"use client";

import { useState, useEffect } from "react";
import { authApi, galleryApi, assetApi } from "../_utils/api";

export default function TestPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin1234");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [storedToken, setStoredToken] = useState<string | null>(null);
  const [galleryResponse, setGalleryResponse] = useState<any>(null);
  
  // --- Asset Creation Test States ---
  const [assetProjectId, setAssetProjectId] = useState("b72ef49f-6001-41c9-9d04-e666abfa0bd9");
  const [assetType, setAssetType] = useState<"characters" | "backgrounds">("characters");
  const [assetName, setAssetName] = useState("Test Asset");
  const [assetStyle, setAssetStyle] = useState("REALISTIC");
  const [assetRatio, setAssetRatio] = useState("16:9");
  const [assetQuality, setAssetQuality] = useState("Standard");
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [assetLoading, setAssetLoading] = useState(false);
  const [assetResponse, setAssetResponse] = useState<any>(null);

  useEffect(() => {
    // Check localStorage on mount
    const token = localStorage.getItem("accessToken");
    setStoredToken(token);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await authApi.login({ username, password });
      setResponse(res);
      if (res.success && res.data.accessToken) {
        localStorage.setItem("accessToken", res.data.accessToken);
        setStoredToken(res.data.accessToken);
      }
    } catch (error: any) {
      setResponse({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTestGallery = async () => {
    setGalleryLoading(true);
    setGalleryResponse(null);
    try {
      const res = await galleryApi.get();
      setGalleryResponse(res);
    } catch (error: any) {
      setGalleryResponse({ success: false, message: error.message });
    } finally {
      setGalleryLoading(false);
    }
  };

  const handleClearToken = () => {
    localStorage.removeItem("accessToken");
    setStoredToken(null);
  };

  const handleCreateAsset = async () => {
    if (!assetProjectId) {
      alert("Project ID is required");
      return;
    }
    setAssetLoading(true);
    setAssetResponse(null);
    try {
      const formData = new FormData();
      formData.append("name", assetName);
      formData.append("style", assetStyle);
      formData.append("ratio", assetRatio);
      formData.append("quality", assetQuality);
      
      if (assetFile) {
        formData.append("referenceImage", assetFile);
      }

      const res = await assetApi.create(assetProjectId, assetType, formData);
      setAssetResponse(res);
    } catch (error: any) {
      setAssetResponse({ success: false, message: error.message });
    } finally {
      setAssetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white p-8 flex flex-col items-center justify-center font-montserrat">
      {/* Background decoration */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-100/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-300/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl z-10">
        <h1 className="text-48 font-bold mb-8 text-center bg-gradient-to-r from-primary-100 to-primary-300 bg-clip-text text-transparent">
          API Endpoint Test
        </h1>

        <div className="grid gap-6">
          {/* Form Card */}
          <div className="bg-dark-200/50 backdrop-blur-xl border border-white-300 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-24 font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary-100 rounded-full" />
              Login Authorization
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-14 text-gray-100 mb-2 ml-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-dark-300/80 border border-border-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-100 transition-colors"
                />
              </div>
              <div>
                <label className="block text-14 text-gray-100 mb-2 ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-300/80 border border-border-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-100 transition-colors"
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-primary-100 hover:bg-primary-300 disabled:bg-gray-300 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-primary-100/20 active:scale-[0.98]"
              >
                {loading ? "Testing..." : "Test POST /auth/login"}
              </button>
            </div>
          </div>

          {/* Token Display Card */}
          <div className="bg-dark-200/50 backdrop-blur-xl border border-white-300 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-18 font-medium">Stored Access Token</h3>
              {storedToken && (
                <button 
                  onClick={handleClearToken}
                  className="text-12 text-red-400 hover:text-red-300 underline"
                >
                  Clear Token
                </button>
              )}
            </div>
            <div className="bg-dark-400 rounded-xl p-4 overflow-x-auto border border-border-100 min-h-[60px] flex items-center">
              {storedToken ? (
                <code className="text-primary-200 break-all text-12">
                  {storedToken}
                </code>
              ) : (
                <span className="text-gray-300 text-14">No token stored (Pending login)</span>
              )}
            </div>
          </div>

          {/* Response Card */}
          {response && (
            <div className="bg-dark-200/50 backdrop-blur-xl border border-white-300 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-18 font-medium mb-4 flex items-center gap-2">
                Response
                <span className={`text-12 px-2 py-0.5 rounded-full ${response.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {response.success ? 'Success' : 'Failed'}
                </span>
              </h3>
              <pre className="bg-dark-400 rounded-xl p-4 overflow-x-auto border border-border-100 text-13 text-green-400/90 leading-relaxed font-mono">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
          {/* Gallery Test Card */}
          <div className="bg-dark-200/50 backdrop-blur-xl border border-white-300 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-24 font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary-300 rounded-full" />
              Gallery Discovery Test
            </h2>
            <p className="text-14 text-white/40 mb-6 -mt-4">
              다른 사용자의 공개된 콘텐츠를 불러옵니다. (GET /gallery)
            </p>
            <button
              onClick={handleTestGallery}
              disabled={galleryLoading}
              className="w-full bg-dark-400 hover:bg-white/5 border border-white/10 text-white font-semibold py-4 rounded-xl transition-all duration-300 active:scale-[0.98] mb-6"
            >
              {galleryLoading ? "Fetching Gallery..." : "Fetch Gallery Data"}
            </button>

            {galleryResponse && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-14 font-medium mb-3 text-white/60">Response Data</h3>
                <pre className="bg-dark-400 rounded-xl p-4 overflow-x-auto border border-border-100 text-12 text-primary-200/90 leading-relaxed font-mono max-h-[400px]">
                  {JSON.stringify(galleryResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Integrated Asset Creation Test Card */}
          <div className="bg-dark-200/50 backdrop-blur-xl border border-white-300 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-24 font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary-100 rounded-full" />
              Integrated Asset Creation Test
            </h2>
            <p className="text-14 text-white/40 mb-6 -mt-4">
              POST /api/projects/{"{projectId}"}/{"{assetType}"}
            </p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-12 text-gray-100 mb-1 ml-1 font-bold italic">PROJECT ID</label>
                  <input
                    type="text"
                    value={assetProjectId}
                    onChange={(e) => setAssetProjectId(e.target.value)}
                    className="w-full bg-dark-300/80 border border-border-100 rounded-xl px-4 py-2.5 text-12"
                  />
                </div>
                <div>
                  <label className="block text-12 text-gray-100 mb-1 ml-1 font-bold italic">ASSET TYPE</label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value as any)}
                    className="w-full bg-dark-300/80 border border-border-100 rounded-xl px-4 py-2.5 text-12"
                  >
                    <option value="characters">characters</option>
                    <option value="backgrounds">backgrounds</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-12 text-gray-100 mb-1 ml-1 font-bold italic">NAME</label>
                  <input
                    type="text"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    className="w-full bg-dark-300/80 border border-border-100 rounded-xl px-4 py-2.5 text-12"
                  />
                </div>
                <div>
                  <label className="block text-12 text-gray-100 mb-1 ml-1 font-bold italic">STYLE</label>
                  <select
                    value={assetStyle}
                    onChange={(e) => setAssetStyle(e.target.value)}
                    className="w-full bg-dark-300/80 border border-border-100 rounded-xl px-4 py-2.5 text-12"
                  >
                    <option value="REALISTIC">REALISTIC</option>
                    <option value="ANIME">ANIME</option>
                    <option value="3D">3D (from 3D ART)</option>
                    <option value="PAINT">PAINT</option>
                    <option value="SKETCH">SKETCH</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-12 text-gray-100 mb-1 ml-1 font-bold italic">RATIO</label>
                  <input
                    type="text"
                    value={assetRatio}
                    onChange={(e) => setAssetRatio(e.target.value)}
                    className="w-full bg-dark-300/80 border border-border-100 rounded-xl px-4 py-2.5 text-12"
                  />
                </div>
                <div>
                  <label className="block text-12 text-gray-100 mb-1 ml-1 font-bold italic">QUALITY</label>
                  <input
                    type="text"
                    value={assetQuality}
                    onChange={(e) => setAssetQuality(e.target.value)}
                    className="w-full bg-dark-300/80 border border-border-100 rounded-xl px-4 py-2.5 text-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-12 text-gray-100 mb-1 ml-1 font-bold italic">REFERENCE IMAGE</label>
                <input
                  type="file"
                  onChange={(e) => setAssetFile(e.target.files?.[0] || null)}
                  className="w-full bg-dark-300/80 border border-white/5 rounded-xl px-4 py-2.5 text-12"
                />
              </div>

              <button
                onClick={handleCreateAsset}
                disabled={assetLoading}
                className="w-full bg-primary-100 hover:bg-primary-300 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-primary-100/10"
              >
                {assetLoading ? "Generating Asset..." : "🚀 Execute POST Request"}
              </button>

              {assetResponse && (
                <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className={`text-14 font-bold mb-3 flex items-center gap-2 ${assetResponse.id ? 'text-green-400' : 'text-red-400'}`}>
                    {assetResponse.id ? 'SUCCESS (Raw Data)' : assetResponse.success ? 'SUCCESS (Wrapped)' : 'ERROR'}
                  </h3>
                  <pre className="bg-black/40 rounded-xl p-4 overflow-x-auto border border-white/5 text-11 text-gray-300 leading-relaxed font-mono max-h-[300px]">
                    {JSON.stringify(assetResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-gray-200 text-14">
          Backend URL: <span className="text-primary-200">{process.env.NEXT_PUBLIC_API_URL}</span>
        </p>
      </div>
    </div>
  );
}
