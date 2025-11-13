import mongoose from "mongoose";

const apiFunctionSchema = new mongoose.Schema(
  {
    /**
     * A unique identifier for the function.
     * This acts as the “key” used by jobs to trigger this function.
     * Example: "TEXT_SUMMARIZER_V1", "IMG_CLASSIFIER_V2", etc.
     */
    functionIdentifier: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    /**
     * The method of execution.
     * LOCAL: Handled directly on your backend (from localFunctionHandlers)
     * API:    Calls an external developer endpoint
     */
    executionType: {
      type: String,
      enum: ["LOCAL", "API"],
      default: "API",
    },

    /**
     * For API-based executions — the developer’s endpoint.
     * Can be null for LOCAL functions.
     */
    endpointUrl: {
      type: String,
      required: function () {
        return this.executionType === "API";
      },
    },

    /**
     * The HTTP method to use when calling the API endpoint.
     * Default is POST (most developers expect POST for structured input).
     */
    method: {
      type: String,
      enum: ["GET", "POST"],
      default: "POST",
    },

    /**
     * Optional link to documentation — allows developers to
     * show users how their API works.
     */
    docsUrl: {
      type: String,
      default: null,
    },

    /**
     * HBAR price per job execution.
     * Used when calculating job payments.
     */
    priceHbar: {
      type: Number,
      required: true,
      min: 0,
    },
    
    /**
     * Hedera account ID of the developer who owns this function.
     * e.g., "0.0.12345"
     */
    providerAccountId: {
      type: String,
      required: true,
    },

    /**
     * Optional short name or description to show in UI listings.
     */
    name: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      default: null,
    },

    /**
     * Indicates if the function is active (available for job execution).
     */
    isActive: {
      type: Boolean,
      default: true,
    },

    /**
     * Timestamps (createdAt, updatedAt)
     */
  },
  { timestamps: true }
);

export default mongoose.model("ApiFunction", apiFunctionSchema);
