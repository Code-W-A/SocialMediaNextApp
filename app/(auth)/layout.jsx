import React from "react";
import css from "@/styles/authLayout.module.css";
import Image from "next/image";
export const metadata = {
  title: "YDestiny - Authentication",
  description: "Sign in or create your YDestiny account to connect with friends and share your moments",
};
const AuthLayout = ({ children }) => {
  return (
    <div className={css.wrapper}>
      <div className={css.container}>
        <div className={css.left}>{children}</div>
        <div className={css.right}>
          <Image
            src="/images/auth.png"
            alt="YDestiny branding"
            quality={100}
            width={400}
            height={480}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
