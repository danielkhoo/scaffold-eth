import { SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, Row, Col, Radio, notification } from "antd";
import React, { useState } from "react";
import { Address, Balance, Events } from "../components";
import humanizeDuration from "humanize-duration";
import Text from "antd/lib/typography/Text";
import { useContractReader } from "eth-hooks";

const { ethers } = require("ethers");

export default function GameUI({
  address,
  mainnetProvider,
  localProvider,
  activeGame,
  tx,
  readContracts,
  writeContracts,
}) {
  // Possible Game States:
  const UIState = {
    NoGame: -1, // Show join / host options
    JoinPhase: 0,
    CommitPhase: 1,
    RevealPhase: 2,
    ResultPhase: 3,
  };
  const GameResult = {
    None: -1, // Show join / host options
    P1Win: 0,
    P2Win: 1,
    Draw: 2,
  };

  const [joinAddress, setJoinAddress] = useState();
  const [otherPlayerAddress, setOtherPlayerAddress] = useState();
  const [commitChoice, setCommitChoice] = useState();
  const [commitSalt, setCommitSalt] = useState("");
  const [revealSalt, setRevealSalt] = useState("");

  const activeGameData = useContractReader(readContracts, "RockPaperScissors", "getActiveGameData", [address]);
  let timeLeft;
  let isPlayer1;
  let playerHasCommitted = false;
  let playerHasRevealed = false;
  let gameResult = GameResult.None;
  let currentUIState = UIState.NoGame;
  if (activeGameData) {
    const { initialized, gameState } = activeGameData;
    if (initialized) {
      currentUIState = gameState;
      gameResult = activeGameData.gameResult;
    }
    isPlayer1 = address === activeGameData.player1;
    playerHasCommitted = isPlayer1
      ? activeGameData.commit1 !== "0x0000000000000000000000000000000000000000000000000000000000000000"
      : activeGameData.commit2 !== "0x0000000000000000000000000000000000000000000000000000000000000000";
    playerHasRevealed = isPlayer1
      ? activeGameData.reveal1 !== "0x0000000000000000000000000000000000000000000000000000000000000000"
      : activeGameData.reveal2 !== "0x0000000000000000000000000000000000000000000000000000000000000000";
  }
  let gameStateMessage = "";
  if (currentUIState === UIState.JoinPhase) gameStateMessage = "Waiting for Player 2 to join";
  if (currentUIState === UIState.CommitPhase) {
    gameStateMessage = playerHasCommitted ? "Waiting for other player to commit" : "Waiting for you to commit";
  }
  if (currentUIState === UIState.RevealPhase) {
    gameStateMessage = playerHasRevealed ? "Waiting for other player to reveal" : "Commited. Waiting for you to reveal";
    const timestamp = Math.round(Date.now() / 1000); //TODO Change to use block timestamp
    timeLeft = activeGameData.revealDeadline > timestamp ? activeGameData.revealDeadline - timestamp : 0;
    console.log("TIMELEFT", timeLeft, typeof timeLeft);
  }
  if (currentUIState === UIState.ResultPhase) {
    if (gameResult === GameResult.Draw) gameStateMessage = "It's a draw!";
    else if ((isPlayer1 && gameResult === GameResult.P1Win) || (!isPlayer1 && gameResult === GameResult.P2Win)) {
      gameStateMessage = "🏆 You won! 🎉🎉";
    } else {
      gameStateMessage = "😞 You lost!";
    }
  }

  const txnUpdate = update => {
    console.log("📡 Transaction Update:", update);
    if (update && (update.status === "confirmed" || update.status === 1)) {
      console.log(" 🍾 Transaction " + update.hash + " finished!");
      console.log(
        " ⛽️ " +
          update.gasUsed +
          "/" +
          (update.gasLimit || update.gas) +
          " @ " +
          parseFloat(update.gasPrice) / 1000000000 +
          " gwei",
      );
    }
  };
  const logTxn = async result => {
    console.log("awaiting metamask/web3 confirm result...", result);
    console.log(await result);
  };

  const joinGame = async () => {
    const result = tx(writeContracts.RockPaperScissors.joinGame(joinAddress), txnUpdate);
    await logTxn(result);
  };
  const createGame = async () => {
    const result = tx(writeContracts.RockPaperScissors.createGame(otherPlayerAddress), txnUpdate);
    await logTxn(result);
  };
  const commit = async () => {
    if (!commitChoice) {
      notification["warning"]({
        message: "No choice selected",
        description: "Please choose rock, paper or scissors",
      });
      return;
    }
    if (commitSalt.length === 0) {
      notification["warning"]({
        message: "No password set",
        description: "Please set a password for your commit",
      });
      return;
    }

    const hash = ethers.utils.solidityKeccak256(["string", "string"], [commitChoice, commitSalt]);

    const result = tx(writeContracts.RockPaperScissors.commit(hash), txnUpdate);
  };
  const reveal = async () => {
    if (!commitChoice) {
      notification["warning"]({
        message: "No choice selected",
        description: "Please choose rock, paper or scissors",
      });
      return;
    }
    if (revealSalt.length === 0) {
      notification["warning"]({
        message: "No password provided",
        description: "Please enter the password used for your commit",
      });
      return;
    }
    const result = tx(writeContracts.RockPaperScissors.reveal(commitChoice, revealSalt), txnUpdate);
    await logTxn(result);
  };
  const claimWin = async () => {
    const result = tx(writeContracts.RockPaperScissors.determineDefaultWinner(), txnUpdate);
    await logTxn(result);
  };
  const leaveGame = async () => {
    const result = tx(writeContracts.RockPaperScissors.leaveGame(), txnUpdate);
    await logTxn(result);
  };

  const renderChoice = reveal => {
    const rockHash = "0x10977e4d68108d418408bc9310b60fc6d0a750c63ccef42cfb0ead23ab73d102";
    const paperHash = "0xea923ca2cdda6b54f4fb2bf6a063e5a59a6369ca4c4ae2c4ce02a147b3036a21";
    const scissorsHash = "0x389a2d4e358d901bfdf22245f32b4b0a401cc16a4b92155a2ee5da98273dad9a";
    let choice;
    let emoji;
    if (reveal === rockHash) {
      choice = "rock";
      emoji = "✊";
    } else if (reveal === paperHash) {
      choice = "paper";
      emoji = "🖐";
    } else if (reveal === scissorsHash) {
      choice = "scissors";
      emoji = "✌";
    } else return <></>;
    return (
      <Radio.Button value={choice} style={{ height: "130px", width: "130px", fontSize: "40px", paddingTop: "32px" }}>
        {emoji}
        <div style={{ fontSize: "20px", margin: "20px 0" }}>{`"${choice}"`}</div>
      </Radio.Button>
    );
  };

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 500, margin: "auto", marginTop: 64 }}>
        <h1>Rock Paper Scissors</h1>
        <Divider />
        <h2>Active Game</h2>
        {activeGame === "0x0000000000000000000000000000000000000000" || !activeGameData ? (
          <h3>-</h3>
        ) : (
          <>
            <Address address={activeGame} ensProvider={mainnetProvider} fontSize={18} />
            <Row>
              <Col
                span={12}
                style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
              >
                <h2 style={{ marginTop: 16 }}>Player 1</h2>
                <Address address={activeGameData.player1} ensProvider={mainnetProvider} fontSize={16} />
              </Col>
              <Col
                span={12}
                style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
              >
                <h2 style={{ marginTop: 16 }}>Player 2</h2>
                <Address address={activeGameData.player2} ensProvider={mainnetProvider} fontSize={16} />
              </Col>
            </Row>
          </>
        )}
        <Divider />
        {currentUIState === UIState.NoGame && (
          <>
            <h2>Join Game</h2>
            <div style={{ margin: 8 }}>
              <Input
                placeholder="Game Address"
                style={{ textAlign: "center" }}
                onChange={e => {
                  setJoinAddress(e.target.value);
                }}
              />
              <Button style={{ marginTop: 8 }} onClick={joinGame}>
                Join
              </Button>
            </div>
            <Divider />
            <h2>Create new Game</h2>
            <div style={{ margin: 8 }}>
              <Input
                placeholder="Other Player's Address"
                style={{ textAlign: "center" }}
                onChange={e => {
                  setOtherPlayerAddress(e.target.value);
                }}
              />
              <Button style={{ marginTop: 8 }} onClick={createGame}>
                Create
              </Button>
            </div>
            <Divider />
          </>
        )}
        {currentUIState === UIState.JoinPhase && (
          <>
            <h2>Game State</h2>
            <h1>{gameStateMessage}</h1>

            <h3>Send them the game address above so they can join</h3>
          </>
        )}
        {currentUIState === UIState.CommitPhase && (
          <>
            <div style={{ margin: 8 }}>
              <h2>Game State</h2>
              <h1>{gameStateMessage}</h1>
            </div>
            {!playerHasCommitted && (
              <>
                <Divider />
                <div style={{ margin: 8 }}>
                  <h2>Commit</h2>
                  <Radio.Group buttonStyle="solid">
                    <Radio.Button
                      value="rock"
                      style={{ height: "130px", width: "130px", fontSize: "40px", paddingTop: "32px" }}
                      onChange={e => setCommitChoice(e.target.value)}
                    >
                      ✊<div style={{ fontSize: "20px", margin: "20px 0" }}>"rock"</div>
                    </Radio.Button>
                    <Radio.Button
                      value="paper"
                      style={{ height: "130px", width: "130px", fontSize: "40px", paddingTop: "32px" }}
                      onChange={e => setCommitChoice(e.target.value)}
                    >
                      🖐<div style={{ fontSize: "20px", margin: "20px 0" }}>"paper"</div>
                    </Radio.Button>
                    <Radio.Button
                      value="scissors"
                      style={{ height: "130px", width: "130px", fontSize: "40px", paddingTop: "32px" }}
                      onChange={e => setCommitChoice(e.target.value)}
                    >
                      ✌<div style={{ fontSize: "20px", margin: "20px 0" }}>"scissors"</div>
                    </Radio.Button>
                  </Radio.Group>
                  <h3 style={{ marginTop: "16px" }}>Password to reveal your choice later</h3>
                  <Input
                    placeholder="Password"
                    style={{ textAlign: "center", width: "200px" }}
                    onChange={e => setCommitSalt(e.target.value)}
                    maxLength={15}
                  />
                  <Button style={{ marginTop: 8 }} onClick={commit}>
                    Commit
                  </Button>
                </div>
              </>
            )}
          </>
        )}
        {currentUIState === UIState.RevealPhase && (
          <>
            <div style={{ margin: 8 }}>
              <h2>Game State</h2>
              <h1>{gameStateMessage}</h1>
            </div>
            <Divider />
            <div style={{ margin: 8 }}>
              {!playerHasRevealed ? (
                <>
                  <h2>Reveal</h2>
                  <Input
                    placeholder="Password"
                    style={{ textAlign: "center", width: "200px" }}
                    onChange={e => setRevealSalt(e.target.value)}
                    maxLength={15}
                  />
                  <Button style={{ marginTop: 8 }} onClick={reveal}>
                    Reveal
                  </Button>
                </>
              ) : (
                <>
                  <h2>Time left</h2>
                  {timeLeft !== undefined && (
                    <>
                      <h2>{humanizeDuration(timeLeft * 1000)}</h2>
                      <h3>If the other player fails to reveal in time, you can claim the win by default</h3>
                    </>
                  )}
                  {timeLeft === 0 && (
                    <Button style={{ marginTop: 8 }} onClick={claimWin}>
                      Claim win
                    </Button>
                  )}
                </>
              )}
            </div>
          </>
        )}
        {currentUIState === UIState.ResultPhase && (
          <>
            <div style={{ margin: 8 }}>
              <h2>Game State</h2>
              <h1>{gameStateMessage}</h1>
              <Button style={{ marginTop: 8 }} size="large" onClick={leaveGame}>
                New Game 🔁
              </Button>
            </div>
            <Divider />
            <div style={{ margin: 8 }}>
              <Row>
                <Col
                  span={12}
                  style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
                >
                  <h3>{isPlayer1 ? "You " : "Player 1"} chose</h3>
                  {renderChoice(activeGameData.reveal1)}
                </Col>
                <Col
                  span={12}
                  style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
                >
                  <h3>{isPlayer1 ? "Player 2" : "You "} chose</h3>
                  {renderChoice(activeGameData.reveal2)}
                </Col>
              </Row>
            </div>
          </>
        )}
      </div>

      {/*
        📑 Maybe display a list of events?
          (uncomment the event and emit line in YourContract.sol! )
      */}
      {/* <Events
        contracts={readContracts}
        contractName="RockPaperScissors"
        eventName="GameUpdate"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      /> */}
    </div>
  );
}
