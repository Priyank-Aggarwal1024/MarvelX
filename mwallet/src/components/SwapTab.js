import React, { useEffect, useState } from "react";
import { message, Select, ConfigProvider } from "antd";
import axios from "axios";
import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import USD from '../images/usd-coin.png';
import BONK from '../images/bonk.png';
import WIF from '../images/dog.png';
import SOL from "../images/Solana_logo.png"
import righta from '../images/right-arrow.svg'
import swap2 from '../images/swap2.svg'
import filter from '../images/filter.svg'
import downArrow from '../images/downArrow.svg'
import bluetick from '../images/bluetick.svg'

function SwapTab({ wallet, tokens, balance, getAccountTokens, selectedChain, filterModal, setFilterModal }) {
  const assets = [
    { name: 'SOL', symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', decimals: 9, imgURL: SOL },
    { name: 'USDC', symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, imgURL: USD },
    { name: 'BONK', symbol: 'BONK', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', decimals: 5, imgURL: BONK },
    { name: 'WIF', symbol: 'WIF', mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', decimals: 6, imgURL: WIF },
  ];
  const [swapFromToken, setSwapFromToken] = useState(assets[0].symbol);
  const [swapToToken, setSwapToToken] = useState(assets[1].symbol);
  const [swapAmount, setSwapAmount] = useState("");
  const [swapQuote, setSwapQuote] = useState(null);
  const [finalSwapAmount, setFinalSwapAmount] = useState("");
  const [finalSwapFromToken, setFinalSwapFromToken] = useState("");
  const [finalSwapToToken, setFinalSwapToToken] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [storedPassword, setStoredPassword] = useState("");
  const [conversionString, setConversionString] = useState("");
  const [priority, setPriority] = useState("fast");
  const { Option } = Select;


  const selectedAsset = assets.find(asset => asset.symbol === swapToToken);


  useEffect(() => {
    const pinSetup = JSON.parse(localStorage.getItem("pinSetup") || "{}");
    setStoredPassword(pinSetup[wallet] || "");
  }, [wallet]);


  async function getSwapQuote() {
    setSwapQuote(null);
    if (selectedChain != "devnet") {
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
          setConversionString("1 " + swapFromToken + " ~ " + swapToToken + ": " + ((response.data.outAmount / Math.pow(10, toToken.decimals)) / swapAmount).toFixed(2))
        } catch (error) {
          console.error("Error fetching swap quote:", error);
          message.error("Failed to fetch swap quote");
        }
      } else {
        message.error("Enter Amount Less than current balance!")
      }

    }
  }


  async function executeSwap() {
    console.log("swap started")
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
  const handleChange = (value) => {
    setSwapToToken(value);
  };



  const handleSelectChange = (assetSymbol) => {
    setSwapToToken(assetSymbol);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div className="pb-6 flex items-center justify-between w-full relative">
        <div></div>
        <h3 className="text-white font-bold">Swap</h3>
        <div className="relative">
          <img src={filter} alt="Filter" className="cursor-pointer" onClick={() => setFilterModal(true)} />
          {
            filterModal && <div className="absolute w-[232px] h-[274px] bg-[#080808] rounded-[10px] right-full z-[20] text-start">
              <div className="w-full px-[10px] pt-[14px] pb-[11px] flex flex-col gap-2">
                <div className="text-[#474747] text-[13px] font-medium font-['SF Pro Display']">Piority Level</div>
                <div className="w-full rounded-[10px] bg-[#161616]" >
                  <div className="w-full flex items-center justify-between py-2 px-2.5 h-[34px] cursor-pointer" onClick={() => { setPriority("fast"); setFilterModal(false) }}>
                    <div className={`text-[13px] font-normal font-['SF Pro Display'] ${priority === "fast" ? "text-[#9945ff]" : "text-[#fff]"}`}>Fast</div>
                    {
                      priority === "fast" && <img src={bluetick} alt="Tick" />
                    }
                  </div>
                  <div className="w-full h-[0px] border border-[#2a2a2a]"></div>
                  <div className="w-full flex items-center justify-between py-2 px-2.5 h-[34px] cursor-pointer" onClick={() => { setPriority("turbo"); setFilterModal(false) }}>
                    <div className={`text-[13px] font-normal font-['SF Pro Display'] ${priority === "turbo" ? "text-[#9945ff]" : "text-[#fff]"}`}>Turbo</div>
                    {
                      priority === "turbo" && <img src={bluetick} alt="Tick" />
                    }
                  </div>
                  <div className="w-full h-[0px] border border-[#2a2a2a]"></div>
                  <div className="w-full flex items-center justify-between py-2 px-2.5 h-[34px] cursor-pointer" onClick={() => { setPriority("ultra"); setFilterModal(false) }}>
                    <div className={`text-[13px] font-normal font-['SF Pro Display'] ${priority === "ultra" ? "text-[#9945ff]" : "text-[#fff]"}`}>Ultra</div>
                    {
                      priority === "ultra" && <img src={bluetick} alt="Tick" />
                    }
                  </div>
                </div>
              </div>
              <div className="w-full h-[0px] border border-[#1d1d1d]"></div>
              <div className="px-2.5 pt-3 pb-4 w-full flex flex-col gap-2.5 ">
                <input type="text" className="flex w-full px-3 py-1 h-9 text-white placeholder:text-[#474747] text-xs font-normal font-['SF Pro Display'] leading-[10px] bg-[#080808] rounded-[4px] border-[1px]  border-[#1B1B1B] outline-none" placeholder="Enter custom amount in SOL" />
                <div className="w-full h-[38px] rounded-[10px] bg-[#722AE8] text-center flex items-center justify-center cursor-pointer">
                  <div className="text-center text-white text-[13px] font-medium font-['SF Pro Display'] leading-[18px]">Save</div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
      <div className="py-[15px] px-[10px] flex flex-col w-full gap-[11px] bg-[#080808] rounded-[8px]">
        <div className="flex items-center justify-between">
          <div className="text-[#474747] text-[13px] font-normal font-urbanist">Source</div>
          <div className="flex justify-end space-x-3 text-gray-400 ">
            <button className="hover:text-purple-900 p-1 rounded-[8px] border-[#1D1D1D] border-[.8px]" onClick={() => setSwapAmount((balance * 0.1).toFixed(2))}>10%</button>
            <button className="hover:text-purple-900 p-1 rounded-[8px] border-[#1D1D1D] border-[.8px]" onClick={() => setSwapAmount((balance * 0.2).toFixed(2))}>20%</button>
            <button className="hover:text-purple-900 p-1 rounded-[8px] border-[#1D1D1D] border-[.8px]" onClick={() => setSwapAmount((balance * 0.5).toFixed(2))}>50%</button>
            <button className="hover:text-purple-900 p-1 rounded-[8px] border-[#1D1D1D] border-[.8px]" onClick={() => setSwapAmount(balance)}>MAX</button>
          </div>
        </div>

        <div className="swapContainer" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div>
            <div style={{ position: 'relative', width: '100px', backgroundColor: "black" }}>
              <ConfigProvider
                theme={{
                  token: {
                    colorBgContainer: '#080808',
                    colorText: 'white',
                    colorBorder: '#080808',
                  },
                }}
              >
                <Select
                  style={{
                    width: '110px',
                    backgroundColor: '#080808',
                    color: 'white',
                  }}
                  value={swapFromToken || undefined}
                  onChange={(value) => setSwapFromToken(value)}
                  placeholder="Select"
                  dropdownStyle={{ backgroundColor: 'black' }}
                  suffixIcon={<img src={downArrow} alt="Down Arrow" />}
                >
                  {assets.map((asset) => (
                    <Option key={asset.mint} value={asset.symbol}> {/* Ensure key is unique */}
                      <div style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                        <img
                          src={asset.imgURL}
                          alt={asset.name}
                          style={{ width: '20px', height: '20px', marginRight: '10px' }}
                        />
                        {asset.name}
                      </div>
                    </Option>
                  ))}
                </Select>
              </ConfigProvider>
            </div>
          </div>
          <div className="ml-12">
            <input
              style={{
                textAlign: "right",
                borderRadius: "10px",
              }}
              value={swapAmount}
              className="bg-transparent text-white w-full px-1 text-[18px] outline-none"
              onChange={(e) => setSwapAmount(e.target.value)}
              placeholder="Enter Amount"
              type="text"
            />
          </div>
        </div>
        <div className="text-[#a8a8a8] text-start text-[13px] font-normal font-urbanist">Balance: {balance} SOL</div>
        {
          balance < Number(swapAmount) && <>
            <div className="w-full h-[0px] border border-[#1d1d1d]"></div>
            <div className="flex justify-between">
              <div className="text-[#CC3A3A] text-[13px] font-normal font-urbanist flex  items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="pr-1" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5Z" stroke="#CC3A3A" strokeWidth="1.5" />
                  <path d="M8.99414 11.25H9.00164" stroke="#CC3A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 9V6" stroke="#CC3A3A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Insufficient balance</span> </div>
              <img src={righta} alt="Right Arrow" className="rotate-90" />
            </div>
          </>
        }
      </div>
      <div className="py-[15px] px-[10px] flex flex-col w-full gap-[11px] bg-[#080808] rounded-[8px] mt-[10px] relative" >
        <img src={swap2} alt="Swap" className="absolute z-[2] left-[50%] -top-[20px] translate-x-[-50%]" />
        <div className="text-[#474747] text-[13px] font-normal font-urbanist text-start">Destination</div>
        <div className="swapContainer" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <ConfigProvider
            theme={{
              token: {
                colorBgContainer: '#080808',
                colorText: 'white',
                colorBorder: '#080808',
              },
            }}
          >
            <Select
              style={{
                width: '110px',
                backgroundColor: '#080808',
                color: 'white',
              }}
              value={selectedAsset ? selectedAsset.symbol : undefined}
              onChange={handleChange}
              placeholder="Select"
              dropdownStyle={{ backgroundColor: 'black' }}
              suffixIcon={<img src={downArrow} alt="Down Arrow" />}
            >
              {assets.map((asset) => (
                <Option key={asset.mint} value={asset.symbol}> {/* Ensure key is unique */}
                  <div style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                    <img
                      src={asset.imgURL}
                      alt={asset.name}
                      style={{ width: '20px', height: '20px', marginRight: '10px' }}
                    />
                    {asset.name}
                  </div>
                </Option>
              ))}
            </Select>

          </ConfigProvider>
          <div className="w-[50%]">
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
                    marginLeft: "100px"
                  }}
                >
                  {finalSwapAmount}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="w-full h-[0px] border border-[#1d1d1d]"></div>
        <div className="flex justify-between">
          <div className="text-[#616161] text-[13px] font-normal font-urbanist">{conversionString}</div>
          <img src={righta} alt="Right Arrow" className="rotate-90" />
        </div>
      </div>

      <button
        className="frontPageButton1"
        style={{ width: "100%", marginTop: "20px" }}
        type="primary"
        onClick={getSwapQuote}
      >
        Proceed
      </button>
      {swapQuote && (
        <div className="quoteInfo">
          <p>Price impact: {swapQuote.priceImpactPct}%</p>
          <button
            className="frontPageButton1 mb-8"
            style={{ width: "100%", marginTop: "20px" }}
            type="primary"
            onClick={executeSwap}
          >
            Execute Swap
          </button>
        </div>
      )}
    </>
  );
}

export default SwapTab;