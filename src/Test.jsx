import { useState } from "react";

export default function Test() {
  const [backendUrl] = useState(import.meta.env.VITE_BACKEND_URL || "");
  return (
    <div className="p-6 text-white">
      <div>Backend URL: {backendUrl || "(not set)"}</div>
      <div className="text-sm text-slate-300 mt-2">Set VITE_BACKEND_URL env to point frontend to backend.</div>
    </div>
  );
}
