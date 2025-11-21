"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/context/wallet-context";
import axios from "axios";
import { 
  Zap, 
  Plus, 
  RefreshCw, 
  Globe,
  Server,
  DollarSign,
  Key,
  FileText,
  Sparkles,
  Rocket,
  Shield,
  Cpu
} from "lucide-react";

export default function DeveloperPage() {
  const { accountId, isInitializing } = useWallet();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceHbar: "",
    endpointUrl: "",
    docsUrl: "",
    functionIdentifier: "",
    executionType: "API",
    method: "POST",
    providerAccountId: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Auto-fill providerAccountId when wallet connects
  useEffect(() => {
    if (accountId) {
      setFormData(prev => ({
        ...prev,
        providerAccountId: accountId
      }));
    }
  }, [accountId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!accountId) {
      setMessage("Please connect your wallet first");
      setMessageType("error");
      return;
    }

    // Validate required fields
    if (!formData.functionIdentifier || !formData.priceHbar || !formData.providerAccountId) {
      setMessage("Function Identifier, Price (HBAR), and Provider Account ID are required");
      setMessageType("error");
      return;
    }

    // Validate function identifier format
    if (!/^[A-Z0-9_]+$/.test(formData.functionIdentifier)) {
      setMessage("Function Identifier must contain only uppercase letters, numbers, and underscores");
      setMessageType("error");
      return;
    }

    // Validate price
    const price = parseFloat(formData.priceHbar);
    if (isNaN(price) || price < 0) {
      setMessage("Price must be a valid positive number");
      setMessageType("error");
      return;
    }

    // Validate endpoint URL for API functions
    if (formData.executionType === "API" && !formData.endpointUrl) {
      setMessage("Endpoint URL is required for API functions");
      setMessageType("error");
      return;
    }

    if (formData.executionType === "API" && formData.endpointUrl) {
      try {
        new URL(formData.endpointUrl);
      } catch (error) {
        setMessage("Please enter a valid URL for the endpoint");
        setMessageType("error");
        return;
      }
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await axios.post("https://aether-foyr.onrender.com/api/function", {
        name: formData.name,
        description: formData.description,
        providerAccountId: formData.providerAccountId,
        priceHbar: price,
        endpointUrl: formData.executionType === "API" ? formData.endpointUrl : undefined,
        docsUrl: formData.docsUrl || undefined,
        functionIdentifier: formData.functionIdentifier.toUpperCase(),
        executionType: formData.executionType,
        method: formData.method
      });

      setMessage("🎉 Function created successfully! It's now live on the marketplace.");
      setMessageType("success");
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        priceHbar: "",
        endpointUrl: "",
        docsUrl: "",
        functionIdentifier: "",
        executionType: "API",
        method: "POST",
        providerAccountId: accountId
      });

    } catch (error) {
      console.error("Failed to create function:", error);
      const errorMessage = error.response?.data?.message || "Failed to create function";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800 text-lg">Loading your developer dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 border border-blue-200 shadow-sm mb-6">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-800">Developer Dashboard</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Build the Future of APIs
            </h1>
            <p className="text-xl text-gray-800 max-w-2xl mx-auto leading-relaxed">
              Monetize your code in the decentralized API marketplace. Earn HBAR for every function call.
            </p>
          </div>

          {!accountId && (
            <div className="mt-8 max-w-md mx-auto">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center shadow-sm">
                <Shield className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Wallet Required</h3>
                <p className="text-gray-700 text-sm">
                  Connect your Hedera wallet to create and manage functions
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Message Display */}
        {message && (
          <div className={`mb-8 rounded-2xl p-6 border-l-4 ${
            messageType === "success" 
              ? "bg-green-50 border-green-400 text-gray-800" 
              : "bg-red-50 border-red-400 text-gray-800"
          }`}>
            <div className="flex items-center gap-3">
              {messageType === "success" ? (
                <Sparkles className="h-6 w-6 text-green-500" />
              ) : (
                <Shield className="h-6 w-6 text-red-500" />
              )}
              <p className="font-medium">{message}</p>
            </div>
          </div>
        )}

        {/* Create Function Form */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
            <div className="flex items-center gap-4 text-white">
              <Rocket className="h-10 w-10" />
              <div>
                <h2 className="text-3xl font-bold">Register Your Function</h2>
                <p className="text-blue-100 text-lg">Deploy your API to the decentralized marketplace</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
                <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Function Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg text-gray-900 placeholder-gray-500"
                    placeholder="e.g., Random Fact Generator"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-gray-900 placeholder-gray-500"
                    placeholder="Describe what your function does and how it helps users..."
                  />
                </div>
              </div>
            </div>

            {/* Technical Configuration */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-purple-600 rounded-full"></div>
                <h3 className="text-xl font-semibold text-gray-900">Technical Configuration</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-3">
                    <Key className="h-5 w-5 text-purple-500" />
                    Function Identifier *
                  </label>
                  <input
                    type="text"
                    name="functionIdentifier"
                    value={formData.functionIdentifier}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all uppercase font-mono text-gray-900 placeholder-gray-500"
                    placeholder="RANDOM_FACT_V1"
                    required
                  />
                  <p className="text-xs text-gray-700 mt-2">
                    Must match exactly with your backend handler name
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-3">
                    <Cpu className="h-5 w-5 text-purple-500" />
                    Execution Type *
                  </label>
                  <select
                    name="executionType"
                    value={formData.executionType}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900"
                  >
                    <option value="API">API Endpoint</option>
                    <option value="LOCAL">Local Function</option>
                  </select>
                </div>
              </div>

              {/* API Endpoint Configuration */}
              {formData.executionType === "API" && (
                <div className="space-y-6 p-6 bg-blue-50 rounded-2xl border border-blue-200">
                  <div className="flex items-center gap-3 text-blue-800">
                    <Globe className="h-5 w-5" />
                    <span className="font-semibold text-lg">API Configuration</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-800 mb-3">
                        Endpoint URL *
                      </label>
                      <input
                        type="url"
                        name="endpointUrl"
                        value={formData.endpointUrl}
                        onChange={handleInputChange}
                        className="w-full p-4 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-500"
                        placeholder="https://api.example.com/endpoint"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-3">
                        HTTP Method
                      </label>
                      <select
                        name="method"
                        value={formData.method}
                        onChange={handleInputChange}
                        className="w-full p-4 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                      >
                        <option value="POST">POST</option>
                        <option value="GET">GET</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Documentation */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-3">
                  <Globe className="h-5 w-5 text-gray-600" />
                  Documentation URL (Optional)
                </label>
                <input
                  type="url"
                  name="docsUrl"
                  value={formData.docsUrl}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all text-gray-900 placeholder-gray-500"
                  placeholder="https://docs.example.com"
                />
              </div>
            </div>

            {/* Pricing & Wallet */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-green-600 rounded-full"></div>
                <h3 className="text-xl font-semibold text-gray-900">Pricing & Wallet</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-3">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Price (HBAR) *
                  </label>
                  <input
                    type="number"
                    name="priceHbar"
                    value={formData.priceHbar}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 placeholder-gray-500"
                    placeholder="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-3">
                    <Server className="h-5 w-5 text-green-500" />
                    Provider Account ID *
                  </label>
                  <input
                    type="text"
                    name="providerAccountId"
                    value={formData.providerAccountId || ""}
                    readOnly
                    className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 font-mono text-sm text-gray-900"
                    placeholder="Connect wallet to auto-fill"
                  />
                  <p className="text-xs text-gray-700 mt-2">
                    Automatically set to your connected wallet
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting || !accountId}
                className="w-full py-5 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-2xl hover:shadow-3xl flex items-center justify-center gap-4 transform hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    Deploying Function...
                  </>
                ) : (
                  <>
                    <Zap className="h-6 w-6" />
                    Deploy to Marketplace
                  </>
                )}
              </button>
              
              {!accountId && (
                <p className="text-center text-amber-600 mt-4 font-medium">
                  Connect your wallet to register functions
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Quick Guide */}
        <div className="mt-12 bg-white rounded-3xl border border-gray-200 shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">🚀 Quick Start Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-2xl border border-blue-200">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">1. Match Identifier</h4>
              <p className="text-sm text-gray-800">Function Identifier must match your backend handler name exactly</p>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-2xl border border-purple-200">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cpu className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">2. Choose Type</h4>
              <p className="text-sm text-gray-800">Select LOCAL for functions in your backend, API for external endpoints</p>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-200">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">3. Set Price</h4>
              <p className="text-sm text-gray-800">Earn HBAR every time someone uses your function</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}