/**
 * CBA Document Processing Service
 * Handles document upload, parsing, and knowledge graph population
 */

import fs from 'fs/promises';
import path from 'path';
import pdf from 'pdf-parse';
import Anthropic from '@anthropic-ai/sdk';
import { executeWriteQuery } from './neo4j-service.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ContractSection {
  reference: string;
  title: string;
  text: string;
  type: 'premium-pay' | 'compliance' | 'scheduling' | 'benefits' | 'general';
  relevance: number;
  pageNumber?: number;
  subsections?: ContractSection[];
}

export interface ParsedDocument {
  filename: string;
  totalPages: number;
  sections: ContractSection[];
  rawText: string;
}

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(filePath: string): Promise<{ text: string; pages: number }> {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);

    return {
      text: data.text,
      pages: data.numpages,
    };
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Parse CBA document using Claude to extract structured sections
 */
export async function parseCBADocument(text: string, filename: string): Promise<ParsedDocument> {
  console.log('📄 Parsing CBA document with Claude...');

  const prompt = `You are a legal document parser specializing in Collective Bargaining Agreements (CBAs) for airlines.

Parse the following CBA document and extract all sections in a structured format.

For each section, identify:
1. Section reference (e.g., "Section 12.4", "Article 15.2")
2. Section title (e.g., "International Premium Pay")
3. Full text of the section
4. Type: premium-pay | compliance | scheduling | benefits | general
5. Relevance (0-1 scale, how important this section is)
6. Any subsections

Return a JSON array of sections. Be thorough and extract ALL sections.

CBA Document:
${text.substring(0, 50000)} ${text.length > 50000 ? '... (truncated for processing)' : ''}

Return ONLY valid JSON in this format:
{
  "sections": [
    {
      "reference": "Section 12.4",
      "title": "International Premium Pay",
      "text": "Full text here...",
      "type": "premium-pay",
      "relevance": 1.0,
      "pageNumber": 42,
      "subsections": []
    }
  ]
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 16000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    console.log(`✅ Extracted ${parsed.sections.length} sections from document`);

    return {
      filename,
      totalPages: 0, // Will be set by PDF parser
      sections: parsed.sections,
      rawText: text,
    };
  } catch (error) {
    console.error('Error parsing CBA document with Claude:', error);
    throw new Error('Failed to parse CBA document');
  }
}

/**
 * Import contract sections into Neo4j knowledge graph
 */
export async function importSectionsToNeo4j(sections: ContractSection[]): Promise<void> {
  console.log('📊 Importing sections to Neo4j...');

  for (const section of sections) {
    try {
      // Create contract section node
      await executeWriteQuery(`
        MERGE (s:ContractSection {reference: $reference})
        SET s.title = $title,
            s.text = $text,
            s.type = $type,
            s.relevance = $relevance,
            s.pageNumber = $pageNumber,
            s.accuracy = 0.5,
            s.validationCount = 0,
            s.lastValidated = timestamp(),
            s.lastUpdated = timestamp()
      `, {
        reference: section.reference,
        title: section.title,
        text: section.text,
        type: section.type,
        relevance: section.relevance,
        pageNumber: section.pageNumber || null,
      });

      // Import subsections
      if (section.subsections && section.subsections.length > 0) {
        for (const subsection of section.subsections) {
          await executeWriteQuery(`
            MERGE (sub:ContractSection {reference: $reference})
            SET sub.title = $title,
                sub.text = $text,
                sub.type = $type,
                sub.relevance = $relevance
          `, {
            reference: subsection.reference,
            title: subsection.title,
            text: subsection.text,
            type: subsection.type,
            relevance: subsection.relevance,
          });

          // Create parent-child relationship
          await executeWriteQuery(`
            MATCH (parent:ContractSection {reference: $parentRef})
            MATCH (child:ContractSection {reference: $childRef})
            MERGE (parent)-[:HAS_SUBSECTION]->(child)
          `, {
            parentRef: section.reference,
            childRef: subsection.reference,
          });
        }
      }

      console.log(`  ✓ Imported ${section.reference}`);
    } catch (error) {
      console.error(`  ✗ Failed to import ${section.reference}:`, error);
    }
  }

  console.log('✅ Import complete');
}

/**
 * Auto-detect relationships between sections using Claude
 */
export async function detectRelationships(sections: ContractSection[]): Promise<void> {
  console.log('🔗 Detecting relationships between sections...');

  const sectionRefs = sections.map(s => ({
    reference: s.reference,
    title: s.title,
    type: s.type,
  }));

  const prompt = `Analyze these CBA contract sections and identify relationships between them.

Sections:
${JSON.stringify(sectionRefs, null, 2)}

Identify relationships like:
- RELATED_TO: Sections that reference or relate to each other
- REQUIRES: Section A requires Section B (e.g., premium pay requires qualification)
- MODIFIES: Section A modifies or clarifies Section B
- CONFLICTS_WITH: Sections that might have conflicting interpretations

Return JSON array of relationships:
{
  "relationships": [
    {
      "from": "Section 12.4",
      "to": "Section 11.5",
      "type": "REQUIRES",
      "reason": "International premium requires qualification"
    }
  ]
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Create relationships in Neo4j
    for (const rel of parsed.relationships) {
      try {
        await executeWriteQuery(`
          MATCH (from:ContractSection {reference: $from})
          MATCH (to:ContractSection {reference: $to})
          MERGE (from)-[r:${rel.type}]->(to)
          SET r.reason = $reason
        `, {
          from: rel.from,
          to: rel.to,
          reason: rel.reason,
        });

        console.log(`  ✓ ${rel.from} ${rel.type} ${rel.to}`);
      } catch (error) {
        console.error(`  ✗ Failed to create relationship:`, error);
      }
    }

    console.log('✅ Relationship detection complete');
  } catch (error) {
    console.error('Error detecting relationships:', error);
  }
}

/**
 * Process uploaded CBA document end-to-end
 */
export async function processDocument(filePath: string, filename: string): Promise<ParsedDocument> {
  console.log(`\n🚀 Processing CBA document: ${filename}\n`);

  // Step 1: Extract text from PDF
  const { text, pages } = await extractTextFromPDF(filePath);
  console.log(`  Extracted ${text.length} characters from ${pages} pages`);

  // Step 2: Parse with Claude
  const parsed = await parseCBADocument(text, filename);
  parsed.totalPages = pages;

  // Step 3: Import to Neo4j
  await importSectionsToNeo4j(parsed.sections);

  // Step 4: Detect relationships
  await detectRelationships(parsed.sections);

  console.log(`\n✅ Document processing complete!\n`);

  return parsed;
}
