export const logEvent = (msg, data = {}) => {
  console.log(`[${new Date().toISOString()}] ${msg}`, data);
};
