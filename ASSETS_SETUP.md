# Assets Setup Guide

## Current Asset Structure

All assets have been copied to the `public/assets/` directory. Next.js serves files from the `public` folder at the root URL path.

### Directory Structure

```
public/
└── assets/
    ├── Videos (for onboarding)
    │   ├── before.mp4      → /assets/before.mp4
    │   ├── oldway.mp4      → /assets/oldway.mp4
    │   └── after.mp4       → /assets/after.mp4
    │
    └── Images (for inspiration page)
        ├── barceloneta.png
        ├── flamenco.png
        ├── camp nou.png
        ├── casa mila pedrera.png
        ├── moco museum.png
        ├── parc guell.png
        ├── safrada familia.png
        ├── montserrat mountains.png
        └── avatar.png
```

## How Assets Are Referenced

### In Code
```typescript
// Images (inspiration page)
src: '/assets/barceloneta.png'

// Videos (onboarding)
videoSrc: '/assets/before.mp4'
```

### In Browser
Files are served at:
- `http://localhost:3000/assets/before.mp4`
- `http://localhost:3000/assets/barceloneta.png`
- etc.

## Asset Files

### Videos (Onboarding)
1. **before.mp4** (966KB) - Used in onboarding step 1
2. **oldway.mp4** (1.9MB) - Used in onboarding step 2
3. **after.mp4** (927KB) - Used in onboarding step 3

### Images (Inspiration Gallery)
1. **barceloneta.png** (343KB) - Beach experience
2. **flamenco.png** (539KB) - Flamenco show
3. **camp nou.png** (458KB) - Camp Nou stadium
4. **casa mila pedrera.png** (866KB) - La Pedrera
5. **moco museum.png** (665KB) - Moco Museum
6. **parc guell.png** (839KB) - Parc Guell
7. **safrada familia.png** (886KB) - Sagrada Familia
8. **montserrat mountains.png** (704KB) - Montserrat Mountains

### Other Assets
- **avatar.png** (519KB) - User avatar (not currently used)

## File Naming Notes

⚠️ **Important**: The actual filename is `safrada familia.png` (typo in original), but we refer to it as "Sagrada Familia" in the UI.

⚠️ **Space in Filenames**: Several files have spaces in their names. This is handled correctly by Next.js Image component and HTML video tags.

## Updating Assets

To add or replace assets:

1. Place files in `public/assets/`
2. Reference them with `/assets/filename.ext`
3. For Next.js Image component, use the `src` prop
4. For video elements, use the `src` attribute

## Image Optimization

Next.js automatically optimizes images when using the `Image` component:
- Automatic lazy loading
- Automatic format selection (WebP when supported)
- Automatic size optimization
- Responsive images with `sizes` prop

## Troubleshooting

### Images Not Loading
✅ Files are in `public/assets/`
✅ Paths start with `/assets/` (leading slash)
✅ Filenames match exactly (case-sensitive)
✅ Next.js dev server is running

### Videos Not Playing
✅ Files are in `public/assets/`
✅ Files are MP4 format (H.264 codec)
✅ Browser supports video tag
✅ File size is reasonable (<5MB recommended)

## Performance Tips

1. **Video Compression**: Videos are currently 1-2MB each, which is acceptable. For production, consider compressing further.

2. **Image Optimization**: PNG files are large (300-900KB). Consider:
   - Converting to JPG for photos (smaller file size)
   - Using WebP format for better compression
   - Resizing to appropriate dimensions (e.g., 800x800px for grid)

3. **Lazy Loading**: Images are lazy-loaded by default with Next.js Image component.

4. **CDN**: For production, consider serving assets from a CDN for better performance.

## Production Deployment

When deploying to Vercel/Netlify:
- All files in `public/` are automatically deployed
- No additional configuration needed
- Assets are served from CDN automatically

## Asset Source

Original assets were located at `../tetristravel/assets/` and have been copied to the Next.js project's `public/assets/` directory.
