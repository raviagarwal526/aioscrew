/**
 * CBA Knowledge Graph Validation API Routes
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  processDocument,
  extractTextFromPDF,
  parseCBADocument,
  importSectionsToNeo4j,
} from '../services/cba-document-service.js';
import {
  askQuestion,
  askBothPerspectives,
  updateSectionFromFeedback,
  type Perspective,
} from '../services/cba-chat-service.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.txt') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

/**
 * Upload CBA document
 * POST /api/cba/upload
 */
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { filename, path: filePath } = req.file;

    // Return upload confirmation
    res.json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: path.basename(filePath, path.extname(filePath)),
        filename,
        path: filePath,
      },
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      error: 'Failed to upload document',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Parse uploaded document
 * POST /api/cba/parse/:documentId
 */
router.post('/parse/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const filePath = `uploads/${documentId}.pdf`;

    // Extract and parse
    const { text } = await extractTextFromPDF(filePath);
    const parsed = await parseCBADocument(text, documentId);

    res.json({
      success: true,
      message: 'Document parsed successfully',
      sections: parsed.sections,
      totalPages: parsed.totalPages,
    });
  } catch (error) {
    console.error('Error parsing document:', error);
    res.status(500).json({
      error: 'Failed to parse document',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Import parsed sections to Neo4j
 * POST /api/cba/import
 */
router.post('/import', async (req, res) => {
  try {
    const { sections } = req.body;

    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({ error: 'Invalid sections array' });
    }

    await importSectionsToNeo4j(sections);

    res.json({
      success: true,
      message: `Imported ${sections.length} sections to knowledge graph`,
    });
  } catch (error) {
    console.error('Error importing sections:', error);
    res.status(500).json({
      error: 'Failed to import sections',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Process document end-to-end
 * POST /api/cba/process/:documentId
 */
router.post('/process/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const filePath = `uploads/${documentId}.pdf`;

    const parsed = await processDocument(filePath, documentId);

    res.json({
      success: true,
      message: 'Document processed and imported successfully',
      sections: parsed.sections.length,
      totalPages: parsed.totalPages,
    });
  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({
      error: 'Failed to process document',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Ask question from specific perspective
 * POST /api/cba/ask
 */
router.post('/ask', async (req, res) => {
  try {
    const { question, perspective, claimContext } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!perspective || !['admin', 'union'].includes(perspective)) {
      return res.status(400).json({ error: 'Valid perspective (admin or union) is required' });
    }

    const response = await askQuestion(question, perspective as Perspective, claimContext);

    res.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({
      error: 'Failed to answer question',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Ask question from BOTH perspectives
 * POST /api/cba/ask-both
 */
router.post('/ask-both', async (req, res) => {
  try {
    const { question, claimContext } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const result = await askBothPerspectives(question, claimContext);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error answering from both perspectives:', error);
    res.status(500).json({
      error: 'Failed to answer from both perspectives',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Validate response
 * POST /api/cba/validate
 */
router.post('/validate', async (req, res) => {
  try {
    const {
      sectionRef,
      isCorrect,
      suggestedText,
      comments,
      perspective,
    } = req.body;

    if (!sectionRef) {
      return res.status(400).json({ error: 'Section reference is required' });
    }

    if (isCorrect === undefined) {
      return res.status(400).json({ error: 'isCorrect boolean is required' });
    }

    await updateSectionFromFeedback(sectionRef, {
      isCorrect,
      suggestedText,
      comments,
    });

    res.json({
      success: true,
      message: 'Validation recorded successfully',
    });
  } catch (error) {
    console.error('Error validating response:', error);
    res.status(500).json({
      error: 'Failed to validate response',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get sections with low accuracy (need review)
 * GET /api/cba/sections/low-accuracy
 */
router.get('/sections/low-accuracy', async (req, res) => {
  try {
    const { executeReadQuery } = await import('../services/neo4j-service.js');

    const sections = await executeReadQuery(`
      MATCH (s:ContractSection)
      WHERE s.accuracy < 0.7
      RETURN s.reference as reference,
             s.title as title,
             s.accuracy as accuracy,
             s.validationCount as validationCount
      ORDER BY s.accuracy ASC
      LIMIT 20
    `);

    res.json({
      success: true,
      sections,
    });
  } catch (error) {
    console.error('Error getting low accuracy sections:', error);
    res.status(500).json({
      error: 'Failed to get low accuracy sections',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get pending revisions
 * GET /api/cba/revisions/pending
 */
router.get('/revisions/pending', async (req, res) => {
  try {
    const { executeReadQuery } = await import('../services/neo4j-service.js');

    const revisions = await executeReadQuery(`
      MATCH (s:ContractSection)-[:HAS_REVISION]->(r:Revision)
      WHERE r.status = 'pending'
      RETURN s.reference as sectionRef,
             s.title as sectionTitle,
             r.id as revisionId,
             r.originalText as originalText,
             r.suggestedText as suggestedText,
             r.comments as comments,
             r.createdAt as createdAt
      ORDER BY r.createdAt DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      revisions,
    });
  } catch (error) {
    console.error('Error getting pending revisions:', error);
    res.status(500).json({
      error: 'Failed to get pending revisions',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Health check
 * GET /api/cba/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CBA Knowledge Graph API is running',
    version: '1.0.0',
  });
});

/**
 * Seed Neo4j database with CBA contract data
 * POST /api/cba/seed
 * WARNING: This will clear existing data and repopulate the database
 */
router.post('/seed', async (req, res) => {
  try {
    // Import seed function dynamically
    const { seed } = await import('../scripts/seed-neo4j.js');

    // Run seed in background and return immediately
    seed()
      .then(() => {
        console.log('✅ Neo4j seed completed successfully');
      })
      .catch((error) => {
        console.error('❌ Neo4j seed failed:', error);
      });

    res.json({
      success: true,
      message: 'Neo4j seed process started. Check server logs for progress.',
    });
  } catch (error) {
    console.error('Error starting seed process:', error);
    res.status(500).json({
      error: 'Failed to start seed process',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
