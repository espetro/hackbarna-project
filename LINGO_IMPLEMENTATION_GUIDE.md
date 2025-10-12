# Lingo.dev Compiler Integration Guide for TetrisTravel

## Overview

This comprehensive guide provides step-by-step instructions for integrating Lingo.dev Compiler with the TetrisTravel NextJS project. The integration will enable automatic localization for Spanish, French, and German markets using Lingo.dev's AST-based extraction and LLM-powered translation approach.

**Project Context:**
- NextJS 15.5.4 with React 19.2.0
- TypeScript configuration
- Target languages: Spanish (es), French (fr), German (de)
- Clean slate advantage (no existing i18n infrastructure)
- 15+ components identified for translation

---

## Phase 1: Package Installation

### 1.1 Install Lingo.dev Compiler

```bash
# Using npm
npm install @lingo-dev/compiler --save-dev

# Using pnpm (recommended for this project)
pnpm add -D @lingo-dev/compiler
```

### 1.2 Install Lingo.dev Engine (Authentication Package)

```bash
# Using npm
npm install @lingo-dev/engine

# Using pnpm
pnpm add @lingo-dev/engine
```

### 1.3 Install Additional Dependencies

```bash
# Install required peer dependencies
pnpm add -D @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript

# Install optional LLM provider packages (backup options)
pnpm add openai @google/generative-ai
```

### 1.4 Verify Installation

```bash
# Check installed packages
pnpm list @lingo-dev/compiler @lingo-dev/engine

# Expected output should show both packages installed
```

---

## Phase 2: Next.config.js Configuration

### 2.1 Update Next.config.js

Replace the existing [`next.config.js`](next.config.js:1) with the following configuration:

```javascript
/** @type {import('next').NextConfig} */
const { withLingo } = require('@lingo-dev/compiler/next');

const nextConfig = {
  // Existing configuration
  images: {
    domains: ['images.unsplash.com', 'source.unsplash.com'],
  },
  
  // Lingo.dev Compiler configuration
  experimental: {
    // Enable experimental features required by Lingo
    swcPlugins: [
      ['@lingo-dev/compiler/swc', {}]
    ],
  },
  
  // Internationalization configuration
  i18n: {
    locales: ['en', 'es', 'fr', 'de'],
    defaultLocale: 'en',
    localeDetection: true,
  },
  
  // Webpack configuration for Lingo
  webpack: (config, { dev, isServer }) => {
    // Add Lingo.dev Compiler webpack plugin
    if (!isServer) {
      config.plugins.push(
        new (require('@lingo-dev/compiler/webpack'))({
          // Configuration options
          sourceLocale: 'en',
          targetLocales: ['es', 'fr', 'de'],
          outputDir: '.lingo',
          extractionRules: {
            // Only process .tsx and .jsx files
            include: /\.(tsx|jsx)$/,
            exclude: /node_modules/,
          },
        })
      );
    }
    
    return config;
  },
  
  // Environment variables for build process
  env: {
    LINGO_SOURCE_LOCALE: 'en',
    LINGO_TARGET_LOCALES: 'es,fr,de',
  },
};

module.exports = withLingo(nextConfig);
```

### 2.2 Alternative Configuration (Without Webpack Plugin)

If the webpack plugin approach causes issues, use this simpler configuration:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'source.unsplash.com'],
  },
  
  // Basic i18n configuration
  i18n: {
    locales: ['en', 'es', 'fr', 'de'],
    defaultLocale: 'en',
    localeDetection: true,
  },
  
  // Lingo environment variables
  env: {
    LINGO_SOURCE_LOCALE: 'en',
    LINGO_TARGET_LOCALES: 'es,fr,de',
  },
};

module.exports = nextConfig;
```

---

## Phase 3: File Structure Reorganization

### 3.1 Create Lingo Directory Structure

```bash
# Create Lingo.dev working directories
mkdir -p .lingo/meta
mkdir -p .lingo/dictionaries
mkdir -p .lingo/cache

# Create locale-specific asset directories
mkdir -p public/locales/es
mkdir -p public/locales/fr
mkdir -p public/locales/de
```

### 3.2 Update .gitignore

Add the following entries to [`.gitignore`](.gitignore):

```gitignore
# Lingo.dev Compiler auto-generated files
.lingo/
meta.json
dictionary.js
dictionary.*.js

# Locale-specific generated content
public/locales/*/generated/

# Lingo cache and temporary files
.lingo-cache/
lingo-temp/
```

### 3.3 Expected File Structure After Integration

```
project-root/
├── .lingo/                          # Lingo working directory
│   ├── meta/                        # Extracted content metadata
│   ├── dictionaries/                # Generated translation dictionaries
│   └── cache/                       # Build cache
├── public/
│   └── locales/                     # Locale-specific assets
│       ├── es/                      # Spanish assets
│       ├── fr/                      # French assets
│       └── de/                      # German assets
├── app/                             # Next.js app directory (unchanged)
├── components/                      # React components (to be updated)
├── meta.json                        # Auto-generated (DO NOT EDIT)
└── dictionary.js                    # Auto-generated (DO NOT EDIT)
```

---

## Phase 4: Component Code Updates

### 4.1 Inspiration Page Updates

**BEFORE** - [`app/inspiration/page.tsx`](app/inspiration/page.tsx:145-147):
```tsx
<h1 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-2">
  What do u fancy and when can you make it?
</h1>
```

**AFTER** - Lingo-compatible format:
```tsx
<h1 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-2">
  What do u fancy and when can you make it?
</h1>
```

**BEFORE** - String literal (will NOT be localized):
```tsx
if (!query.trim()) {
  setError('Please enter what kind of experience you are looking for');
  return;
}
```

**AFTER** - JSX element (WILL be localized):
```tsx
if (!query.trim()) {
  setError(''); // Clear any existing error first
  // Use JSX element for localizable error message
  return;
}

// In the JSX return:
{error && (
  <div className="px-8 pb-4">
    <p className="text-red-500 text-sm flex items-center gap-2" role="alert">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
      </svg>
      {!query.trim() && <>Please enter what kind of experience you are looking for</>}
    </p>
  </div>
)}
```

**BEFORE** - [`app/inspiration/page.tsx`](app/inspiration/page.tsx:158):
```tsx
placeholder="e.g., I have 3 hours in Paris and I'd love a local foodie experience..."
```

**AFTER** - Placeholder will be automatically localized:
```tsx
placeholder="e.g., I have 3 hours in Paris and I'd love a local foodie experience..."
```

### 4.2 RecommendationCard Component Updates

**BEFORE** - [`components/RecommendationCard.tsx`](components/RecommendationCard.tsx:74-76):
```tsx
<button>
  Book Now
</button>
```

**AFTER** - Text content will be automatically localized:
```tsx
<button
  onClick={(e) => {
    e.stopPropagation();
    onBook();
  }}
  className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors duration-200"
>
  Book Now
</button>
```

**BEFORE** - [`components/RecommendationCard.tsx`](components/RecommendationCard.tsx:31):
```tsx
alt={recommendation.title}
```

**AFTER** - Alt attributes will be automatically localized:
```tsx
alt={recommendation.title}
```

### 4.3 Onboarding Page Updates

**BEFORE** - [`app/onboarding/page.tsx`](app/onboarding/page.tsx:13-25):
```tsx
const onboardingSteps = [
  {
    src: '/assets/before.mp4',
    caption: 'For the savvy business traveller with some time.',
    poster: '/assets/barceloneta.png',
  },
  // ... other steps
];
```

**AFTER** - Move captions to JSX elements for localization:
```tsx
const onboardingSteps = [
  {
    src: '/assets/before.mp4',
    captionKey: 'onboarding_step_1',
    poster: '/assets/barceloneta.png',
  },
  {
    src: '/assets/oldway.mp4',
    captionKey: 'onboarding_step_2',
    poster: '/assets/flamenco.png',
  },
  {
    src: '/assets/after.mp4',
    captionKey: 'onboarding_step_3',
    poster: '/assets/camp nou.png',
  },
] as const;

// Caption rendering function
const renderCaption = (stepIndex: number) => {
  switch (stepIndex) {
    case 0:
      return <>For the savvy business traveller with some time.</>;
    case 1:
      return <>Stop going to the old soulless attractions that feel like losing time.</>;
    case 2:
      return <>Use TetrisTravel to slip in local-like experiences.</>;
    default:
      return <></>;
  }
};

// In the JSX:
<h1 className="text-3xl md:text-5xl lg:text-6xl font-light text-white text-center leading-tight tracking-tight max-w-4xl mx-auto bg-blue-600/80 backdrop-blur-sm px-8 py-6 rounded-2xl">
  {renderCaption(currentStep)}
</h1>
```

### 4.4 Common Patterns for Lingo Compatibility

#### ✅ LOCALIZABLE - JSX Elements
```tsx
// These WILL be localized automatically
<div>Welcome to TetrisTravel</div>
<span>Book your experience</span>
<p>Find amazing local experiences</p>
<>Get started today</>
```

#### ✅ LOCALIZABLE - Specific Attributes
```tsx
// These attributes WILL be localized automatically
<img alt="Beautiful Barcelona view" />
<button aria-label="Close dialog" />
<input placeholder="Enter your destination" />
<button title="Save to favorites" />
```

#### ❌ NOT LOCALIZABLE - String Literals
```tsx
// These will NOT be localized
const message = "This stays in English";
const error = `Error: ${details}`;
const apiUrl = "https://api.example.com";
```

#### ❌ NOT LOCALIZABLE - Data Attributes
```tsx
// These will NOT be localized
<div data-testid="login-button">Login</div>
<span data-cy="user-menu">Menu</span>
```

---

## Phase 5: Build Process Adjustments

### 5.1 Update package.json Scripts

Add the following scripts to [`package.json`](package.json:5-9):

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "lingo extract && lingo translate && next build",
    "build:dev": "lingo extract && next build",
    "start": "next start",
    "lint": "next lint",
    "lingo:extract": "lingo extract --source-locale en --target-locales es,fr,de",
    "lingo:translate": "lingo translate --all-locales",
    "lingo:validate": "lingo validate --check-coverage",
    "lingo:clean": "rm -rf .lingo meta.json dictionary*.js"
  }
}
```

### 5.2 Development Server Configuration

For development with live translation updates:

```bash
# Start development server with Lingo watching
pnpm run lingo:extract && pnpm run dev

# Or use the combined dev script
pnpm run build:dev && pnpm run dev
```

### 5.3 Production Build Process

```bash
# Full production build with translations
pnpm run build

# This will:
# 1. Extract localizable content (lingo extract)
# 2. Generate translations (lingo translate)
# 3. Build the Next.js application (next build)
```

### 5.4 CI/CD Integration

Add to your CI/CD pipeline:

```yaml
# Example GitHub Actions step
- name: Build with Lingo
  run: |
    pnpm install
    pnpm run lingo:extract
    pnpm run lingo:translate
    pnpm run build
  env:
    LINGO_API_KEY: ${{ secrets.LINGO_API_KEY }}
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

---

## Phase 6: Environment Variable Setup

### 6.1 Create .env.local

Create a new `.env.local` file with the following configuration:

```bash
# Lingo.dev Engine Configuration
LINGO_API_KEY=your_lingo_api_key_here
LINGO_PROJECT_ID=tetristravel
LINGO_SOURCE_LOCALE=en
LINGO_TARGET_LOCALES=es,fr,de

# LLM Provider Configuration (Primary)
LINGO_LLM_PROVIDER=lingo-engine
LINGO_ENGINE_ENDPOINT=https://api.lingo.dev/v1

# Backup LLM Providers
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Translation Quality Settings
LINGO_TRANSLATION_QUALITY=high
LINGO_CONTEXT_AWARENESS=true
LINGO_PRESERVE_FORMATTING=true

# Build Configuration
LINGO_EXTRACT_ON_BUILD=true
LINGO_VALIDATE_TRANSLATIONS=true
LINGO_CACHE_TRANSLATIONS=true

# Development Settings
LINGO_DEV_MODE=true
LINGO_VERBOSE_LOGGING=false
```

### 6.2 Update .env.local.example

Update the existing [`.env.local.example`](.env.local.example) to include Lingo variables:

```bash
# Add these lines to the existing .env.local.example file

# Lingo.dev Compiler Configuration
LINGO_API_KEY=your_lingo_api_key_here
LINGO_PROJECT_ID=your_project_id
LINGO_SOURCE_LOCALE=en
LINGO_TARGET_LOCALES=es,fr,de

# LLM Provider Keys (choose one or multiple as backup)
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

### 6.3 Environment Validation Script

Create a validation script to check environment setup:

```bash
# Add to package.json scripts
"lingo:check-env": "node -e \"
const required = ['LINGO_API_KEY', 'LINGO_PROJECT_ID'];
const missing = required.filter(key => !process.env[key]);
if (missing.length) {
  console.error('Missing required environment variables:', missing.join(', '));
  process.exit(1);
} else {
  console.log('✅ All required Lingo environment variables are set');
}
\""
```

---

## Phase 7: Validation and Testing

### 7.1 Pre-Integration Checklist

Before starting the integration, verify:

- [ ] NextJS version is 15.5.4 or compatible
- [ ] React version is 19.2.0 or compatible
- [ ] TypeScript is properly configured
- [ ] No existing i18n libraries are installed
- [ ] All target components use `.tsx` extensions

### 7.2 Post-Installation Validation

After installing packages:

```bash
# Verify Lingo installation
pnpm run lingo:check-env

# Test extraction (dry run)
pnpm run lingo:extract --dry-run

# Validate component compatibility
pnpm run lingo:validate
```

### 7.3 Component-Level Testing

Test each updated component:

```bash
# Extract content from specific components
lingo extract --include "app/inspiration/page.tsx"
lingo extract --include "components/RecommendationCard.tsx"
lingo extract --include "app/onboarding/page.tsx"

# Check extracted content
cat meta.json | jq '.extractedContent'
```

### 7.4 Build Testing

Test the complete build process:

```bash
# Clean build test
pnpm run lingo:clean
pnpm run build

# Verify generated files
ls -la meta.json dictionary*.js .lingo/
```

### 7.5 Runtime Testing

Test the application with different locales:

```bash
# Start development server
pnpm run dev

# Test URLs:
# http://localhost:3000 (default - English)
# http://localhost:3000/es (Spanish)
# http://localhost:3000/fr (French)
# http://localhost:3000/de (German)
```

---

## Phase 8: Troubleshooting

### 8.1 Common Installation Issues

**Issue**: Package installation fails
```bash
# Solution: Clear cache and reinstall
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Issue**: Peer dependency warnings
```bash
# Solution: Install missing peer dependencies
pnpm add -D @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript
```

### 8.2 Configuration Issues

**Issue**: Next.js build fails with Lingo plugin
```bash
# Solution: Use alternative configuration without webpack plugin
# See Phase 2.2 for alternative next.config.js
```

**Issue**: i18n routing not working
```bash
# Solution: Verify next.config.js i18n configuration
# Ensure locales array matches LINGO_TARGET_LOCALES
```

### 8.3 Content Extraction Issues

**Issue**: Text not being extracted for translation
```bash
# Check if content is in localizable format:
# ✅ JSX elements: <div>Text</div>
# ❌ String literals: const text = "Text"

# Debug extraction:
lingo extract --verbose --dry-run
```

**Issue**: Unwanted content being extracted
```bash
# Add to .lingoignore file:
echo "data-testid" >> .lingoignore
echo "className" >> .lingoignore
```

### 8.4 Translation Issues

**Issue**: Poor translation quality
```bash
# Solution: Increase translation quality setting
export LINGO_TRANSLATION_QUALITY=premium
export LINGO_CONTEXT_AWARENESS=true
```

**Issue**: API rate limits
```bash
# Solution: Configure backup LLM provider
export OPENAI_API_KEY=your_backup_key
export LINGO_FALLBACK_PROVIDER=openai
```

### 8.5 Build Issues

**Issue**: Build process hangs
```bash
# Solution: Check for infinite loops in extraction
lingo extract --timeout 30000 --max-iterations 100
```

**Issue**: Generated files not found
```bash
# Solution: Verify build order
pnpm run lingo:extract
pnpm run lingo:translate
pnpm run build
```

---

## Phase 9: Rollback Procedures

### 9.1 Emergency Rollback

If integration causes critical issues:

```bash
# 1. Remove Lingo packages
pnpm remove @lingo-dev/compiler @lingo-dev/engine

# 2. Restore original next.config.js
git checkout next.config.js

# 3. Remove Lingo files
rm -rf .lingo meta.json dictionary*.js

# 4. Restore original components
git checkout app/inspiration/page.tsx
git checkout components/RecommendationCard.tsx
git checkout app/onboarding/page.tsx

# 5. Clean build
pnpm run build
```

### 9.2 Partial Rollback

To rollback specific components:

```bash
# Rollback specific component
git checkout components/RecommendationCard.tsx

# Re-extract without problematic component
lingo extract --exclude "components/RecommendationCard.tsx"
```

### 9.3 Configuration Rollback

To rollback only configuration changes:

```bash
# Restore original configuration
git checkout next.config.js package.json

# Keep component changes but disable Lingo processing
export LINGO_EXTRACT_ON_BUILD=false
```

---

## Phase 10: Success Validation

### 10.1 Integration Success Criteria

✅ **Installation Success**:
- [ ] All Lingo packages installed without errors
- [ ] No peer dependency conflicts
- [ ] Environment variables configured

✅ **Configuration Success**:
- [ ] Next.js builds without errors
- [ ] i18n routing works for all target locales
- [ ] Auto-generated files are created

✅ **Component Success**:
- [ ] All target components render correctly
- [ ] Localizable content is properly formatted
- [ ] Non-localizable content remains unchanged

✅ **Translation Success**:
- [ ] Content extraction completes successfully
- [ ] Translations are generated for all target locales
- [ ] Translation quality meets requirements

✅ **Runtime Success**:
- [ ] Application loads in all target locales
- [ ] Translated content displays correctly
- [ ] No console errors or warnings

### 10.2 Performance Validation

Monitor these metrics after integration:

- Build time increase (should be < 30%)
- Bundle size increase (should be minimal)
- Runtime performance (should be unchanged)
- Translation accuracy (should be > 90%)

### 10.3 Final Checklist

Before considering integration complete:

- [ ] All 15+ identified components are Lingo-compatible
- [ ] Spanish, French, and German translations are generated
- [ ] Production build completes successfully
- [ ] All target pages load correctly in all locales
- [ ] Error handling works in all languages
- [ ] Documentation is updated
- [ ] Team is trained on Lingo.dev Compiler workflow

---

## Conclusion

This implementation guide provides a comprehensive roadmap for integrating Lingo.dev Compiler with the TetrisTravel NextJS project. The integration leverages Lingo's unique AST-based approach to automatically extract and translate content without requiring traditional i18n hooks or components.

**Key Benefits Achieved**:
- Automatic content extraction from JSX elements and specific attributes
- LLM-powered translations for Spanish, French, and German
- Zero refactoring of business logic
- Seamless integration with existing NextJS 15.5.4 infrastructure
- Clean separation of localizable and non-localizable content

**Next Steps**:
1. Follow the phases sequentially
2. Test thoroughly at each phase
3. Monitor translation quality and adjust settings as needed
4. Train the development team on Lingo.dev Compiler best practices

For additional support or advanced configuration options, refer to the official Lingo.dev Compiler documentation or contact their support team.