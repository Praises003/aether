import dotenv from "dotenv";
import fs from "fs";
import { Client, TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import { randomUUID } from "crypto";

dotenv.config();

const client = Client.forTestnet();
client.setOperator(process.env.OPERATOR_ID, process.env.OPERATOR_KEY);

const JOB_TOPIC_ID = process.env.AETHER_JOB_TOPIC_ID;

// Read last transfer ID
let transferTxId = null;
try {
  const data = fs.readFileSync("./utils/lastTransfer.json");
  transferTxId = JSON.parse(data).transactionId;
  console.log("💸 Using last payment TxID:", transferTxId);
} catch (err) {
  console.warn("⚠️ No previous transfer found. Run testTransfer.js first!");
}

async function simulateJob() {
  const job = {
    jobId: "job-" + randomUUID().slice(0, 6),
    functionIdentifier: "TEXT_SUMMARIZER_V1",
    input: "Aether is working perfectly. but why dont we just summarize this text to see if the local API functionality is working as intended",
    providerAccountId: process.env.PROVIDER_ACCOUNT_ID,
    transferTxId, // from lastTransfer.json
    priceHbar: "0.1",
  };

  const tx = await new TopicMessageSubmitTransaction({
    topicId: JOB_TOPIC_ID,
    message: JSON.stringify(job),
  }).execute(client);

  const receipt = await tx.getReceipt(client);
  console.log(`✅ Submitted fake job to topic ${JOB_TOPIC_ID}`);
  console.log(`🔗 Job ID: ${job.jobId}`);
}

simulateJob();
