import { Client, PrivateKey, AccountId } from '@hashgraph/sdk';
import dotenv from "dotenv";
dotenv.config();


export const createHederaClient = () => {
    
  const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
  const operatorKey =PrivateKey.fromStringED25519(process.env.HEDERA_PRIVATE_KEY);


  const client = Client.forTestnet().setOperator(operatorId, operatorKey);
  console.log('✅ Hedera client initialized');
  return client;
};
