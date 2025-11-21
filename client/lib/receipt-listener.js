import { Client, TopicMessageQuery } from "@hashgraph/sdk";

export function listenForReceipt(jobId, onResult) {
  const client = Client.forTestnet();

  return new TopicMessageQuery()
    .setTopicId(process.env.NEXT_PUBLIC_RECEIPT_TOPIC_ID)
    .subscribe(client, null, (m) => {
      const msg = JSON.parse(Buffer.from(m.contents, "utf8").toString());

      if (msg.jobId === jobId) {
        onResult(msg);
      }
    });
}
