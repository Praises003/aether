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

// Get a single API function by ID
export const getApiFunctionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid function ID" });
    }

    const func = await ApiFunction.findById(id);

    if (!func) {
      return res.status(404).json({ message: "Function not found" });
    }

    res.status(200).json(func);
  } catch (error) {
    console.error("[API Error] Could not get function by ID:", error);
    res.status(500).json({ message: "Server error while fetching function" });
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



export const deleteApiFunction = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ApiFunction.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Function not found" });
    }
    
    res.json({ message: "Function deleted successfully" });
  } catch (error) {
    console.error("[API Error] Could not delete function:", error);
    res.status(500).json({ message: "Server error while deleting function" });
  }
};