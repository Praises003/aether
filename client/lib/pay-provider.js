import {
  Hbar,
  TransferTransaction,
  AccountId,
  TransactionId,
  Client,
} from "@hashgraph/sdk";

export async function payProvider({
  client: walletClient,
  session,
  from,
  to,
  amountHbar,
  memo = "Aether API Payment",
}) {
  if (!walletClient || !session) throw new Error("Wallet not connected");

  console.log(`💸 Payment: ${from} -> ${to}, ${amountHbar} HBAR`);
  console.log(`📡 Session topic: ${session.topic}`);
  console.log(`🔗 Available methods:`, session.namespaces?.hedera?.methods);

  const fromId = AccountId.fromString(from);
  const toId = AccountId.fromString(to);

  const client = Client.forTestnet();

  const transferTx = await new TransferTransaction()
    .addHbarTransfer(fromId, new Hbar(-amountHbar))
    .addHbarTransfer(toId, new Hbar(amountHbar))
    .setTransactionMemo(memo)
    .setMaxTransactionFee(new Hbar(1))
    .setTransactionId(TransactionId.generate(fromId))
    .freezeWith(client);

  const txBytes = transferTx.toBytes();
  const base64Tx = Buffer.from(txBytes).toString("base64");

  console.log("📱 Transaction prepared, sending to wallet...");

  try {
    console.log("🔍 Making wallet request...");

    // Check available methods and use appropriate one
    const availableMethods = session.namespaces?.hedera?.methods || [];
    console.log("📋 Available methods:", availableMethods);

    let response;
    
    if (availableMethods.includes("hedera_signAndExecuteTransaction")) {
      console.log("✅ Using hedera_signAndExecuteTransaction");
      response = await walletClient.request({
        topic: session.topic,
        chainId: "hedera:testnet",
        request: {
          method: "hedera_signAndExecuteTransaction",
          params: {
            signerAccountId: from,
            transactionList: base64Tx
          },
        },
      });
    } else if (availableMethods.includes("hedera_signTransaction")) {
      console.log("🔄 Using hedera_signTransaction (fallback)");
      const signResponse = await walletClient.request({
        topic: session.topic,
        chainId: "hedera:testnet",
        request: {
          method: "hedera_signTransaction",
          params: {
            signerAccountId: from,
            transactionList: base64Tx
          },
        },
      });

      console.log("✅ Transaction signed by wallet, now executing...");
      const signedTxBytes = Buffer.from(signResponse, 'base64');
      const signedTx = TransferTransaction.fromBytes(signedTxBytes);
      
      // Execute the signed transaction
      const txResponse = await signedTx.execute(client);
      const receipt = await txResponse.getReceipt(client);
      
      const transactionId = receipt.transactionId.toString();
      console.log("✅ Transaction executed successfully:", transactionId);
      
      return {
        success: true,
        transactionId: transactionId,
        explorerUrl: `https://hashscan.io/testnet/transaction/${transactionId}`,
      };
    } else {
      throw new Error("No supported transaction methods available in wallet");
    }

    console.log("✅ Wallet response received:", response);

    // Handle response for hedera_signAndExecuteTransaction
    let transactionId;
    
    if (typeof response === 'string') {
      transactionId = response;
    } else if (response?.transactionId) {
      transactionId = response.transactionId;
    } else if (response?.result?.transactionId) {
      transactionId = response.result.transactionId;
    } else if (response?.[0]?.transactionId) {
      transactionId = response[0].transactionId;
    } else {
      console.log("🟡 Using generated transaction ID as fallback");
      transactionId = transferTx.transactionId.toString();
    }

    console.log("✅ Extracted transaction ID:", transactionId);

    if (!transactionId) {
      console.warn("⚠️ No transaction ID found in response");
      transactionId = transferTx.transactionId.toString();
    }

    return {
      success: true,
      transactionId: transactionId,
      explorerUrl: `https://hashscan.io/testnet/transaction/${transactionId}`,
    };

  } catch (error) {
    console.error("❌ Payment Error:", error);
    
    if (error.message?.includes('timeout')) {
      throw new Error("Wallet not responding. Please check your wallet and try again.");
    } else if (error.message?.includes('rejected') || error.message?.includes('denied')) {
      throw new Error("Transaction was rejected by user.");
    } else if (error.message?.includes('pairing')) {
      throw new Error("Wallet connection lost. Please reconnect your wallet.");
    } else if (error.message?.includes('Missing or invalid')) {
      throw new Error("Wallet method not supported. Please try reconnecting your wallet.");
    } else {
      throw new Error(`Payment failed: ${error.message}`);
    }
  }
}