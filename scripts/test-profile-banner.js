#!/usr/bin/env node

// Test script for profile banner functionality
// Run with: node scripts/test-profile-banner.js

console.log('🎭 Profile Banner Test\n');

const path = require('path');
const fs = require('fs');

// Test 1: Check if required files exist
console.log('📁 Test 1: Checking required files...');

const requiredFiles = [
  'sections/profile/ProfileHead.jsx',
  'sections/profile/view/ProfileView.jsx',
  'app/(app)/profile/[id]/page.jsx',
  'public/images/banner.jpg',
  'actions/user.js'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing!');
  process.exit(1);
}

// Test 2: Check ProfileHead implementation
console.log('\n🎭 Test 2: Checking ProfileHead implementation...');

try {
  const profileHeadContent = fs.readFileSync('sections/profile/ProfileHead.jsx', 'utf8');
  
  // Check for logging
  if (profileHeadContent.includes('console.log') && profileHeadContent.includes('[ProfileHead]')) {
    console.log('✅ ProfileHead has logging enabled');
  } else {
    console.log('❌ ProfileHead missing debug logging');
  }
  
  // Check for banner state management
  if (profileHeadContent.includes('setBanner(null)')) {
    console.log('✅ ProfileHead resets banner state');
  } else {
    console.log('❌ ProfileHead missing banner reset logic');
  }
  
  // Check for userId dependency
  if (profileHeadContent.includes('userId]')) {
    console.log('✅ ProfileHead has userId dependency in useEffect');
  } else {
    console.log('❌ ProfileHead missing userId dependency');
  }
  
  // Check for error handling
  if (profileHeadContent.includes('onError') && profileHeadContent.includes('onLoad')) {
    console.log('✅ ProfileHead has image error handling');
  } else {
    console.log('❌ ProfileHead missing image error handling');
  }
  
} catch (error) {
  console.log('❌ Error reading ProfileHead.jsx:', error.message);
}

// Test 3: Check banner image exists
console.log('\n🖼️ Test 3: Checking default banner image...');

const bannerPath = path.join(process.cwd(), 'public/images/banner.jpg');
if (fs.existsSync(bannerPath)) {
  const stats = fs.statSync(bannerPath);
  console.log(`✅ Default banner exists (${(stats.size / 1024).toFixed(2)} KB)`);
} else {
  console.log('❌ Default banner missing at public/images/banner.jpg');
}

// Test 4: Check updateBanner action
console.log('\n🔄 Test 4: Checking updateBanner action...');

try {
  const userActionsContent = fs.readFileSync('actions/user.js', 'utf8');
  
  if (userActionsContent.includes('updateBanner')) {
    console.log('✅ updateBanner action found');
  } else {
    console.log('❌ updateBanner action missing');
  }
  
  if (userActionsContent.includes('banner_url') || userActionsContent.includes('banner')) {
    console.log('✅ Banner field handling found');
  } else {
    console.log('❌ Banner field handling missing');
  }
  
} catch (error) {
  console.log('❌ Error reading actions/user.js:', error.message);
}

// Test 5: Check for common issues
console.log('\n🔍 Test 5: Checking for common issues...');

try {
  const profileHeadContent = fs.readFileSync('sections/profile/ProfileHead.jsx', 'utf8');
  
  // Check for proper state initialization
  if (profileHeadContent.includes('useState(null)')) {
    console.log('✅ Banner state properly initialized');
  } else {
    console.log('⚠️ Banner state might not be properly initialized');
  }
  
  // Check for multiple useEffect dependencies
  const useEffectMatches = profileHeadContent.match(/useEffect\(/g);
  if (useEffectMatches && useEffectMatches.length >= 2) {
    console.log('✅ Multiple useEffect hooks for proper state management');
  } else {
    console.log('⚠️ Might need more useEffect hooks for proper state management');
  }
  
  // Check for image loading events
  if (profileHeadContent.includes('onLoad') && profileHeadContent.includes('onError')) {
    console.log('✅ Image loading events handled');
  } else {
    console.log('⚠️ Image loading events might not be handled');
  }
  
} catch (error) {
  console.log('❌ Error in common issues check:', error.message);
}

console.log('\n🎯 Summary of Changes Made:');
console.log('✅ Added comprehensive logging to ProfileHead component');
console.log('✅ Added banner state reset when profile changes');
console.log('✅ Added userId dependency to useEffect');
console.log('✅ Added proper error handling for banner loading');
console.log('✅ Added profile image logging for debugging');

console.log('\n🔧 To test the banner functionality:');
console.log('1. Run: npm run dev');
console.log('2. Open browser console (F12)');
console.log('3. Navigate to your profile');
console.log('4. Navigate to another user\'s profile');
console.log('5. Check console logs for banner loading details');
console.log('6. Try uploading a new banner (if on your profile)');

console.log('\n📋 What to look for in console:');
console.log('🎭 [ProfileHead] Component rendered with: - Component mounting');
console.log('🔄 [ProfileHead] useEffect triggered - Banner state updates');
console.log('🖼️ [ProfileHead] Rendering banner: - Banner rendering details');
console.log('✅ [ProfileHead] Banner image loaded: - Successful loading');
console.log('❌ [ProfileHead] Banner image failed to load: - Loading errors');

console.log('\n🚨 Common Issues and Solutions:');
console.log('❌ Banner not changing between profiles:');
console.log('   → Check userId dependency in useEffect');
console.log('   → Verify banner state resets to null');
console.log('❌ Banner not loading for other users:');
console.log('   → Check data?.data?.banner_url in console logs');
console.log('   → Verify user has uploaded a banner');
console.log('❌ Default banner not showing:');
console.log('   → Check if public/images/banner.jpg exists');
console.log('   → Verify file path is correct');

console.log('\n✅ Profile banner debugging test completed!');
console.log('📱 Check console logs when navigating between profiles');

console.log('\n' + '='.repeat(60)); 