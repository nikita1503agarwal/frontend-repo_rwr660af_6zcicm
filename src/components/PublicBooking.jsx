import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const api = (path) => `${import.meta.env.VITE_BACKEND_URL || ""}${path}`;

export default function PublicBooking() {
  const { slug } = useParams();
  const [org, setOrg] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [when, setWhen] = useState("");
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(api(`/public/${slug}`));
      if (res.ok) {
        const data = await res.json();
        setOrg(data.organization);
        setServices(data.services || []);
      }
    })();
  }, [slug]);

  const book = async (e) => {
    e.preventDefault();
    if (!org || !selectedService || !when || !customer.name) return;
    const res = await fetch(api("/public/book"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organization_id: org.id,
        service_id: selectedService,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        start_time: new Date(when).toISOString(),
      })
    });
    if (res.ok) {
      const data = await res.json();
      setResult(data);
    }
  };

  if (!org) {
    return <div className="p-4 text-center text-slate-200">Loading…</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold text-white text-center">Book with {org.name}</h1>

      {!result ? (
        <form onSubmit={book} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-3">
          <div>
            <label className="text-slate-300 text-sm">Service</label>
            <select className="w-full bg-slate-900 text-white p-2 rounded" value={selectedService || ""} onChange={(e)=>setSelectedService(e.target.value)} required>
              <option value="" disabled>Select a service</option>
              {services.map((s)=> (
                <option key={s.id} value={s.id}>{s.name} {s.price>0 ? `- $${s.price}` : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-slate-300 text-sm">When</label>
            <input type="datetime-local" className="w-full bg-slate-900 text-white p-2 rounded" value={when} onChange={(e)=>setWhen(e.target.value)} required />
          </div>
          <div>
            <label className="text-slate-300 text-sm">Your name</label>
            <input className="w-full bg-slate-900 text-white p-2 rounded" value={customer.name} onChange={(e)=>setCustomer({...customer, name:e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className="bg-slate-900 text-white p-2 rounded" placeholder="Email" type="email" value={customer.email} onChange={(e)=>setCustomer({...customer, email:e.target.value})} />
            <input className="bg-slate-900 text-white p-2 rounded" placeholder="Phone" value={customer.phone} onChange={(e)=>setCustomer({...customer, phone:e.target.value})} />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded">Book tentative</button>
        </form>
      ) : (
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 text-slate-200 text-center">
          <div className="font-medium">Thanks! Your booking is tentative.</div>
          <div className="text-sm mt-2">Save this code to modify your booking:</div>
          <div className="mt-2 font-mono text-white">{result.public_code}</div>
        </div>
      )}
    </div>
  );
}
