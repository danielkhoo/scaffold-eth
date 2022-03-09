import React, { useCallback, useEffect, useState } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
import { Address, AddressInput, Balance, Blockie, TransactionListItem } from "../components";
import { useContractReader } from "eth-hooks";

const axios = require("axios");

const DEBUG = false;

export default function Transactions({
  contractName,
  signaturesRequired,
  address,
  nonce,
  userProvider,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
  blockExplorer,
}) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    async function getTransactions() {
      if (readContracts[contractName]) {
        const currentNonce = nonce ? nonce.toNumber() : 0;
        const pendingTransaction = await readContracts[contractName].transactions(currentNonce);

        if (pendingTransaction && pendingTransaction != "") {
          const transaction = JSON.parse(pendingTransaction);
          const validSignatures = [];
          for (const s in transaction.signatures) {
            // Validate signatures with recover function
            const signer = await readContracts[contractName].recover(transaction.hash, transaction.signatures[s]);
            const isSigner = await readContracts[contractName].isSigner(signer);
            if (signer && isSigner) {
              validSignatures.push({ signer, signature: transaction.signatures[s] });
            }
          }
          const update = [{ ...transaction, validSignatures }];

          console.log("\n\n", nonce.toNumber(), transaction, update, "\n\n");
          setTransactions(update);
        }
      }
    }
    getTransactions();
  }, [nonce]);

  const getSortedSigList = async (allSigs, newHash) => {
    console.log("allSigs", allSigs);

    const sigList = [];
    for (const s in allSigs) {
      console.log("SIG", allSigs[s]);
      const recover = await readContracts[contractName].recover(newHash, allSigs[s]);
      sigList.push({ signature: allSigs[s], signer: recover });
    }

    sigList.sort((a, b) => {
      return ethers.BigNumber.from(a.signer).sub(ethers.BigNumber.from(b.signer));
    });

    console.log("SORTED SIG LIST:", sigList);

    const finalSigList = [];
    const finalSigners = [];
    const used = {};
    for (const s in sigList) {
      if (!used[sigList[s].signature]) {
        finalSigList.push(sigList[s].signature);
        finalSigners.push(sigList[s].signer);
      }
      used[sigList[s].signature] = true;
    }

    console.log("FINAL SIG LIST:", finalSigList);
    return [finalSigList, finalSigners];
  };

  if (!signaturesRequired) {
    return <Spin />;
  }

  console.log("transactions", transactions);

  return (
    <div style={{ maxWidth: 750, margin: "auto", marginTop: 32, marginBottom: 32 }}>
      <h1>
        <b style={{ padding: 16 }}>#{nonce ? nonce.toNumber() : <Spin />}</b>
      </h1>

      <List
        bordered
        dataSource={transactions}
        renderItem={item => {
          console.log("ITE88888M", item);

          const hasSigned = item.signers.indexOf(address) >= 0;
          const hasEnoughSignatures = item.signatures.length >= signaturesRequired.toNumber();

          console.log(item.signatures.length, signaturesRequired.toNumber(), hasEnoughSignatures);
          return (
            <TransactionListItem
              item={item}
              mainnetProvider={mainnetProvider}
              blockExplorer={blockExplorer}
              price={price}
              readContracts={readContracts}
              contractName={contractName}
            >
              <span>
                {item.signatures.length}/{signaturesRequired.toNumber()} {hasSigned ? "✅" : ""}
              </span>

              <Button
                onClick={async () => {
                  console.log("item.signatures", item.signatures);

                  const newHash = await readContracts[contractName].getTransactionHash(
                    item.nonce,
                    item.to,
                    parseEther("" + parseFloat(item.amount).toFixed(12)),
                    item.data,
                  );
                  console.log("newHash", newHash);

                  const signature = await userProvider.signMessage(ethers.utils.arrayify(newHash));
                  console.log("signature", signature);

                  const recover = await readContracts[contractName].recover(newHash, signature);
                  console.log("recover--->", recover);

                  const isSigner = await readContracts[contractName].isSigner(recover);
                  console.log("isSigner", isSigner);

                  if (isSigner) {
                    const [finalSigList, finalSigners] = await getSortedSigList(
                      [...item.signatures, signature],
                      newHash,
                    );

                    let txData = {
                      ...item,
                      signatures: finalSigList,
                      signers: finalSigners,
                    };
                    await writeContracts[contractName].createTransaction(JSON.stringify(txData));
                  }
                }}
                type="secondary"
                disabled={hasSigned}
              >
                {hasSigned ? "Signed" : "Sign"}
              </Button>
              <Button
                key={item.hash}
                onClick={async () => {
                  const newHash = await readContracts[contractName].getTransactionHash(
                    item.nonce,
                    item.to,
                    parseEther("" + parseFloat(item.amount).toFixed(12)),
                    item.data,
                  );
                  console.log("newHash", newHash);

                  console.log("item.signatures", item.signatures);

                  const [finalSigList, finalSigners] = await getSortedSigList(item.signatures, newHash);

                  console.log(item.to, parseEther("" + parseFloat(item.amount).toFixed(12)), item.data, finalSigList);
                  tx(
                    writeContracts[contractName].executeTransaction(
                      item.to,
                      parseEther("" + parseFloat(item.amount).toFixed(12)),
                      item.data,
                      finalSigList,
                    ),
                  );
                }}
                type={hasEnoughSignatures ? "primary" : "secondary"}
                disabled={!hasEnoughSignatures}
              >
                Exec
              </Button>
            </TransactionListItem>
          );
        }}
      />
    </div>
  );
}
