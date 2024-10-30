import React, { useState, useEffect } from "react";
import { Input } from "antd";
import { useNavigate } from "react-router-dom";
import view from '../images/view.svg'
import BackHome from "./BackHome";
function Enterpass({ password, setPassword, confirmpassword, setConfirmPassword }) {
    const [error, setError] = useState("");
    const [pass1, setPass1] = useState("")
    const [pass2, setPass2] = useState("");
    const navigate = useNavigate();


    function passAdjust(e) {
        setPass1(e.target.value);
    }

    function confirmpassAdjust(e) {
        setPass2(e.target.value);
    }

    useEffect(() => {
        setPassword("");
        setConfirmPassword("");
    }, [setPassword, setConfirmPassword]);

    function handleSubmit() {
        if (pass1 !== pass2) {
            setError("Passwords do not match.");
        } else {
            setError("");
            setPassword(pass2)
            setConfirmPassword(pass2)
            navigate("/entername");
        }
    }

    return (
        <>
            <BackHome />
            <div className="content bg-black flex flex-col justify-between w-full">
                <div className="w-full px-[25px]">

                    <h1 className="text-white font-sans text-2xl mt-5 font-semibold w-full text-start">Set up password</h1>
                    <h3 className="text-gray-500 font-sans text-xs w-full mt-2 text-start">Enhance security by setting up your password</h3>

                    <Input.Password
                        value={pass1}
                        onChange={passAdjust}
                        className="passwordContainer1 relative"
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

                </div>
                <div className="mt-auto mb-6 w-full px-[25px]">

                    <button
                        className="frontPageButton1 w-full"
                        type="primary"
                        onClick={handleSubmit}
                        disabled={pass1 === "" && pass2 === ""}
                    >
                        Proceed
                    </button>
                </div>

            </div>
        </>
    );
}

export default Enterpass;
