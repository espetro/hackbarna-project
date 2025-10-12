# Lingo.dev Compiler Integration Prerequisites Verification Checklist

## Overview

This comprehensive checklist ensures your NextJS project meets all requirements for successful Lingo.dev Compiler integration. Each item includes specific verification steps, pass/fail criteria, and troubleshooting guidance.

**Project Context**: TetrisTravel NextJS 15.5.4 Application  
**Target Languages**: Spanish (es), French (fr), German (de)  
**Integration Type**: Lingo.dev Compiler with App Router  

---

## Priority Legend

- 🔴 **CRITICAL** - Must pass before integration
- 🟡 **RECOMMENDED** - Should pass for optimal experience  
- 🟢 **OPTIONAL** - Nice to have, not blocking

---

## 1. System Requirements Verification

### 1.1 Node.js Version Compatibility 🔴 CRITICAL

**Requirement**: Node.js 18.x or higher

**Verification Steps**:
```bash
node --version
```

**Pass Criteria**: 
- Version shows `v18.x.x` or higher
- Version shows `v20.x.x` or `v21.x.x` (recommended)

**Expected Output**:
```
v18.17.0  # ✅ PASS
v20.10.0  # ✅ PASS (recommended)
v16.20.0  # ❌ FAIL
```

**Troubleshooting**:
- **If Node.js < 18**: Update using [nvm](https://github.com/nvm-sh/nvm) or download from [nodejs.org](https://nodejs.org/)
- **macOS**: `brew install node` or `nvm install 20`
- **Verification**: Restart terminal after installation

### 1.2 Package Manager Availability 🔴 CRITICAL

**Requirement**: npm, yarn, or pnpm available

**Verification Steps**:
```bash
npm --version
# OR
yarn --version
# OR
pnpm --version
```

**Pass Criteria**: Any package manager returns version number

**Expected Output**:
```
10.2.4  # ✅ PASS (npm)
1.22.19 # ✅ PASS (yarn)
8.15.0  # ✅ PASS (pnpm)
```

**Troubleshooting**:
- **npm missing**: Reinstall Node.js (includes npm)
- **yarn missing**: `npm install -g yarn`
- **pnpm missing**: `npm install -g pnpm`

---

## 2. NextJS Version Compatibility Verification

### 2.1 NextJS Version Check 🔴 CRITICAL

**Requirement**: NextJS 15.x (current: 15.5.4)

**Verification Steps**:
```bash
# Check package.json
cat package.json | grep '"next"'
# OR check installed version
npm list next
```

**Pass Criteria**: 
- NextJS version is 15.x.x
- Version 15.5.4 is optimal (current project version)

**Expected Output**:
```json
"next": "^15.5.4"  # ✅ PASS
```

**Troubleshooting**:
- **Version < 15**: `npm install next@latest`
- **Version conflicts**: Check for version locks in `package-lock.json`
- **Build issues**: Clear `.next` folder and rebuild

### 2.2 App Router Architecture Detection 🔴 CRITICAL

**Requirement**: Project uses App Router (not Pages Router)

**Verification Steps**:
```bash
# Check for app directory
ls -la | grep "app"
# Verify app directory structure
ls -la app/
# Check for pages directory (should not exist or be minimal)
ls -la pages/ 2>/dev/null || echo "No pages directory (Good - App Router)"
```

**Pass Criteria**:
- `app/` directory exists
- Contains `layout.tsx` and route files
- No `pages/` directory or minimal usage

**Expected Output**:
```
drwxr-xr-x  app/           # ✅ PASS
layout.tsx                 # ✅ PASS
page.tsx                   # ✅ PASS
No pages directory (Good - App Router)  # ✅ PASS
```

**Troubleshooting**:
- **Pages Router detected**: Migration required - see [NextJS App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- **Mixed architecture**: Remove Pages Router components or complete migration

### 2.3 React Version Compatibility 🔴 CRITICAL

**Requirement**: React 18.x or 19.x (current: 19.2.0)

**Verification Steps**:
```bash
# Check React version
cat package.json | grep '"react"'
npm list react
```

**Pass Criteria**: React version 18.x.x or 19.x.x

**Expected Output**:
```json
"react": "^19.2.0"  # ✅ PASS (optimal)
"react": "^18.2.0"  # ✅ PASS (compatible)
```

**Troubleshooting**:
- **Version < 18**: `npm install react@latest react-dom@latest`
- **Peer dependency warnings**: Update related packages

---

## 3. Project Structure Assessment

### 3.1 Directory Structure Verification 🟡 RECOMMENDED

**Requirement**: Standard NextJS App Router structure

**Verification Steps**:
```bash
# Verify core directories
echo "=== Core Structure ==="
ls -la | grep -E "(app|components|lib|public)"

echo "=== App Directory Contents ==="
find app -type f -name "*.tsx" -o -name "*.ts" | head -10

echo "=== Components Directory ==="
ls -la components/ | wc -l
```

**Pass Criteria**:
- `app/` directory with layout.tsx
- `components/` directory exists
- `lib/` directory for utilities
- `public/` directory for assets

**Expected Output**:
```
=== Core Structure ===
drwxr-xr-x  app/           # ✅ PASS
drwxr-xr-x  components/    # ✅ PASS
drwxr-xr-x  lib/           # ✅ PASS
drwxr-xr-x  public/        # ✅ PASS

=== App Directory Contents ===
app/layout.tsx             # ✅ PASS
app/page.tsx               # ✅ PASS
app/onboarding/page.tsx    # ✅ PASS

=== Components Directory ===
15                         # ✅ PASS (15+ components identified)
```

**Troubleshooting**:
- **Missing directories**: Create with `mkdir -p components lib`
- **Incorrect structure**: Reorganize files according to NextJS conventions

### 3.2 TypeScript Configuration Verification 🔴 CRITICAL

**Requirement**: TypeScript properly configured with strict mode

**Verification Steps**:
```bash
# Check TypeScript config
cat tsconfig.json | grep -E "(strict|target|module)"

# Verify TypeScript version
npm list typescript
```

**Pass Criteria**:
- `tsconfig.json` exists with strict mode enabled
- TypeScript version 5.x
- Target ES2017 or higher

**Expected Output**:
```json
"strict": true,            # ✅ PASS
"target": "ES2017",        # ✅ PASS
"module": "esnext",        # ✅ PASS
typescript@5.9.3           # ✅ PASS
```

**Troubleshooting**:
- **Missing tsconfig.json**: Run `npx tsc --init`
- **Strict mode disabled**: Enable with `"strict": true`
- **Old TypeScript**: Update with `npm install typescript@latest`

---

## 4. Existing Internationalization Setup Analysis

### 4.1 Current i18n Infrastructure Check 🟡 RECOMMENDED

**Requirement**: No conflicting i18n libraries (clean slate preferred)

**Verification Steps**:
```bash
# Check for existing i18n packages
echo "=== Checking for existing i18n libraries ==="
cat package.json | grep -i -E "(i18n|intl|locale|translation)"

# Check for translation files
echo "=== Checking for existing translation files ==="
find . -name "*.json" | grep -i -E "(locale|lang|translation|i18n)" | head -5

# Check for i18n configuration
echo "=== Checking for i18n configuration ==="
find . -name "*i18n*" -o -name "*locale*" | head -5
```

**Pass Criteria**:
- No existing i18n libraries found (clean slate)
- No translation files present
- No i18n configuration files

**Expected Output**:
```
=== Checking for existing i18n libraries ===
(no output)                # ✅ PASS (clean slate)

=== Checking for existing translation files ===
(no output)                # ✅ PASS (no conflicts)

=== Checking for i18n configuration ===
(no output)                # ✅ PASS (ready for Lingo.dev)
```

**Troubleshooting**:
- **Existing i18n libraries found**: 
  - Document current setup
  - Plan migration strategy
  - Consider removing conflicting packages
- **Translation files exist**: Backup and plan integration approach

### 4.2 Hard-coded Text Detection 🟡 RECOMMENDED

**Requirement**: Identify components with translatable content

**Verification Steps**:
```bash
# Find components with hard-coded text (sample check)
echo "=== Components with potential translatable text ==="
grep -r "className.*text-" components/ | wc -l
grep -r "title\|placeholder\|aria-label" app/ | wc -l

# Check specific high-priority components
echo "=== High-priority components check ==="
ls -la app/layout.tsx app/onboarding/ app/inspiration/ components/RecommendationCard.tsx 2>/dev/null
```

**Pass Criteria**:
- Components identified for translation
- Text content is accessible for extraction
- No complex text interpolation blocking translation

**Expected Output**:
```
=== Components with potential translatable text ===
45                         # ✅ PASS (text found for translation)
23                         # ✅ PASS (UI elements with text)

=== High-priority components check ===
app/layout.tsx             # ✅ PASS (needs translation)
app/onboarding/            # ✅ PASS (needs translation)
components/RecommendationCard.tsx  # ✅ PASS (needs translation)
```

**Troubleshooting**:
- **No translatable text found**: Verify component structure
- **Complex interpolation**: Plan for Lingo.dev's handling of dynamic content

---

## 5. Dependency Conflict Identification

### 5.1 Package Compatibility Analysis 🔴 CRITICAL

**Requirement**: No conflicting packages that interfere with Lingo.dev

**Verification Steps**:
```bash
# Check for potentially conflicting packages
echo "=== Checking for conflicting packages ==="
cat package.json | grep -E "(react-i18next|next-i18next|react-intl|formatjs)"

# Verify core dependencies
echo "=== Core dependency versions ==="
npm list react next typescript --depth=0

# Check for peer dependency issues
echo "=== Peer dependency check ==="
npm ls 2>&1 | grep -i "peer dep" || echo "No peer dependency issues"
```

**Pass Criteria**:
- No conflicting i18n packages
- Core dependencies compatible
- No peer dependency warnings

**Expected Output**:
```
=== Checking for conflicting packages ===
(no output)                # ✅ PASS (no conflicts)

=== Core dependency versions ===
react@19.2.0               # ✅ PASS
next@15.5.4                # ✅ PASS
typescript@5.9.3           # ✅ PASS

=== Peer dependency check ===
No peer dependency issues  # ✅ PASS
```

**Troubleshooting**:
- **Conflicting packages found**: Remove or plan migration
- **Peer dependency issues**: Update packages to resolve conflicts
- **Version mismatches**: Align versions with project requirements

### 5.2 Build Dependencies Verification 🟡 RECOMMENDED

**Requirement**: Build tools compatible with Lingo.dev integration

**Verification Steps**:
```bash
# Check build-related packages
echo "=== Build tool versions ==="
npm list @types/node @types/react @types/react-dom --depth=0

# Verify PostCSS and Tailwind (if used)
echo "=== Styling dependencies ==="
npm list tailwindcss postcss autoprefixer --depth=0 2>/dev/null || echo "Styling packages not found"
```

**Pass Criteria**:
- Type definitions are current
- Build tools are compatible versions
- No build-blocking conflicts

**Expected Output**:
```
=== Build tool versions ===
@types/node@24.7.2         # ✅ PASS
@types/react@19.2.2        # ✅ PASS
@types/react-dom@19.2.1    # ✅ PASS

=== Styling dependencies ===
tailwindcss@3.4.18         # ✅ PASS (compatible)
postcss@8.5.6              # ✅ PASS
autoprefixer@10.4.21       # ✅ PASS
```

**Troubleshooting**:
- **Outdated types**: Update with `npm install @types/node@latest @types/react@latest`
- **Build tool conflicts**: Check compatibility matrix

---

## 6. Environment and Authentication Prerequisites

### 6.1 Lingo.dev Engine Authentication Setup 🔴 CRITICAL

**Requirement**: Lingo.dev API key configuration

**Verification Steps**:
```bash
# Check for environment file
echo "=== Environment file check ==="
ls -la .env.local .env.local.example

# Verify environment structure (without exposing keys)
echo "=== Environment variables structure ==="
if [ -f .env.local ]; then
  grep -E "^[A-Z_]+" .env.local | sed 's/=.*/=***' || echo "No environment variables found"
else
  echo "No .env.local file found"
fi
```

**Pass Criteria**:
- `.env.local` file exists or can be created
- Environment structure supports API keys
- No conflicting environment variables

**Expected Output**:
```
=== Environment file check ===
.env.local.example         # ✅ PASS (template exists)
.env.local                 # ✅ PASS (or ready to create)

=== Environment variables structure ===
NEXT_PUBLIC_MAPBOX_KEY=*** # ✅ PASS (existing structure)
LINGODOTDEV_API_KEY=***    # ✅ PASS (ready for Lingo.dev)
```

**Setup Instructions**:
```bash
# Create environment file if missing
cp .env.local.example .env.local

# Add Lingo.dev API key
echo "LINGODOTDEV_API_KEY=your_lingo_dev_api_key_here" >> .env.local
```

**Troubleshooting**:
- **Missing .env.local**: Create from example template
- **Permission issues**: Check file permissions with `chmod 600 .env.local`
- **API key format**: Ensure no spaces or quotes around the key

### 6.2 Google Gemini Alternative Provider Setup 🟡 RECOMMENDED

**Requirement**: Google Gemini API key as alternative LLM provider

**Verification Steps**:
```bash
# Check for Google API key in environment
echo "=== Google Gemini setup check ==="
if [ -f .env.local ]; then
  grep "GOOGLE_API_KEY" .env.local | sed 's/=.*/=***' || echo "GOOGLE_API_KEY not found"
else
  echo "No .env.local file for Google API key"
fi

# Verify Gemini CLI availability
echo "=== Gemini CLI check ==="
which gemini || echo "Gemini CLI not found (optional)"
gemini --version 2>/dev/null || echo "Gemini CLI not available"
```

**Pass Criteria**:
- `GOOGLE_API_KEY` configured in environment
- Gemini CLI available (optional but helpful)
- API key format is valid

**Expected Output**:
```
=== Google Gemini setup check ===
GOOGLE_API_KEY=***         # ✅ PASS (alternative provider ready)

=== Gemini CLI check ===
/usr/local/bin/gemini      # ✅ PASS (CLI available)
gemini version 1.0.0       # ✅ PASS (working CLI)
```

**Setup Instructions**:
```bash
# Add Google API key to environment
echo "GOOGLE_API_KEY=your_google_api_key_here" >> .env.local

# Test Gemini CLI (if available)
gemini auth login
```

**Troubleshooting**:
- **Missing API key**: Obtain from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **CLI issues**: Install with `npm install -g @google/generative-ai`
- **Authentication errors**: Verify API key permissions

---

## 7. Build System Compatibility Verification

### 7.1 Next.js Build Process Check 🔴 CRITICAL

**Requirement**: Clean build process compatible with Lingo.dev compiler integration

**Verification Steps**:
```bash
# Test current build process
echo "=== Build process verification ==="
npm run build 2>&1 | tail -10

# Check build output structure
echo "=== Build output check ==="
ls -la .next/ 2>/dev/null | head -5 || echo "No build output found"

# Verify build scripts
echo "=== Build scripts check ==="
cat package.json | grep -A 5 -B 5 '"scripts"'
```

**Pass Criteria**:
- Build completes without errors
- Standard NextJS build output structure
- Build scripts are properly configured

**Expected Output**:
```
=== Build process verification ===
✓ Compiled successfully        # ✅ PASS
Route (app)                    # ✅ PASS (App Router confirmed)
Size     First Load JS         # ✅ PASS (build metrics)

=== Build output check ===
drwxr-xr-x  .next/            # ✅ PASS (build directory)
drwxr-xr-x  static/           # ✅ PASS (static assets)

=== Build scripts check ===
"dev": "next dev",            # ✅ PASS
"build": "next build",        # ✅ PASS
"start": "next start"         # ✅ PASS
```

**Troubleshooting**:
- **Build errors**: Fix TypeScript/ESLint issues first
- **Missing scripts**: Add standard NextJS scripts to package.json
- **Build performance**: Clear `.next` and `node_modules` if needed

### 7.2 Compiler Integration Readiness 🟡 RECOMMENDED

**Requirement**: Next.js configuration ready for Lingo.dev compiler integration

**Verification Steps**:
```bash
# Check current Next.js configuration
echo "=== Next.js configuration check ==="
cat next.config.js

# Verify configuration format
echo "=== Configuration format verification ==="
node -e "console.log('Config syntax valid:', !!require('./next.config.js'))"
```

**Pass Criteria**:
- `next.config.js` exists and is valid
- Configuration uses modern format (ES modules ready)
- No conflicting compiler configurations

**Expected Output**:
```
=== Next.js configuration check ===
/** @type {import('next').NextConfig} */
const nextConfig = {          # ✅ PASS (standard format)
  images: {                   # ✅ PASS (existing config)
    domains: ['images.unsplash.com'],
  },
}
module.exports = nextConfig   # ✅ PASS (ready for modification)

=== Configuration format verification ===
Config syntax valid: true    # ✅ PASS
```

**Troubleshooting**:
- **Missing config**: Create with `touch next.config.js`
- **Syntax errors**: Validate JavaScript syntax
- **Module format**: Prepare for ES module conversion if needed

---

## 8. File Organization Requirements

### 8.1 Translation File Directory Preparation 🟡 RECOMMENDED

**Requirement**: Space and structure for auto-generated translation files

**Verification Steps**:
```bash
# Check available disk space
echo "=== Disk space check ==="
df -h . | tail -1

# Verify write permissions
echo "=== Write permission check ==="
touch .test_write && rm .test_write && echo "Write permissions OK" || echo "Write permission denied"

# Check for potential lingo directory conflicts
echo "=== Lingo directory check ==="
ls -la lingo/ 2>/dev/null || echo "No existing lingo directory (good)"
```

**Pass Criteria**:
- Sufficient disk space (>100MB recommended)
- Write permissions in project root
- No conflicting `lingo/` directory

**Expected Output**:
```
=== Disk space check ===
/dev/disk1  465Gi  234Gi  230Gi    51%    /  # ✅ PASS (sufficient space)

=== Write permission check ===
Write permissions OK       # ✅ PASS

=== Lingo directory check ===
No existing lingo directory (good)  # ✅ PASS (ready for auto-generation)
```

**Troubleshooting**:
- **Insufficient space**: Clean up node_modules, .next, or other large directories
- **Permission denied**: Check directory ownership and permissions
- **Conflicting directory**: Backup and remove existing `lingo/` directory

### 8.2 Asset Organization Verification 🟢 OPTIONAL

**Requirement**: Static assets properly organized for internationalization

**Verification Steps**:
```bash
# Check public directory structure
echo "=== Public assets check ==="
find public -type f | head -10

# Verify image optimization setup
echo "=== Image optimization check ==="
cat next.config.js | grep -A 5 "images" || echo "No image optimization config"
```

**Pass Criteria**:
- Assets are in `public/` directory
- Image optimization configured
- Asset paths are relative and consistent

**Expected Output**:
```
=== Public assets check ===
public/assets/logo.svg     # ✅ PASS (organized structure)
public/assets/avatar.png   # ✅ PASS
public/videos/README.md    # ✅ PASS

=== Image optimization check ===
images: {                  # ✅ PASS (optimization configured)
  domains: ['images.unsplash.com'],
}
```

**Troubleshooting**:
- **Disorganized assets**: Reorganize into logical subdirectories
- **Missing optimization**: Add image domains to next.config.js

---

## 9. Locale Routing and URL Structure

### 9.1 URL Structure Compatibility 🟡 RECOMMENDED

**Requirement**: Current routing structure supports locale prefixes

**Verification Steps**:
```bash
# Check current route structure
echo "=== Current route structure ==="
find app -name "page.tsx" | sed 's|app/||' | sed 's|/page.tsx||' | sort

# Verify dynamic routing usage
echo "=== Dynamic routing check ==="
find app -name "\[*\]" | head -5 || echo "No dynamic routes found"
```

**Pass Criteria**:
- Routes are clearly defined
- No conflicting route patterns
- Structure supports locale prefixes (e.g., `/es/onboarding`)

**Expected Output**:
```
=== Current route structure ===
                              # ✅ PASS (root route)
confirmation                  # ✅ PASS (static route)
inspiration                   # ✅ PASS (static route)
onboarding                    # ✅ PASS (static route)
recommendations               # ✅ PASS (static route)

=== Dynamic routing check ===
No dynamic routes found       # ✅ PASS (simple structure, good for i18n)
```

**Troubleshooting**:
- **Complex routing**: Document current structure for locale integration planning
- **Conflicting patterns**: Resolve route conflicts before integration

### 9.2 Navigation Component Analysis 🟡 RECOMMENDED

**Requirement**: Navigation components ready for locale-aware routing

**Verification Steps**:
```bash
# Find navigation-related components
echo "=== Navigation components check ==="
grep -r "useRouter\|Link\|href" components/ | wc -l
grep -r "router.push\|router.replace" components/ | wc -l || echo "0"

# Check for hard-coded navigation paths
echo "=== Hard-coded paths check ==="
grep -r "href=\"/" components/ | head -3 || echo "No hard-coded paths found"
```

**Pass Criteria**:
- Navigation components identified
- Routing patterns are consistent
- Paths can be easily modified for locale support

**Expected Output**:
```
=== Navigation components check ===
12                            # ✅ PASS (navigation usage found)
3                             # ✅ PASS (programmatic navigation)

=== Hard-coded paths check ===
No hard-coded paths found     # ✅ PASS (flexible routing)
```

**Troubleshooting**:
- **Hard-coded paths**: Document for locale-aware conversion
- **Complex navigation**: Plan for locale parameter integration

---

## 10. Target Language Verification

### 10.1 European Market Language Support 🟡 RECOMMENDED

**Requirement**: Verify support for Spanish (es), French (fr), German (de)

**Verification Steps**:
```bash
# Check system locale support
echo "=== System locale support ==="
locale -a | grep -E "(es_|fr_|de_)" | head -3 || echo "System locales may need installation"

# Verify Unicode/UTF-8 support
echo "=== Unicode support check ==="
echo "Test: español, français, deutsch" | wc -c
node -e "console.log('Unicode test:', 'español français deutsch'.length)"
```

**Pass Criteria**:
- System supports target locales
- Unicode characters display correctly
- No encoding issues

**Expected Output**:
```
=== System locale support ===
es_ES.UTF-8               # ✅ PASS (Spanish support)
fr_FR.UTF-8               # ✅ PASS (French support)
de_DE.UTF-8               # ✅ PASS (German support)

=== Unicode support check ===
32                        # ✅ PASS (correct character count)
Unicode test: 23          # ✅ PASS (Unicode handling)
```

**Troubleshooting**:
- **Missing locales**: Install with system package manager
- **Encoding issues**: Verify terminal and editor UTF-8 support
- **Character display**: Check font support for target languages

### 10.2 Content Readiness Assessment 🟢 OPTIONAL

**Requirement**: Content structure suitable for target languages

**Verification Steps**:
```bash
# Analyze text content length (for layout considerations)
echo "=== Content length analysis ==="
grep -r "title\|description" app/ | head -3

# Check for text that might need special handling
echo "=== Special content check ==="
grep -r "€\|\$\|%" components/ | wc -l || echo "0"
```

**Pass Criteria**:
- Content length is reasonable for translation
- Currency and number formats identified
- No content blocking translation

**Expected Output**:
```
=== Content length analysis ===
title: 'TetrisTravel - Local Experiences'  # ✅ PASS (reasonable length)
description: 'Discover authentic local...' # ✅ PASS (translatable)

=== Special content check ===
5                         # ✅ PASS (currency/numbers identified)
```

**Troubleshooting**:
- **Very long content**: Consider breaking into smaller translatable units
- **Complex formatting**: Plan for locale-specific formatting

---

## 11. Final Readiness Assessment

### 11.1 Integration Readiness Score 🔴 CRITICAL

**Automated Verification Script**:
```bash
#!/bin/bash
echo "=== LINGO.DEV INTEGRATION READINESS ASSESSMENT ==="
echo ""

SCORE=0
TOTAL=0

# Node.js version check
TOTAL=$((TOTAL + 1))
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
  echo "✅ Node.js version: $(node --version)"
  SCORE=$((SCORE + 1))
else
  echo "❌ Node.js version: $(node --version) (requires 18+)"
fi

# NextJS version check
TOTAL=$((TOTAL + 1))
if grep -q '"next".*"15\.' package.json; then
  echo "✅ NextJS version: Compatible"
  SCORE=$((SCORE + 1))
else
  echo "❌ NextJS version: Incompatible or not found"
fi

# App Router check
TOTAL=$((TOTAL + 1))
if [ -d "app" ] && [ -f "app/layout.tsx" ]; then
  echo "✅ App Router: Detected"
  SCORE=$((SCORE + 1))
else
  echo "❌ App Router: Not detected"
fi

# TypeScript check
TOTAL=$((TOTAL + 1))
if [ -f "tsconfig.json" ] && grep -q '"strict".*true' tsconfig.json; then
  echo "✅ TypeScript: Properly configured"
  SCORE=$((SCORE + 1))
else
  echo "❌ TypeScript: Missing or not strict"
fi

# Build test
TOTAL=$((TOTAL + 1))
if npm run build > /dev/null 2>&1; then
  echo "✅ Build process: Successful"
  SCORE=$((SCORE + 1))
else
  echo "❌ Build process: Failed"
fi

echo ""
echo "=== READINESS SCORE: $SCORE/$TOTAL ==="
echo ""

if [ "$SCORE" -eq "$TOTAL" ]; then
  echo "🎉 READY FOR INTEGRATION!"
  echo "All critical requirements met. Proceed with Lingo.dev setup."
elif [ "$SCORE" -ge $((TOTAL * 3 / 4)) ]; then
  echo "⚠️  MOSTLY READY"
  echo "Address remaining issues before integration."
else
  echo "🚫 NOT READY"
  echo "Critical issues must be resolved before integration."
fi
```

**Pass Criteria**: Score 5/5 for full readiness

**Usage**:
```bash
# Save script as check-lingo-readiness.sh
chmod +x check-lingo-readiness.sh
./check-lingo-readiness.sh
```

### 11.2 Pre-Integration Checklist Summary 🔴 CRITICAL

**Final Verification Checklist**:

- [ ] **System Requirements**
  - [ ] Node.js 18+ installed and verified
  - [ ] Package manager (npm/yarn/pnpm) available
  
- [ ] **NextJS Compatibility**
  - [ ] NextJS 15.x confirmed
  - [ ] App Router architecture verified
  - [ ] React 18+ or 19+ confirmed
  
- [ ] **Project Structure**
  - [ ] Standard directory structure present
  - [ ] TypeScript configured with strict mode
  - [ ] Build process working without errors
  
- [ ] **Dependencies**
  - [ ] No conflicting i18n packages
  - [ ] Core dependencies compatible
  - [ ] No peer dependency warnings
  
- [ ] **Environment Setup**
  - [ ] `.env.local` file ready for API keys
  - [ ] Lingo.dev API key obtained (or Google Gemini alternative)
  - [ ] Environment variables properly formatted
  
- [ ] **Build System**
  - [ ] Clean build process confirmed
  - [ ] `next.config.js` ready for modification
  - [ ] No compiler conflicts
  
- [ ] **File Organization**
  - [ ] Sufficient disk space available
  - [ ] Write permissions verified
  - [ ] No conflicting directories

**Success Criteria**: All critical (🔴) items must be checked before proceeding.

---

## 12. Next Steps After Verification

### 12.1 Immediate Actions Upon Passing All Checks

1. **Install Lingo.dev Compiler**:
   ```bash
   npm install lingo.dev
   ```

2. **Update next.config.js**:
   ```javascript
   import lingoCompiler from "lingo.dev/compiler";
   
   export default lingoCompiler.next({
     sourceLocale: "en",
     targetLocales: ["es", "fr", "de"],
     models: "lingo.dev", // or "google" for Gemini
   });
   ```

3. **Update app/layout.tsx**:
   ```jsx
   import { LingoProvider, loadDictionary } from "lingo.dev/react/rsc";
   
   export default function Layout({ children }) {
     return (
       <LingoProvider loadDictionary={(locale) => loadDictionary(locale)}>
         <html>
           <body>{children}</body>
         </html>
       </LingoProvider>
     );
   }
   ```

### 12.2 Troubleshooting Resources

**Common Issues and Solutions**:

| Issue | Solution |
|-------|----------|
| Build fails after Lingo.dev installation | Clear `.next` directory and rebuild |
| API key not recognized | Verify environment variable format and restart dev server |
| Translation files not generated | Check file permissions and disk space |
| TypeScript errors | Update `@types/node` and restart TypeScript server |
| Locale routing issues | Verify App Router structure and route organization |

**Support Resources**:
- [Lingo.dev Documentation](https://lingo.dev/docs)
- [NextJS App Router Guide](https://nextjs.org/docs/app)
- [TypeScript Configuration](https://www.typescriptlang.org/tsconfig)

---

## Conclusion

This comprehensive prerequisites checklist ensures your TetrisTravel NextJS application is fully prepared for Lingo.dev Compiler integration. Each verification step includes specific commands, clear pass/fail criteria, and troubleshooting guidance.

**Key Success Factors**:
- ✅ Modern NextJS 15.5.4 with App Router
- ✅ Clean TypeScript implementation  
- ✅ No conflicting dependencies
- ✅ Proper environment configuration
- ✅ Target language support (Spanish, French, German)

**Integration Confidence**: High - All requirements align with current project structure.

---

*Checklist Version: 1.0*  
*Compatible with: NextJS 15.5.4, Lingo.dev Compiler (Latest)*  
*Target Languages: Spanish (es), French (fr), German (de)*  
*Last Updated: 2025-10-12*