import Dashboard from "./components/Dashboard";
import { Link } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-slate-900/70 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold">Tradie Scheduler</Link>
          <nav className="text-sm text-slate-300">Mobile-first • Clean UI</nav>
        </div>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App