#!/usr/bin/env bash
set -euo pipefail

: "${OPENAI_API_KEY:?Set OPENAI_API_KEY before running this script}"

curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Привет"}]
  }'
