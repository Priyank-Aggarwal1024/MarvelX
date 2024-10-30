import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import img from "../images/wallet.png"
import key from "../images/key.png"
import key2 from "../images/key2.png"
import key3 from "../images/key3.png"
import brandname from '../images/brandname.svg'


const App = () => {
  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <div className="bg-black w-[360px] h-[568px] flex flex-col items-center justify-center text-white font-sans p-6">
      <div className="max-w-sm space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center flex-col gap-1 mb-1.5">
            <img src={img} alt="Metasafe Logo" className="w-[94px]" />
            <img src={brandname} alt="MarvelX" />
          </div>
          <p className="text-[12px] text-[#474747]">
            The Solana Non Custodial Wallet
          </p>
        </div>

        <div className="space-y-5">
          <div className="flex items-center space-x-3">
            <img src={key} alt="Icon 1" className="w-7" />
            <p className="text-sm leading-relaxed text-start">
              Manage your Solana tokens in one secure, easy-to-use wallet. MarvelX ensures your assets are safe with non-custodial storage.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <img src={key2} alt="Icon 2" className="w-7" />
            <p className="text-sm leading-relaxed text-start">
              Instantly swap between different tokens without leaving the app.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <img src={key3} alt="Icon 3" className="w-7" />
            <p className="text-sm leading-relaxed text-start">
              Discover and interact with your favorite decentralized applications (dApps) in MarvelX.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center mb-6 ">
          <input
            id="terms"
            type="checkbox"
            checked={termsAccepted}
            onChange={() => setTermsAccepted(!termsAccepted)}
            className="form-checkbox h-5 w-5 text-purple-600 bg-black border-gray-600 rounded-full hover:cursor-pointer"
          />
          <label htmlFor="terms" className="ml-3 text-gray-400 text-sm hover:cursor-pointer">
            I accept the terms and conditions
          </label>
        </div>

        <Link to="/home">
          <button
            className={`frontPageButton1 w-full ${termsAccepted ? "bg-gray-500" : "bg-gray-800 text-gray-600 cursor-not-allowed"
              }`}
            disabled={!termsAccepted}
          >
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
};

export default App;




