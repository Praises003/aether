import { executeJob } from "../services/functionExecutionService.js";
import { postJobReceipt } from "../services/hcsReceiptSubmitter.js";

// export async function executeJobHandler(req, res) {
//   try {
//     const { functionIdentifier, input, providerAccountId } = req.body;

//     if (!functionIdentifier || !input) {
//       return res.status(400).json({
//         success: false,
//         message: "functionIdentifier and input are required."
//       });
//     }

//     // Mock jobId — you can also generate this dynamically
//     const jobId = `job-${Date.now()}`;

//     // 1️⃣ Execute the job using the service
//     const result = await executeJob({  functionIdentifier, input });

//     // 2️⃣ Determine status
//     const status = result.success ? "SUCCESS" : "FAILED";

//     // 3️⃣ Build job receipt object
//     const jobReceipt = {
//       functionIdentifier,
//       res: result,
//       providerAccountId: providerAccountId || "0.0.0000",
//       status,
//       error: result.error || null,
//       timestamp: new Date().toISOString(),
//     };

//     // 4️⃣ Optionally post the receipt to your Hedera topic
//     await postJobReceipt(process.env.RECEIPT_TOPIC_ID, jobReceipt);

//     console.log(`[Job] ${status}: ${functionIdentifier} completed`);

//     // 5️⃣ Respond to the frontend with the same payload
//     return res.status(200).json(jobReceipt);

//   } catch (error) {
//     console.error("Error executing job:", error.message);

//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message
//     });
//   }
// }
import ApiFunction from "../models/apiFunctionModel.js";

// POST /api/jobs/execute
export const executeFunction = async (req, res) => {
  try {
    const { functionIdentifier, input } = req.body;
    
    if (!functionIdentifier) {
      return res.status(400).json({ error: "Missing functionIdentifier" });
    }

    if (!functionIdentifier || !input) {
      return res.status(400).json({
        success: false,
        message: "functionIdentifier and input are required.",
      });
    }

    // 1️⃣ Find the API Function from the DB
    const apiFunction = await ApiFunction.findOne({ functionIdentifier });
    if (!apiFunction) {
      return res.status(404).json({
        success: false,
        message: "API function not found.",
      });
    }

    // 2️⃣ Execute the function
    const result = await executeJob(functionIdentifier, input);

    // 3️⃣ Return unified structure
    const responsePayload = {
      functionIdentifier,
      res: result,
      providerAccountId: apiFunction.providerAccountId,
      status: result.success ? "SUCCESS" : "ERROR",
      error: result.success ? null : result.error,
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error("[executeJob] Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};
