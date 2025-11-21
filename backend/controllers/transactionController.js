import { Client, Transaction } from "@hashgraph/sdk";

export async function submitSignedTransaction(req, res) {
  try {
    const { signedTransaction } = req.body;

    if (!signedTransaction)
      return res.status(400).json({ error: "signedTransaction missing" });

    const client = Client.forTestnet();
    client.setOperator(
      process.env.OPERATOR_ID,
      process.env.OPERATOR_KEY
    );

    // Decode the signed transaction
    const txBytes = Buffer.from(signedTransaction, "base64");
    const tx = Transaction.fromBytes(txBytes);

    // Submit to Hedera
    const submitRes = await tx.execute(client);
    const receipt = await submitRes.getReceipt(client);

    res.json(receipt);

  } catch (err) {
    console.error("TX Submit Error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
