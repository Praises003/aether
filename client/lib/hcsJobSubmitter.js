// services/hcsJobSubmitter.js
import { 
  Client, 
  PrivateKey, 
  AccountId, 
  TopicMessageSubmitTransaction 
} from "@hashgraph/sdk";

const JOB_TOPIC_ID = process.env.NEXT_PUBLIC_JOB_TOPIC_ID;

/**
 * Submit job to HCS topic (web3 style - no REST endpoint)
 */
export async function submitJobToHCS(jobData) {
  try {
    if (!JOB_TOPIC_ID) {
      throw new Error("AETHER_JOB_TOPIC_ID is not defined");
    }

    console.log(`[HCS Submitter] Submitting job to topic: ${JOB_TOPIC_ID}`);
    
    // Get Hedera operator account
    if (!process.env.NEXT_PUBLIC_OPERATOR_ID || !process.env.NEXT_PUBLIC_OPERATOR_KEY) {
      throw new Error("OPERATOR_ID or OPERATOR_KEY is missing from .env");
    }

    const operatorId = AccountId.fromString(process.env.NEXT_PUBLIC_OPERATOR_ID);
    const operatorKey = PrivateKey.fromStringED25519(process.env.NEXT_PUBLIC_OPERATOR_KEY);
    
    // Create Hedera client
    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorKey);
    
    // Convert job data to string
    const message = JSON.stringify(jobData);

    // Submit to HCS topic
    const tx = await new TopicMessageSubmitTransaction({
      topicId: JOB_TOPIC_ID,
      message: message,
    }).execute(client);

    const txReceipt = await tx.getReceipt(client);
    
    console.log(`[HCS Submitter] ✅ Job submitted successfully! Status: ${txReceipt.status}`);
    
    return {
      success: true,
      jobId: jobData.jobId,
      topicId: JOB_TOPIC_ID,
      transactionId: tx.transactionId.toString()
    };

  } catch (error) {
    console.error(`[HCS Submitter] ❌ Error submitting job:`, error);
    throw error;
  }
}