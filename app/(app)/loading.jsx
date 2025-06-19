import { Spin } from "antd";
import Image from "next/image";
import React from "react";

const Loading = () => {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column", gap: "1rem" }}>
      <Image
        src="/images/destiny-logo.svg"
        width={200}
        height={60}
        alt="YDestiny"
      />
      <Spin size="large" />
    </div>
  );
};

export default Loading;
