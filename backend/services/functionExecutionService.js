/**
 * Aether - Function Executor Service
 * -----------------------------------
 * Dynamically executes developer-provided or local functions.
 *
 * - Fetches function metadata (endpoint, docsUrl, execution type, etc.)
 *   from the MongoDB ApiFunction collection.
 * - Executes function logic based on executionType:
 *    🔹 LOCAL  -> runs an internal/local handler (from utils/localFunctions.js)
 *    🔹 API    -> makes an HTTP POST/GET request to developer’s endpoint
 * - Returns normalized output to the job processor.
 */

import axios from "axios";
import ApiFunction from "../models/apiFunctionModel.js";
import { localFunctionHandlers } from "../utils/localFunctions.js";

/**
 * Executes a job dynamically based on its functionIdentifier.
 *
 * @param {Object} job - The job object
 * @param {string} job.jobId - Unique job identifier
 * @param {string} job.functionIdentifier - Function key (links to ApiFunction record)
 * @param {any} job.input - Input payload for the function
 * @returns {Promise<any>} Output/result from function execution
 */
export async function executeJob(functionIdentifier, inputData) {
  console.log(`[Executor] 🧠 Executing job ${inputData.name} (${functionIdentifier})`);

  // 1️⃣ Find function metadata in DB
  const fn = await ApiFunction.findOne({ functionIdentifier });

  if (!fn) {
    throw new Error(`Unknown functionIdentifier: ${functionIdentifier}`);
  }

  // Optional logging
  console.log(`[Executor] Found function "${fn.functionIdentifier}" [Type: ${fn.executionType}]`);

  let output;

  try {
    // 2️⃣ Determine execution path
    if (fn.executionType === "LOCAL") {
      // --- LOCAL EXECUTION ---
      const handler = localFunctionHandlers[functionIdentifier];
      if (!handler) {
        throw new Error(`No local handler found for ${functionIdentifier}`);
      }

      output = await handler(inputData);
      console.log(`[Executor] ✅ Local function executed successfully`);

    } else if (fn.executionType === "API") {
      // --- EXTERNAL API EXECUTION ---
      console.log(`[Executor] 🔗 Calling API endpoint: ${fn.endpointUrl}`);

      // Allow POST/GET flexibility
      const method = fn.method?.toUpperCase() || "POST";

      const response = await axios({
        method,
        url: fn.endpointUrl,
        data: { input: inputData },
        timeout: 15000,
      });

      output = response.data;
      console.log(`[Executor] ✅ API executed successfully for ${functionIdentifier}`);

    } else {
      throw new Error(`Invalid executionType "${fn.executionType}" in DB.`);
    }

    // 3️⃣ Return normalized output
    return {
      success: true,
      output,
      docsUrl: fn.docsUrl || null, // for transparency
    };

  } catch (error) {
    console.error(`[Executor] ❌ Error executing function ${functionIdentifier}:`, error.message);

    return {
      success: false,
      output: null,
      error: error.message,
      docsUrl: fn.docsUrl || null,
    };
  }
}
