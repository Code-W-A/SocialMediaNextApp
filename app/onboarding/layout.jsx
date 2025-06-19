import React from "react";
import css from "@/styles/onboardingLayout.module.css";

export const metadata = {
  title: "YDestiny - Complete Your Profile",
  description: "Complete your profile setup to get the best experience on YDestiny",
};

const OnboardingLayout = ({ children }) => {
  return (
    <div className={css.wrapper}>
      <div className={css.container}>
        <div className={css.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout; 