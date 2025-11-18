import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const api = (path) => `${import.meta.env.VITE_BACKEND_URL || ""}${path}`;

export default function PublicBooking() {
  const { slug } = useParams();
  const [org, setOrg] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [result, setResult] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

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

  const loadSlots = async () => {
    if (!org || !selectedService || !selectedDate) return;
    setLoadingSlots(true);
    const url = new URL(api(`/public/slots`));
    url.searchParams.set("organization_id", org.id);
    url.searchParams.set("service_id", selectedService);
    url.searchParams.set("date_str", selectedDate);
    url.searchParams.set("days", "7");
    const res = await fetch(url.toString());
    if (res.ok) {
      const data = await res.json();
      setSlots(data.slots || []);
    }
    setLoadingSlots(false);
  };

  const book = async (startISO) => {
    if (!org || !selectedService || !startISO || !customer.name) return;
    const res = await fetch(api("/public/book"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organization_id: org.id,
        service_id: selectedService,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        start_time: startISO,
      })
    });
    if (res.ok) {
      const data = await res.json();
      setResult(data);
    } else {
      const err = await res.json().catch(()=>({detail:"Unable to book"}));
      alert(err.detail || "Unable to book this slot");
    }
  };

  if (!org) {
    return <div className="p-4 text-center text-slate-200">Loading…</div>;
  }

  const grouped = slots.reduce((acc, s) => {
    const d = new Date(s.start);
    const key = d.toDateString();
    acc[key] = acc[key] || [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold text-white text-center">Book with {org.name}</h1>

      {!result ? (
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-4">
          <div>
            <label className="text-slate-300 text-sm">Service</label>
            <select className="w-full bg-slate-900 text-white p-2 rounded" value={selectedService} onChange={(e)=>{setSelectedService(e.target.value); setSlots([]);}} required>
              <option value="" disabled>Select a service</option>
              {services.map((s)=> (
                <option key={s.id} value={s.id}>{s.name} {s.price>0 ? `- $${s.price}` : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-slate-300 text-sm">Start from date</label>
            <div className="flex gap-2">
              <input type="date" className="w-full bg-slate-900 text-white p-2 rounded" value={selectedDate} onChange={(e)=>{setSelectedDate(e.target.value); setSlots([]);}} required />
              <button onClick={loadSlots} className="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded disabled:opacity-50" disabled={!selectedService || !selectedDate || loadingSlots}>{loadingSlots? 'Loading…':'Find slots'}</button>
            </div>
          </div>

          <div>
            <label className="text-slate-300 text-sm">Your details</label>
            <input className="w-full bg-slate-900 text-white p-2 rounded mt-1" placeholder="Your name" value={customer.name} onChange={(e)=>setCustomer({...customer, name:e.target.value})} required />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <input className="bg-slate-900 text-white p-2 rounded" placeholder="Email" type="email" value={customer.email} onChange={(e)=>setCustomer({...customer, email:e.target.value})} />
              <input className="bg-slate-900 text-white p-2 rounded" placeholder="Phone" value={customer.phone} onChange={(e)=>setCustomer({...customer, phone:e.target.value})} />
            </div>
          </div>

          <div>
            <div className="text-slate-300 text-sm mb-2">Available slots (next 7 days)</div>
            {slots.length === 0 && (
              <div className="text-slate-400 text-sm">No slots loaded. Choose service and date, then tap Find slots.</div>
            )}
            <div className="space-y-3">
              {Object.keys(grouped).map(day => (
                <div key={day} className="bg-slate-900/60 p-2 rounded">
                  <div className="text-slate-200 text-sm mb-1">{day}</div>
                  <div className="flex flex-wrap gap-2">
                    {grouped[day].map((s, idx) => (
                      <button key={idx} onClick={()=>book(s.start)} className="px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
                        {new Date(s.start).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
