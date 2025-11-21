import { getJobResult } from "../utils/resultStore.js";

export const checkJobResult = async (req, res) => {
  try {
    const { jobId } = req.params;

    const result = getJobResult(jobId);
    
    if (!result) {
      return res.status(404).json({ 
        status: "processing", 
        message: "Job still processing on HCS network" 
      });
    }

    res.json({
      status: "completed",
      result: result.result,
      timestamp: result.timestamp
    });

  } catch (error) {
    console.error("[Result Controller] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check job result",
      error: error.message
    });
  }
};