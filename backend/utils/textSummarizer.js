// src/services/functionExecutor.service.js
export async function executeFunction(functionId, input) {
  // Replace these mocks with real calls (OpenAI, Replicate, etc.) later.
  switch (functionId) {
    case "textSummarizer":
      return input.length > 200 ? input.slice(0, 200) + "..." : input;
    case "reverse":
      return input.split("").reverse().join("");
    default:
      return `No function ${functionId} implemented.`;
  }
}
