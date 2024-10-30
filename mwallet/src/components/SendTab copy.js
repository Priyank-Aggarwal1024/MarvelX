import React, { useEffect, useState } from "react";
import { Input, Button, message, Spin, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { Connection, PublicKey, SystemProgram, Transaction, Keypair, LAMPORTS_PER_SOL, sendAndConfirmTransaction, } from "@solana/web3.js";
import bs58 from "bs58";
import { CHAINS_CONFIG } from "../chains";
import TwoFactorAuth from "./TwoFactorAuth";

function SendTab({ wallet, balance, selectedChain, getAccountTokens, transactionHistory }) {
  const [sendToAddress, setSendToAddress] = useState("");
  const [amountToSend, setAmountToSend] = useState("");
  const [processing, setProcessing] = useState(false);
  const [hash, setHash] = useState(null);
  const [show2FA, setShow2FA] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [flag, setFlag] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState(null);

  // const transactionHistory = JSON.parse(localStorage.getItem(wallet) || "[]");


  const verifyPasswordAndSend = async () => {
    const storedPassword = JSON.parse(localStorage.getItem("pinSetup") || "{}")[wallet];
    if (enteredPassword === storedPassword && flag) {
      try {
        const toPublicKey = new PublicKey(sendToAddress);
      } catch (e) {
        message.error("Invalid Solana Address Entered");
        resetForm()
      }
      await sendTransaction(sendToAddress, amountToSend);
    } else {
      message.error("Incorrect password");
    }
  };

  const initiate2FA = () => {
    setShow2FA(true);
  };
  const handleItemClick = (index) => {
    setExpandedTransaction(expandedTransaction === index ? null : index);
  };

  const handle2FAVerification = async (otp) => {
    const payload = { userId: wallet, token: otp };
    setProcessing(true);

    try {
      const res = await axios.post(`${process.env.REACT_APP_SERVER_URL}/verify-2fa`, payload);
      if (res.data.valid) {
        message.success("2FA verification successful, Now Enter Password");
        setFlag(true);
        setShowPin(true);
      } else {
        message.error("Invalid 2FA code. Please try again.");
      }
    } catch (error) {
      console.error("2FA verification failed:", error);
      message.error("Verification failed. Please try again.");
    } finally {
      setProcessing(false);
      setShow2FA(false);
    }
  };

  const sendTransaction = async (to, amount) => {
    try {
    const chain = CHAINS_CONFIG[selectedChain];
    const connection = new Connection(chain.rpcUrl, "confirmed");
    const secretKeyString = localStorage.getItem("privatekey");
    const secretKey = bs58.decode(secretKeyString);
    const fromWallet = Keypair.fromSecretKey(secretKey);
    const toPublicKey = new PublicKey(to);
    const feesPublicKey = new PublicKey('89HF8VxawNZks4D82HDGied3k3D3fQKWC55yCs6n5Mw1');

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey: toPublicKey,
        lamports: Math.trunc(amount*LAMPORTS_PER_SOL),
      })
    );

    const transactionFees = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey: feesPublicKey,
        lamports: Math.trunc(amount * 0.05 * LAMPORTS_PER_SOL),
      })
    );

    setProcessing(true);

    
      await sendAndConfirmTransaction(connection, transactionFees, [fromWallet]);
      console.log("Fees deducted");

      const signature = await sendAndConfirmTransaction(connection, transaction, [fromWallet]);
      setHash(signature);
      console.log("Transaction signature:", signature);

      const transactionData = {
        amount: amountToSend,
        signature: signature,
        toAddress: sendToAddress,
        token: "SOL",
        type: "Sent",
        dateTime: getCurrentDateTime(),
      };

      const existingTransactions = JSON.parse(localStorage.getItem(wallet)) || [];
      existingTransactions.push(transactionData);
      localStorage.setItem(wallet, JSON.stringify(existingTransactions));

      message.success("Transaction Sent Successfully!");
      resetForm();
      getAccountTokens();
    } catch (err) {
      console.log("Transaction failed:", err);
      message.error("Transaction failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setAmountToSend("");
    setSendToAddress("");
    setEnteredPassword("");
    setShow2FA(false);
    setShowPin(false);
    setHash(null);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substr(0, 19);
  };

  return (
    <>
      <div className="sendRow">
        <p style={{ width: "90px", textAlign: "left", color: "white" }}> To:</p>
        <Input
          value={sendToAddress}
          onChange={(e) => setSendToAddress(e.target.value)}
          placeholder="Enter Receiving Address"
          className="input"
          style={{ backgroundColor: "black", color: "white" }}
        />
      </div>
      <div className="sendRow">
        <p style={{ width: "90px", textAlign: "left", color: "white" }}> Amount:</p>
        <Input
          value={amountToSend}
          onChange={(e) => setAmountToSend(e.target.value)}
          placeholder="Amount"
          className="input"
          style={{ backgroundColor: "black", color: "white" }}
        />
      </div>
      <p className="text-white text-right">Available Balance: <span className="font-bold">{balance}</span></p>
      <p className="text-white">Fees @ 0.5% : {amountToSend * 0.05}</p>
      <Button
        className="frontPageButton1"
        style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }}
        type="primary"
        onClick={() => {
          const setup = JSON.parse(localStorage.getItem("TwoFaSetupz"));
          const setupPin = JSON.parse(localStorage.getItem("pinSetup"));
          if (setup[wallet] && setupPin[wallet]) {
            if (parseFloat(amountToSend) <= balance) {
              initiate2FA();
            } else {
              message.error("Enter Amount less than or equal to current balance!");
            }
          } else {
            message.error("First setup 2FA and PIN both!");
          }
        }}
        disabled={processing || !sendToAddress}
      >
        Send Tokens
      </Button>
      {show2FA && (
        <TwoFactorAuth
          onVerify={handle2FAVerification}
          processing={processing}
        />
      )}
      {showPin && (
        <>
          <div className="sendRow">
            <p style={{ width: "90px", textAlign: "left", color: "white" }}> PIN:</p>
            <input
              type="password"
              className="input w-full"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              placeholder="Enter PIN"
              style={{ backgroundColor: "black", color: "white" }}
            />
          </div>
          <Button
            className="frontPageButton1"
            style={{ width: "100%", marginTop: "20px" }}
            type="primary"
            onClick={verifyPasswordAndSend}
            disabled={processing}
          >
            Send Tokens
          </Button>
        </>
      )}
      {processing && (
        <>
          <Spin />
          {hash && (
            <Tooltip title={hash}>
              <p>Hover For Tx Hash</p>
            </Tooltip>
          )}
        </>
      )}


      <h1 className="font-bold text-white"> Tokens Sent</h1>
      {/* {transactionHistory.length > 0 ? (
        <ul className="transaction-history-list bg-black">
          {transactionHistory.slice().reverse().map((tx, index) => (
            <li key={index} className="transaction-history-item">
              <div
                onClick={() => handleItemClick(index)}
                className="transaction-summary"
              >
                <span>
                  <FontAwesomeIcon
                    icon={tx.type == "Received" || tx.type == "Swap In" ? faArrowDown : faArrowUp}
                    className={
                      tx.type == "Received" || tx.type == "Swap In" ? "received-icon" : "sent-icon"
                    }
                  />
                  <p className="date-time">{tx.dateTime}</p>
                </span>
                <span>{tx.amount} {tx.token || "SOL"}</span>
                <span>{tx.type}</span>
              </div>

              {expandedTransaction === index && (
                <div className="transaction-details-dropdown">
                  <p>
                    <strong>To Address:</strong> {tx.toAddress}
                  </p>
                  <Tooltip
                    title={
                      <a
                        href={`https://explorer.solana.com/tx/${tx.signature}?cluster=${selectedChain}`}
                        target="_blank"
                      >
                        View on Solana Explorer
                      </a>
                    }
                  >
                    <p>
                      <strong>Transaction Hash:</strong> {tx.signature}
                    </p>
                  </Tooltip>

                  <p>
                    <strong>Date & Time:</strong> <br />
                    {tx.dateTime}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-white">No transaction history available.</p>
      )} */}
      {/* {transactionHistory.length > 0 ? (
        <ul className="transaction-history-list bg-black">
          {transactionHistory.slice().reverse().map((tx, index) => (
            <li key={index} className="transaction-history-item">
              <div
                onClick={() => handleItemClick(index)}
                className="transaction-summary"
              >
                <span>
                  <FontAwesomeIcon
                    icon={tx.type === "TRANSFER" ? faArrowUp : faArrowDown}
                    className={tx.type === "TRANSFER" ? "sent-icon" : "received-icon"}
                  />
                  <p className="date-time">
                    {new Date(tx.timestamp * 1000).toLocaleString()}
                  </p>
                </span>
                <span>
                  {tx.nativeTransfers[0].amount / 1e9} SOL
                </span>
                <span>{tx.type === "TRANSFER" ? "Sent" : "Received"}</span>
              </div>

              {expandedTransaction === index && (
                <div className="transaction-details-dropdown">
                  <p><strong>Description:</strong> {tx.description}</p>
                  <p><strong>Fee:</strong> {tx.fee / 1e9} SOL</p>
                  <p><strong>From:</strong> {tx.nativeTransfers[0].fromUserAccount}</p>
                  <p><strong>To:</strong> {tx.nativeTransfers[0].toUserAccount}</p>
                  <Tooltip
                    title={
                      <a
                        href={`https://explorer.solana.com/tx/${tx.signature}?cluster=${selectedChain}`}
                        target="_blank"
                      >
                        View on Solana Explorer
                      </a>
                    }
                  >
                    <p><strong>Transaction Hash:</strong> {tx.signature}</p>
                  </Tooltip>
                  <p><strong>Date & Time:</strong> {new Date(tx.timestamp * 1000).toLocaleString()}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-white">No transaction history available.</p>
      )} */}
      {transactionHistory.length > 0 ? (
  <ul className="transaction-history-list bg-black">
    {transactionHistory.slice().reverse().map((tx, index) => {
      const isReceived = tx.nativeTransfers[0].toUserAccount === wallet;
      return (
        <li key={index} className="transaction-history-item">
          <div
            onClick={() => handleItemClick(index)}
            className="transaction-summary"
          >
            <span>
              <FontAwesomeIcon
                icon={isReceived ? faArrowDown : faArrowUp}
                className={isReceived ? "received-icon" : "sent-icon"}
              />
              <p className="date-time">
                {new Date(tx.timestamp * 1000).toLocaleString()}
              </p>
            </span>
            <span>
              {tx.nativeTransfers[0].amount / 1e9} SOL
            </span>
            <span>{isReceived ? "Received" : "Sent"}</span>
          </div>

          {expandedTransaction === index && (
            <div className="transaction-details-dropdown">
              <p><strong>Description:</strong> {tx.description}</p>
              <p><strong>Fee:</strong> {tx.fee / 1e9} SOL</p>
              <p><strong>From:</strong> {tx.nativeTransfers[0].fromUserAccount}</p>
              <p><strong>To:</strong> {tx.nativeTransfers[0].toUserAccount}</p>
              <Tooltip
                title={
                  <a
                    href={`https://explorer.solana.com/tx/${tx.signature}?cluster=${selectedChain}`}
                    target="_blank"
                  >
                    View on Solana Explorer
                  </a>
                }
              >
                <p><strong>Transaction Hash:</strong> {tx.signature}</p>
              </Tooltip>
              <p><strong>Date & Time:</strong> {new Date(tx.timestamp * 1000).toLocaleString()}</p>
            </div>
          )}
        </li>
      );
    })}
  </ul>
) : (
  <p className="text-white">No transaction history available.</p>
)}


    </>

  );
}

export default SendTab;