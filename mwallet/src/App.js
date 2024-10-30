import "./App.css";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import CreateAccount from "./components/CreateAccount";
import RecoverAccount from "./components/RecoverAccount";
import WalletView from "./components/WalletView";
import SignInPwd from "./components/signInPwd";
import Initial from "./components/Initial"
import RecoverAccountSeed from "./components/seedPhrase";
import Enterpass from "./components/Enterpass";
import WatchWallet from "./components/wachWallet";
import WalletName from "./components/WalletName";



function App() {

  const [wallet, setWallet] = useState(null);
  const [seedPhrase, setSeedPhrase] = useState(null);
  const [selectedChain, setSelectedChain] = useState("devnet");
  const [password, setPassword] = useState("");
  const [walletName, setWalletName] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [authTab, setAuthTab] = useState(null);

  return (
    <div className="outer-app relative h-full">

      <div className={`header relative max-w-[360px] p-0 m-0 ${!wallet && "pt-8"}`}>

      </div>

      <div className="App">
        {wallet && seedPhrase ? (
          <Routes>
            <Route
              path="/yourwallet"
              element={
                <WalletView
                  wallet={wallet}
                  setWallet={setWallet}
                  seedPhrase={seedPhrase}
                  setSeedPhrase={setSeedPhrase}
                  selectedChain={selectedChain}
                  setSelectedChain={setSelectedChain}
                  password={password}
                  authTab={authTab}
                  setAuthTab={setAuthTab}
                />
              }
            />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Initial />} />
            <Route path="/enterpass" element={<Enterpass
            />} />
            <Route path="/home" element={<Home />} />
            <Route
              path="/recover"
              element={
                <RecoverAccount
                  setSeedPhrase={setSeedPhrase}
                  setWallet={setWallet}
                  password={password}
                  setPassword={setPassword}
                  walletName = {walletName}
                />
              }
            />
            <Route
              path="/yourwallet"
              element={
                <Enterpass
                  password={password}
                  setPassword={setPassword}
                  confirmpassword={confirmpassword}
                  setConfirmPassword={setConfirmPassword}
                />
              }
            />
            <Route
              path="/entername"
              element={
                <WalletName
                  walletName={walletName}
                  setWalletName={setWalletName}
                  setTo="/confirmwallet"
                />
              }
            />
            <Route
              path="/enternameviakey"
              element={
                <WalletName
                  walletName={walletName}
                  setWalletName={setWalletName}
                  setTo = "/recover"
                />
              }
            />
            <Route
              path="/enternameviaseed"
              element={
                <WalletName
                  walletName={walletName}
                  setWalletName={setWalletName}
                  setTo = "/recoverseed"
                />
              }
            />
            <Route
              path="/confirmwallet"
              element={
                <CreateAccount
                  setSeedPhrase={setSeedPhrase}
                  setWallet={setWallet}
                  password={password}
                  setPassword={setPassword}
                  walletName = {walletName}
                />
              }
            />
            <Route
              path="/signin"
              element={
                <SignInPwd
                  setSeedPhrase={setSeedPhrase}
                  setWallet={setWallet}
                  setPassword={setPassword}
                  walletName = {walletName}
                />
              }
            />
            <Route
              path="/recoverseed"
              element={
                <RecoverAccountSeed
                  setPassword={setPassword}
                  password={password}
                  setSeedPhrase={setSeedPhrase}
                  setWallet={setWallet}
                  walletName = {walletName}
                />
              }
            />
            <Route
              path="/watch-wallet"
              element={
                <WatchWallet
                  setSeedPhrase={setSeedPhrase}
                  setWallet={setWallet}
                  setPassword={setPassword}
                />
              }
            />
          </Routes>
        )}
      </div>
    </div>
  );
}

export default App;
