import ApiFunction from "../models/apiFunctionModel.js";

// Get all API functions
export const getApiFunctions = async (req, res) => {
  try {
    const functions = await ApiFunction.find();
    res.status(200).json(functions);
  } catch (error) {
    console.error("[API Error] Could not get functions:", error);
    res.status(500).json({ message: "Server error while fetching functions" });
  }
};

// Create a new function
export const createApiFunction = async (req, res) => {
  try {
    const {
      name,
      description,
      providerAccountId,
      priceHbar,
      endpointUrl,
      docsUrl,
      functionIdentifier,
      executionType,
      method,
    } = req.body;

    if (!functionIdentifier || !priceHbar || !providerAccountId)
      return res.status(400).json({ message: "Required fields missing" });

    const newFunction = new ApiFunction({
      name,
      description,
      providerAccountId,
      priceHbar,
      endpointUrl,
      docsUrl,
      functionIdentifier,
      executionType,
      method,
    });

    const saved = await newFunction.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("[API Error] Could not create function:", error);
    res.status(500).json({ message: "Server error while creating function" });
  }
};
