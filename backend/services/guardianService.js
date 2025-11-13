import axios from "axios";

const guardianBaseUrl = process.env.GUARDIAN_BASE_URL;
const guardianApiKey = process.env.GUARDIAN_API_KEY;

// Axios instance with base headers
const guardian = axios.create({
  baseURL: guardianBaseUrl,
  headers: {
    Authorization: `Bearer ${guardianApiKey}`,
    "Content-Type": "application/json",
  },
});

// ✅ Function to test Guardian connection
export const testGuardianConnection = async () => {
  try {
    const response = await guardian.get("/policies");
    console.log("✅ Guardian connected successfully!");
    return response.data;
  } catch (err) {
    console.error("❌ Guardian connection failed:", err.message);
    throw err;
  }
};

// You’ll later add other functions here like:
// - submitWaterSavingData()
// - mintWaterCredit()
// - retireWaterCredit()
