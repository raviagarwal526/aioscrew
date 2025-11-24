# CBA Knowledge Graph Validation System

## Overview

A dual-perspective validation system for Copa Airlines CBA (Collective Bargaining Agreement) that ensures 100% accuracy through continuous validation from both claims administrators and union representatives.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Document Upload Interface                            │  │
│  │  - Upload CBA PDFs, Word docs, text files            │  │
│  │  - Auto-extract sections and clauses                 │  │
│  │  - Preview and approve before importing              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Dual Perspective Chat Interface                     │  │
│  │  ┌────────────────────┐  ┌──────────────────────┐   │  │
│  │  │ Claims Admin View  │  │ Union Rep View       │   │  │
│  │  │ - Management lens  │  │ - Worker rights lens │   │  │
│  │  │ - Cost focus       │  │ - Benefits focus     │   │  │
│  │  └────────────────────┘  └──────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Response Validation & Flagging                       │  │
│  │  - "Correct" / "Incorrect" / "Partially Correct"     │  │
│  │  - Add comments explaining disagreement              │  │
│  │  - Suggest correct interpretation                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Review Dashboard                                     │  │
│  │  - View all flagged responses                        │  │
│  │  - See perspective differences                       │  │
│  │  - Update knowledge graph                            │  │
│  │  - Track accuracy metrics                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ REST/WebSocket API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Document Processing Service                          │  │
│  │  - PDF parsing (pdf-parse)                           │  │
│  │  - Section extraction (Claude Sonnet)                │  │
│  │  - Auto-tagging (compliance, premium-pay, etc.)      │  │
│  │  - Relationship detection                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Dual Perspective RAG Service                        │  │
│  │  - Query Neo4j for relevant sections                 │  │
│  │  - Generate admin-perspective response (cost focus)  │  │
│  │  - Generate union-perspective response (rights focus)│  │
│  │  - Provide contract references for both              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Validation & Review Service                         │  │
│  │  - Store validation feedback                         │  │
│  │  - Track disagreements between perspectives          │  │
│  │  - Generate accuracy reports                         │  │
│  │  - Update knowledge graph based on feedback          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Neo4j Knowledge Graph                               │  │
│  │  - Contract sections                                 │  │
│  │  - Rules and regulations                             │  │
│  │  - Relationships and references                      │  │
│  │  - Validation metadata (accuracy scores)             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL (Supabase)                               │  │
│  │  - Document versions                                 │  │
│  │  - Chat conversations                                │  │
│  │  - Validation feedback                               │  │
│  │  - Review workflow state                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Document Upload & Parsing

```typescript
// Upload CBA document
POST /api/cba/upload
Body: FormData with file

// Parse and extract sections
POST /api/cba/parse/:documentId
Response: {
  sections: [
    {
      reference: "Section 12.4",
      title: "International Premium Pay",
      text: "...",
      type: "premium-pay",
      subsections: []
    }
  ]
}

// Approve and import to Neo4j
POST /api/cba/import/:documentId
Body: { approvedSections: [...] }
```

### 2. Dual Perspective Chat

```typescript
// Ask question from specific perspective
POST /api/cba/ask
Body: {
  question: "Can a crew member claim international premium for a flight to Panama?",
  perspective: "admin" | "union",
  claimContext?: { ... }
}

Response: {
  answer: "Yes, crew members are entitled to...",
  confidence: 0.95,
  contractReferences: [
    {
      section: "CBA Section 12.4",
      text: "...",
      relevance: 1.0
    }
  ],
  perspective: "union",
  reasoning: "From the union perspective, this is clearly covered under..."
}
```

### 3. Validation & Flagging

```typescript
// Validate response
POST /api/cba/validate
Body: {
  conversationId: "...",
  messageId: "...",
  validation: "correct" | "incorrect" | "partially_correct",
  comments: "The answer missed the qualification requirement...",
  suggestedAnswer: "A crew member can claim international premium only if...",
  perspective: "admin" | "union"
}

// Get flagged responses
GET /api/cba/flagged
Response: {
  flagged: [
    {
      question: "...",
      adminResponse: { ... },
      unionResponse: { ... },
      validations: [
        { user: "admin@copa.com", status: "incorrect", comments: "..." },
        { user: "union@copa.com", status: "correct", comments: "..." }
      ]
    }
  ]
}
```

### 4. Knowledge Graph Enhancement

```typescript
// Update contract section based on validation
PUT /api/cba/sections/:reference
Body: {
  text: "Updated text...",
  relevance: 1.0,
  validatedBy: ["admin", "union"],
  accuracy: 1.0
}

// Add missing relationship
POST /api/cba/relationships
Body: {
  from: "CBA Section 12.4",
  to: "CBA Section 11.5",
  type: "REQUIRES_QUALIFICATION",
  notes: "International premium requires qualification"
}
```

## Database Schema

### Neo4j Nodes

```cypher
// Contract Section (enhanced)
(:ContractSection {
  reference: "CBA Section 12.4",
  title: "International Premium Pay",
  text: "...",
  type: "premium-pay",
  relevance: 1.0,
  accuracy: 0.95,
  validationCount: 25,
  lastValidated: timestamp(),
  sourceDocument: "CBA_2024.pdf",
  pageNumber: 42
})

// Validation Record
(:Validation {
  id: "val-123",
  question: "...",
  answer: "...",
  perspective: "admin",
  status: "correct",
  comments: "...",
  timestamp: timestamp(),
  userId: "admin@copa.com"
})

// Dispute
(:Dispute {
  id: "dispute-123",
  question: "...",
  adminAnswer: "...",
  unionAnswer: "...",
  status: "pending" | "resolved",
  resolution: "...",
  resolvedBy: "legal@copa.com"
})
```

### PostgreSQL Tables

```sql
-- CBA Documents
CREATE TABLE cba_documents (
  id UUID PRIMARY KEY,
  filename TEXT NOT NULL,
  upload_date TIMESTAMP DEFAULT NOW(),
  parsed BOOLEAN DEFAULT FALSE,
  approved BOOLEAN DEFAULT FALSE,
  version TEXT,
  uploaded_by TEXT
);

-- Chat Conversations
CREATE TABLE cba_conversations (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  perspective TEXT CHECK (perspective IN ('admin', 'union')),
  started_at TIMESTAMP DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE cba_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES cba_conversations(id),
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  contract_references JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Validations
CREATE TABLE cba_validations (
  id UUID PRIMARY KEY,
  message_id UUID REFERENCES cba_messages(id),
  validated_by TEXT NOT NULL,
  perspective TEXT CHECK (perspective IN ('admin', 'union')),
  status TEXT CHECK (status IN ('correct', 'incorrect', 'partially_correct')),
  comments TEXT,
  suggested_answer TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Disputes
CREATE TABLE cba_disputes (
  id UUID PRIMARY KEY,
  question TEXT NOT NULL,
  admin_answer TEXT,
  union_answer TEXT,
  status TEXT CHECK (status IN ('pending', 'under_review', 'resolved')),
  resolution TEXT,
  resolved_by TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Dual Perspective System Prompts

### Claims Administrator Perspective

```
You are a Claims Administrator for Copa Airlines. Your role is to:
- Ensure CBA compliance while managing costs
- Verify claims meet all requirements and deadlines
- Check for proper documentation and qualifications
- Apply rules consistently and fairly
- Protect the company from invalid claims while honoring valid ones

When answering questions:
- Focus on eligibility requirements and deadlines
- Emphasize documentation needs
- Highlight compliance rules
- Be precise about what qualifies and what doesn't
- Reference specific CBA sections
```

### Union Representative Perspective

```
You are a Union Representative for Copa Airlines crew members. Your role is to:
- Protect crew member rights under the CBA
- Ensure crew receive all entitled benefits and premiums
- Advocate for correct interpretation of contract language
- Help crew understand their rights
- Challenge incorrect claim denials

When answering questions:
- Focus on crew member entitlements
- Explain rights clearly and comprehensively
- Interpret contract language in favor of workers when ambiguous
- Highlight all applicable premiums and benefits
- Reference specific CBA sections
```

## Validation Workflow

```
1. User asks question → System generates response from selected perspective
2. User validates response → Mark as correct/incorrect/partially correct
3. If incorrect → User provides correct interpretation
4. System checks if opposite perspective gives different answer
5. If perspectives differ → Create dispute record
6. Dispute reviewed by legal/management/union committee
7. Resolution updates knowledge graph
8. System learns from validation feedback
```

## Accuracy Tracking

- Track validation rate for each contract section
- Monitor agreement between admin and union perspectives
- Calculate confidence scores based on validation history
- Identify sections with frequent disputes (need clarification)
- Generate accuracy reports for continuous improvement

## Implementation Plan

Phase 1: Document Upload & Parsing
- PDF/Word document upload
- Section extraction using Claude
- Preview and approval interface

Phase 2: Dual Perspective Chat
- Chat interface with perspective selector
- RAG system with Neo4j
- Contract reference display

Phase 3: Validation & Flagging
- Validation buttons and forms
- Dispute tracking
- Review dashboard

Phase 4: Knowledge Graph Enhancement
- Update sections based on validation
- Add relationships from feedback
- Accuracy scoring system

Phase 5: Continuous Improvement
- Analytics and reporting
- A/B testing different interpretations
- ML-based confidence scoring
