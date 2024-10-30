const express = require("express");
const Moralis = require("moralis").default;
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const cors = require("cors");
require("dotenv").config();
const port = 3001;
const axios = require("axios");


const app = express();
app.use(cors());
app.use(express.json());

const userSecrets = {};

app.post("/auth/generate-2fa", async (req, res) => {
  const { userId } = req.body;

  console.log(`Generating 2FA secret for user: ${userId}`);

  const secret = speakeasy.generateSecret({
    name: `SolanaWallet (${userId})`,
  });

  userSecrets[userId] = secret;

  console.log(`2FA secret generated and stored for user: ${userId}`);

  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

  return res.status(200).json({ qrCodeUrl });
});

app.post("/verify-2fa", (req, res) => {
  const { userId, token } = req.body;

  console.log(`Verifying 2FA for user: ${userId}`);
  console.log(`Received token: ${token}`);

  const userSecret = userSecrets[userId];

  if (!userSecret) {
    console.log(`User ${userId} not enrolled in 2FA.`);
    return res
      .status(400)
      .json({ valid: false, message: "User not enrolled in 2FA." });
  }

  console.log(`User secret found for ${userId}`);

  try {
    const isValid = speakeasy.totp.verify({
      secret: userSecret.base32,
      encoding: 'base32',
      token: token,
      window: 1,
    });

    console.log(`2FA verification result for user ${userId}: ${isValid}`);

    if (isValid) {
      return res.status(200).json({ valid: true });
    } else {
      return res.status(400).json({ valid: false, message: "Invalid token." });
    }
  } catch (error) {
    console.error(`Error verifying 2FA token: ${error.message}`);
    return res.status(500).json({ valid: false, message: "Server error during verification." });
  }
});

app.get("/getTokens", async (req, res) => {
  const { userAddress, network } = req.query;

  try {
    const tokensResponse = await Moralis.SolApi.account.getSPL({
      network: network,
      address: userAddress,
    });

    const balanceResponse = await Moralis.SolApi.account.getBalance({
      network: network,
      address: userAddress,
    });

    const nativeSol = {
      associatedTokenAddress: userAddress,
      mint: "So11111111111111111111111111111111111111112",
      amountRaw: balanceResponse.raw.lamports,
      amount: balanceResponse.raw.solana,
      decimals: "9",
      name: "Solana",
      symbol: "SOL",
    };

    let tokens = [nativeSol, ...tokensResponse.raw];

    let totalUsdBalance = 0;

    if (network === "mainnet") {
      const tokenPricesPromises = tokens.map(async (token) => {
        try {
          const priceResponse = await Moralis.SolApi.token.getTokenPrice({
            network: network,
            address: token.mint,
          });
          const usdPrice = priceResponse.raw.usdPrice || 0;
          const usdBalance = usdPrice * parseFloat(token.amount);

          totalUsdBalance += usdBalance;

          return {
            ...token,
            price: usdPrice,
            usdbal: usdBalance.toFixed(2),
          };
        } catch (error) {
          console.error(`Error fetching price for token ${token.mint}:`, error);
          return { ...token, price: 0, usdbal: "0.00" };
        }
      });

      tokens = await Promise.all(tokenPricesPromises);
    }else {
      tokens = tokens.map((token) => ({
        ...token,
        price: 0,
        usdbal: "0.00",
      }));
    }

    const jsonResponse = {
      tokens: tokens,
      nfts: [],
      balance: balanceResponse.raw.solana,
      usdbalance: totalUsdBalance.toFixed(2),
    };
    console.log(jsonResponse);
    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return res.status(500).json({ error: "An error occurred while fetching the tokens." });
  }
});

app.get("/getBalance", async (req, res) => {
  const { wallet, network } = req.query;
  try {
    const tokensResponse = await Moralis.SolApi.account.getSPL({
      network: network,
      address: wallet,
    });

    const balanceResponse = await Moralis.SolApi.account.getBalance({
      network: network,
      address: wallet,
    });

    const nativeSol = {
      associatedTokenAddress: wallet,
      mint: "So11111111111111111111111111111111111111112",
      amountRaw: balanceResponse.raw.lamports,
      amount: balanceResponse.raw.solana,
      decimals: "9",
      name: "Solana",
      symbol: "SOL"
    };

    const tokens = [nativeSol, ...tokensResponse.raw];

    const tokenPricesPromises = tokens.map(async (token) => {
      const priceResponse = await Moralis.SolApi.token.getTokenPrice({
        network: network,
        address: token.mint,
      });

      return {
        mint: token.mint,
        price: priceResponse.raw.usdPrice || 0,
        amount: parseFloat(token.amount),
      };
    });

    const tokenPrices = await Promise.all(tokenPricesPromises);

    const totalBalanceUSD = tokenPrices.reduce((acc, token) => {
      return acc + (token.price * token.amount);
    }, 0);

    const jsonResponse = {
      balance: totalBalanceUSD.toFixed(2),
    };

    return res.status(200).json(jsonResponse);

  } catch (error) {
    console.error("Error fetching balance:", error);
    return res.status(500).json({ error: "An error occurred while fetching the balance." });
  }
});

app.get("/getTransactions", async (req, res) => {
  const { userAddress, network } = req.query;
  let apiUrl = "";
  if (network === "mainnet") {
    apiUrl = `https://api-mainnet.helius.xyz/v0/addresses/${userAddress}/transactions?api-key=a40dc3a4-ca63-45d4-b196-7952dd75348f`;
  } else if (network === "devnet") {
    apiUrl = `https://api-devnet.helius.xyz/v0/addresses/${userAddress}/transactions?api-key=a40dc3a4-ca63-45d4-b196-7952dd75348f`;
  } else {
    return res.status(400).json({ error: "Invalid network specified" });
  }
  try {
    const response = await axios.get(apiUrl);
    const transactions = response.data;
    return res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
