import React, { useState } from 'react';
import { message,Tooltip } from 'antd';
import bought from '../images/bought.svg'
import logo from "../noImg.png";
import SOL from "../images/Solana_logo.png";
import USDC from '../images/usdc.png';
import send from "../images/send.svg";
import swap from "../images/swap.svg";
import recieve from "../images/recieve.svg"
import buy from '../images/buy.svg'
function AssetDetail({ token, wallet, selectedChain,setTab }) {
    const [expandedTransaction, setExpandedTransaction] = useState(null);
    const transactionHistory = JSON.parse(localStorage.getItem(wallet)) || [];
    console.log(transactionHistory)
    const handleItemClick = (index) => {
        setExpandedTransaction(expandedTransaction === index ? null : index);
    };
    return (
        <div className="w-full h-full text-start">
            <div className="flex flex-col w-full gap-4">
                <p className="text-[#474747] text-sm font-medium font-urbanist">Your Balance</p>
                <div className="w-full flex justify-between">
                    <div className="">
                        <div className="text-white text-base font-medium font-urbanist leading-[18.34px]">{token.amount} SOL</div>
                        <div className="text-[#a7a7a7] text-sm font-light font-urbanist leading-[18.34px]">${token.usdbal}</div>
                    </div>
                    <img className="w-[45px] h-[45px]" src={
                        token?.symbol === "SOL"
                            ? SOL
                            : token?.symbol === "USDC"
                                ? USDC
                                : token?.logo || logo
                    } alt="" />
                </div>
            </div>
            <div className="pt-5 w-full flex items-center gap-2">
                <div className="w-[70px] h-[70px] cursor-pointer bg-[#080808] rounded-[13px] flex flex-col justify-center items-center p-[10px] gap-0">
                    <img onClick={() => setTab(1)} src={send} alt="Send" />
                    <div className="text-center text-[#a8a8a8] text-xs font-normal font-urbanist leading-[18.34px]">Send</div>
                </div>
                <div className="w-[70px] h-[70px] cursor-pointer bg-[#080808] rounded-[13px] flex flex-col justify-center items-center p-[10px] gap-0">
                    <img onClick={() => setTab(6)} src={recieve} alt="Receive" />
                    <div className="text-center text-[#a8a8a8] text-xs font-normal font-urbanist leading-[18.34px]">Receive</div>
                </div>
                <div className="w-[70px] h-[70px] cursor-pointer bg-[#080808] rounded-[13px] flex flex-col justify-center items-center p-[10px] gap-0">
                    <img onClick={() => setTab(3)} src={swap} alt="Swap" />
                    <div className="text-center text-[#a8a8a8] text-xs font-normal font-urbanist leading-[18.34px]">Swap</div>
                </div>
                <div className="w-[70px] h-[70px] cursor-pointer bg-[#080808] rounded-[13px] flex flex-col justify-center items-center p-[10px] gap-0">
                    <img onClick={() => message.error("Buy feature will be available soon")}src={buy} alt="Buy" />
                    <div className="text-center text-[#a8a8a8] text-xs font-normal font-urbanist leading-[18.34px]">Buy</div>
                </div>
            </div>
            <div className="flex pt-[20px] gap-4 flex-col w-full">
                <p className="text-[#474747] text-sm font-medium font-urbanist">About {token.symbol}</p>
                <div className="py-3 px-2 w-full rounded-[9px] bg-[#080808] flex flex-col gap-3">
                    <div className="pb-3 flex w-full justify-between border-b-[1px] border-[#1D1D1D] text-white text-[13px] font-normal font-urbanist leading-[18.34px]">
                        <p className="">Token</p>
                        <p className="">{token.symbol}</p>
                    </div>
                    <div className="pb-3 flex w-full justify-between border-b-[1px] border-[#1D1D1D] text-white text-[13px] font-normal font-urbanist leading-[18.34px]">
                        <p className="">Network </p>
                        <p className="">Solana</p>
                    </div>
                    <div className="flex w-full justify-between text-white text-[13px] font-normal font-urbanist leading-[18.34px]">
                        <p className="">Price </p>
                        <div className="flex items-center gap-1.5">
                            <p>${Number(token.price).toFixed(3)}</p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
                                <circle cx="6.45252" cy="6.50721" r="6.11268" fill="white" />
                                <path d="M6.45191 9.8418L3.08317 4.42374L9.82065 4.42374L6.45191 9.8418Z" fill="#080808" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            <div className="pt-[20px] flex gap-[10px] flex-col w-full">
                {transactionHistory.length > 0 ? <> <div className="text-[#474747] text-[14px] font-medium font-urbanist text-start">Recent Activity</div>
                    {
                        <ul className="transaction-history-list bg-black flex flex-col gap-5">
                            {transactionHistory.slice().reverse().map((item, index) => (
                                <li key={index} className="">
                                    <div
                                        onClick={() => handleItemClick(index)}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <div className="min-w-9 h-9 rounded-full bg-[#080808] flex justify-center items-center">
                                            <img src={item.type === "Received" || item.type === "Swap In" ? recieve : item.type === "Sent" ? send : bought} alt="asset" className="w-4 h-4" />
                                        </div>

                                        <div className="flex w-full justify-between items-center text-white text-[13px]">
                                            <div className="text-start">
                                                <p className="">{item.type} {item.token || "SOL"}</p>
                                                <p className="pt-0.5 text-[#474747]">{item.type === "Received" ? "From" : item.type === "Sent" || item.type === "Swap In" ? "To" : "Via"} {wallet.slice(0, 4)}...{wallet.slice(38)}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[#FE4444]">{item.amount} {item.token || "SOL"}</div>
                                                <div className="text-[#A8A8A8]">$249.90</div>
                                            </div>
                                        </div>
                                    </div>

                                    {expandedTransaction === index && (
                                        <div className="transaction-details-dropdown">
                                            <p>
                                                <strong>To Address:</strong> {item.toAddress}
                                            </p>
                                            <Tooltip
                                                title={
                                                    <a
                                                        href={`https://explorer.solana.com/item/${item.signature}?cluster=${selectedChain}`}
                            
                                                    >
                                                        View on Solana Explorer
                                                    </a>
                                                }
                                            >
                                                <p>
                                                    <strong>Transaction Hash:</strong> {item.signature}
                                                </p>
                                            </Tooltip>

                                            <p>
                                                <strong>Date & Time:</strong> <br />
                                                {item.dateTime}
                                            </p>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    }
                </> :
                    (
                        <>
                            <div className="w-full h-[1px] bg-[#1D1D1D] mb-[10px]"></div>
                            <div className="flex w-full justify-center">
                                <p className="text-[#474747] text-[14px] font-urbanist w-full text-center max-w-[230px]">
                                    <span>Transactions will appear here  Can’t find txns, </span>
                                    <span className="text-[#722AE8] underline cursor-pointer">check explorer</span>
                                </p>
                            </div>
                        </>
                    )}
            </div>
        </div>
    );
}

export default AssetDetail;