/**
 * Neo4j Knowledge Graph Service
 * Manages CBA contract rules, sections, and relationships
 */

import neo4j, { Driver, Session } from 'neo4j-driver';
import type { ContractReference } from '../agents/shared/types.js';

let driver: Driver | null = null;

/**
 * Initialize Neo4j driver connection
 */
export function initNeo4jDriver(): Driver {
  if (driver) {
    return driver;
  }

  const uri = process.env.NEO4J_URI;
  const username = process.env.NEO4J_USERNAME || process.env.NEO4J_USER;
  const password = process.env.NEO4J_PASSWORD;
  const database = process.env.NEO4J_DATABASE || 'neo4j';

  if (!uri || !username || !password) {
    throw new Error('Neo4j connection credentials are missing. Please set NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD environment variables.');
  }

  driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
    maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
  });

  // Verify connectivity (non-blocking - allows graceful fallback)
  driver.verifyConnectivity()
    .then(() => {
      console.log('✅ Neo4j driver connected successfully');
    })
    .catch((error) => {
      console.warn('⚠️  Neo4j connection verification failed (will retry on first query):', error.message);
      // Don't throw - allow driver to be created, connection will be attempted on first query
    });

  return driver;
}

/**
 * Get Neo4j driver instance
 * Returns null if credentials are missing (allows graceful fallback)
 */
export function getNeo4jDriver(): Driver | null {
  if (!driver) {
    try {
      return initNeo4jDriver();
    } catch (error) {
      console.warn('Neo4j driver initialization failed, agents will use fallback rules:', error instanceof Error ? error.message : error);
      return null;
    }
  }
  return driver;
}

/**
 * Close Neo4j driver connection
 */
export async function closeNeo4jDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
    console.log('Neo4j driver closed');
  }
}

/**
 * Execute a read query against Neo4j
 */
export async function executeReadQuery<T = any>(
  query: string,
  parameters?: Record<string, any>
): Promise<T[]> {
  const driver = getNeo4jDriver();
  if (!driver) {
    throw new Error('Neo4j driver not available');
  }
  const session = driver.session({ database: process.env.NEO4J_DATABASE || 'neo4j' });

  try {
    const result = await session.executeRead(async (tx) => {
      return await tx.run(query, parameters || {});
    });

    return result.records.map((record) => {
      const obj: any = {};
      record.keys.forEach((key) => {
        obj[key] = record.get(key);
      });
      return obj as T;
    });
  } catch (error) {
    console.error('Neo4j read query error:', error);
    throw error;
  } finally {
    await session.close();
  }
}

/**
 * Execute a write query against Neo4j
 */
export async function executeWriteQuery<T = any>(
  query: string,
  parameters?: Record<string, any>
): Promise<T[]> {
  const driver = getNeo4jDriver();
  if (!driver) {
    throw new Error('Neo4j driver not available');
  }
  const session = driver.session({ database: process.env.NEO4J_DATABASE || 'neo4j' });

  try {
    const result = await session.executeWrite(async (tx) => {
      return await tx.run(query, parameters || {});
    });

    return result.records.map((record) => {
      const obj: any = {};
      record.keys.forEach((key) => {
        obj[key] = record.get(key);
      });
      return obj as T;
    });
  } catch (error) {
    console.error('Neo4j write query error:', error);
    throw error;
  } finally {
    await session.close();
  }
}

/**
 * Query CBA contract sections relevant to a claim type
 */
export async function getContractSectionsForClaimType(
  claimType: string
): Promise<ContractReference[]> {
  try {
    const query = `
      MATCH (section:ContractSection)-[:APPLIES_TO]->(claimType:ClaimType {type: $claimType})
      OPTIONAL MATCH (section)-[:RELATED_TO]->(related:ContractSection)
      RETURN 
        section.reference as section,
        section.title as title,
        section.text as text,
        section.relevance as relevance,
        collect(related.reference) as relatedSections
      ORDER BY section.relevance DESC
    `;

    const results = await executeReadQuery<{
      section: string;
      title: string;
      text: string;
      relevance: number;
      relatedSections: string[];
    }>(query, { claimType });

    return results.map((r) => ({
      section: r.section,
      title: r.title,
      text: r.text,
      relevance: r.relevance || 1.0,
    }));
  } catch (error) {
    console.error('Error querying contract sections:', error);
    return [];
  }
}

/**
 * Query CBA compliance rules for a specific rule type
 */
export async function getComplianceRules(ruleType: string): Promise<any[]> {
  try {
    const query = `
      MATCH (rule:ComplianceRule {type: $ruleType})
      OPTIONAL MATCH (rule)-[:DEFINED_IN]->(section:ContractSection)
      RETURN 
        rule.type as type,
        rule.description as description,
        rule.deadlineDays as deadlineDays,
        rule.requiredDocumentation as requiredDocumentation,
        rule.qualificationRequired as qualificationRequired,
        collect(section.reference) as contractSections
    `;

    return await executeReadQuery(query, { ruleType });
  } catch (error) {
    console.error('Error querying compliance rules:', error);
    return [];
  }
}

/**
 * Query premium pay rates for a specific pay type
 */
export async function getPremiumPayRate(payType: string): Promise<any | null> {
  try {
    const query = `
      MATCH (rate:PremiumPayRate {type: $payType})
      OPTIONAL MATCH (rate)-[:DEFINED_IN]->(section:ContractSection)
      RETURN 
        rate.type as type,
        rate.amount as amount,
        rate.formula as formula,
        rate.conditions as conditions,
        rate.applicableDestinations as applicableDestinations,
        collect(section.reference) as contractSections
      LIMIT 1
    `;

    const results = await executeReadQuery(query, { payType });
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error querying premium pay rate:', error);
    return null;
  }
}

/**
 * Search contract sections by keyword
 */
export async function searchContractSections(
  keyword: string,
  limit: number = 10
): Promise<ContractReference[]> {
  try {
    const query = `
      MATCH (section:ContractSection)
      WHERE 
        section.text CONTAINS $keyword 
        OR section.title CONTAINS $keyword
        OR section.reference CONTAINS $keyword
      RETURN 
        section.reference as section,
        section.title as title,
        section.text as text,
        section.relevance as relevance
      ORDER BY section.relevance DESC
      LIMIT $limit
    `;

    const results = await executeReadQuery<{
      section: string;
      title: string;
      text: string;
      relevance: number;
    }>(query, { keyword, limit });

    return results.map((r) => ({
      section: r.section,
      title: r.title,
      text: r.text,
      relevance: r.relevance || 0.5,
    }));
  } catch (error) {
    console.error('Error searching contract sections:', error);
    return [];
  }
}

/**
 * Get all compliance rules (for compliance validator)
 */
export async function getAllComplianceRules(): Promise<any[]> {
  try {
    const query = `
      MATCH (rule:ComplianceRule)
      OPTIONAL MATCH (rule)-[:DEFINED_IN]->(section:ContractSection)
      RETURN 
        rule.type as type,
        rule.description as description,
        rule.deadlineDays as deadlineDays,
        rule.requiredDocumentation as requiredDocumentation,
        rule.qualificationRequired as qualificationRequired,
        rule.redFlags as redFlags,
        collect(section.reference) as contractSections
    `;

    return await executeReadQuery(query);
  } catch (error) {
    console.error('Error querying all compliance rules:', error);
    return [];
  }
}

/**
 * Get all premium pay rates (for premium pay calculator)
 */
export async function getAllPremiumPayRates(): Promise<any[]> {
  try {
    const query = `
      MATCH (rate:PremiumPayRate)
      OPTIONAL MATCH (rate)-[:DEFINED_IN]->(section:ContractSection)
      RETURN 
        rate.type as type,
        rate.amount as amount,
        rate.formula as formula,
        rate.conditions as conditions,
        rate.applicableDestinations as applicableDestinations,
        collect(section.reference) as contractSections
      ORDER BY rate.type
    `;

    return await executeReadQuery(query);
  } catch (error) {
    console.error('Error querying all premium pay rates:', error);
    return [];
  }
}
