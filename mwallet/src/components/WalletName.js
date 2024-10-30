import { useState,useEffect } from "react";
import { Input } from "antd";
import { useNavigate } from "react-router-dom";
import back from '../images/back.svg'

function WalletName({ walletName, setWalletName,setTo}) {
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        setWalletName("");
    }, [setWalletName]);

    const handleWalletName = ({ target }) => {
        setWalletName(target.value);
        if (target.value.length > 20) {
            setError("Wallet name didn't exceed 20 chars");
        }
    }
    const handleSubmit = () => {
        if (walletName.length > 20) {
            setError("Wallet name didn't exceed 20 chars");
        } else {
            navigate(setTo)
        }
    }
    return (
        <>
            <div className="px-[25px] text-start bg-[#000] w-full justify-between flex">
                <img className="cursor-pointer" src={back} alt="Back" onClick={() => navigate("/")} />
                <p className="text-center text-[#722ae8] text-base font-medium font-['Urbanist'] leading-[21px] cursor-pointer" onClick={() => navigate("/confirmwallet")}>Skip</p>
            </div>
            <div className="content bg-black flex flex-col justify-between w-full px-[25px]">
                <div className="w-full">
                    <h1 className="text-white font-sans text-2xl mt-5 font-semibold w-full text-start">Wallet Name</h1>
                    <h3 className="text-gray-500 font-sans text-xs w-full mt-2 text-start">Set up a name for your wallet</h3>
                    <Input
                        value={walletName}
                        onChange={handleWalletName}
                        className="passwordContainer1 relative w-full"
                        placeholder="Enter 1 - 20 Character"
                    />

                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
                <div className="mt-auto mb-6 w-full">
                    <button
                        className="frontPageButton1 w-full"
                        type="primary"
                        onClick={handleSubmit}
                        disabled={walletName === ""}
                    >
                        Proceed
                    </button>
                </div>

            </div>
        </>
    );
}

export default WalletName;