import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from '@ant-design/icons';
import img from "../images/wallet.png";
import trap from '../images/trap.svg'
import edit from '../images/edit.svg'
import key from '../images/key.svg'
import cloud from '../images/cloud.svg'
import watch from '../images/watch.svg'
import righta from '../images/right-arrow.svg'
import brandname from '../images/brandname.svg'
function Home() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  const handleImportClick = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showPopup]);

  return (
    <>
      <div className={`content1 bg-black py-5 px-6  ${showPopup ? 'inset-0' : ''}`}>
        <img src={trap} alt="trap" className="absolute top-0 z-[1] max-w-[360px]" />
        <div className="flex flex-col justify-between h-full w-full">
          <div className="text-center relative z-[4] text-white pt-12">
            <div className="flex items-center justify-center flex-col gap-1 mb-1">
              <img src={img} alt="Metasafe Logo" className="w-[94px]" />
              <img src={brandname} alt="MarvelX" />
            </div>
            <p className="text-[12px] text-[#474747]">
              The Solana Non Custodial Wallet
            </p>
          </div>
          <div className="w-full relative z-[4]">
            <button
              onClick={() => navigate("/yourwallet")}
              className="w-full bg-[#722AE8] text-white py-3 rounded-lg mb-4"
              type="primary"
            >
              Create New Wallet
            </button>
            <button
              onClick={handleImportClick}
              className="w-full bg-[#1D1D1D] text-white py-3 rounded-lg"
              type="primary"
            >
              Import Existing Wallet
            </button>
          </div>
        </div>
        {
          showPopup && (<div className="absolute top-0 z-[10] bg-[rgba(38,38,38,0.87)] w-[360px]
             h-full" />)
        }
        {showPopup && (
          <div className="absolute bottom-0 bg-black bg-opacity-50 z-50 flex items-end rounded-[10px]">
            <div className="content bg-black w-full max-w-full border-stone-200 max-h-[55vh] rounded-[10px]">
              <div className="bg-black text-white p-6 slide-up w-full pb-[18px]">
                <div className="flex items-center mb-6">
                  <ArrowLeftOutlined className="text-lg mr-4" onClick={closePopup} />
                  <h3 className="text-sm font-bold w-full text-center ">Import Wallet</h3>
                </div>

                <div className="py-[10px] px-2 flex flex-col gap-[10px] w-full bg-[#080808] rounded-[8px]">
                  <button
                    onClick={() => navigate("/recoverseed")}
                    className="flex justify-between w-full items-center"
                    type="default"
                  >
                    <div className="flex gap-2.5 items-center">
                      <img src={edit} alt="By Mnemonic Phrase" />
                      <div className="w-full text-start">
                        <p className="pb-0.5 text-white font-urbanist text-[13px] font-[500]">By Mnemonic Phrase</p>
                        <p className="text-[#474747] font-[300] text-[13px] font-urbanist">Use a 12, 0r 24 word seed phrase</p>
                      </div>
                    </div>
                    <img src={righta} alt="Right Arrow" />

                  </button>
                  <div className="w-full h-[1px] bg-[#161616]"> </div>
                  <button
                    onClick={() => navigate("/recover")}
                    className="flex justify-between w-full items-center"
                    type="default"
                  >
                    <div className="flex gap-2.5 items-center">
                      <img src={key} alt=" By Private Key" />
                      <div className="w-full text-start">
                        <p className="pb-0.5 text-white font-urbanist text-[13px] font-[500]">By Private key</p>
                        <p className="text-[#474747] font-[300] text-[13px] font-urbanist">Restore with your private key</p>
                      </div>
                    </div>
                    <img src={righta} alt="Right Arrow" />
                  </button>
                  <div className="w-full h-[1px] bg-[#161616]"> </div>
                  <button
                    onClick={() => navigate("/signin")}
                    className="flex justify-between w-full items-center"
                    type="primary"
                  >
                    <div className="flex gap-2.5 items-center">
                      <img src={cloud} alt="Restore wallet from Backup" />
                      <div className="w-full text-start">
                        <p className="pb-0.5 text-white font-urbanist text-[13px] font-[500]">Restore wallet from Backup</p>
                        <p className="text-[#474747] font-[300] text-[13px] font-urbanist">Restore wallet from backup</p>
                      </div>
                    </div>
                    <img src={righta} alt="Right Arrow" />
                  </button>
                  <div className="w-full h-[1px] bg-[#161616]"> </div>
                  <button
                    onClick={() => navigate("/watch-wallet")}
                    className="flex justify-between w-full items-center"
                    type="primary"
                  >
                    <div className="flex gap-2.5 items-center">
                      <img src={watch} alt="Watch Wallet" />
                      <div className="w-full text-start">
                        <p className="pb-0.5 text-white font-urbanist text-[13px] font-[500]">Watch Wallet</p>
                        <p className="text-[#474747] font-[300] text-[13px] font-urbanist">Track asset of other SOL wallet</p>
                      </div>
                    </div>
                    <img src={righta} alt="Right Arrow" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>



      <style>{`
        .slide-up {
          animation: slide-up 0.3s ease-out;
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export default Home;