import React from 'react';
import back from '../images/back.svg'

function BackArrow({ setTab, tab, token }) {
    return (
        <div className="flex items-center w-full relative justify-center pb-4 pt-2">
            <img className="cursor-pointer absolute z-[1] left-0" alt="Back" src={back} onClick={() => {
                setTab(4)
            }} />
            <div className="w-full text-center text-[16px] text-white">
                {tab === 1 ? "Send" : tab === 6 ? "Receive SOL" : tab === 5 ? "Transaction" : tab === 7 ? (token?.symbol || "SOL") : ""}
            </div>
        </div>
    );
}

export default BackArrow;