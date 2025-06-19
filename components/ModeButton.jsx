"use client";
import { useSettingsContext, useThemeContext } from "@/context/settings/settings-context";
import { Icon } from "@iconify/react";
import { Button } from "antd";
import React from "react";

const ModeButton = () => {
  const {
    setSettings,
  } = useSettingsContext();
  return (
    <Button
      style={{ padding: 0, border: "none", opacity: 0.5 }}
      disabled={true}
      onClick={() => {
        // Temporarily disabled - app forced to light mode
        console.log("Theme switching temporarily disabled");
      }}
      icon={<Icon icon="icon-park-solid:dark-mode" width={"35px"} />}
      title="Theme switching temporarily disabled"
    />
  );
};

export default ModeButton;
