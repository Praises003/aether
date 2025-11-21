// import { executeJob } from "../services/functionExecutionService.js";
// import { postJobReceipt } from "../services/hcsReceiptSubmitter.js";

// // export async function executeJobHandler(req, res) {
// //   try {
// //     const { functionIdentifier, input, providerAccountId } = req.body;

// //     if (!functionIdentifier || !input) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "functionIdentifier and input are required."
// //       });
// //     }

// //     // Mock jobId — you can also generate this dynamically
// //     const jobId = `job-${Date.now()}`;

// //     // 1️⃣ Execute the job using the service
// //     const result = await executeJob({  functionIdentifier, input });

// //     // 2️⃣ Determine status
// //     const status = result.success ? "SUCCESS" : "FAILED";

// //     // 3️⃣ Build job receipt object
// //     const jobReceipt = {
// //       functionIdentifier,
// //       res: result,
// //       providerAccountId: providerAccountId || "0.0.0000",
// //       status,
// //       error: result.error || null,
// //       timestamp: new Date().toISOString(),
// //     };

// //     // 4️⃣ Optionally post the receipt to your Hedera topic
// //     await postJobReceipt(process.env.RECEIPT_TOPIC_ID, jobReceipt);

// //     console.log(`[Job] ${status}: ${functionIdentifier} completed`);

// //     // 5️⃣ Respond to the frontend with the same payload
// //     return res.status(200).json(jobReceipt);

// //   } catch (error) {
// //     console.error("Error executing job:", error.message);

// //     return res.status(500).json({
// //       success: false,
// //       message: "Internal Server Error",
// //       error: error.message
// //     });
// //   }
// // }
// import ApiFunction from "../models/apiFunctionModel.js";

// // POST /api/jobs/execute
// export const executeFunction = async (req, res) => {
//   try {
//     const { functionIdentifier, input } = req.body;
    
//     if (!functionIdentifier) {
//       return res.status(400).json({ error: "Missing functionIdentifier" });
//     }

//     if (!functionIdentifier || !input) {
//       return res.status(400).json({
//         success: false,
//         message: "functionIdentifier and input are required.",
//       });
//     }

//     // 1️⃣ Find the API Function from the DB
//     const apiFunction = await ApiFunction.findOne({ functionIdentifier });
//     if (!apiFunction) {
//       return res.status(404).json({
//         success: false,
//         message: "API function not found.",
//       });
//     }

//     // 2️⃣ Execute the function
//     const result = await executeJob(functionIdentifier, input);

//     // 3️⃣ Return unified structure
//     const responsePayload = {
//       functionIdentifier,
//       res: result,
//       providerAccountId: apiFunction.providerAccountId,
//       status: result.success ? "SUCCESS" : "ERROR",
//       error: result.success ? null : result.error,
//       timestamp: new Date().toISOString(),
//     };

//     return res.status(200).json(responsePayload);
//   } catch (err) {
//     console.error("[executeJob] Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: err.message,
//     });
//   }
// };




// import { TopicMessageSubmitTransaction, Client } from "@hashgraph/sdk";
// import dotenv from "dotenv";
// import { randomUUID } from "crypto";

// dotenv.config();

// const JOB_TOPIC_ID = process.env.AETHER_JOB_TOPIC_ID;

// const client = Client.forTestnet();
// client.setOperator(process.env.OPERATOR_ID, process.env.OPERATOR_KEY);

// export const submitJob = async (req, res) => {
//   try {
//     const { functionIdentifier, input, transferTxId, priceHbar } = req.body;

//     if (!functionIdentifier || !input || !transferTxId || !priceHbar) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "functionIdentifier, input, transferTxId, and priceHbar are required" 
//       });
//     }

//     const jobId = "job-" + randomUUID().slice(0, 6);

//     const jobMessage = {
//       jobId,
//       functionIdentifier,
//       input,
//       transferTxId,
//       priceHbar,
//       providerAccountId: process.env.PROVIDER_ACCOUNT_ID
//     };

//     const tx = await new TopicMessageSubmitTransaction({
//       topicId: JOB_TOPIC_ID,
//       message: JSON.stringify(jobMessage),
//     }).execute(client);

//     const receipt = await tx.getReceipt(client);

//     return res.status(200).json({
//       success: true,
//       message: "Job submitted to HCS successfully",
//       jobId,
//       transactionStatus: receipt.status.toString(),
//     });
    
//   } catch (err) {
//     console.error("[submitJob] Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: err.message,
//     });
//   }
// };


// controllers/hcsJobController.js
import { postJobReceipt } from "../services/hcsReceiptSubmitter.js";

/**
 * Submit job to HCS job topic (uses your existing postJobReceipt function)
 */
export const submitJobToHCS = async (req, res) => {
  try {
    const { 
      functionIdentifier, 
      input, 
      providerAccountId, 
      transferTxId, 
      priceHbar,
      userAccountId 
    } = req.body;

    // Validate required fields (same as your listener expects)
    if (!functionIdentifier || !input || !providerAccountId || !transferTxId || !priceHbar) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields for HCS job"
      });
    }

    // Generate unique job ID
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Prepare job data (EXACTLY what your HCS listener expects)
    const jobData = {
      jobId,
      functionIdentifier,
      input,
      providerAccountId,
      transferTxId, 
      priceHbar,
      userAccountId, // Optional: for tracking
      submittedAt: new Date().toISOString()
    };

    console.log(`[HCS Job Controller] Submitting job to HCS: ${jobId}`);

    // Use your EXISTING postJobReceipt function to submit to JOB topic!
    await postJobReceipt(process.env.AETHER_JOB_TOPIC_ID, jobData);

    res.json({
      success: true,
      message: "Job submitted to decentralized HCS network",
      jobId: jobData.jobId,
      // Your existing HCS listener will pick this up and process it!
      nextStep: "wait_for_hcs_processing"
    });

  } catch (error) {
    console.error("[HCS Job Controller] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit job to HCS",
      error: error.message
    });
  }
};