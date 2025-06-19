"use client";
import { useState } from "react";
import {  SettingsContext } from "./settings-context";

export function SettingsContextProvider({ children }) {
  const [settings, setSettings] = useState({
    theme: "light",
    isSidebarOpen: false,
  });

  // Override setSettings to always keep theme as "light"
  const forcedSetSettings = (newSettings) => {
    if (typeof newSettings === 'function') {
      setSettings(prev => {
        const updated = newSettings(prev);
        return { ...updated, theme: "light" };
      });
    } else {
      setSettings({ ...newSettings, theme: "light" });
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings: forcedSetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
