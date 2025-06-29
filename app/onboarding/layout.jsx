import React from "react";
import css from "@/styles/onboardingLayout.module.css";
import { LanguageProvider } from "@/lib/i18n";

export const metadata = {
  title: "YDestiny - Complete Your Profile",
  description: "Complete your profile setup to get the best experience on YDestiny",
};

const OnboardingLayout = ({ children }) => {
  return (
    <LanguageProvider>
      <div className={css.wrapper}>
        <div className={css.container}>
          <div className={css.content}>
            {children}
          </div>
        </div>
      </div>
    </LanguageProvider>
  );
};

export default OnboardingLayout; 