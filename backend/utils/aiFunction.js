// --- Our "AI" Mock and Job Processor ---
import dotenv from "dotenv";
dotenv.config();
import { postJobReceipt } from '../services/hcsReceiptSubmitter.js';

// We will post the *answer* to this topic
const RECEIPT_TOPIC_ID = process.env.AETHER_RECEIPT_TOPIC_ID;

// This function is called by the HCS Listener
async function processJob(messageString) {
  let job;
  try {
    // 1. Parse the incoming job
    job = JSON.parse(messageString);
    if (!job || !job.jobId || !job.functionIdentifier || !job.input) {
      throw new Error("Invalid job format. 'jobId', 'functionIdentifier', and 'input' are required.");
    }

    console.log(`[Job Processor] Starting job ${job.jobId} for function: ${job.functionIdentifier}`);

    let result;

    // 2. Find and run the correct function
    switch (job.functionIdentifier) {
      case 'TEXT_SUMMARIZER_V1':
      case 'text-summary':
        result = await runTextSummarizer(job.input);
        break;
      // We could add more functions here later
      // case 'IMAGE_RESIZER_V1':
      //   result = await runImageResizer(job.input);
      //   break;
      default:
        throw new Error(`Unknown function identifier: ${job.functionIdentifier}`);
    }

    console.log(`[Job Processor] Job ${job.jobId} complete.`);

    // 3. Post the "SUCCESS" receipt back to HCS
    const receipt = {
      jobId: job.jobId,
      functionIdentifier: "TEXT_SUMMARIZER_V1",
      providerAccountId: "0.0.12345",
      transferTxId: "0.0.7045024-1762490042-341931009",
      priceHbar: 1,
      status: "SUCCESS",
      output: result,
      error: null
    };
    
    await postJobReceipt(RECEIPT_TOPIC_ID, receipt);

  } catch (error) {
    console.error(`[Job Processor] Failed to process job: ${error.message}`);
    
    // 4. Post the "ERROR" receipt back to HCS
    if (job && job.jobId && RECEIPT_TOPIC_ID) {
      const errorReceipt = {
        jobId: job.jobId,
        status: "ERROR",
        output: null,
        error: error.message,
      };
      await postJobReceipt(RECEIPT_TOPIC_ID, errorReceipt);
    }
  }
}


// --- Our "Mock" AI Function ---
function runTextSummarizer(textToSummarize) {
  console.log(`[AI Mock] Summarizing text: "${textToSummarize.substring(0, 30)}..."`);
  
  // Simulate a 2-second AI process
  return new Promise((resolve) => {
    setTimeout(() => {
      // The "AI" logic is just appending text
      const summary = `This is a successful summary of: '${textToSummarize}'`;
      resolve(summary);
      return summary.substring(0, 30) + "...";
    }, 2000);
  });
}

export { processJob };