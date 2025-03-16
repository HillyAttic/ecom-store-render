'use client';

import { useState } from 'react';

export default function ImportProductsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [clearExisting, setClearExisting] = useState(true);

  const handleImport = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch(`/api/import-products?apiKey=${apiKey}&clear=${clearExisting}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import products');
      }

      setResult(data);
    } catch (err: any) {
      console.error('Error importing products:', err);
      setError(err.message || 'An error occurred while importing products');
    } finally {
      setLoading(false);
    }
  };

  const handleTestFirebase = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Test client-side Firebase
      const clientResponse = await fetch('/api/test-firebase-connection');
      const clientData = await clientResponse.json();

      // Test admin Firebase
      const adminResponse = await fetch('/api/test-firebase-admin-connection');
      const adminData = await adminResponse.json();

      setResult({
        clientTest: clientData,
        adminTest: adminData
      });
    } catch (err: any) {
      console.error('Error testing Firebase connection:', err);
      setError(err.message || 'An error occurred while testing Firebase connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin: Import Products</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Firebase Connection</h2>
        <button
          onClick={handleTestFirebase}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Testing...' : 'Test Firebase Connection'}
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Import Products</h2>
        
        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            API Key (use "debug-key-for-testing")
          </label>
          <input
            type="text"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter API key"
          />
        </div>
        
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={clearExisting}
              onChange={(e) => setClearExisting(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Clear existing products</span>
          </label>
        </div>
        
        <button
          onClick={handleImport}
          disabled={loading || !apiKey}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? 'Importing...' : 'Import Products'}
        </button>
      </div>
      
      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-bold">Result:</h3>
          <pre className="mt-2 whitespace-pre-wrap text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 