import { Client, TopicMessageSubmitTransaction } from "@hashgraph/sdk";

export async function submitJob(job) {
  const client = Client.forTestnet();

  await new TopicMessageSubmitTransaction({
    topicId: process.env.NEXT_PUBLIC_JOB_TOPIC_ID,
    message: Buffer.from(JSON.stringify(job)),
  }).execute(client);
}
