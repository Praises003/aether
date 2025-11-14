// src/lib/blade.js
import { BladeConnector, ConnectorStrategy, HederaNetwork } from "@bladelabs/blade-web3.js";

let bladeConnector = null;
let bladeSigner = null;

export const initBlade = async () => {
  // Initialize connector (WalletConnect only to avoid extension bugs)
  bladeConnector = await BladeConnector.init(
    ConnectorStrategy.WALLET_CONNECT,
    {
      name: "Your Dapp Name",
      description: "Your Dapp Description",
      url: "https://your-dapp.com",
      icons: ["https://your-dapp.com/icon.png"]
    }
  );

  return bladeConnector;
};

export const connectWallet = async () => {
  if (!bladeConnector) {
    bladeConnector = await initBlade();
  }

  const sessionParams = {
    network: HederaNetwork.Testnet,
    dAppCode: "YourDappCode" // optional or remove completely
  };

  const accountIds = await bladeConnector.createSession(sessionParams);

  if (!accountIds || accountIds.length === 0) {
    throw new Error("No accounts returned from Blade Wallet");
  }

  bladeSigner = bladeConnector.getSigners()[0];

  return {
    accountId: bladeSigner.getAccountId(),
    signer: bladeSigner
  };
};

export const disconnectWallet = async () => {
  if (bladeConnector) {
    await bladeConnector.killSession();
  }
  bladeConnector = null;
  bladeSigner = null;
};

export const getBladeSigner = () => bladeSigner;

