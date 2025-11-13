// --- One-Time Tool to Create HCS Topics ---
import dotenv from "dotenv";
dotenv.config();
import { 
  Client, 
  PrivateKey, 
  AccountId, 
  TopicCreateTransaction 
} from "@hashgraph/sdk";



async function main() {
  console.log("Starting topic creation script...");

  // 1. Get Hedera account from .env file
  if (!process.env.OPERATOR_ID || !process.env.OPERATOR_KEY) {
    throw new Error("OPERATOR_ID and OPERATOR_KEY must be in your .env file.");
  }
  const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
  const operatorKey = PrivateKey.fromStringED25519(process.env.OPERATOR_KEY);

  // 2. Set up the Hedera Testnet Client
  const client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);

  console.log("[Setup] Client configured for Testnet...");

  // 3. Create the "Job" Topic
  console.log("[Setup] Creating 'Job' topic...");
  const jobTopicTx = await new TopicCreateTransaction()
    .setTopicMemo("Aether - Job Submission Topic")
    .execute(client);
  
  const jobTopicReceipt = await jobTopicTx.getReceipt(client);
  const jobTopicId = jobTopicReceipt.topicId;
  console.log(`✅ 'Job' Topic Created! ID: ${jobTopicId}`);

  // 4. Create the "Receipt" Topic
  console.log("[Setup] Creating 'Receipt' topic...");
  const receiptTopicTx = await new TopicCreateTransaction()
    .setTopicMemo("Aether - Job Receipt Topic")
    .execute(client);

  const receiptTopicReceipt = await receiptTopicTx.getReceipt(client);
  const receiptTopicId = receiptTopicReceipt.topicId;
  console.log(`✅ 'Receipt' Topic Created! ID: ${receiptTopicId}`);

  // 5. Show the .env variables
  console.log("\n--- COPY THESE INTO YOUR .env FILE ---");
  console.log(`AETHER_JOB_TOPIC_ID=${jobTopicId}`);
  console.log(`AETHER_RECEIPT_TOPIC_ID=${receiptTopicId}`);
  console.log("----------------------------------------");

  process.exit();
}

main().catch((err) => {
  console.error("[Setup] Error creating topics:", err);
  process.exit(1);
});