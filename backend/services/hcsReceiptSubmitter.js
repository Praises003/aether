// --- Our HCS Receipt Submitter ---
import { 
  Client, 
  PrivateKey, 
  AccountId, 
  TopicMessageSubmitTransaction 
} from "@hashgraph/sdk";

// This function posts the *answer* back to the receipt topic
async function postJobReceipt(topicId, receipt) {
  try {
    if (!topicId) {
      throw new Error("Receipt Topic ID is not defined.");
    }
    console.log(receipt)
    
    console.log(`[HCS Submitter] Posting receipt for Job ID: ${receipt.name} to topic ${topicId}`);
    
    // 1. Get Hedera account from .env file
    if (!process.env.OPERATOR_ID || !process.env.OPERATOR_KEY) {
      throw new Error("[HCS Submitter] OPERATOR_ID or OPERATOR_KEY is missing from .env");
    }
    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const operatorKey = PrivateKey.fromStringED25519(process.env.OPERATOR_KEY);
    
    // 2. Set up the Hedera Testnet Client
    // We create a new client for this single submission
    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorKey);
    
    // 3. Convert our receipt object to a string to send
    const message = JSON.stringify(receipt);

    // 4. Submit the message to the HCS Receipt Topic
    const tx = await new TopicMessageSubmitTransaction({
      topicId: topicId,
      message: message,
    }).execute(client);

    const txReceipt = await tx.getReceipt(client);
    
    console.log(`[HCS Submitter] Successfully posted receipt! Status: ${txReceipt.status}`);
  
  } catch (error) {
    console.error(`[HCS Submitter] Error posting receipt:`, error);
  }
}

export { postJobReceipt };