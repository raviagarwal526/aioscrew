#!/bin/bash

# Test AI Agent Validation Endpoint
# This will trigger all 3 agents: Flight Time, Premium Pay, Compliance

echo "🧪 Testing AI Agent Validation..."
echo ""

curl -X POST https://aioscrew-backend-production.up.railway.app/api/agents/validate \
  -H "Content-Type: application/json" \
  -d '{
    "claimId": "CLM-2024-1156"
  }' \
  | jq '.'

echo ""
echo "✅ Check Railway Deploy Logs to see agent execution details!"
