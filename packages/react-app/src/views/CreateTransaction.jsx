import React, { useCallback, useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import { Button, Select, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { parseEther, formatEther } from "@ethersproject/units";
import { Address, AddressInput, Balance, EtherInput, Blockie } from "../components";
import { useEventListener, useLocalStorage } from "../hooks";
import { useContractReader } from "eth-hooks";
const { Option } = Select;

const { ethers } = require("ethers");
const axios = require("axios");

export default function CreateTransaction({
  contractName,
  address,
  setRoute,
  userProvider,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const history = useHistory();

  // keep track of a variable from the contract in the local React state:
  const nonce = useContractReader(readContracts, contractName, "nonce");
  const calldataInputRef = useRef("0x");

  console.log("🤗 nonce:", nonce);

  console.log("price", price);

  const [customNonce, setCustomNonce] = useState();
  const [to, setTo] = useLocalStorage("to");
  const [amount, setAmount] = useLocalStorage("amount", "0");
  const [data, setData] = useLocalStorage("data", "0x");
  const [isCreateTxnEnabled, setCreateTxnEnabled] = useState(true);
  const [decodedDataState, setDecodedData] = useState();
  const [methodName, setMethodName] = useLocalStorage("methodName");
  const [newOwner, setNewOwner] = useLocalStorage("newOwner");
  const [newSignaturesRequired, setNewSignaturesRequired] = useLocalStorage("newSignaturesRequired");
  const [selectDisabled, setSelectDisabled] = useState(false);
  let decodedData = "";

  const [result, setResult] = useState();

  const inputStyle = {
    padding: 10,
  };

  let resultDisplay;
  if (result) {
    if (result.indexOf("ERROR") >= 0) {
      resultDisplay = <div style={{ margin: 16, padding: 8, color: "red" }}>{result}</div>;
    } else {
      resultDisplay = (
        <div style={{ margin: 16, padding: 8 }}>
          <Blockie size={4} scale={8} address={result} /> Tx {result.substr(0, 6)} Created!
          <div style={{ margin: 8, padding: 4 }}>
            <Spin />
          </div>
        </div>
      );
    }
  }

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2 style={{ margin: 24 }}>Create Transaction</h2>
        <div style={{ margin: 8 }}>
          <b>Nonce</b>
          <div style={inputStyle}>
            <Input
              prefix="#"
              disabled
              value={customNonce}
              placeholder={"" + (nonce ? nonce.toNumber() : "loading...")}
              onChange={setCustomNonce}
            />
          </div>

          <div style={{ margin: 8, padding: 8 }}>
            <b>Function</b>
            <Select
              value={methodName}
              disabled={selectDisabled}
              style={{ width: "100%" }}
              onChange={e => {
                setData("0x");
                setMethodName(e);
              }}
            >
              //<Option key="transferFunds">transferFunds()</Option>
              <Option disabled={true} key="addSigner">
                addSigner()
              </Option>
              <Option disabled={true} key="removeSigner">
                removeSigner()
              </Option>
            </Select>
          </div>
          <b>Address</b>
          <div style={inputStyle}>
            <AddressInput
              autoFocus
              ensProvider={mainnetProvider}
              placeholder="to address"
              value={to}
              onChange={setTo}
            />
          </div>
          <b>Value</b>
          {!selectDisabled && (
            <div style={inputStyle}>
              <EtherInput price={price} mode="USD" value={amount} onChange={setAmount} />
            </div>
          )}
          <b>Calldata</b>
          <div style={inputStyle}>
            <Input
              placeholder="calldata"
              value={data}
              onChange={e => {
                setData(e.target.value);
              }}
              ref={calldataInputRef}
            />
            {decodedDataState}
          </div>

          <Button
            style={{ marginTop: 32 }}
            disabled={!isCreateTxnEnabled}
            onClick={async () => {
              // setData(calldataInputRef.current.state.value)
              // if (data && data == "0x") {
              //   setResult("ERROR, Call Data Invalid");
              //   return;
              // }
              console.log("customNonce", customNonce);
              const nonce = customNonce || (await readContracts[contractName].nonce());
              console.log("nonce", nonce);

              const newHash = await readContracts[contractName].getTransactionHash(
                nonce,
                to,
                parseEther("" + parseFloat(amount).toFixed(12)),
                data,
              );
              console.log("newHash", newHash);

              const signature = await userProvider.signMessage(ethers.utils.arrayify(newHash));
              console.log("signature", signature);

              const recover = await readContracts[contractName].recover(newHash, signature);
              console.log("recover", recover);

              const isOwner = await readContracts[contractName].isSigner(recover);
              console.log("isOwner", isOwner);

              if (isOwner) {
                console.log(newOwner, newSignaturesRequired);
                console.log("decodedDataState", decodedDataState);
                const txData = {
                  functionSignature: methodName,
                  functionArgs: [newOwner, newSignaturesRequired],
                  nonce: nonce.toNumber(),
                  to,
                  amount,
                  data,
                  hash: newHash,
                  signatures: [signature],
                  signers: [recover],
                };
                console.log(txData);

                // Save update
                await writeContracts[contractName].createTransaction(JSON.stringify(txData));

                setTimeout(() => {
                  history.push("/pool");
                }, 1000);

                setResult(newHash);
                setTo();
                setAmount("0");
                setData("0x");
              } else {
                console.log("ERROR, NOT OWNER.");
                setResult("ERROR, NOT OWNER.");
              }
            }}
          >
            Create
          </Button>
        </div>

        {resultDisplay}
      </div>
    </div>
  );
}
