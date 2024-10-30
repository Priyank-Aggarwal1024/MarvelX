import React, { useState, useEffect } from "react";
import { BulbOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import wallet from "../images/wallet.png";
import view from '../images/view.svg'
import BackHome from "./BackHome";


function RecoverAccountSeed({ setWallet, setSeedPhrase, password, setPassword,walletName}) {
  const navigate = useNavigate();
  const [typedSeed, setTypedSeed] = useState("");
  const [nonValid, setNonValid] = useState(false);
  const [blankPassword, setBlankPassword] = useState(false);
  const { TextArea } = Input;
  // const [password, setPasswordNew] = useState("");
  const [confirmpassword, setconfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showpassdiv, setShowpassdiv] = useState(true);
  const [error, setError] = useState("");
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  function seedAdjust(e) {
    setNonValid(false);
    const inp = document.querySelectorAll(".input-mnemonic");
    let str = "";
    inp.forEach(item => {
      str += item.value.trim();
      str += " "
    })
    str = str.trim()
    let strArr = str.split(" ")
    inp.forEach((item, idx) => {
      if (idx < strArr.length)
        item.value = strArr[idx];
      else
        item.value = ""
    })
    setTypedSeed(str);
  }
  function passAdjust(e) {
    setBlankPassword(false);
    setPass1(e.target.value);
  }
  function confirmpassAdjust(e) {
    setBlankPassword(false);
    setPass2(e.target.value);
  }
  function showdiv() {
    if (pass1 !== pass2) {
      setError("Passwords do not match.");
    } else {
      setPassword(pass2);
      setconfirmPassword(pass2);
      setShowpassdiv(false);
    }
  }
  useEffect(() => {
    if (password !== "") {
      setShowpassdiv(false);
    }
  }, []);

  async function recoverWallet() {
    let recoveredWallet;
    if (password !== "") {
      if (bip39.validateMnemonic(typedSeed.trim())) { // Validate seed phrase
        try {
          const seed = await bip39.mnemonicToSeed(typedSeed.trim());
          const derived = derivePath("m/44'/501'/0'/0'", seed.toString("hex")).key;
          recoveredWallet = Keypair.fromSeed(derived);
        } catch (err) {
          setNonValid(true);
          return;
        }
        const secretKey = bs58.encode(recoveredWallet.secretKey);
        // localStorage.setItem(password, secretKey);

        let accountList;
        try {
          accountList = JSON.parse(localStorage.getItem(password) || "[]");
          const isValidAccountList = Array.isArray(accountList) && accountList.every(item => typeof item === "object" && item !== null && "walletName" in item && "key" in item);
          if (!isValidAccountList) {
            accountList = [];
          }
        } catch {
          accountList = [];
        }
        const accountExists = accountList.some(
          (account) => account.key === secretKey
        );
        if (!accountExists) {
          const newAccount = {
            walletName: walletName,
            key: secretKey,
          };
    
          accountList.push(newAccount);
          localStorage.setItem(password, JSON.stringify(accountList));
        } else {
          console.log("Account already added");
        }
        localStorage.setItem('privatekey', recoveredWallet.secretKey);
        setLoading(true);
        setTimeout(() => {
          setPassword(password);
          setLoading(false);
          setSeedPhrase(secretKey);
          setWallet(recoveredWallet.publicKey.toString());
          navigate("/yourwallet");
        }, 2000);
      } else {
        setNonValid(true);
      }
    } else {
      setBlankPassword(true);
    }
  }


  return (
    <>
      <BackHome />
      {loading ? (
        <div className="loading bg-black w-full flex justify-center items-center">
          <div className="mt-36">
            <img src={wallet} alt="" className="w-24 ml-20" />
            <div className="text-white font-semibold">Importing Your Wallet</div>
            <div className="text-white">We are importing your existing wallet</div>
            <div className="spinner">
              <div className="rect1"></div>
              <div className="rect2"></div>
              <div className="rect3"></div>
              <div className="rect4"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="content pt-4 px-[25px]">
          <div className="mnemonic">
            <BulbOutlined style={{ fontSize: "20px" }} />
            <div>
              Paste your seedphrase in the field below to recover your wallet.
            </div>
          </div>
          {showpassdiv && (<> <Input.Password
            value={pass1}
            onChange={passAdjust}
            className="passwordContainer1 bg-transparent ant-input-password"
            placeholder="Enter New Password"
            iconRender={() => (<img src={view} alt="Hide Unhide button" />)}
          />
            <Input.Password
              value={pass2}
              onChange={confirmpassAdjust}
              className="passwordContainer1"
              placeholder="Confirm New Password"
              iconRender={() => (<img src={view} alt="Hide Unhide button" />)}
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <button className="frontPageButton1" onClick={showdiv} >Set Password</button>

          </>
          )}
          {!showpassdiv && (<>
            <div className="flex-col justify-start items-start gap-2 inline-flex w-full text-start pt-4">
              <div className="text-white text-[22px] font-semibold font-urbanist">Mnemonic Phrase</div>
              <div className="text-[#474747] text-[15px] font-light font-urbanist leading-[21px]">Enter your mnemonic phrase to import wallet</div>
            </div>
            <div className="grid grid-cols-3 gap-[7px] py-4 w-full">
              {
                arr.map((item, idx) => <div className="py-2.5 px-2  bg-[#080808]  border-[0.8px] border-[#1D1D1D] rounded-[8px] flex gap-1" key={idx}>
                  <span className="block text-[#474747] text-[12px] ">{item}.</span>
                  <input className="block w-full font-urbanist tetx-[14px] text-white bg-transparent outline-none border-none input-mnemonic" onChange={seedAdjust} />

                </div>)
              }
            </div>
            <div className="px-4 pb-4 flex items-center text-start justify-start w-full">
              <input type="radio" name="mnemonicphase" id="mnemonicphase" className="checked:accent-[transparent]" />
              <label htmlFor="mnemonicphase" className="pl-1 text-[#a8a8a8] text-[13px] font-light font-urbanist leading-[21px]">I have saved my mnemonic phrase</label>
            </div>
            <Button
              disabled={typedSeed.trim().length === 0 || !password}
              className="frontPageButton1"
              type="primary"
              onClick={() => recoverWallet()}
            >
              Import
            </Button>
          </>
          )}
          {nonValid && <p style={{ color: "red" }}>Invalid SeedPhrase</p>}
          {blankPassword && <p style={{ color: "red" }}>Enter Password</p>}
        </div >
      )
      }
    </>
  );
}

export default RecoverAccountSeed;