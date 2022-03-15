import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/austintgriffith/scaffold-eth" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="🏗 Scaffold-Eth Kitchen Sink"
        subTitle="minimum viable reference examples for building with scaffold-eth"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
