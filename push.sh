#!/bin/bash
cd /root/.openclaw/workspace/kanban-ai

# Check git status
echo "=== Git Status ==="
git status --short

echo ""
echo "=== Git Remote ==="
git remote -v

echo ""
echo "=== Pushing to GitHub ==="
git push -u origin main --verbose 2>&1

echo ""
echo "=== Done ==="
