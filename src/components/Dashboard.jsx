import { useEffect, useMemo, useState } from "react";

const api = (path) => `${import.meta.env.VITE_BACKEND_URL || ""}${path}`;

export default function Dashboard() {
  // Minimal org bootstrap for demo
  const [org, setOrg] = useState(null);
  const [services, setServices] = useState([]);
  const [appts, setAppts] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", slug: "" });
  const [serviceForm, setServiceForm] = useState({ name: "", duration_minutes: 60, price: 0, is_quote_only: false, requires_deposit: false, deposit_amount: 0 });
  const [statusFilter, setStatusFilter] = useState("");

  const publicUrl = useMemo(() => org ? `${window.location.origin}/b/${org.slug}` : "", [org]);

  useEffect(() => {
    // no-op: in a real app we'd fetch current org (auth). Here it's manual create.
  }, []);

  const createOrg = async (e) => {
    e.preventDefault();
    const res = await fetch(api("/dashboard/org"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) {
      const data = await res.json();
      setOrg({ id: data.organization_id, ...form });
    }
  };

  const createService = async (e) => {
    e.preventDefault();
    if (!org) return;
    const res = await fetch(api("/dashboard/service"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...serviceForm, organization_id: org.id }) });
    if (res.ok) {
      const data = await res.json();
      setServices((s) => [...s, { id: data.service_id, ...serviceForm }]);
      setServiceForm({ name: "", duration_minutes: 60, price: 0, is_quote_only: false, requires_deposit: false, deposit_amount: 0 });
    }
  };

  const loadAppts = async () => {
    if (!org) return;
    const url = new URL(api("/dashboard/appointments"));
    url.searchParams.set("organization_id", org.id);
    if (statusFilter) url.searchParams.set("status", statusFilter);
    const res = await fetch(url.toString());
    if (res.ok) {
      const data = await res.json();
      setAppts(data.items || []);
    }
  };

  const confirm = async (id) => {
    await fetch(api("/dashboard/confirm"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appointment_id: id }) });
    loadAppts();
  };

  useEffect(() => { loadAppts(); }, [org, statusFilter]);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold text-white">Tradie Dashboard</h1>

      {!org && (
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
          <h2 className="text-white font-medium mb-2">Create your business profile</h2>
          <form onSubmit={createOrg} className="grid grid-cols-1 gap-3">
            <input className="bg-slate-900 text-white p-2 rounded" placeholder="Business Name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required/>
            <input className="bg-slate-900 text-white p-2 rounded" placeholder="Contact Email" type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} required/>
            <input className="bg-slate-900 text-white p-2 rounded" placeholder="Public slug (e.g. acme-plumbing)" value={form.slug} onChange={(e)=>setForm({...form, slug:e.target.value})} required/>
            <button className="bg-blue-600 hover:bg-blue-500 text-white py-2 rounded transition">Create</button>
          </form>
        </div>
      )}

      {org && (
        <>
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-white font-medium">{org.name}</div>
                <div className="text-slate-300 text-sm break-all">Public booking link: <a className="text-blue-400 underline" href={publicUrl} target="_blank" rel="noreferrer">{publicUrl}</a></div>
              </div>
              <div className="text-xs text-slate-400">Slug: {org.slug}</div>
            </div>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
            <h3 className="text-white font-medium mb-2">Services</h3>
            <form onSubmit={createService} className="grid grid-cols-2 gap-2 text-sm">
              <input className="bg-slate-900 text-white p-2 rounded col-span-2" placeholder="Name" value={serviceForm.name} onChange={(e)=>setServiceForm({...serviceForm, name:e.target.value})} required/>
              <input className="bg-slate-900 text-white p-2 rounded" placeholder="Duration (min)" type="number" value={serviceForm.duration_minutes} onChange={(e)=>setServiceForm({...serviceForm, duration_minutes:Number(e.target.value)})} required/>
              <input className="bg-slate-900 text-white p-2 rounded" placeholder="Price" type="number" step="0.01" value={serviceForm.price} onChange={(e)=>setServiceForm({...serviceForm, price:Number(e.target.value)})} />
              <label className="flex items-center gap-2 text-slate-300"><input type="checkbox" checked={serviceForm.is_quote_only} onChange={(e)=>setServiceForm({...serviceForm, is_quote_only:e.target.checked})}/> Quote only</label>
              <label className="flex items-center gap-2 text-slate-300"><input type="checkbox" checked={serviceForm.requires_deposit} onChange={(e)=>setServiceForm({...serviceForm, requires_deposit:e.target.checked})}/> Requires deposit</label>
              {serviceForm.requires_deposit && (
                <input className="bg-slate-900 text-white p-2 rounded" placeholder="Deposit Amount" type="number" step="0.01" value={serviceForm.deposit_amount} onChange={(e)=>setServiceForm({...serviceForm, deposit_amount:Number(e.target.value)})} />
              )}
              <button className="bg-blue-600 hover:bg-blue-500 text-white py-2 rounded col-span-2 mt-2">Add Service</button>
            </form>
            <ul className="mt-3 space-y-2">
              {services.map((s)=> (
                <li key={s.id} className="text-slate-200 text-sm flex justify-between bg-slate-900/60 p-2 rounded">
                  <span>{s.name}</span>
                  <span className="text-slate-400">{s.duration_minutes}m · ${s.price}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-medium">Appointments</h3>
              <select className="bg-slate-900 text-white p-2 rounded text-sm" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
                <option value="">All</option>
                <option value="tentative">Tentative</option>
                <option value="confirmed">Confirmed</option>
                <option value="deposit_paid">Deposit Paid</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
                <option value="missed">Missed</option>
              </select>
            </div>
            <button onClick={loadAppts} className="text-xs text-blue-400 underline">Refresh</button>
            <ul className="mt-3 space-y-2">
              {appts.map((a)=> (
                <li key={a.id} className="p-3 rounded bg-slate-900/60 text-slate-200 text-sm flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{a.customer_name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-700">{a.status}</span>
                  </div>
                  <div className="text-slate-400 text-xs">{new Date(a.start_time).toLocaleString()} - {new Date(a.end_time).toLocaleTimeString()}</div>
                  {a.status === "tentative" && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={()=>confirm(a.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs">Confirm</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
