import React, { useState } from "react";
import { Tooltip, QRCode } from "antd";
import SOL from "../images/Solana_logo.png"


function WalletHeader({ wallet }) {
  const [copySuccess, setCopySuccess] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet);
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };
  return (
    <>
      <div className="w-96">
        <Tooltip
          className="tools text-white" overlayStyle={{ width: '500px' }}
          title={
            <div className="toolTip">
              <div className="text-[16px] pb-4">Receive SOL</div>
              <div className="py-6 px-8 bg-[#080808] rounded-[8px]">
                <QRCode value={wallet} icon={SOL} size={128} className="qrcode" />
              </div>
              <div className="walletInfo">
                <div className="py-[14px] text-[#A8A8A8] text-[12px]">{wallet}</div>
                {/* <div className="bg-[#0B0515] p-[11px] flex items-start gap-1 rounded-[8px]">
                  <img src={ibutton} alt="iButton" />
                  <div className="text-start text-[#722ae8] text-[13px] font-medium font-urbanist leading-[15px]">This address can only be used to receive compatible tokens. Any other types of token might be lost</div>
                </div> */}
                <div className="flex w-full gap-1.5">
                  <div className="w-full py-[11px] text-center text-[15px] font-urbanist font-[600] rounded-[10px] bg-[#722AE8] cursor-pointer" onClick={handleCopy}>{copySuccess ? copySuccess : "Copy"}</div>
                </div>
              </div>
            </div>
          }
        >
          {/* <div className="mt-[-6px] max-w-[360px] w-full">
            {wallet.slice(0, 4)}...{wallet.slice(38)}
          </div> */}
        </Tooltip>
      </div>
    </>
  );
}

export default WalletHeader;
