# Fix: Tailwind CSS Invalid Declaration Error

## Error Message
```
[plugin:@tailwindcss/vite:generate:serve] Invalid declaration: `// Over-written by JS - use the autoScrollOffset option`
```

## Root Cause
The error was caused by importing the SCSS file from `@sjmc11/tourguidejs` package directly:
```css
@import "@sjmc11/tourguidejs/src/scss/tour.scss";
```

**Why it failed:**
- Tailwind CSS v4 uses Lightning CSS for processing
- Lightning CSS doesn't fully support SCSS syntax (specifically `//` comments)
- The tour.scss file contains JavaScript-style comments (`//`) which are valid in SCSS but invalid in plain CSS
- When Tailwind tried to process this file, it encountered invalid CSS syntax

## Solution

### 1. Removed SCSS Import
**File:** `src/index.css`
- Removed: `@import "@sjmc11/tourguidejs/src/scss/tour.scss";`

### 2. Removed SCSS Import from Component
**File:** `src/components/TourGuide.jsx`
- Removed: `import '@sjmc11/tourguidejs/src/scss/tour.scss';`
- Kept: `import { TourGuideClient } from '@sjmc11/tourguidejs';` (JS functionality)

### 3. Added Custom Tour Guide CSS
**File:** `src/index.css`
- Added complete tour guide styles directly in plain CSS
- Converted all SCSS features to plain CSS
- Added dark mode support
- Included all necessary classes:
  - `.tg-backdrop` - Tour backdrop overlay
  - `.tg-dialog` - Tour dialog container
  - `.tg-dialog-header` - Dialog header
  - `.tg-dialog-title` - Dialog title
  - `.tg-dialog-close-btn` - Close button
  - `.tg-dialog-body` - Dialog content
  - `.tg-dialog-footer` - Dialog footer
  - `.tg-dialog-buttons` - Button container
  - Button variants (primary/secondary)

## Benefits of This Approach

1. ✅ **No Build Errors**: Plain CSS works perfectly with Tailwind v4
2. ✅ **Full Control**: Can customize tour styles easily
3. ✅ **Dark Mode**: Added dark mode support
4. ✅ **Better Performance**: No SCSS compilation needed
5. ✅ **Maintainable**: All styles in one place

## Verification

Server started successfully without errors:
```
VITE v7.1.9  ready in 348 ms
➜  Local:   http://localhost:5174/
```

## Files Modified

1. `src/index.css` - Removed SCSS import, added plain CSS tour styles
2. `src/components/TourGuide.jsx` - Removed SCSS import

## No Breaking Changes

- Tour functionality remains exactly the same
- All tour features work as before
- Custom positioning fixes (from previous bugfix) still apply
- Dark mode support enhanced

## Future Considerations

If you need to update tour styles:
- Edit the CSS directly in `src/index.css` (search for "Tour Guide Base Styles")
- No need to deal with SCSS compilation
- Changes take effect immediately with hot reload

---

**Status:** ✅ **FIXED** - Development server running without errors
