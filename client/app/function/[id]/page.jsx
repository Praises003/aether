"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useWallet } from "@/context/wallet-context";
import { payProvider } from "@/lib/pay-provider";

export default function FunctionDetailPage() {
  const { id } = useParams();
  const { client, session, accountId, connectWallet, disconnect, clearAllSessions } = useWallet();

  const isConnected = !!accountId;

  const [func, setFunc] = useState(null);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [transactionStep, setTransactionStep] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [jobId, setJobId] = useState("");

  // Fetch function metadata
  useEffect(() => {
    async function fetchFunction() {
      try {
        const res = await axios.get(`https://aether-foyr.onrender.com/api/function/${id}`);
        setFunc(res.data);
      } catch (err) {
        console.error("Failed to fetch function:", err);
        setErrorMessage("Failed to fetch function data.");
      }
    }
    fetchFunction();
  }, [id]);

  async function handleExecuteClick(funcData) {
    if (!funcData?.providerAccountId || !funcData?.priceHbar || !funcData?.functionIdentifier) {
      setErrorMessage("Function data is not ready.");
      setTransactionStep("error");
      return;
    }

    if (!input.trim()) {
      setErrorMessage("Please provide input for the function.");
      return;
    }

    try {
      setErrorMessage("");
      setTransactionStep("awaiting-approval");
      setResult(null);
      setTransactionId("");
      setJobId("");

      // Ensure wallet is connected
      let currentAccountId = accountId;
      let currentSession = session;
      let walletClient = client;

      if (!currentAccountId || !currentSession || !walletClient) {
        console.log("Connecting wallet...");
        const connectResult = await connectWallet();
        currentAccountId = connectResult.accountId;
        currentSession = connectResult.session;
        walletClient = connectResult.client;
      }

      if (!currentAccountId) {
        throw new Error("Failed to retrieve connected account.");
      }

      console.log("👤 Using account:", currentAccountId);
      console.log("📋 Available methods:", currentSession.namespaces?.hedera?.methods);
      
      // ✅ ADD TIMEOUT FOR PAYMENT
      const paymentPromise = payProvider({
        client: walletClient,
        session: currentSession,
        from: currentAccountId,
        to: funcData.providerAccountId,
        amountHbar: Number(funcData.priceHbar),
        memo: `Payment for ${funcData.name || "function usage"}`,
      });

      // Set 2 minute timeout for payment
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Payment request timed out. Please check your wallet.")), 120000);
      });

      setTransactionStep("processing");
      console.log("💰 Starting payment process...");

      // Race between payment and timeout
      const paymentResult = await Promise.race([paymentPromise, timeoutPromise]);
      
      console.log("✅ Payment completed:", paymentResult);
      setTransactionId(paymentResult.transactionId);
      setTransactionStep("submitting-hcs");

      // 2. Submit job to HCS
      console.log("📨 Submitting job to HCS...");
      const submissionResult = await submitToHCS(
        funcData, 
        input, 
        paymentResult.transactionId, 
        currentAccountId
      );

      setJobId(submissionResult.jobId);
      setTransactionStep("processing-hcs");

      // 3. Poll for results
      console.log("🔄 Starting to poll for results...");
      await pollForHCSResult(submissionResult.jobId);

    } catch (err) {
      console.error("❌ Transaction error:", err);
      setErrorMessage(err.message || "Transaction failed");
      setTransactionStep("error");
    }
  }

  // Submit job to HCS endpoint
  async function submitToHCS(funcData, userInput, txId, userAccountId) {
    try {
      console.log("Submitting to HCS...");

      const response = await axios.post('https://aether-foyr.onrender.com/api/hcs/submit', {
        functionIdentifier: funcData.functionIdentifier,
        input: userInput,
        providerAccountId: funcData.providerAccountId,
        transferTxId: txId,
        priceHbar: funcData.priceHbar,
        userAccountId: userAccountId
      });

      console.log("HCS submission result:", response.data);
      return response.data;

    } catch (error) {
      console.error("HCS submission error:", error);
      throw new Error(`Failed to submit to HCS: ${error.response?.data?.message || error.message}`);
    }
  }

  // Poll for HCS results
  async function pollForHCSResult(jobId) {
    console.log("Starting to poll for job result:", jobId);
    
    for (let attempt = 1; attempt <= 30; attempt++) {
      try {
        const response = await axios.get(`https://aether-foyr.onrender.com/api/result/${jobId}`);
        
        if (response.data.status === "completed") {
          console.log("Job completed successfully:", response.data);
          setResult(response.data.result);
          setTransactionStep("complete");
          return;
        }
        
        // Still processing
        console.log(`HCS processing... (${attempt}/30)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        if (error.response?.status === 404) {
          // Still processing - job not found yet
          console.log(`Job not found yet... (${attempt}/30)`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        console.error("Polling error:", error);
        throw new Error(`Failed to poll for results: ${error.message}`);
      }
    }
    
    throw new Error("HCS processing timeout - please check back later");
  }

  const getButtonText = () => {
    switch (transactionStep) {
      case "idle": return `Execute - ${func?.priceHbar || 0} HBAR`;
      case "awaiting-approval": return "Awaiting wallet approval…";
      case "processing": return "Processing payment…";
      case "submitting-hcs": return "Submitting to decentralized network…";
      case "processing-hcs": return "Processing on HCS network…";
      case "complete": return "Success! Execute Again?";
      case "error": return "Retry";
      default: return "Execute";
    }
  };

  const isButtonDisabled = () => {
    return [
      "awaiting-approval", 
      "processing", 
      "submitting-hcs", 
      "processing-hcs"
    ].includes(transactionStep);
  };

  const getInputPlaceholder = () => {
    if (!func) return "Enter input...";
    
    const functionName = func.name?.toLowerCase() || func.functionIdentifier?.toLowerCase();
    
    if (functionName?.includes("country")) {
      return "Enter country name (e.g., 'canada', 'france', 'japan')...";
    } else if (functionName?.includes("image") || functionName?.includes("generate")) {
      return "Describe the image you want to generate...";
    } else if (functionName?.includes("summar")) {
      return "Paste text to summarize...";
    } else if (functionName?.includes("translate")) {
      return "Enter text to translate...";
    } else {
      return "Enter input for the function...";
    }
  };

  // ✅ NEW: Extract and format country data
  // ✅ FIXED: Handle the direct country object structure
// ✅ FIXED: Handle the exact data structure from your backend
      const formatCountryData = (result) => {
        console.log("🔍 DEBUG: Raw result in formatCountryData:", result);
        
        if (!result) {
          console.log("❌ No result provided");
          return null;
        }

        // Your exact data structure: { success: true, output: [{...country data...}], docsUrl: "..." }
        let countryData;
        
        if (result.output && Array.isArray(result.output) && result.output.length > 0) {
          // ✅ THIS IS YOUR STRUCTURE: { output: [{...country data...}] }
          countryData = result.output[0];
          console.log("✅ Found country data in result.output[0]");
        } else if (Array.isArray(result) && result.length > 0) {
          // Structure: [{...country data...}] 
          countryData = result[0];
        } else if (result.name && result.capital) {
          // Structure: {...country data...} directly
          countryData = result;
        } else {
          console.log("❌ Unknown data structure - cannot extract country data");
          console.log("Available keys:", Object.keys(result));
          return null;
        }

        console.log("✅ Extracted country data:", countryData);

        // Safely extract data with fallbacks
        return {
          name: countryData.name?.common || 'Unknown',
          officialName: countryData.name?.official || 'Unknown',
          flag: countryData.flag || '🏳️',
          flagImage: countryData.flags?.png || countryData.flags?.svg,
          capital: Array.isArray(countryData.capital) ? countryData.capital[0] : countryData.capital || 'Unknown',
          population: countryData.population ? countryData.population.toLocaleString() : 'Unknown',
          area: countryData.area ? `${countryData.area.toLocaleString()} km²` : 'Unknown',
          region: countryData.region || 'Unknown',
          subregion: countryData.subregion || 'Unknown',
          languages: countryData.languages ? Object.values(countryData.languages).join(', ') : 'Unknown',
          currencies: countryData.currencies ? Object.values(countryData.currencies).map(curr => curr.name).join(', ') : 'Unknown',
          timezones: countryData.timezones ? countryData.timezones.join(', ') : 'Unknown',
          borders: countryData.borders ? countryData.borders.join(', ') : 'None',
          googleMaps: countryData.maps?.googleMaps
        };
      };

  // ✅ UPDATED: Render country information beautifully
  // ✅ UPDATED: Better result rendering with proper colors
// ✅ UPDATED: Handle the specific data structure
    const renderResult = () => {
      if (!result) {
        console.log("🔍 DEBUG: No result to render");
        return null;
      }

      console.log("🔍 DEBUG: Rendering result - structure:", {
        hasOutput: !!result.output,
        isArray: Array.isArray(result.output),
        length: result.output?.length,
        keys: Object.keys(result)
      });

      // Handle country API result
      if (func?.functionIdentifier === 'COUNTRY_API') {
        const country = formatCountryData(result);
        
        console.log("🔍 DEBUG: Formatted country data:", country);
        
        if (!country) {
          return (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">No country data found for "{input}"</p>
              <p className="text-red-600 text-sm mt-2">Result structure: {JSON.stringify(result, null, 2)}</p>
            </div>
          );
        }

        return (
          <div className="mt-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">🌍 Country Information</h2>
            
            <div className="bg-white border border-gray-300 rounded-xl shadow-lg overflow-hidden">
              {/* Header with flag and basic info */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{country.name}</h3>
                    <p className="text-blue-100 opacity-90">{country.officialName}</p>
                  </div>
                  <div className="text-4xl">{country.flag}</div>
                </div>
              </div>

              {/* Country details grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold text-gray-700">Capital</span>
                      <span className="text-gray-900 font-medium">{country.capital}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold text-gray-700">Population</span>
                      <span className="text-gray-900 font-medium">{country.population}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold text-gray-700">Area</span>
                      <span className="text-gray-900 font-medium">{country.area}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold text-gray-700">Region</span>
                      <span className="text-gray-900 font-medium">{country.region}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold text-gray-700">Subregion</span>
                      <span className="text-gray-900 font-medium">{country.subregion}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold text-gray-700">Languages</span>
                      <span className="text-gray-900 font-medium text-right">{country.languages}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold text-gray-700">Currencies</span>
                      <span className="text-gray-900 font-medium text-right">{country.currencies}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold text-gray-700">Bordering Countries</span>
                      <span className="text-gray-900 font-medium text-right">{country.borders}</span>
                    </div>
                  </div>
                </div>

                {/* Timezones */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">🕐 Timezones</h4>
                  <p className="text-gray-600 text-sm">{country.timezones}</p>
                </div>

                {/* Google Maps link */}
                {country.googleMaps && (
                  <div className="mt-4 text-center">
                    <a 
                      href={country.googleMaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <span>🗺️ View on Google Maps</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      // If we get here and it's still showing JSON, show a formatted version
      return (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">🎯 Execution Result</h2>
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <pre className="whitespace-pre-wrap break-words text-sm text-gray-800 bg-white p-4 rounded border">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      );
    };

  const resetForm = () => {
    setResult(null);
    setTransactionStep("idle");
    setInput("");
    setTransactionId("");
    setJobId("");
    setErrorMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{func?.name || "Loading..."}</h1>
        <p className="text-gray-600 mb-4">{func?.description}</p>
        <div className="flex gap-4 text-sm">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
            {func?.priceHbar} HBAR per call
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
            {func?.executionType || "API"}
          </span>
          {func?.docsUrl && (
            <a 
              href={func.docsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200"
            >
              Documentation
            </a>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-2">
          Input
        </label>
        <textarea
          id="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={getInputPlaceholder()}
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isButtonDisabled()}
          rows={4}
        />
      </div>

      <button
        onClick={() => handleExecuteClick(func)}
        disabled={isButtonDisabled() || !input.trim()}
        className="w-full px-6 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg"
      >
        {getButtonText()}
      </button>

      {!isConnected && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">Connect your wallet to execute functions</p>
          <button
            onClick={connectWallet}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Connect Wallet
          </button>
        </div>
      )}

      {/* Debug Tools */}
      <div className="mt-4 text-center space-x-2">
        <button
          onClick={async () => {
            console.log("🔍 Debug: Checking wallet state");
            console.log("Client:", client);
            console.log("Session:", session);
            console.log("Account:", accountId);
            
            if (client && session) {
              console.log("Session topic:", session.topic);
              console.log("Session namespaces:", session.namespaces);
              console.log("Hedera methods available:", session.namespaces?.hedera?.methods);
              console.log("Hedera accounts:", session.namespaces?.hedera?.accounts);
            }
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
        >
          Debug Wallet State
        </button>

        {/* Add this debug button to see what's happening */}
<div className="mt-4 text-center">
  <button
    onClick={() => {
      console.log("🔍 Current state:", { 
        result, 
        func, 
        transactionStep,
        formattedCountry: func?.functionIdentifier === 'country_api' ? formatCountryData(result) : null 
      });
    }}
    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
  >
    Debug Current State
  </button>
</div>

        <button
          onClick={async () => {
            console.log("🔄 Force fresh connection...");
            await disconnect();
            await connectWallet();
          }}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
        >
          Force Fresh Connection
        </button>

        <button
          onClick={async () => {
            console.log("🗑️ Clearing all sessions...");
            await clearAllSessions();
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
        >
          Clear All Sessions
        </button>
      </div>

      {/* Transaction Status */}
      {transactionStep === "processing-hcs" && (
        <div className="mt-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Processing on decentralized network...</p>
          {jobId && (
            <p className="text-sm text-gray-500 mt-1">Job ID: {jobId}</p>
          )}
        </div>
      )}

      {/* Payment Success */}
      {transactionId && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>✅ Payment verified!</strong> Transaction:{" "}
            <a 
              href={`https://hashscan.io/testnet/transaction/${transactionId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-green-900"
            >
              {transactionId}
            </a>
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* Results */}
      {renderResult()}

      {/* Success Actions */}
      {transactionStep === "complete" && (
        <div className="mt-6 flex gap-4">
          <button
            onClick={resetForm}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Execute Another
          </button>
          <button
            onClick={() => {
              setResult(null);
              setTransactionStep("idle");
            }}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Keep Input
          </button>
        </div>
      )}
    </div>
  );
}