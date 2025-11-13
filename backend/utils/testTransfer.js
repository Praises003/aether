import dotenv from "dotenv";
import { Client, Hbar, TransferTransaction } from "@hashgraph/sdk";
import fs from "fs";

dotenv.config();

const client = Client.forTestnet();
client.setOperator(process.env.OPERATOR_ID, process.env.OPERATOR_KEY);

async function sendTestTransfer() {
  const recipient = process.env.PROVIDER_ACCOUNT_ID; // the provider who'll execute the job

  const tx = await new TransferTransaction()
    .addHbarTransfer(process.env.OPERATOR_ID, new Hbar(-0.1)) // sender pays
    .addHbarTransfer(recipient, new Hbar(0.1)) // receiver gets 0.1 HBAR
    .execute(client);

  const receipt = await tx.getReceipt(client);
  const transactionId = tx.transactionId.toString();

  console.log("✅ Transfer status:", receipt.status.toString());
  console.log("🔗 Transaction ID:", transactionId);

  // Save it for simulate.js
  fs.writeFileSync("./utils/lastTransfer.json", JSON.stringify({ transactionId }, null, 2));

  return transactionId;
}

sendTestTransfer();
