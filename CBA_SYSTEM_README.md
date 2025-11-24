# CBA Knowledge Graph Validation System - Quick Start

## Overview

A comprehensive system for managing and validating Copa Airlines CBA (Collective Bargaining Agreement) knowledge through dual-perspective AI chat and continuous validation.

## Key Features

✅ **Document Upload & Parsing** - Upload PDF/text CBAs, auto-extract sections
✅ **Dual Perspective Chat** - Ask questions from both Admin and Union perspectives
✅ **RAG with Neo4j** - Retrieval-Augmented Generation using knowledge graph
✅ **Validation & Flagging** - Mark answers as correct/incorrect to improve accuracy
✅ **Continuous Learning** - System learns from feedback and updates knowledge graph

## Quick Start

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ..
npm install
```

### 2. Configure Environment

Create `backend/.env` with:

```env
# Claude API for document parsing and chat
ANTHROPIC_API_KEY=sk-ant-xxx

# Neo4j AuraDB for knowledge graph
NEO4J_URI=neo4j+s://xxx.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=xxx
NEO4J_DATABASE=neo4j

# PostgreSQL (optional - for chat history)
DATABASE_URL=postgresql://...

# Server
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 3. Seed Neo4j (Initial Sample Data)

```bash
cd backend
npm run seed:neo4j
```

This creates sample CBA sections, rules, and relationships in Neo4j.

### 4. Start the System

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

### 5. Access the System

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **CBA Chat**: Navigate to /cba-chat (add route to your app)
- **Document Upload**: Navigate to /cba-upload

## Using the System

### Upload CBA Documents

1. Go to **CBA Document Upload** page
2. Click "Choose PDF file" and select your CBA PDF
3. Click "Upload & Parse" - AI will extract sections automatically
4. Review the extracted sections (you can deselect any if needed)
5. Click "Import to Neo4j" to add sections to knowledge graph

### Ask Questions

1. Go to **CBA Chat** page
2. Select perspective:
   - **Claims Administrator** - Management/cost focus
   - **Union Representative** - Worker rights focus
   - **Both Perspectives** - See both answers side-by-side
3. Type your question (e.g., "Can a crew member claim international premium for Panama?")
4. Get AI response with:
   - Detailed answer
   - Confidence score
   - Contract references
   - Reasoning
   - Warnings (if any)

### Validate Responses

After receiving an answer:
- Click **✓ Correct** if the answer is accurate
- Click **✗ Incorrect** if the answer has errors

This feedback updates the knowledge graph accuracy scores and helps the system learn.

### Example Questions

```
- Can a crew member claim international premium for a flight to Panama?
- What is the filing deadline for premium pay claims?
- Do I need international qualification to claim international premium?
- What is the holiday premium rate for Christmas Day?
- Can I file a claim more than 7 days after trip completion?
- How much is the night premium for flights between 2200-0600?
```

## API Endpoints

### Document Management

```bash
# Upload document
POST /api/cba/upload
Content-Type: multipart/form-data
Body: FormData with 'document' file

# Parse document
POST /api/cba/parse/:documentId

# Import sections to Neo4j
POST /api/cba/import
Body: { sections: [...] }

# Process end-to-end (upload + parse + import)
POST /api/cba/process/:documentId
```

### Chat & Questions

```bash
# Ask question from single perspective
POST /api/cba/ask
Body: {
  "question": "Can I claim international premium for Panama?",
  "perspective": "admin" | "union",
  "claimContext": { ... }  // optional
}

# Ask from BOTH perspectives
POST /api/cba/ask-both
Body: {
  "question": "What is the filing deadline?",
  "claimContext": { ... }  // optional
}
```

### Validation & Feedback

```bash
# Validate response
POST /api/cba/validate
Body: {
  "sectionRef": "CBA Section 12.4",
  "isCorrect": true | false,
  "suggestedText": "...",  // if incorrect
  "comments": "...",
  "perspective": "admin" | "union"
}

# Get sections with low accuracy (need review)
GET /api/cba/sections/low-accuracy

# Get pending revisions
GET /api/cba/revisions/pending
```

## Neo4j Knowledge Graph Schema

### Nodes

```cypher
// Contract Section
(:ContractSection {
  reference: "CBA Section 12.4",
  title: "International Premium Pay",
  text: "Full text...",
  type: "premium-pay" | "compliance" | "scheduling" | "benefits" | "general",
  relevance: 0-1,
  accuracy: 0-1,  // Updated by validation
  validationCount: number,
  lastValidated: timestamp
})

// Validation Record
(:Validation {
  question: "...",
  answer: "...",
  status: "correct" | "incorrect",
  perspective: "admin" | "union"
})

// Revision (suggested corrections)
(:Revision {
  originalText: "...",
  suggestedText: "...",
  comments: "...",
  status: "pending" | "approved" | "rejected"
})
```

### Relationships

```cypher
// Section applies to claim type
(section:ContractSection)-[:APPLIES_TO]->(claimType:ClaimType)

// Section requires another section
(section1:ContractSection)-[:REQUIRES]->(section2:ContractSection)

// Section has subsection
(parent:ContractSection)-[:HAS_SUBSECTION]->(child:ContractSection)

// Section has pending revision
(section:ContractSection)-[:HAS_REVISION]->(revision:Revision)

// Sections are related
(section1:ContractSection)-[:RELATED_TO]->(section2:ContractSection)
```

## Validation Workflow

1. **User asks question** → System generates answer from selected perspective(s)
2. **User validates** → Mark as correct/incorrect
3. **If incorrect** → User can provide correct interpretation
4. **System checks** if opposite perspective gives different answer
5. **If disagreement** → Create dispute record for review
6. **Legal/Management/Union committee reviews** disputes
7. **Resolution** → Update knowledge graph
8. **System learns** from feedback

## Accuracy Tracking

The system tracks:
- ✓ Validation rate for each contract section
- ✓ Agreement rate between admin and union perspectives
- ✓ Confidence scores based on validation history
- ✓ Sections with frequent disputes (need clarification)
- ✓ Overall system accuracy over time

## Best Practices

### For Claims Administrators
1. Focus on compliance requirements and deadlines
2. Verify all qualifications and documentation
3. Be consistent in interpretation across similar claims
4. Flag answers that might set incorrect precedents

### For Union Representatives
1. Focus on crew member rights and entitlements
2. Ensure all benefits are highlighted
3. Challenge overly restrictive interpretations
4. Flag answers that might limit crew benefits

### For Both
1. Always validate responses - your feedback improves the system
2. Provide detailed comments when marking answers incorrect
3. Reference specific CBA sections when suggesting corrections
4. Review flagged items regularly to resolve disputes

## Troubleshooting

### Can't connect to Neo4j
- Check `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` in .env
- Verify Neo4j AuraDB instance is running
- Test connection: `npm run seed:neo4j`

### AI responses are low quality
- Upload more comprehensive CBA documents
- Validate more responses to train the system
- Check that sections are properly categorized (type field)

### Parsing fails on PDF
- Ensure PDF is text-based, not scanned images
- Try extracting text to .txt first if issues persist
- Check Claude API key is valid

## Architecture

```
Frontend (React)
  ├─ CBAChat - Dual perspective chat interface
  ├─ CBADocumentUpload - Document upload and parsing
  └─ CBAAdmin - Review dashboard

Backend (Express/Node.js)
  ├─ cba-document-service - PDF parsing, section extraction
  ├─ cba-chat-service - RAG, dual perspective generation
  └─ cba-routes - REST API endpoints

Data Layer
  ├─ Neo4j - Knowledge graph (sections, rules, relationships)
  └─ PostgreSQL - Chat history, validations, disputes (optional)
```

## Next Steps

1. **Upload Real CBA Document** - Replace sample data with actual Copa CBA
2. **Train with Validation** - Have admins and union reps validate 50+ questions
3. **Review Disputes** - Resolve any disagreements between perspectives
4. **Add More Documents** - Import related policies, amendments, side letters
5. **Monitor Accuracy** - Track validation rates and improve low-accuracy sections

## Support

For issues or questions:
1. Check the API health: `GET /api/cba/health`
2. Review backend logs for errors
3. Verify Neo4j connection and data
4. Check console for frontend errors

---

**Built with**: Claude Sonnet 4.5, Neo4j, React, TypeScript, Express
