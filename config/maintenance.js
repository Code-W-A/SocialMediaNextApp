/**
 * Maintenance Mode Configuration
 * 
 * Set MAINTENANCE_MODE to true to enable maintenance mode
 * Set MAINTENANCE_MODE to false to disable maintenance mode and allow normal access
 */

// 🔧 CHANGE THIS TO true TO ENABLE MAINTENANCE MODE
export const MAINTENANCE_MODE = true;

// Maintenance configuration
export const maintenanceConfig = {
  enabled: MAINTENANCE_MODE,
  title: {
    ro: "Site în Mentenanță",
    en: "Site Under Maintenance"
  },
  message: {
    ro: "Site-ul este momentan în mentenanță. Vă rugăm să încercați aplicația noastră de pe Android pentru o experiență completă!",
    en: "The site is currently under maintenance. Please try our Android app for a complete experience!"
  },
  androidAppUrl: "https://play.google.com/store/apps/details?id=com.mobitools.ydestiny"
};

