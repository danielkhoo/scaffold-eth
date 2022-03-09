import React, { useCallback, useEffect, useState } from "react";
import { Button, List, Modal, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
import QR from "qrcode.react";
import { useContractReader, useEventListener, useLocalStorage, useLookupAddress } from "../hooks";
import { Address, AddressInput, Balance, Blockie, TransactionListItem } from "../components";

const axios = require("axios");

export default function FrontPage({
  executeTransactionEvents,
  contractName,
  localProvider,
  readContracts,
  price,
  mainnetProvider,
  blockExplorer,
}) {
  let contractAddress = "";
  if (readContracts[contractName]) {
    contractAddress = readContracts[contractName].address;
  }

  return (
    <div style={{ padding: 32, maxWidth: 750, margin: "auto" }}>
      <div style={{ paddingBottom: 32 }}>
        <div>
          <Balance address={contractAddress} provider={localProvider} dollarMultiplier={price} fontSize={64} />
        </div>
        <div>
          <QR
            value={contractAddress}
            size="180"
            level="H"
            includeMargin
            renderAs="svg"
            imageSettings={{ excavate: false }}
          />
        </div>
        <div>
          <Address
            address={contractAddress}
            ensProvider={mainnetProvider}
            blockExplorer={blockExplorer}
            fontSize={32}
          />
        </div>
      </div>
      <List
        bordered
        dataSource={executeTransactionEvents}
        renderItem={item => {
          const txnData = {
            functionSignature: item.event,
            functionArgs: [],
            nonce: item.args.nonce,
            hash: item.args.hash,
            toAddress: item.args.to,
            value: item.args.value,
          };
          return (
            <>
              <TransactionListItem
                item={item}
                mainnetProvider={mainnetProvider}
                blockExplorer={blockExplorer}
                price={price}
                readContracts={readContracts}
                contractName={contractName}
              />
            </>
          );
        }}
      />
    </div>
  );
}
