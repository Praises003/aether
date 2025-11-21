// --- Our HCS Job Listener (v4: Mirror Node Verification with Axios) ---
import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import { Client, TopicMessageQuery, Hbar } from "@hashgraph/sdk";


import { processJob } from "../utils/aiFunction.js";
import { postJobReceipt } from "../services/hcsReceiptSubmitter.js";
import { executeJob } from "./functionExecutionService.js";
import { storeJobResult } from "../utils/resultStore.js";

// --- HCS Topic & Mirror Node Config ---
const JOB_TOPIC_ID = process.env.AETHER_JOB_TOPIC_ID;
const RECEIPT_TOPIC_ID = process.env.AETHER_RECEIPT_TOPIC_ID;
const MIRROR_API_BASE = "https://testnet.mirrornode.hedera.com/api/v1";

/**
 * Parse HCS message safely (handles malformed JSON)
 *
 */
function parseMessageContents(msg) {
  try {
    return JSON.parse(Buffer.from(msg.contents, "utf8").toString());
  } catch (e) {
    console.warn("[Listener] Received non-JSON message, skipping.");
    return null;
  }
}

/**
 * Verify a payment using Hedera Mirror Node REST API (via Axios)
 */
// async function verifyPayment(transactionIdString, expectedAccountId, expectedAmountHbar) {
//   console.log(`[Verifier] Checking payment for TxID: ${transactionIdString}`);

//   const expectedTinybar = new Hbar(expectedAmountHbar).toTinybars().toNumber();
//   const url = `${MIRROR_API_BASE}/transactions?transactionId=${transactionIdString}`;

//   try {
//     const response = await axios.get(url);
//     const data = response.data;

//     if (!data || !data.transactions || data.transactions.length === 0) {
//       console.warn("[Verifier] ❌ Transaction not found on mirror node.");
//       return false;
//     }

//     const tx = data.transactions[0];
//     const transfers = tx.transfers || [];

//     const found = transfers.find(
//       (t) => t.account === expectedAccountId && t.amount >= expectedTinybar
//     );

//     if (found) {
//       console.log(
//         `[Verifier] ✅ Payment CONFIRMED. ${found.account} received ${found.amount} tinybar.`
//       );
//       return true;
//     } else {
//       console.warn("[Verifier] ❌ No matching transfer found.");
//       return false;
//     }
//   } catch (err) {
//     if (err.response) {
//       console.error(
//         `[Verifier] Mirror Node Error ${err.response.status}: ${err.response.statusText}`
//       );
//       err.response.data && console.error(err.response.data);
//     } else {
//       console.error(`[Verifier] Axios Error: ${err.message}`);
//     }
//     return false;
//   }
// }



// services/hcsListenerService.js - UPDATED verifyPayment
export const verifyPayment = async (transferTxId, providerAccountId, priceHbar) => {
  try {
    // Convert HBAR → tinybars
    const expectedTinybar = new Hbar(priceHbar).toTinybars().toNumber();

    console.log(`[Verifier] Expected: ${providerAccountId} to receive ${expectedTinybar} tinybars`);

    // Split TxID into mirror node format
    const [account, timestamp] = transferTxId.split("@");
    const [seconds, nanos] = timestamp.split(".");
    const formattedTxId = `${account}-${seconds}-${nanos}`;

    const url = `https://testnet.mirrornode.hedera.com/api/v1/transactions/${formattedTxId}`;
    console.log(`[Verifier] Checking payment at: ${url}`);

    const { data } = await axios.get(url);

    if (!data.transactions?.length) {
      console.log("[Verifier] No transactions found");
      return false;
    }

    const tx = data.transactions[0];

    // Debug: Log all transfers
    console.log(`[Verifier] Transaction result: ${tx.result}`);
    console.log(`[Verifier] All transfers:`, JSON.stringify(tx.transfers, null, 2));

    // Check if transaction succeeded
    if (tx.result !== "SUCCESS") {
      console.warn(`[Verifier] Transaction failed: ${tx.result}`);
      return false;
    }

    // Check if provider received at least the expected amount
    const providerTransfer = tx.transfers.find(
      (t) => t.account === providerAccountId && t.amount >= expectedTinybar
    );

    if (!providerTransfer) {
      console.warn(`[Verifier] ❌ Transfer to provider ${providerAccountId} not found or amount insufficient`);
      console.warn(`[Verifier] Looking for: ${expectedTinybar} tinybars to ${providerAccountId}`);
      return false;
    }

    console.log(`[Verifier] ✅ Payment verified: ${providerAccountId} received ${providerTransfer.amount} tinybars`);
    return true;

  } catch (err) {
    console.error("[Verifier] Mirror Node Error:", err.message);
    if (err.response) {
      console.error("[Verifier] Status:", err.response.status);
      console.error("[Verifier] Data:", err.response.data);
    }
    return false;
  }
};

/**
 * Start the Hedera Consensus Service Listener
 */
export function startHCSListener() {
  if (!JOB_TOPIC_ID) {
    console.warn("[HCS Listener] AETHER_JOB_TOPIC_ID not found in .env. Listener not started.");
    return;
  }

  try {
    const mirrorClient = Client.forTestnet();
    mirrorClient.setMirrorNetwork(["testnet.mirrornode.hedera.com:443"]);

    console.log(`[HCS Listener] Subscribing to job topic: ${JOB_TOPIC_ID}`);

    new TopicMessageQuery()
      .setTopicId(JOB_TOPIC_ID)
      .setStartTime(0)
      .subscribe(mirrorClient, null, async (msg) => {
        let jobId = null;

        try {
          const job = parseMessageContents(msg);
          if (!job) return;

          jobId = job.jobId;
          const { functionIdentifier, input, providerAccountId, transferTxId, priceHbar } = job;

          console.log(`[HCS Listener] New job received: ${jobId} for ${functionIdentifier}`);

          // --- Step 1: Verify payment ---
          if (!transferTxId || !providerAccountId || !priceHbar) {
            throw new Error("Job message missing payment details (transferTxId, providerAccountId, priceHbar)");
          }

          const paid = await verifyPayment(transferTxId, providerAccountId, priceHbar);

          if (!paid) {
            console.warn(`[HCS Listener] Payment verification FAILED for job: ${jobId}`);
            await postJobReceipt(RECEIPT_TOPIC_ID, {
              jobId,
              status: "PAYMENT_FAILED",
              error: "Payment not verified.",
            });
            return;
          }

          console.log(`[HCS Listener] ✅ Payment verified for job: ${jobId}. Executing...`);

          //
          const res = await executeJob(functionIdentifier, input);

          storeJobResult(jobId, res);


        const receipt = {
          jobId,
          functionIdentifier,
          res,
          providerAccountId,
          status: "SUCCESS",
          error: null,
          timestamp: new Date().toISOString(),
        };

        await postJobReceipt(RECEIPT_TOPIC_ID, receipt);
        console.log(`[Job] SUCCESS: ${functionIdentifier} completed`);
        return receipt;

          // --- Step 2: Process AI task ---
          //const result = await processJob(JSON.stringify(job));

          // --- Step 3: Publish success receipt ---
          // await postJobReceipt(RECEIPT_TOPIC_ID, {
          //   jobId,
          //   status: "SUCCESS",
          //   output: result,
          //   error: null,
          // });

          // console.log(`[HCS Listener] ✅ Successfully completed job: ${jobId}`);
        } catch (err) {
          console.error(`[HCS Listener] Error processing job ${jobId || "unknown"}:`, err.message);

          if (jobId) {
            await postJobReceipt(RECEIPT_TOPIC_ID, {
              jobId,
              status: "ERROR",
              error: err.message,
            });
          }
        }
      });
  } catch (error) {
    console.error("[HCS Listener] Failed to start:", error.message);
  }
}
