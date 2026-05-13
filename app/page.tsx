"use client";
import { useState } from 'react';

export default function Dashboard() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [changelog, setChangelog] = useState("");
  const [dllUrl, setDllUrl] = useState("");
  const [dllFile, setDllFile] = useState<File | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setDllFile(e.target.files[0]);
  };

  const handleLogin = async () => {
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username: user, password: pass }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (data.success) {
      setLoggedIn(true);
      setToken(data.token);
      // Fetch current config immediately
      const configRes = await fetch('/api/config', {
        headers: { 'Authorization': `Bearer ${data.token}` }
      });
      const config = await configRes.json();
      setChangelog(config.changelog);
      setDllUrl(config.dll_url);
    } else {
      alert("Invalid credentials");
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    let finalDllUrl = dllUrl;

    try {
      if (dllFile) {
        console.log("Uploading DLL...");
        const response = await fetch(`/api/upload?filename=${dllFile.name}&oldUrl=${dllUrl}`, {
          method: 'POST',
          body: dllFile,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error("Upload failed");
        const newBlob = await response.json();
        finalDllUrl = newBlob.url;
        console.log("New DLL URL:", finalDllUrl);
      }

      console.log("Updating Config...");
      const res = await fetch('/api/config', {
        method: 'POST',
        body: JSON.stringify({ 
          changelog, 
          dll_url: finalDllUrl,
          last_updated: new Date().toLocaleString()
        }),
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await res.json();
      if (res.ok) {
        setDllUrl(finalDllUrl);
        alert("Update published successfully!");
      } else {
        alert("Server Error: " + result.message);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-black text-green-500 flex items-center justify-center font-mono">
        <div className="border border-green-900 p-8 rounded-lg bg-zinc-950 w-96 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
          <h1 className="text-2xl mb-6 text-center tracking-widest">WEEDHACK ADMIN</h1>
          <input 
            type="text" 
            placeholder="Username" 
            className="w-full bg-zinc-900 border border-green-900 p-2 mb-4 outline-none focus:border-green-500 transition-colors"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full bg-zinc-900 border border-green-900 p-2 mb-6 outline-none focus:border-green-500 transition-colors"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          <button 
            onClick={handleLogin}
            className="w-full bg-green-900 hover:bg-green-700 text-black font-bold p-2 transition-all"
          >
            LOGIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-500 p-8 font-mono">
      <div className="max-w-4xl mx-auto border border-green-900 p-8 rounded-lg bg-zinc-950 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
        <div className="flex justify-between items-center mb-8 border-b border-green-900 pb-4">
          <h1 className="text-3xl tracking-tighter">WEEDHACK <span className="text-zinc-600">DASHBOARD</span></h1>
          <button onClick={() => setLoggedIn(false)} className="text-xs hover:text-white underline">LOGOUT</button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <section>
            <h2 className="text-lg mb-2 opacity-70">CHANGELOG</h2>
            <textarea 
              className="w-full h-48 bg-zinc-900 border border-green-900 p-4 outline-none focus:border-green-500 text-sm"
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
            />
          </section>

          <section>
            <h2 className="text-lg mb-2 opacity-70">DLL MANAGEMENT</h2>
            <div className="flex gap-4 mb-4">
              <input 
                type="text" 
                placeholder="Direct URL"
                className="flex-1 bg-zinc-900 border border-green-900 p-3 outline-none focus:border-green-500"
                value={dllUrl}
                onChange={(e) => setDllUrl(e.target.value)}
              />
            </div>
            <div className="border-2 border-dashed border-green-900 p-8 text-center hover:border-green-500 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileChange}
              />
              <p className="text-sm">{dllFile ? `Selected: ${dllFile.name}` : "DRAG & DROP DLL HERE OR CLICK TO UPLOAD"}</p>
              <p className="text-[10px] mt-2 opacity-50">FILES ARE AUTOMATICALLY ENCRYPTED BEFORE STORAGE</p>
            </div>
          </section>

          <button 
            onClick={handleUpdate}
            disabled={loading}
            className={`bg-green-600 hover:bg-green-400 text-black font-bold py-3 px-8 transition-all self-start shadow-[0_0_15px_rgba(34,197,94,0.3)] ${loading ? "opacity-50 cursor-wait" : ""}`}
          >
            {loading ? "UPLOADING..." : "PUBLISH UPDATE"}
          </button>
        </div>
      </div>
    </div>
  );
}
