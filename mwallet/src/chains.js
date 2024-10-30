const SOLANA = {
    name: 'SOLANA',
    type: 'mainnet',
    rpcUrl: 'https://mainnet.helius-rpc.com/?api-key=a40dc3a4-ca63-45d4-b196-7952dd75348f'
};
const DEVNET = {
    name: 'DEVNET',
    type: 'devnet',
    rpcUrl: 'https://api.devnet.solana.com',
};

// const MumbaiTestnet = {
//     hex: '0x13881',
//     name: 'Mumbai Testnet',
//     rpcUrl: '',
//     ticker: "MATIC"
// };

export const CHAINS_CONFIG = {
    "mainnet": SOLANA,
    "devnet": DEVNET,
};