#!/bin/bash

# Script للتحقق من كل الملفات قبل Deploy
# Usage: bash check-files.sh

echo "🔍 Perfect CFW - File Structure Check"
echo "======================================"
echo ""

ERRORS=0

# Check middleware
echo "📁 Checking middleware/..."
if [ ! -d "middleware" ]; then
    echo "❌ middleware/ folder NOT FOUND!"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ middleware/ folder exists"
    
    if [ ! -f "middleware/auth.js" ]; then
        echo "❌ middleware/auth.js NOT FOUND!"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ middleware/auth.js exists"
    fi
    
    if [ ! -f "middleware/logger.js" ]; then
        echo "❌ middleware/logger.js NOT FOUND!"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ middleware/logger.js exists"
    fi
fi

echo ""

# Check models
echo "📁 Checking models/..."
if [ ! -d "models" ]; then
    echo "❌ models/ folder NOT FOUND!"
    ERRORS=$((ERRORS + 1))
else
    MODEL_COUNT=$(ls -1 models/*.js 2>/dev/null | wc -l)
    echo "✅ models/ folder exists"
    echo "   Found $MODEL_COUNT model files"
    
    if [ $MODEL_COUNT -lt 10 ]; then
        echo "⚠️  Expected 10 models, found $MODEL_COUNT"
    fi
    
    # Check specific models
    REQUIRED_MODELS=("User.js" "Application.js" "Notification.js" "Question.js" "SystemSettings.js" "Admin.js" "Product.js" "DiscountCode.js" "RuleSection.js" "ActivityLog.js")
    
    for model in "${REQUIRED_MODELS[@]}"; do
        if [ ! -f "models/$model" ]; then
            echo "❌ models/$model NOT FOUND!"
            ERRORS=$((ERRORS + 1))
        fi
    done
fi

echo ""

# Check routes
echo "📁 Checking routes/..."
if [ ! -d "routes" ]; then
    echo "❌ routes/ folder NOT FOUND!"
    ERRORS=$((ERRORS + 1))
else
    ROUTE_COUNT=$(ls -1 routes/*.js 2>/dev/null | wc -l)
    echo "✅ routes/ folder exists"
    echo "   Found $ROUTE_COUNT route files"
    
    if [ $ROUTE_COUNT -lt 10 ]; then
        echo "⚠️  Expected 10 routes, found $ROUTE_COUNT"
    fi
    
    # Check specific routes
    REQUIRED_ROUTES=("discordAuth.js" "questions.js" "applications.js" "notifications.js" "auth.js" "admins.js" "products.js" "discountCodes.js" "rules.js" "activityLogs.js")
    
    for route in "${REQUIRED_ROUTES[@]}"; do
        if [ ! -f "routes/$route" ]; then
            echo "❌ routes/$route NOT FOUND!"
            ERRORS=$((ERRORS + 1))
        fi
    done
fi

echo ""

# Check public
echo "📁 Checking public/..."
if [ ! -d "public" ]; then
    echo "❌ public/ folder NOT FOUND!"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ public/ folder exists"
    
    HTML_COUNT=$(ls -1 public/*.html 2>/dev/null | wc -l)
    echo "   Found $HTML_COUNT HTML files"
    
    if [ -d "public/css" ]; then
        echo "✅ public/css/ exists"
    else
        echo "⚠️  public/css/ NOT FOUND"
    fi
    
    if [ -d "public/js" ]; then
        echo "✅ public/js/ exists"
    else
        echo "⚠️  public/js/ NOT FOUND"
    fi
fi

echo ""

# Check main files
echo "📄 Checking main files..."

if [ ! -f "server.js" ]; then
    echo "❌ server.js NOT FOUND!"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ server.js exists"
fi

if [ ! -f "package.json" ]; then
    echo "❌ package.json NOT FOUND!"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ package.json exists"
fi

if [ ! -f ".env.example" ]; then
    echo "⚠️  .env.example NOT FOUND (optional)"
else
    echo "✅ .env.example exists"
fi

if [ ! -f ".gitignore" ]; then
    echo "⚠️  .gitignore NOT FOUND (recommended)"
else
    echo "✅ .gitignore exists"
fi

if [ ! -f "discord-bot.js" ]; then
    echo "⚠️  discord-bot.js NOT FOUND"
else
    echo "✅ discord-bot.js exists"
fi

if [ ! -f "seed-questions.js" ]; then
    echo "⚠️  seed-questions.js NOT FOUND"
else
    echo "✅ seed-questions.js exists"
fi

echo ""
echo "======================================"

if [ $ERRORS -eq 0 ]; then
    echo "✅ ALL CHECKS PASSED!"
    echo "✅ Project structure is complete"
    echo "✅ Ready for deployment"
    echo ""
    echo "Next steps:"
    echo "1. git add ."
    echo "2. git commit -m 'Perfect CFW Backend'"
    echo "3. git push"
    exit 0
else
    echo "❌ FOUND $ERRORS ERROR(S)!"
    echo "❌ Please fix missing files before deployment"
    echo ""
    echo "To fix:"
    echo "1. Make sure you extracted the complete archive"
    echo "2. Check that all folders are present"
    echo "3. Run this script again"
    exit 1
fi
