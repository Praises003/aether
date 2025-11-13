/**
 * Local Function Handlers for testing / fallback.
 * These run directly on the backend without external APIs.
 */

export const localFunctionHandlers = {
  TEXT_SUMMARIZER_V1: (input) => {
    if (typeof input !== "string") throw new Error("Input must be a string.");
    const words = input.split(" ");
    const summary = words.slice(0, Math.min(10, words.length)).join(" ") + "...";
    return `Summary: ${summary}`;
  },

  REVERSE_TEXT_V1: (input) => {
    if (typeof input !== "string") throw new Error("Input must be a string.");
    return input.split("").reverse().join("");
  },

  RANDOM_FACT_V1: async () => {
    const facts = [
      "Hedera uses aBFT — the highest level of security.",
      "Gas refilling in Nigeria is growing at 12% annually.",
      "Dadatech helps customers avoid running out of gas.",
    ];
    return facts[Math.floor(Math.random() * facts.length)];
  },
};
