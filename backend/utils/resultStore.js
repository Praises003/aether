// Simple in-memory store for demo
const jobResults = new Map();

export const storeJobResult = (jobId, result) => {
  jobResults.set(jobId, {
    result,
    timestamp: new Date()
  });
};

export const getJobResult = (jobId) => {
  return jobResults.get(jobId);
};

export const deleteJobResult = (jobId) => {
  jobResults.delete(jobId);
};