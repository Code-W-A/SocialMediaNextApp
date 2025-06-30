# 🔒 Password Protection Guide

## Overview
The application now includes a password protection system for controlling access to the preview during development/testing phases.

## Features
- **Coming Soon Page**: Beautiful landing page shown to visitors without access
- **Password Protection**: Access controlled via password dialog
- **Persistent Access**: Password is remembered in localStorage
- **Development Tools**: Reset buttons and hints for developers

## Configuration

### Enable Password Protection
Add to your `.env.local`:
```env
NEXT_PUBLIC_ENABLE_PASSWORD_PROTECTION=true
```

### Disable Password Protection
Set to `false` or remove the variable:
```env
NEXT_PUBLIC_ENABLE_PASSWORD_PROTECTION=false
```

## Password
**Current Password**: `1234567890`

## How It Works

### 1. First Visit
- User sees "Coming Soon" page
- Click "See Preview" to open password dialog
- Enter password `1234567890`
- Access is granted and saved in localStorage

### 2. Return Visits
- Access is automatically granted if password was previously entered
- No need to re-enter password

### 3. Development Mode
- Password hint shown in development
- Reset button appears in top-right corner
- Easily test both modes

## Pages Affected
- **Landing Page** (`/`) - Main entry point
- **All public routes** - Protected when user not signed in

## Implementation Details

### Components
- `ComingSoonPage.jsx` - Password-protected landing page
- `LandingPage.jsx` - Modified to include protection logic

### State Management
- Uses localStorage key: `ydestiny_preview_access`
- Value: `"granted"` when access is allowed

### Environment Variables
- `NEXT_PUBLIC_ENABLE_PASSWORD_PROTECTION` - Controls if protection is active
- `NODE_ENV` - Controls development features visibility

## Testing Instructions

### Test Coming Soon Page
1. Open browser in incognito/private mode
2. Visit your application URL
3. Should see "Coming Soon" page
4. Click "See Preview"
5. Enter password: `1234567890`
6. Should see full landing page

### Test Persistent Access
1. Close browser/tab after successful login
2. Revisit application
3. Should directly show full landing page

### Reset Access (Development)
1. In development mode, look for red "Reset Preview" button
2. Click to return to "Coming Soon" page
3. Or manually clear localStorage: `localStorage.removeItem('ydestiny_preview_access')`

## Deployment

### For Testing/Preview Environments
Keep protection enabled:
```env
NEXT_PUBLIC_ENABLE_PASSWORD_PROTECTION=true
```

### For Production Launch
Disable protection:
```env
NEXT_PUBLIC_ENABLE_PASSWORD_PROTECTION=false
```

## Security Notes
- This is **NOT** a security feature
- Password is client-side only
- Intended for preview control, not data protection
- Anyone with developer tools can bypass this

## Customization

### Change Password
Modify in `ComingSoonPage.jsx`:
```javascript
if (values.password === 'YOUR_NEW_PASSWORD') {
```

### Change Coming Soon Content
Edit `ComingSoonPage.jsx` component content

### Change localStorage Key
Modify both files:
```javascript
localStorage.setItem('your_custom_key', 'granted');
```

## Troubleshooting

### Password Not Working
- Verify it's exactly `1234567890`
- Check browser console for errors
- Clear localStorage and try again

### Coming Soon Page Not Showing
- Verify `NEXT_PUBLIC_ENABLE_PASSWORD_PROTECTION=true`
- Check that user is not signed in
- Clear localStorage

### Reset Button Not Visible
- Must be in development mode (`NODE_ENV=development`)
- Must have password protection enabled
- Button appears in top-right corner

---

**Perfect for testing Stripe webhooks and other features while keeping the app private!** 🚀 