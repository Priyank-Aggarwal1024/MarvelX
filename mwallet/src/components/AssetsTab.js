import React from "react";
import { Avatar } from "antd";
import logo from "../noImg.png";
import SOL from "../images/Solana_logo.png";
import USDC from '../images/usdc.png';

function AssetsTab({ tokens, setTab, setToken }) {
  return (
    <>
      <div className="text-white text-left ml-2 mb-4">My Assets</div>
      {tokens?.length > 0 ? (
        tokens.map((item, idx) => <div className="w-full text-white bg-[#080808] flex justify-between items-center py-3 px-2 rounded-[5px] cursor-pointer" key={idx} onClick={() => { setTab(7); setToken(item) }}>
          <div className="flex items-center">
            <Avatar
              src={
                item.symbol === "SOL"
                  ? SOL
                  : item.symbol === "USDC"
                    ? USDC
                    : item.logo || logo
              }
            />
            <div className="pl-2 flex flex-col gap-0.5 text-start">
              <span style={{ color: "white" }}>{item.name}</span>
              <span style={{ color: "gray" }}>{item.symbol}</span>
            </div>
          </div>
          <div className="">
            <div className="text-right text-white text-[13px] font-medium font-urbanist">{item.amount}</div>
            <div className="text-right text-[#a8a8a8] text-[13px] font-light font-urbanist">+0%</div>
          </div>
        </div>)

      ) : (
        <span>You seem to not have any tokens yet</span>
      )}
    </>
  );
}

export default AssetsTab;