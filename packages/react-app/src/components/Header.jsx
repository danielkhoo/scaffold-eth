import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://buidlguidl.com/builders" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="🏰 BuidlGuidl Tabards"
        subTitle="Dynamic address-bound NFTs for BuidlGuidl members"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
