# Logo Setup Instructions

## 📋 Overview

The Header component fetches logos from `/api/logo/:theme` endpoint based on the current theme (light/dark mode).

## 📁 File Location

Place your logo files in:
```
backend/public/logos/
```

## 📝 Required Files

1. **`logo-light.png`** - Logo for light theme (white background)
   - Should have white/light background
   - Should work well on light header background

2. **`logo-dark.png`** - Logo for dark theme (dark background)
   - Should have dark background or transparent
   - Should work well on dark header background

## 🚀 Setup Steps

### Step 1: Add Logo Files

1. Copy your logo files to `backend/public/logos/`:
   - `logo-light.png` (for light mode)
   - `logo-dark.png` (for dark mode)

2. Make sure file names are exactly:
   - `logo-light.png`
   - `logo-dark.png`

### Step 2: Verify Files

Check that files exist:
```bash
ls backend/public/logos/
# Should show:
# logo-light.png
# logo-dark.png
```

### Step 3: Test Endpoints

After deployment, test the endpoints:

**Light Mode Logo:**
```
GET https://your-backend.railway.app/api/logo/light
```

**Dark Mode Logo:**
```
GET https://your-backend.railway.app/api/logo/dark
```

### Step 4: Verify in Frontend

1. Open the application
2. Check the Header - logo should appear
3. Toggle theme (day/night mode)
4. Logo should switch automatically

## 🎨 Logo Requirements

### Light Mode Logo (`logo-light.png`)
- Background: White or light color
- Text/Graphics: Dark colors (for contrast)
- Format: PNG (with or without transparency)
- Recommended size: 200x50px or similar aspect ratio

### Dark Mode Logo (`logo-dark.png`)
- Background: Dark (navy blue, black, etc.) or transparent
- Text/Graphics: Light colors (white, light gray)
- Format: PNG (with or without transparency)
- Recommended size: 200x50px or similar aspect ratio

## ⚠️ Troubleshooting

### Logo Not Showing

1. **Check file names** - Must be exactly `logo-light.png` and `logo-dark.png`
2. **Check file location** - Must be in `backend/public/logos/`
3. **Check file permissions** - Files should be readable
4. **Check endpoint** - Test `/api/logo/light` and `/api/logo/dark` directly
5. **Check browser console** - Look for 404 errors

### Logo Shows but Wrong Theme

- Make sure you're using the correct logo for each theme
- Light mode logo should have light background
- Dark mode logo should have dark background

### Logo Doesn't Switch on Theme Toggle

- Check that Header component is using `theme` from `useApp()`
- Check that logo URL includes theme: `${API_BASE_URL}/api/logo/${theme === 'day-mode' ? 'light' : 'dark'}`

## 📝 Notes

- Logo endpoint returns 404 if logo file doesn't exist (graceful degradation)
- Header component hides logo if image fails to load
- Logo automatically switches when theme changes
- Logo is cached by browser (may need hard refresh to see changes)

## ✅ Checklist

- [ ] `logo-light.png` added to `backend/public/logos/`
- [ ] `logo-dark.png` added to `backend/public/logos/`
- [ ] Files have correct names (exact match)
- [ ] Tested `/api/logo/light` endpoint
- [ ] Tested `/api/logo/dark` endpoint
- [ ] Logo appears in Header (light mode)
- [ ] Logo appears in Header (dark mode)
- [ ] Logo switches when theme toggles

