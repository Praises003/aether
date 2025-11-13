import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const WaterCreditSchema = new Schema({
  farmerId: String,
  coordinates: { lat: Number, lon: Number },
  litersSaved: Number,
  source: String,
  status: {
    type: String,
    enum: ['PENDING', 'SUBMITTED', 'VERIFIED', 'MINTED', 'REJECTED', 'ERROR'],
    default: 'PENDING'
  },
  guardian: {
    policyId: String,
    proofHash: String,
    confidence: Number,
    submittedAt: Date,
    verifiedAt: Date
  },
  token: {
    tokenId: String,
    serials: [Number],
    mintTxId: String,
    retired: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('WaterCredit', WaterCreditSchema);
