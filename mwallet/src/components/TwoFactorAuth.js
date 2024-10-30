import React, { useState } from "react";
import { Input, Button } from "antd";

function TwoFactorAuth({ onVerify, processing}) {
  const [otp, setotp] = useState("");

  const handleVerify = () => {
    onVerify(otp);
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <Input
      className="input"
  placeholder="Enter 2FA Code"
  value={otp}
  onChange={(e) => setotp(e.target.value)}
  style={{
    backgroundColor: "black",  
    color: "white"             
  }}
/>

      <Button
      className="frontPageButton1"
        type="primary"
        onClick={() => {
          handleVerify();
        }}
        disabled={processing || !otp}
        style={{ marginTop: "10px", width: "100%" }}
      >
        Verify 2FA Code
      </Button>
    </div>
  );
}

export default TwoFactorAuth;
