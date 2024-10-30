import React, { useEffect, useState } from "react";
import {
  Divider,
  Tooltip,
  List,
  Avatar,
  Spin,
  Tabs,
  Input,
  Button,
  message,
  Alert,
} from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import logo from "../noImg.png";
import SOL from "../images/Solana_logo.png"
import axios from "axios";
import { CHAINS_CONFIG } from "../chains";
import { QRCodeCanvas } from "qrcode.react";
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  Keypair,
  VersionedTransaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import TwoFactorAuth from "./TwoFactorAuth";
import send from "../images/send.png";
import rec from "../images/rec.png";
import swap from "../images/swap.png";
import security from "../images/security.png";
import ass from "../images/ass.png";
import USDC from '../images/usdc.png';
import USD from '../images/usd-coin.png';
import BONK from '../images/bonk.png';
import WIF from '../images/dog.png';


function WalletView({
  wallet,
  setWallet,
  setSeedPhrase,
  selectedChain,

}) {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState(null);
  const [nfts, setNfts] = useState(null);
  const [balance, setBalance] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [amountToSend, setAmountToSend] = useState("");
  const [sendToAddress, setSendToAddress] = useState("");
  const [processing, setProcessing] = useState(false);
  const [hash, setHash] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [show2FA, setShow2FA] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [flag, setflag] = useState(false);
  const [showPin, setshowPin] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [isVisiblePin, setIsVisiblePin] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [swapFromToken, setSwapFromToken] = useState("");
  const [swapToToken, setSwapToToken] = useState("");
  const [swapAmount, setSwapAmount] = useState("");
  const [swapQuote, setSwapQuote] = useState(null);
  const [finalSwapAmount, setFinalSwapAmount] = useState("");
  const [finalSwapFromToken, setFinalSwapFromToken] = useState("");
  const [finalSwapToToken, setFinalSwapToToken] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [key, setKey] = useState("");




  const assets = [
    { name: 'SOL', symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', decimals: 9, imgURL: SOL },
    { name: 'USDC', symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, imgURL: USD },
    { name: 'BONK', symbol: 'BONK', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', decimals: 5, imgURL: BONK },
    { name: 'WIF', symbol: 'WIF', mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', decimals: 6, imgURL: WIF },
  ];
  const selectedAsset = assets.find(asset => asset.symbol === swapToToken);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState({ symbol: '', image: '' });

  const handleSelect = (tokenSymbol, tokenImage) => {
    setSelectedToken({ symbol: tokenSymbol, image: tokenImage });
    setIsOpen(false);
  };

  useEffect(() => {
    const pinSetup = JSON.parse(localStorage.getItem("pinSetup") || "{}");
    setStoredPassword(pinSetup[wallet] || "");
  }, [wallet]);

  const transactionHistory = JSON.parse(localStorage.getItem(wallet) || "[]");

  async function getSwapQuote() {
    setSwapQuote(null);
    if (selectedChain == "devnet") {
      message.error("SWAP not available on devnet!")
    } else {
      console.log(swapFromToken)
      console.log(swapToToken)
      console.log(swapAmount)
      if (!swapFromToken || !swapToToken || !swapAmount) {
        message.error("Please fill in all swap details");
        return;
      }
      const fromToken = tokens.find(token => token.symbol === swapFromToken);
      const toToken = assets.find(asset => asset.symbol === swapToToken);
      setFinalSwapToToken(toToken)
      setFinalSwapFromToken(fromToken)
      console.log(swapAmount)
      console.log(fromToken.amount)
      if (swapAmount <= fromToken.amount) {
        try {
          const response = await axios.get(
            `https://quote-api.jup.ag/v6/quote?inputMint=${fromToken.mint}&outputMint=${toToken.mint}&amount=${swapAmount * Math.pow(10, fromToken.decimals)}&slippageBps=50`
          );
          setFinalSwapAmount(response.data.outAmount / Math.pow(10, toToken.decimals))
          setSwapQuote(response.data);
        } catch (error) {
          console.error("Error fetching swap quote:", error);
          message.error("Failed to fetch swap quote");
        }
      } else {
        message.error("Enter Amount Less than current balance!")
      }

    }
  }
  async function revealKey() {
    const secretKeyString = localStorage.getItem("privatekey");
    setKey(secretKeyString);
  }
  const onClose = (e) => {
    setKey("");
  };

  async function executeSwap() {
    if (!swapQuote) {
      message.error("Please get a quote first");
      return;
    }
    

    try {
      const swapResponse = await axios.post("https://quote-api.jup.ag/v6/swap", {
        quoteResponse: swapQuote,
        userPublicKey: wallet,
        wrapAndUnwrapSol: true,
      });

      const swapTransactionBuf = Buffer.from(swapResponse.data.swapTransaction, "base64");
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      const secretKeyString = localStorage.getItem("privatekey");
      const secretKey = bs58.decode(secretKeyString);
      const keypair = Keypair.fromSecretKey(secretKey);

      transaction.sign([keypair]);

      const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=a40dc3a4-ca63-45d4-b196-7952dd75348f', "confirmed");
      const rawTransaction = transaction.serialize();
      const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2,
      });
      const latestBlockHash = await connection.getLatestBlockhash();
      // await connection.confirmTransaction(txid);
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: txid
      }, 'confirmed');
      function getCurrentDateTime() {
        const currentDateTime = new Date();
        const year = currentDateTime.getFullYear();
        const month = String(currentDateTime.getMonth() + 1).padStart(2, "0"); // Months are zero-based
        const day = String(currentDateTime.getDate()).padStart(2, "0");
        const hours = String(currentDateTime.getHours()).padStart(2, "0");
        const minutes = String(currentDateTime.getMinutes()).padStart(2, "0");
        const seconds = String(currentDateTime.getSeconds()).padStart(2, "0");
        const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        return formattedDateTime;
      }
      const transactionData1 = {
        amount: swapAmount,
        signature: txid,
        toAddress: finalSwapToToken.mint,
        token: finalSwapFromToken.symbol,
        type: "Swap Out",
        dateTime: getCurrentDateTime(),
      };
      const transactionData2 = {
        amount: finalSwapAmount,
        signature: txid,
        toAddress: finalSwapFromToken.mint,
        token: finalSwapToToken.symbol,
        type: "Swap In",
        dateTime: getCurrentDateTime(),
      };
      const walletAddress = wallet;
      const existingTransactions =
        JSON.parse(localStorage.getItem(walletAddress)) || [];
      existingTransactions.push(transactionData1);
      localStorage.setItem(walletAddress, JSON.stringify(existingTransactions));
      existingTransactions.push(transactionData2);
      localStorage.setItem(walletAddress, JSON.stringify(existingTransactions));

      message.success(`Swap executed successfully.`);
      getAccountTokens();
      setSwapFromToken("");
      setSwapToToken("");
      setSwapAmount("");
      setSwapQuote(null);
      setFinalSwapAmount("");
      setFinalSwapFromToken("");
      setFinalSwapToToken("");
    } catch (error) {
      console.error("Error executing swap:", error);
      message.error("Failed to execute swap");
    }
  }

  const handleItemClick = (index) => {
    setExpandedTransaction(expandedTransaction === index ? null : index);
  };

  const verifyPasswordAndSend = async () => {
    if (enteredPassword === storedPassword && flag) {
      try {
        const toPublicKey = new PublicKey(sendToAddress);
        await sendTransaction(sendToAddress, amountToSend);
      } catch (e) {
        message.error("Invalid Solana Address Entered")
      }
    } else {
      message.error("Incorrect password");
    }
  };

  const savePassword = () => {
    if (password === confirmPassword) {
      let currentSetup = JSON.parse(localStorage.getItem("pinSetup") || "{}");
      currentSetup[wallet] = password;
      localStorage.setItem("pinSetup", JSON.stringify(currentSetup));
      setStoredPassword(password);
      message.success("Password set successfully");
      setIsVisiblePin(false);
      setQrCodeUrl(null);
    } else {
      message.error("Passwords do not match");
    }
  };

  const generatePin = () => {
    const setup = JSON.parse(localStorage.getItem("pinSetup") || "{}");
    if (setup[wallet]) {
      message.error("PIN already set!");
    } else {
      setIsVisiblePin(true);
    }
  };

  const handleSelectChange = (assetSymbol) => {
    setSwapToToken(assetSymbol);
    setIsDropdownOpen(false); // Close dropdown on selection
  };

  const items = [
    {
      key: "0",
      label:
       (
        <>
          <span
            style={{
              color: "white",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#722ae8")}
            onMouseLeave={(e) => (e.target.style.color = "white")}

          >            <img src={ass} alt="send" className="w-9 ml-1" />

            <p className="text-xs"> Tokens</p>
          </span>
        </>
      ),
      children: (
        <>
          <div className="text-white text-left ml-2 mb-4">My Assets</div>
          {tokens ? (
            <>
              <List className="text-white"
                bordered
                itemLayout="horizontal"
                dataSource={tokens}
                renderItem={(item, index) => (
                  <List.Item style={{ textAlign: "left", color: "white" }}>
                    <List.Item.Meta
                      avatar={
                        <Avatar src={item.symbol === "SOL" ? SOL :
                          item.symbol === "USDC" ? USDC :
                            item.logo || logo
                        }
                        />
                      }
                      title={<span style={{ color: 'white' }}>{item.symbol}</span>}
                      description={<span style={{ color: 'gray' }}>{item.name}</span>}
                    />
                    <div>
                      {(
                        Number(item.amountRaw) /
                        10 ** Number(item.decimals)
                      ).toFixed(2)}{" "}
                      Tokens
                    </div>
                  </List.Item>
                )}
              />
            </>
          ) : (
            <>
              <span>You seem to not have any tokens yet</span>
            </>
          )}
        </>
      ),
    },
    // {
    //   key: "1",
    //   label: `NFTs`,
    //   children: (
    //     <>
    //       {nfts ? (
    //         <>
    //           {nfts.map((e, i) => {
    //             return (
    //               <>
    //                 {e && (
    //                   <img
    //                     key={i}
    //                     className="nftImage"
    //                     alt="nftImage"
    //                     src={e}
    //                   />
    //                 )}
    //               </>
    //             );
    //           })}
    //         </>
    //       ) : (
    //         <>
    //           <span>You seem to not have any NFTs yet</span>
    //         </>
    //       )}
    //     </>
    //   ),
    // },
    {
      key: "2",
      label: (
        <>
          <span
            style={{
              color: "white",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#722ae8")}
            onMouseLeave={(e) => (e.target.style.color = "white")}
          >
            <img src={send} alt="send" className="w-8" />

            <p className="text-xs">  Send</p>
          </span>
        </>
      ),
      children: (
        <>


          <div className="sendRow">
            <p style={{ width: "90px", textAlign: "left", color: "white" }}> To:</p>
            <Input
              value={sendToAddress}
              onChange={(e) => setSendToAddress(e.target.value)}
              placeholder="Enter Receiving Address"
              className="input"
              style={{
                backgroundColor: "black",
                color: "white"
              }}
            />
          </div>
          <div className="sendRow">
            <p style={{ width: "90px", textAlign: "left", color: "white" }}> Amount:</p>
            <Input
              value={amountToSend}
              onChange={(e) => setAmountToSend(e.target.value)}
              placeholder="Amount"
              className="input"
              style={{
                backgroundColor: "black",
                color: "white"
              }}

            />
          </div>
          <p className="text-white text-right">Available Balance: <span className="font-bold"> {balance} </span></p>
          <p className="text-white">Fees @ 0.5% : {amountToSend * 0.05}</p>
          <Button
            className="frontPageButton1"
            style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }}
            type="primary"
            onClick={() => {
              const setup = JSON.parse(localStorage.getItem("TwoFaSetupz"));
              const setupPin = JSON.parse(localStorage.getItem("pinSetup"));
              setProcessing(false);
              setAmountToSend(null);
              setSendToAddress(null);
              setEnteredPassword("");
              setShow2FA(false);
              setshowPin(false);
              getAccountTokens();
              if (setup[wallet] && setupPin[wallet]) {
                if (amountToSend <= balance) {
                  initiate2FA();
                } else {
                  message.error("Enter Amount less than or equal to current balance!")
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

          {/* password part */}
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
                  style={{
                    backgroundColor: "black",
                    color: "white"
                  }}
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
          {/* password part ends */}

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
          {transactionHistory.length > 0 ? (
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
          )}
        </>
      ),
    },

    {
      key: "4",
      label: 
      (
        <>
          <span
            style={{
              color: "white",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#722ae8")}
            onMouseLeave={(e) => (e.target.style.color = "white")}
          >
            <img src={security} alt="send" className="w-9 ml-1" />

            <p className="text-xs"> Security </p>
          </span>
        </>
      ), children: (
        <>
          <span className="text-white">Step 1:-</span>{" "}
          <Button className="frontPageButton1" onClick={generate2FA}>Generate 2FA QR Code</Button>
          {qrCodeUrl && (
            <>
              <h3 className="text-white">Scan this QR Code with Google Authenticator and Enter Code Below:</h3>
              <img src={qrCodeUrl} alt="2FA QR Code" className="ml-[50px]" />
              {show2FASetup && (
                <TwoFactorAuth
                  onVerify={handle2FAVerificationSetup}
                  processing={processing}
                />
              )}
            </>
          )}
          <>
            <p className="mt-6">
              {" "}
              <span className="text-white">Step 2:-</span> <Button className="frontPageButton1" onClick={generatePin}>Setup Transaction PIN</Button>
            </p>
            {isVisiblePin && (
              <div className="setupPin">
                <div className="passwordRow">
                  <p style={{ width: "150px", textAlign: "left", color: "white" }}>PIN:</p>
                  <div className="passwordRow">
                    <p style={{ width: "150px", textAlign: "left", color: "white" }}>Set PIN:</p>
                    <input
                      type="password"
                      className="w-full h-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Set a new password"
                      style={{
                        backgroundColor: "black",
                        color: "white"
                      }}
                    />
                  </div>

                  <div className="passwordRow">
                    <p style={{ width: "150px", textAlign: "left", color: "white" }}>Confirm PIN:</p>
                    <input
                      type="password"
                      className="w-full h-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      style={{
                        backgroundColor: "black",
                        color: "white"
                      }}
                    />
                  </div>

                </div>
                <Button
                  className="frontPageButton1"
                  style={{ width: "100%", marginTop: "20px" }}
                  type="primary"
                  onClick={savePassword}
                  disabled={!password || password !== confirmPassword}
                >
                  Set Password
                </Button>
              </div>
              
            )}
             <p>
              {" "}
              <Button className="frontPageButton1" onClick={revealKey}>Reveal PrivateKey</Button>
            </p>
            {key && (
              <>
                <Alert
                  message={"Please Copy and Close this"}
                  description={key}
                  type="warning"
                  closable
                  onClose={onClose}
                />
                <br />
              </>
            )}

          </>
        </>
      ),
    },
    {
      key: "5",
      label: 
      (
        <>
          <span
            style={{
              color: "white",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#722ae8")}
          // onMouseLeave={(e) => (e.target.style.color = "white")}
          >
            <img src={swap} alt="send" className="w-8" />

            <p className="text-xs"> Swap</p>
          </span>
        </>
      ), children: (
        <>
          <h3 className="text-white font-bold">Swap Tokens</h3>
          <div className="swapRow">
            <div className="flex justify-end space-x-3 text-gray-400 ">
              <button className="hover:text-purple-900" onClick={() => setSwapAmount((balance * 0.1).toFixed(2))}>10%</button>
              <button className="hover:text-purple-900" onClick={() => setSwapAmount((balance * 0.2).toFixed(2))}>20%</button>
              <button className="hover:text-purple-900" onClick={() => setSwapAmount((balance * 0.5).toFixed(2))}>50%</button>
              <button className="hover:text-purple-900" onClick={() => setSwapAmount(balance)}>MAX</button>
            </div>

            <div className="swapContainer" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div>
                <p className="m-2 text-gray-600 text-left">Source</p>
                <div style={{ position: 'relative', width: '100px', }}>
                <select
                  style={{
                    borderRadius: "10px",
                    width: "full",
                    backgroundColor: "black",
                    color: "white",
                    height: "35px",
                    paddingLeft: "10px",
                  }}
                  value={swapFromToken || ""}
                  onChange={(e) => setSwapFromToken(e.target.value)}
                >
                  <option value="" disabled>Select</option>
                  {tokens &&
                    tokens.map((token) => (
                      <option
                        key={token.address}
                        value={token.symbol}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          color: "white",
                          backgroundColor: "black",
                          border: "1px solid #722ae8",
                        }}
                      >
                        <span>{token.symbol}</span>
                        <img src={SOL} alt="SOL logo" style={{ width: "20px", height: "20px" }} />
                        </option>
                    ))}
                </select>
                </div>
              </div>

              <div>
                <p className="m-2 text-gray-600 text-right">Amount:</p>
                <input
                  style={{
                    textAlign: "right",
                    borderRadius: "10px",
                    paddingLeft: "120px",
                    width: "100%",
                  }}
                  value={swapAmount}
                  className="bg-black text-white w-full h-[35px] border border-black"
                  onChange={(e) => setSwapAmount(e.target.value)}
                  placeholder="Enter Amount"
                  type="text"
                />
              </div>
            </div>
          </div>


          <div className="swapContainer" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div>
              <p className="m-2 text-gray-600 text-left">Destination</p>
              <div>
                <div>
                  <div
                    style={{
                      borderRadius: "10px",
                      width: "100%",  // fix the width
                      backgroundColor: "black",
                      color: "white",
                      height: "35px",
                      paddingLeft: "10px",
                      marginRight: "14px",
                      cursor: "pointer",
                      position: "relative"
                    }}
                    value={swapToToken || ""}
                    onChange={(e) => setSwapToToken(e.target.value)}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle dropdown state
                  >
                    <div>
                      {selectedAsset ? (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <img
                            src={selectedAsset.imgURL}
                            alt={selectedAsset.name}
                            style={{ width: '20px', height: '20px', marginRight: '10px' }}
                          />
                          {selectedAsset.name}
                        </div>
                      ) : (
                        <span>Select</span>
                      )}
                    </div>
                    {/* Dropdown menu */}
                    <div style={{
                      display: isDropdownOpen ? 'block' : 'none',
                      position: "absolute",
                      top: "100%",
                      left: "0",
                      width: "100%",
                      backgroundColor: "black",
                      border: "1px solid white",
                      zIndex: 1
                    }}>
                      {assets.map((asset) => (
                        <div
                          key={asset.mint}
                          value={asset.symbol}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px',
                            cursor: 'pointer',
                            color: 'white',
                          }}
                          onClick={() => handleSelectChange(asset.symbol)}
                        >
                          <img
                            src={asset.imgURL}
                            alt={asset.name}
                            style={{ width: '20px', height: '20px', marginRight: '10px' }}
                          />
                          {asset.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {swapQuote && (
              <div className="quoteInfo">
                <p
                  style={{
                    borderRadius: "10px",
                    backgroundColor: "black",
                    color: "white",
                    height: "35px",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 10px",
                    width: "40%",
                    marginTop: "40px",
                    marginLeft: "120px"
                  }}
                >
                  {finalSwapAmount}
                </p>
              </div>
            )}
          </div>

          <button
            className="frontPageButton1"
            style={{ width: "100%", marginTop: "20px" }}
            type="primary"
            onClick={getSwapQuote}
          >
            Get Quote
          </button>
          {swapQuote && (
            <div className="quoteInfo">
              <p>Price impact: {swapQuote.priceImpactPct}%</p>
              <button
                className="frontPageButton1"
                style={{ width: "100%", marginTop: "20px" }}
                type="primary"
                onClick={executeSwap}
              >
                Execute Swap
              </button>
            </div>
          )}
        </>
      ),
    }
  ];
  async function generate2FA() {
    initiate2FASetup();
    const setup = JSON.parse(localStorage.getItem("TwoFaSetupz") || "{}");
    if (setup[wallet]) {
      message.error("2FA already setup!");
    } else {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/auth/generate-2fa`,
          { userId: wallet }
        );
        setQrCodeUrl(response.data.qrCodeUrl);
        console.log("2FA QR Code URL:", response.data.qrCodeUrl);
      } catch (error) {
        console.error("Error generating 2FA QR code:", error);
      }
    }
  }
  async function handle2FAVerificationSetup(otp) {
    const payload = {
      userId: wallet,
      token: otp,
    };
    console.log("Sending 2FA verification payload:", payload);

    setProcessing(true);

    try {
      const res = await axios.post(`${process.env.REACT_APP_SERVER_URL}/verify-2fa`, payload);
      console.log("2FA verification response:", res.data);

      if (res.data.valid) {
        message.success("2FA verification successful, Setup Successfull!");
        let currentSetup = JSON.parse(localStorage.getItem("TwoFaSetupz") || "{}");
        currentSetup[wallet] = true;
        localStorage.setItem("TwoFaSetupz", JSON.stringify(currentSetup));
        setQrCodeUrl(null);
        setflag(true);
        setshowPin(true);
      } else {
        console.error("Invalid 2FA code");
        message.error("Invalid 2FA code. Please try again.");
      }
    } catch (error) {
      console.error("2FA verification failed:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        message.error(`Verification failed: ${error.response.data.message}`);
      } else {
        message.error("Verification failed. Please try again.");
      }
    } finally {
      setProcessing(false);
      setShow2FASetup(false);
    }
  }
  async function initiate2FA() {
    setShow2FA(true);
  }
  async function initiate2FASetup() {
    setShow2FASetup(true);
  }

  async function handle2FAVerification(otp) {
    const payload = {
      userId: wallet,
      token: otp,
    };
    console.log("Sending 2FA verification payload:", payload);

    setProcessing(true);

    try {
      const res = await axios.post(`${process.env.REACT_APP_SERVER_URL}/verify-2fa`, payload);
      console.log("2FA verification response:", res.data);

      if (res.data.valid) {
        console.log("2FA verification successful");
        message.success("2FA verification successful, Now Enter Password");
        setflag(true);
        setshowPin(true);
      } else {
        console.error("Invalid 2FA code");
        message.error("Invalid 2FA code. Please try again.");
      }
    } catch (error) {
      console.error("2FA verification failed:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        message.error(`Verification failed: ${error.response.data.message}`);
      } else {
        message.error("Verification failed. Please try again.");
      }
    } finally {
      setProcessing(false);
      setShow2FA(false);
    }
  }

  async function sendTransaction(to, amount) {
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
    const transactionfees = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey: feesPublicKey,
        lamports: amount * 0.05 * LAMPORTS_PER_SOL,
      })
    );

    setProcessing(true);

    try {
      const signature = await sendAndConfirmTransaction(
        connection,
        transactionfees,
        [fromWallet]
      );
      const { value: status } = await connection.getSignatureStatuses([
        signature,
      ]);
      const confirmedSignature = status[0];
      console.log(confirmedSignature);
      if (confirmedSignature.confirmationStatus) {
        console.log("Fees deducted");
      } else {
        console.log("Transaction failed to finalize");
      }
    } catch (err) {
      console.log("Transaction failed:", err);
    }
    try {
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [fromWallet]
      );

      setHash(signature);
      console.log("Transaction signature:", signature);

      function getCurrentDateTime() {
        const currentDateTime = new Date();
        const year = currentDateTime.getFullYear();
        const month = String(currentDateTime.getMonth() + 1).padStart(2, "0"); // Months are zero-based
        const day = String(currentDateTime.getDate()).padStart(2, "0");
        const hours = String(currentDateTime.getHours()).padStart(2, "0");
        const minutes = String(currentDateTime.getMinutes()).padStart(2, "0");
        const seconds = String(currentDateTime.getSeconds()).padStart(2, "0");
        const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        return formattedDateTime;
      }
      const transactionData = {
        amount: amountToSend,
        signature: signature,
        toAddress: sendToAddress,
        token: "SOL",
        type: "Sent",
        dateTime: getCurrentDateTime(),
      };
      const walletAddress = wallet;
      const existingTransactions =
        JSON.parse(localStorage.getItem(walletAddress)) || [];
      existingTransactions.push(transactionData);
      localStorage.setItem(walletAddress, JSON.stringify(existingTransactions));

      const { value: status } = await connection.getSignatureStatuses([
        signature,
      ]);
      const confirmedSignature = status[0];
      console.log(confirmedSignature);
      if (confirmedSignature.confirmationStatus) {
        message.success("Transaction Sent Successfully!");
        setProcessing(false);
        setAmountToSend(null);
        setSendToAddress(null);
        setEnteredPassword("");
        setShow2FA(false);
        setshowPin(false);
        getAccountTokens();
      } else {
        console.log("Transaction failed to finalize");
      }
    } catch (err) {
      console.log("Transaction failed:", err);
      setHash(null);
      setProcessing(false);
      setAmountToSend(null);
      setSendToAddress(null);
      setShow2FA(false);
    }
  }

  async function getAccountTokens() {
    setFetching(true);
    console.log(wallet, selectedChain);
    const res = await axios.get(`${process.env.REACT_APP_SERVER_URL}/getTokens`, {
      params: {
        userAddress: wallet,
        network: selectedChain,
      },
    });

    const response = res.data;

    if (response.tokens.length > 0) {
      setTokens(response.tokens);
    }

    if (response.nfts.length > 0) {
      setNfts(response.nfts);
    }
    console.log(response.balance);
    setBalance(response.balance);

    setFetching(false);
  }

  function logout() {
    setSeedPhrase(null);
    setWallet(null);
    setNfts(null);
    setTokens(null);
    setBalance(0);
    navigate("/");
  }

  useEffect(() => {
    if (!wallet || !selectedChain) return;
    setNfts(null);
    setTokens(null);
    setBalance(0);
    getAccountTokens();
  }, []);

  useEffect(() => {
    if (!wallet) return;
    setNfts(null);
    setTokens(null);
    setBalance(0);
    getAccountTokens();
  }, [selectedChain]);

  return (
    <>
      <div className="content bg-black ">
        <div className="logoutButton text-white" onClick={logout}>
          <LogoutOutlined />
        </div>
        <div className="walletName">Wallet</div>
        <Tooltip
          className="tools text-white"
          title={
            <div className="toolTip">
              <div className="title">Receive Crypto</div>
              <QRCodeCanvas value={wallet} size={128} className="qrcode" />
              <div className="walletInfo">
                <div className="walletLabel ">Wallet Address: </div>
                <div className="walletAddress">{wallet}</div>
              </div>
              <div className="networkInfo">Network: {selectedChain}</div>
            </div>
          }
        >
          <div className="mt-[-6px]">
            {wallet.slice(0, 4)}...{wallet.slice(38)}
          </div>
        </Tooltip>
        <div className="text-white font-sans text-xs ">Total Balance</div> <div className="font-bold text-white text-2xl">{balance} {"SOL"}  <FontAwesomeIcon
          icon={faSyncAlt}
          style={{
            marginLeft: "10px",
            cursor: "pointer",
            fontSize: "12px",
          }}
          onClick={getAccountTokens}
        /></div>

        <Divider className="divider" />
        {fetching ? (
          <Spin className="" />
        ) : (
          <Tabs defaultActiveKey="5" items={items} className="walletView" />
        )}
      </div>
    </>
  );
}

export default WalletView;