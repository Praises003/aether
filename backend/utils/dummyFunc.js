import axios from "axios";
import ApiFunction from "../models/apiFunctionModel";

export async function executeJob(job) {
  try {
    // Find the corresponding function
    const func = await ApiFunction.findOne({ functionIdentifier: job.functionIdentifier });
    if (!func) throw new Error(`No function found for ${job.functionIdentifier}`);

    // Send job input to the developer's endpoint
    const response = await axios.post(func.endpointUrl, { input: job.input });

    // Return the result
    return response.data;
  } catch (error) {
    console.error("[Function Executor] Job execution failed:", error.message);
    throw error;
  }
}
