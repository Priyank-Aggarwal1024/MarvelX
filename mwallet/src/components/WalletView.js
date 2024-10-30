import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message, Button, Spin } from "antd";
import { ArrowLeftOutlined, CheckCircleFilled, CheckCircleOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { Keypair } from "@solana/web3.js";
import axios from "axios";
import WalletHeader from "./WalletHeader";
import AssetsTab from "./AssetsTab";
import SendTab from "./SendTab";
import SecurityTab from "./SecurityTab";
import SwapTab from "./SwapTab";
import send from "../images/send.svg";
import swap from "../images/swap.svg";
import bluetick from '../images/bluetick.svg'
import recieve from "../images/recieve.svg"

import bs58 from "bs58";
import TransactionHistory from "./TransactionHistory";
import ReceiveTab from "./ReceiveTab";
import BackArrow from "./BackArrow";
import setting from '../images/setting.svg'
import scan2 from '../images/scan2.svg'
import security2 from '../images/security2.svg'
import key4 from '../images/key4.svg'
import triangle from '../images/triangle.svg'
import acccheck from '../images/account-check.svg'
import wallet1 from '../images/wallet1.svg'
import AssetDetail from "./AssetDetail";
import BottomNav from "./BottomNav";

function WalletView({ wallet, setWallet, setSeedPhrase, selectedChain, password, authTab, setAuthTab, setSelectedChain }) {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState(null);
  const [token, setToken] = useState(null)
  const [nfts, setNfts] = useState(null);
  const [balance, setBalance] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupdiv, setShowPopupdiv] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedAccountVal, setSelectedAccountVal] = useState({
    publicKey: wallet,
    usdbal: 0,
    privateKey: "",
  });
  const [accountkeys, setAccountKeys] = useState("[]");
  const [accountTokens, setAccountTokens] = useState(null);
  const [transactionData, setTransactionData] = useState("[]");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usdBalance, setusdBalance] = useState(0);
  const [tab, setTab] = useState(4)
  const [openModal, setOpenModal] = useState(false)
  const [filterModal, setFilterModal] = useState(false);

  const handleAccountSelection = (wallet) => {
    const selectedKey = accountkeys.find(key => key.publicKey === wallet);
    if (selectedKey) {
      setSelectedAccountVal({
        publicKey: selectedKey.publicKey,
        usdbal: selectedKey.usdbal,
        privateKey: selectedKey.secretKey,
        walletName: selectedKey.walletName || "Wallet",
      });
    }
  };
  const handleWalletDropDown = () => {
    if (showPopup) {
      closePopup()
    } else {
      handleImportClick();
    }
  }
  useEffect(() => {
    const fetchAndSetBalance = async () => {
      if (wallet) {
        const balance = await fetchBalance(wallet, selectedChain);
        setSelectedAccountVal(prevState => ({
          ...prevState,
          usdbal: balance,
        }));
      }
    };
    fetchAndSetBalance();
  }, [wallet, accountkeys, selectedChain]);



  async function fetchTransactions(wallet, selectedChain) {
    try {
      let apiUrl = ""
      if (selectedChain === "devnet") {
        apiUrl = `https://api-${selectedChain}.helius.xyz/v0/addresses/${wallet}/transactions?api-key=a40dc3a4-ca63-45d4-b196-7952dd75348f`;
      } else if (selectedChain === "mainnet") {
        apiUrl = `https://api.helius.xyz/v0/addresses/${wallet}/transactions?api-key=a40dc3a4-ca63-45d4-b196-7952dd75348f`;
      }
      console.log(apiUrl)
      const response = await axios.get(apiUrl);
      setTransactionData(response.data.reverse());
      console.log(transactionData)
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }

  const fetchBalance = async (wallet, selectedChain) => {
    setLoading(true);
    setError(null);
    if (selectedChain !== "devnet") {
      try {
        const res = await axios.get(`${process.env.REACT_APP_SERVER_URL}/getBalance`, {
          params: { wallet: wallet, network: selectedChain },
        });
        return res.data.balance;
      } catch (err) {
        setError(err.message);
        return 0;
      } finally {
        setLoading(false);
      }
    } else {
      return 0;
    }
  };

  const fetchAllBalances = async () => {
    if (accountkeys != "[]") {
      setLoading(true);
      try {
        const updatedAccountKeys = await Promise.all(
          accountkeys.map(async (account) => {
            const balance = await fetchBalance(account.publicKey, selectedChain);
            return { ...account, usdbal: balance };
          })
        );

        setAccountKeys(updatedAccountKeys);
      } catch (error) {
        setError("Error fetching all balances");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

  };

  function getAccountArray() {
    const account = JSON.parse(localStorage.getItem(password) || "[]");
    console.log("account", account);
    const publicKeys = account.map(secretKeyBase58 => {
      try {
        const secretKey = bs58.decode(secretKeyBase58.key);
        const recoveredWallet = Keypair.fromSecretKey(secretKey);
        return recoveredWallet.publicKey.toString();
      } catch (error) {
        console.error("Failed to decode or recover Keypair:", error);
        return null;
      }
    });
    const accountKeys = account.map(secretKeyBase58 => {
      try {
        const secretKey = bs58.decode(secretKeyBase58.key);
        const recoveredWallet = Keypair.fromSecretKey(secretKey);

        return {
          publicKey: recoveredWallet.publicKey.toString(),
          secretKey: secretKeyBase58.key,
          walletName: secretKeyBase58.walletName || truncateAddress(recoveredWallet.publicKey.toString()),
          usdbal: 0
        };
      } catch (error) {
        console.error("Failed to decode or recover Keypair:", error);
        return null;
      }
    });
    // setAccountKeys(accountKeys.filter(keyPair => keyPair !== null))
    const currentAccount = accountKeys.find(key => key.publicKey === wallet);
    if (currentAccount) {
      setSelectedAccountVal({
        publicKey: currentAccount.publicKey,
        usdbal: currentAccount.usdbal,
        privateKey: currentAccount.secretKey,
        walletName: currentAccount.walletName || "Wallet",
      });
    }
    const keys = accountKeys.filter(keyPair => keyPair !== null);
    setAccountKeys(keys);
    return accountKeys.filter(keyPair => keyPair !== null);
    // return publicKeys.filter(publicKey => publicKey !== null);
  }


  const handleImportClick = () => {
    const accountArray = getAccountArray();
    setAccountKeys(accountArray);
    // if (accountArray.length > 0 && !selectedAccount) {
    //   setSelectedAccount(accountArray[0]);
    // }
    // console.log(accounts)
    // console.log(accountkeys)
    setShowPopup(true);
    fetchAllBalances();
  };
  const handleAccountSelect = (account) => {
    // console.log(account)
    setSelectedAccount(account);
    setWallet(account.publicKey);
    setSeedPhrase(account.secretKey);
    localStorage.setItem("privatekey", account.secretKey);
    closePopup();
  };

  const truncateAddress = (address) => {
    if (address.length > 10) {
      return `${address.slice(0, 4)}...${address.slice(-6)}`;
    }
    return address;
  };

  const closePopup = () => {
    setShowPopup(false);
    setShowPopupdiv(false);

  };

  async function getAccountTokens() {
    // fetchTransactions(wallet, selectedChain);
    try {
      console.log(wallet);
      const res = await axios.get(`${process.env.REACT_APP_SERVER_URL}/getTokens`, {
        params: { userAddress: wallet, network: selectedChain },
      });
      const response = res.data;
      if (response.tokens.length > 0) setTokens(response.tokens);
      if (response.nfts.length > 0) setNfts(response.nfts);
      setAccountTokens(response.tokens);
      setBalance(response.balance);
      setusdBalance(response.usdbalance);
    } catch (error) {
      console.error("Error fetching account tokens:", error);
      message.error("Failed to fetch account tokens");
    } finally {
      setFetching(false)
    }
  }

  async function getBalance() {
    const res = await axios.get(`${process.env.REACT_APP_SERVER_URL}/getBalance`, {
      params: { wallet: wallet, network: selectedChain },
    });
    console.log(res.data.balance)
  }

  function show() {
    setShowPopupdiv(true)
    setShowPopup(false)
    console.log("button pressed")
  }



  function logout() {
    setSeedPhrase(null);
    setWallet(null);
    setNfts(null);
    setTokens(null);
    setBalance(0);
    navigate("/");
  }
  function recover() {
    setSeedPhrase(null);
    setWallet(null);
    setNfts(null);
    setTokens(null);
    setBalance(0);
    navigate("/enternameviakey");
  }
  function recoverseed() {
    setSeedPhrase(null);
    setWallet(null);
    setNfts(null);
    setTokens(null);
    setBalance(0);
    navigate("/enternameviaseed");
  }
  function create() {
    setSeedPhrase(null);
    setWallet(null);
    setNfts(null);
    setTokens(null);
    setBalance(0);
    navigate("/entername");
  }

  useEffect(() => {
    if (wallet && selectedChain) {
      getAccountTokens();
      getAccountArray();
      fetchAllBalances()
      // getBalance();
      // fetchBalance(wallet,selectedChain);
      // fetchTransactions(wallet,selectedChain);
    }
  }, [wallet, selectedChain]);
  useEffect(() => {
    if (authTab) {
      setTab(authTab.tab)
      console.log(authTab)
    }
  }, [authTab])
  useEffect(() => {
    closePopup();

  }, [tab])
  return (
    <>
      {
        (openModal || showPopup || showPopupdiv) && <div className="absolute z-[11] bg-[#ffffff33] h-[600px] w-[360px]" onClick={() => setOpenModal(false)}></div>
      }
      {
        filterModal && <div className="h-[600px] w-[360px] cursor-pointer bg-[rgba(38,38,38,0.60)] absolute z-[11] top-0 left-0" onClick={() => setFilterModal(false)}></div>
      }
      {tab === 4 && <>
        <div className="gradient-blue z-[1]"></div>
        <div className="wallet-content relative bg-black overflow-x-hidden overflow-y-hidden overflow-hidden max-w-[360px] w-full">
          <div className="w-full">
            <div className="p-4 pt-[25px] pb-[35px] flex items-center justify-between text-white w-full">
              <div className="w-7"></div>
              <div
                className="bg-transparent border-[0.8px] border-[#c6b8f8] px-2 h-[30px] select-wallet rounded-[10px] text-white flex justify-center items-center gap-2 cursor-pointer relative z-[4]"
                onClick={handleWalletDropDown}
              >
                <span className="">{selectedAccountVal.walletName}</span>
                <img src={triangle} alt="triangle" className="w-2 h-2" />
              </div>
              <div className="pr-2 relative z-[16]">
                <img src={setting} className="cursor-pointer" alt="Network Modal" onClick={() => setOpenModal(!openModal)} />
                {
                  openModal && <>
                    <div className="w-[208px] bg-[#080808] rounded-[10px] absolute top-[150%] right-0 z-[10]">
                      <div className="w-full px-2 py-2.5">
                        <div className="flex flex-col w-full bg-[#161616] rounded-[10px]">

                          <div className="w-full p-2 flex items-center justify-between cursor-pointer"
                            onClick={() => {
                              setSelectedChain("mainnet")
                              setOpenModal(false)
                            }}
                          >
                            <p className={`font-urbanist text-[13px] font-[500] ${selectedChain === "mainnet" ? "text-[#9945FF]" : "text-[#fff]"}`}>Switch to Mainnet</p>
                            {
                              selectedChain === "mainnet" && <img src={bluetick} alt="Tick" />
                            }
                          </div>
                          <div className="w-full h-[1px] bg-[#2A2A2A]"></div>
                          <div className="w-full p-2 flex items-center justify-between cursor-pointer"
                            onClick={() => {
                              setSelectedChain("devnet")
                              setOpenModal(false)
                            }}
                          >
                            <p className={`font-urbanist text-[13px] font-[500] ${selectedChain === "devnet" ? "text-[#9945FF]" : "text-[#fff]"}`}>Switch to Devnet</p>
                            {
                              selectedChain === "devnet" && <img src={bluetick} alt="Tick" />
                            }
                          </div>

                        </div>
                      </div>
                      {wallet &&
                        <>
                          <div className="my-[3px] h-[1px] bg-[#1D1D1D] w-full"></div>
                          <div className="px-2 pb-4 pt-2.5 w-full flex flex-col gap-4">
                            <div className="text-[#474747] text-[13px] text-start font-medium font-urbanist">Security</div>
                            <div className="flex items-center cursor-pointer" onClick={() => {
                              setAuthTab(() => ({ tab: 2, innerTab: 1 }))
                              setOpenModal(false)
                            }}>
                              <img src={scan2} alt="Scan" />
                              <div className="text-white text-xs font-medium font-urbanist pl-[5px]">Generate 2FA QR code</div>
                            </div>
                            <div className="flex items-center cursor-pointer" onClick={() => {
                              setAuthTab(() => ({ tab: 2, innerTab: 2 }))
                              setOpenModal(false)
                            }}>
                              <img src={security2} alt="Security" />
                              <div className="text-white text-xs font-medium font-urbanist pl-[5px]">Setup transaction pin</div>
                            </div>
                            <div className="flex items-center cursor-pointer" onClick={() => {
                              setAuthTab(() => ({ tab: 2, innerTab: 3 }))
                              setOpenModal(false)
                            }}>
                              <img src={key4} alt="Key" />
                              <div className="text-white text-xs font-medium font-urbanist pl-[5px]">Reveal private Key</div>
                            </div>
                          </div>
                        </>
                      }
                    </div>
                  </>
                }
              </div>
            </div>
          </div>
          <div className="z-[2] max-w-full w-full">
            <WalletHeader
              wallet={wallet} />
            <div className="text-[#A8A8A8] font-sans text-xs">Total Balance</div>
            <div className="font-bold text-white text-[40px] leading-[43px] flex items-center justify-center gap-1">
              <p>{balance === "0" ? "0" : Number(balance) % 1 === 0 ? Number(balance).toFixed(0) : Number(balance).toFixed(2)} SOL</p>
              <FontAwesomeIcon
                icon={faSyncAlt}
                style={{ cursor: "pointer", fontSize: "12px" }}
                onClick={getAccountTokens}
              />
            </div>
            <div className="flex justify-center items-center gap-1.5 mb-2.5">
              <div className="text-center text-white text-sm font-normal font-urbanist leading-[17px]">+$0</div>
              <div className="h-[24.51px] px-2 py-1 bg-[#17872a] rounded-lg border border-[#17872a] flex-col justify-end items-center gap-2 inline-flex text-center text-white text-[13px] font-normal leading-[18px]">
                0%
              </div>
            </div>
            {fetching ? (
              <Spin className="" />
            ) : (
              <>
                <div className="flex justify-center gap-2.5">
                  <div className="cursor-pointer"
                    onClick={() => setTab(1)}
                  >
                    <div className="w-[70px] h-[70px] rounded-full bg-[#1D1D1D] flex justify-center items-center hover:bg-[#000000e5] transition-all duration-200">

                      <img src={send} alt="Send" className=" -ml-1 -mb-1" />
                    </div>
                    <div className="text-center text-white text-[13px] font-normal font-urbanist leading-[17px] pt-2.5">Send</div>
                  </div>
                  <div className="cursor-pointer"
                    onClick={() => setTab(6)}
                  >
                    <div className="w-[70px] h-[70px] rounded-full bg-[#1D1D1D] flex justify-center items-center hover:bg-[#000000e5] transition-all duration-200">
                      <img src={recieve} alt="Receive" className="" />
                    </div>
                    <div className="text-center text-white text-[13px] font-normal font-urbanist leading-[17px] pt-2.5">Receive</div>
                  </div>
                  <div className="cursor-pointer"
                    onClick={() => setTab(3)}
                  >
                    <div className="w-[70px] h-[70px] rounded-full bg-[#1D1D1D] flex justify-center items-center hover:bg-[#000000e5] transition-all duration-200">
                      <img src={swap} alt="Swap" />
                    </div>
                    <div className="text-center text-white text-[13px] font-normal font-urbanist leading-[17px] pt-2.5">Swap</div>
                  </div>
                </div>
                <div className="px-4 w-full py-4">
                  {
                    tab === 4 && <AssetsTab setTab={setTab} tokens={tokens} setToken={setToken} />
                  }
                </div>
              </>
            )}

          </div>
          {showPopup && (
            <div className="absolute z-[16] bottom-0 left-0 right-0 bg-black text-white rounded-t-2xl shadow-lg animate-slide-up">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <ArrowLeftOutlined className="text-xl mr-4 cursor-pointer" onClick={closePopup} />
                  <h3 className="text-sm flex-grow text-center">Wallet</h3>
                </div>
                <div
                  className="max-h-[250px] overflow-y-auto scrollbar-none bg-[#080808] rounded-[8px] px-[15px] py-2 flex flex-col w-full gap-[15px]"
                >

                  {
                    accountkeys.map((account, idx) => (
                      <React.Fragment key={idx}>
                        <div key={idx}
                          onClick={() => handleAccountSelect(account)}
                          className="cursor-pointer hover:bg-gray-800 transition-colors w-full flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <img src={wallet1} alt="Wallet Img" />
                            <div>
                              <p className="text-white text-[13px] text-start">
                                {account.walletName}
                              </p>
                              <p className="text-[#474747] text-[13px] text-start">
                                {loading && selectedChain === "mainnet"
                                  ? "Loading..."
                                  : selectedChain === "mainnet"
                                    ? `$${account.usdbal}`
                                    : "$0.00"}
                              </p>
                            </div>
                          </div>
                          <div className="w-8">
                            {account.publicKey === wallet && <img src={acccheck} alt="Check" />}
                          </div>
                        </div>
                        {idx !== accountkeys.length - 1 && <div className="w-full">
                          <div className="bg-[#161616] h-[1px] w-full"></div>
                        </div>}
                      </React.Fragment>
                    ))
                  }

                </div>

                {error && (
                  <p style={{ color: "red" }}>Error: {error}</p>
                )}

              </div>
              <div className="px-[25px]">
                <button className="frontPageButton1 w-full mb-4" style={{ marginTop: "0px" }} onClick={show}>Add Wallet</button>
              </div>
            </div>
          )}
          {showPopupdiv && (
            <div className="absolute bottom-0 bg-black bg-opacity-50 z-50 flex items-end">
              <div className="content bg-black w-full max-w-full border-stone-200 max-h-[45vh]">
                <div className="bg-black text-white p-6 slide-up">
                  <div className="flex items-center mb-6">
                    <ArrowLeftOutlined className="text-lg mr-4" onClick={closePopup} />
                    <h3 className="text-sm font-bold ml-10 ">Import Existing Wallet</h3>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={() => recover()}
                      className="frontPageButton2 w-full"
                      type="default"
                    >
                      By Private Key
                    </button>
                    <Button
                      onClick={(e) => recoverseed()}
                      className="frontPageButton1 w-full border-purple-950 font-semibold"
                      type="default"
                    >
                      By Mnemonic Phrase
                    </Button>

                    <button
                      onClick={() => create()}
                      className="frontPageButton3"
                      type="primary"
                    >
                      Create a New Wallet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <BottomNav setTab={setTab} tab={tab} filterModal={filterModal} />

        </div>
      </>}
      {tab !== 4 && tab !== null &&
        <div className="h-[600px]">
          <div className={`bg-black overflow-y-auto scrollbar-none w-[360px] relative ${tab === 2 ? "h-[600px]" : "h-[519px] "}`}>
            <div className="p-5 h-full overflow-y-auto scrollbar-none">
              {tab !== 2 && <BackArrow setTab={setTab} tab={tab} token={token} />}

              {
                tab === 2 ? <SecurityTab wallet={wallet} accountkeys={accountkeys} authTab={authTab} setTab={setTab} /> : tab === 1 ? <SendTab wallet={wallet} balance={balance} selectedChain={selectedChain} getAccountTokens={getAccountTokens} transactionHistory={transactionData} /> :
                  tab === 5 ? <TransactionHistory wallet={wallet} selectedChain={selectedChain} /> :
                    tab === 3 ? <SwapTab wallet={wallet} tokens={tokens} balance={balance} selectedChain={selectedChain} getAccountTokens={getAccountTokens} filterModal={filterModal} setFilterModal={setFilterModal} /> :
                      tab === 6 ? <ReceiveTab wallet={wallet} /> :
                        tab === 7 && <AssetDetail token={token} wallet={wallet} selectedChain={selectedChain} />
              }
            </div>
          </div>
          {
            tab !== 2 && <BottomNav setTab={setTab} tab={tab} />
          }
        </div>
      }
    </>

  );
}

export default WalletView;