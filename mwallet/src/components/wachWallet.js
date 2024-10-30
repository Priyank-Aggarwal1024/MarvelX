import React, { useState } from "react";
import { Button, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import BackHome from "./BackHome";

function WatchWallet({ setWallet, setSeedPhrase, setPassword }) {
    const navigate = useNavigate();
    const [typedSeed, setTypedSeed] = useState("");
    const [nonValid, setNonValid] = useState(false);
    const [address, setAddress] = useState("");
    const handleAddress = ({ target }) => {
        setAddress(target.value);
    }

    function seedAdjust(e) {
        setNonValid(false);
        setTypedSeed(e.target.value);
    }


    function recoverWallet() {

        let recoveredWallet;
        try {
            const passRecovered = JSON.parse(localStorage.getItem(typedSeed.trim()) || "[]");
            const pass = passRecovered[0];
            if (pass != null) {
                const secretKey = bs58.decode(pass);
                recoveredWallet = Keypair.fromSecretKey(secretKey);
            }
            else {
                setNonValid(true);
                return;
            }
        } catch (err) {
            setNonValid(true);
            return;
        }
        setSeedPhrase(typedSeed);
        setWallet(recoveredWallet.publicKey.toString());
        setPassword(typedSeed.trim())
        navigate("/yourwallet");
        return;
    }

    return (
        <>
            <BackHome />
            <div className="content bg-black pt-4 px-[25px]">
                <div className="flex-col justify-start items-start gap-2 inline-flex w-full text-start pt-4">
                    <div className="text-white text-[22px] font-semibold font-urbanist">Watch Wallet</div>
                    <div className="text-[#474747] text-[15px] font-light font-urbanist leading-[21px]">Fill the details below to track wallet</div>
                </div>
                <div className=" w-full">

                    <div className="text-[#a8a8a8] text-[13px] font-normal font-urbanist leading-[18.43px] text-start mt-4 pb-2">Wallet Name</div>

                    <Input
                        value={typedSeed}
                        onChange={seedAdjust}
                        className=" custom-password-input h-12 passwordContainer3"
                        placeholder="Enter 1 - 20 Character"
                    />
                    <div className="text-[#a8a8a8] text-[13px] font-normal font-urbanist leading-[18.43px] text-start mt-4 pb-2">Address</div>

                    <Input
                        value={address}
                        onChange={handleAddress}
                        className=" custom-password-input h-12 passwordContainer3"
                        placeholder="Enter"
                    />
                </div>

                <Button
                    disabled={typedSeed.trim().length === 0}
                    className="frontPageButton1"
                    type="primary"
                    onClick={() => recoverWallet()}
                >
                    Import
                </Button>
                {nonValid && <p style={{ color: "red" }}>Invalid Password</p>}
            </div>
        </>
    );
}

export default WatchWallet;
