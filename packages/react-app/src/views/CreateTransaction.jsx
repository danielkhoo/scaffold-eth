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
  poolServerUrl,
  contractName,
  address,
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
  const [amount, setAmount] = useState(0);
  const [data, setData] = useLocalStorage("data", "0x");
  const [isCreateTxnEnabled, setCreateTxnEnabled] = useState(true);
  const [decodedDataState, setDecodedData] = useState();
  const [methodName, setMethodName] = useLocalStorage("methodName", "addSigner");
  const [newOwner, setNewOwner] = useLocalStorage("newOwner");
  const [newSignaturesRequired, setNewSignaturesRequired] = useLocalStorage("newSignaturesRequired");
  const [selectDisabled, setSelectDisabled] = useState(false);
  let decodedData = "";

  const [result, setResult] = useState();

  const inputStyle = {
    padding: 10,
  };
  let decodedDataObject = "";
  useEffect(() => {
    const inputTimer = setTimeout(async () => {
      console.log("EFFECT RUNNING");
      try {
        // if(methodName == "transferFunds"){
        //   console.log("Send transaction selected")
        //   console.log("🔥🔥🔥🔥🔥🔥",amount)
        //     const calldata = readContracts[contractName].interface.encodeFunctionData("transferFunds",[to,parseEther("" + parseFloat(amount).toFixed(12))])
        //     setData(calldata);
        // }
        // decodedDataObject = readContracts ? await readContracts[contractName].interface.parseTransaction({ data }) : "";
        // console.log("decodedDataObject", decodedDataObject);
        // setCreateTxnEnabled(true);
        if (decodedDataObject.signature === "addSigner(address,uint256)") {
          setMethodName("addSigner");
          setSelectDisabled(true);
        } else if (decodedDataObject.signature === "removeSigner(address,uint256)") {
          setMethodName("removeSigner");
          setSelectDisabled(true);
        }
        decodedData = (
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "left",
                marginTop: 16,
                marginBottom: 16,
              }}
            >
              {decodedDataObject && decodedDataObject.signature && <b>Function Signature : </b>}
              {decodedDataObject.signature}
            </div>
            {decodedDataObject.functionFragment &&
              decodedDataObject.functionFragment.inputs.map((element, index) => {
                if (element.type === "address") {
                  return (
                    <div
                      style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "left" }}
                    >
                      <b>{element.name} :&nbsp;</b>
                      <Address fontSize={16} address={decodedDataObject.args[index]} ensProvider={mainnetProvider} />
                    </div>
                  );
                }
                if (element.type === "uint256") {
                  return (
                    <p style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "left" }}>
                      {element.name === "value" ? (
                        <>
                          <b>{element.name} : </b>{" "}
                          <Balance fontSize={16} balance={decodedDataObject.args[index]} dollarMultiplier={price} />{" "}
                        </>
                      ) : (
                        <>
                          <b>{element.name} : </b>{" "}
                          {decodedDataObject.args[index] && decodedDataObject.args[index].toNumber()}
                        </>
                      )}
                    </p>
                  );
                }
              })}
          </div>
        );
        setDecodedData(decodedData);
        setCreateTxnEnabled(true);
        setResult();
      } catch (error) {
        console.log("mistake: ", error);
        if (data !== "0x") setResult("ERROR: Invalid calldata");
        setCreateTxnEnabled(false);
      }
    }, 500);
    return () => {
      clearTimeout(inputTimer);
    };
  }, [data, decodedData, amount]);

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
        <div style={{ margin: 8 }}>
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
            <Select value={methodName} disabled={selectDisabled} style={{ width: "100%" }} onChange={setMethodName}>
              <Option key="transferFunds">transferFunds()</Option>
              <Option key="addSigner">addSigner()</Option>
              <Option key="removeSigner">removeSigner()</Option>
            </Select>
          </div>
          <div style={inputStyle}>
            <AddressInput
              autoFocus
              ensProvider={mainnetProvider}
              placeholder="to address"
              value={to}
              onChange={setTo}
            />
          </div>

          {!selectDisabled && (
            <div style={inputStyle}>
              <EtherInput price={price} mode="ETH" value={amount} onChange={setAmount} />
            </div>
          )}
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
              // const signature = await userProvider.send("personal_sign", [newHash, address]);
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
                  decodedData: decodedDataState,
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
                  setResult(newHash);
                  setMethodName("addSigner");
                  setTo("");
                  setAmount("0");
                  setData("0x");
                  history.push("/pool");
                }, 2777);
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
