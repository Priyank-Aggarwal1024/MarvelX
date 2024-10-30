import React, { useState } from 'react';
import { Tooltip } from 'antd';
import sent from '../images/send.svg'
import recieve from '../images/recieve.svg'
import bought from '../images/bought.svg'
function TransactionHistory({ wallet, selectedChain }) {
    const [expandedTransaction, setExpandedTransaction] = useState(null);
    const transactionHistory = JSON.parse(localStorage.getItem(wallet)) || [];
    console.log(transactionHistory)
    const handleItemClick = (index) => {
        setExpandedTransaction(expandedTransaction === index ? null : index);
    };
    return (
        <div>
            <div className="flex gap-[30px] flex-col w-full">
                <div className="text-[#474747] text-lg font-medium font-urbanist text-start">Today</div>
                {transactionHistory.length > 0 ? (
                    <ul className="transaction-history-list bg-black flex flex-col gap-5">
                        {transactionHistory.slice().reverse().map((item, index) => (
                            <li key={index} className="">
                                <div
                                    onClick={() => handleItemClick(index)}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <div className="min-w-9 h-9 rounded-full bg-[#080808] flex justify-center items-center">
                                        <img src={item.type === "Received" || item.type === "Swap In" ? recieve : item.type === "Sent" ? sent : bought} alt="asset" className="w-4 h-4" />
                                    </div>

                                    <div className="flex w-full justify-between items-center text-white text-[13px]">
                                        <div className="text-start">
                                            <p className="">{item.type} {item.token || "SOL"}</p>
                                            <p className="pt-0.5 text-[#474747]">{item.type === "Received" ? "From" : item.type === "Sent" || item.type === "Swap In" ? "To" : "Via"} {wallet.slice(0, 4)}...{wallet.slice(38)}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[#FE4444]">{item.amount} {item.token || "SOL"}</div>
                                            <div className="text-[#A8A8A8]">$0.00</div>
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
                                                    target="_blank"
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
                ) : (
                    <p className="text-white">No transaction history available.</p>
                )}
            </div>

        </div>
    );
}

export default TransactionHistory;