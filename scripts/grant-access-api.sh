#!/bin/bash
# Grant full access via the admin API endpoint
# Requires: you must be logged in as ADMIN/SUPERADMIN and have a valid session cookie
#
# Alternatively, run the Prisma script directly on Railway:
#   npx tsx scripts/grant-access.ts roman.kolontaj@gmail.com

APP_URL="${1:-https://clawsetup-production.up.railway.app}"

echo "To grant access, call this from the browser console while logged in as admin:"
echo ""
echo "fetch('/api/admin/subscriptions', {"
echo "  method: 'POST',"
echo "  headers: { 'Content-Type': 'application/json' },"
echo "  body: JSON.stringify({ email: 'roman.kolontaj@gmail.com', plan: 'annual' })"
echo "}).then(r => r.json()).then(console.log)"
