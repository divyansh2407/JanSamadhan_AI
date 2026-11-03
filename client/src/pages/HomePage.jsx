import { useState, useEffect } from 'react';
import { Globe, Zap, Shield, Users, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

/**
 * HomePage – Stage 1 placeholder page.
 * Displays the project identity and current build status.
 * A full landing page will be implemented in a later stage.
 */
function HomePage() {
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking' | 'online' | 'offline'
  const [apiMessage, setApiMessage] = useState('');

  // Poll the backend health endpoint once on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await axios.get('/api/health', { timeout: 5000 });
        if (res.data?.success) {
          setApiStatus('online');
          setApiMessage(res.data.message);
        } else {
          setApiStatus('offline');
        }
      } catch {
        setApiStatus('offline');
        setApiMessage('Backend not reachable – start the server with npm run dev:server');
      }
    };

    checkHealth();
  }, []);

  const stages = [
    { id: 1, name: 'Project Foundation & Architecture', status: 'complete' },
    { id: 2, name: 'Authentication & User Management',  status: 'pending'  },
    { id: 3, name: 'Citizen Dashboard & Problem Reporting', status: 'pending' },
    { id: 4, name: 'Admin Panel & Case Management',    status: 'pending'  },
    { id: 5, name: 'AI Integration (Grok)',             status: 'pending'  },
    { id: 6, name: 'Maps, Notifications & Collaboration', status: 'pending' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-orange-600 flex flex-col">

      {/* ── Header bar ──────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">BETA</span>
          <span className="text-white/60 text-sm">Stage 1 – Foundation</span>
        </div>
        <span className="text-white/60 text-sm">v1.0.0</span>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">

        {/* Logo mark */}
        <div className="mb-6 w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <Globe className="w-10 h-10 text-orange-400" />
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-3">
          JAN <span className="text-orange-400">SAMADHAN</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/80 font-light mb-2">
          AI-Powered Civic Problem Solving Platform
        </p>
        <p className="text-white/50 text-sm mb-10">
          Empowering citizens. Enabling governance. Transforming Indian cities.
        </p>

        {/* API status badge */}
        <div className="mb-10">
          {apiStatus === 'checking' && (
            <span className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/40 text-yellow-200 text-sm px-4 py-2 rounded-full">
              <Clock className="w-4 h-4 animate-pulse" />
              Checking backend status…
            </span>
          )}
          {apiStatus === 'online' && (
            <span className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/40 text-green-200 text-sm px-4 py-2 rounded-full">
              <CheckCircle className="w-4 h-4" />
              {apiMessage || 'Backend online'}
            </span>
          )}
          {apiStatus === 'offline' && (
            <span className="inline-flex items-center gap-2 bg-red-500/20 border border-red-400/40 text-red-200 text-sm px-4 py-2 rounded-full">
              <Shield className="w-4 h-4" />
              Backend offline – run npm run dev:server
            </span>
          )}
        </div>

        {/* Feature teaser cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full mb-12">
          {[
            { icon: Users,  label: 'Citizen Portal',    desc: 'Report & track civic issues'    },
            { icon: Zap,    label: 'AI-Powered',        desc: 'Grok AI categorisation & routing' },
            { icon: Shield, label: 'Admin Dashboard',   desc: 'Governance & resolution tools'   },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 text-left"
            >
              <Icon className="w-6 h-6 text-orange-400 mb-2" />
              <p className="text-white font-semibold text-sm">{label}</p>
              <p className="text-white/60 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>

        {/* Development roadmap */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-lg w-full text-left">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="text-orange-400">◆</span> Development Roadmap
          </h2>
          <ul className="space-y-2">
            {stages.map((stage) => (
              <li key={stage.id} className="flex items-center gap-3 text-sm">
                {stage.status === 'complete' ? (
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-white/30 shrink-0" />
                )}
                <span className={stage.status === 'complete' ? 'text-white' : 'text-white/50'}>
                  Stage {stage.id} – {stage.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="text-center py-6 text-white/30 text-xs">
        © {new Date().getFullYear()} JanSamadhan · Built for Indian Cities · Stage 1 Complete
      </footer>
    </div>
  );
}

export default HomePage;
