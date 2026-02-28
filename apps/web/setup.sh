#!/bin/bash

# TaskFlow Quick Setup Script
# Run this after cloning the repo to set up the project

echo "🚀 TaskFlow Setup Starting..."

# Check Node version
echo "✓ Checking Node.js version..."
node_version=$(node -v)
echo "  Node version: $node_version"

# Install dependencies
echo "✓ Installing dependencies..."
npm install

# Create .env.local
echo "✓ Creating .env.local..."
if [ ! -f .env.local ]; then
  cp .env.local.example .env.local
  echo "  Created .env.local - update with your Supabase credentials"
else
  echo "  .env.local already exists - skipping"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 NEXT STEPS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Create Supabase Project:"
echo "   - Go to https://supabase.com"
echo "   - Create a new project"
echo "   - Get API credentials from Settings > API"
echo ""
echo "2️⃣  Set Up Database:"
echo "   - Open database.sql file"
echo "   - Go to Supabase SQL Editor"
echo "   - Copy and paste the entire SQL content"
echo "   - Execute the queries"
echo ""
echo "3️⃣  Configure Environment:"
echo "   - Edit .env.local"
echo "   - Add your Supabase credentials:"
echo "     NEXT_PUBLIC_SUPABASE_URL=your_url"
echo "     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key"
echo "     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
echo ""
echo "4️⃣  Start Development Server:"
echo "   npm run dev"
echo ""
echo "5️⃣  Open in Browser:"
echo "   http://localhost:3000"
echo ""
echo "✨ For detailed setup, see SETUP.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
