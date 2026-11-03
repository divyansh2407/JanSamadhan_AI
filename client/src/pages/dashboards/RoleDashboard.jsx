/**
 * JanSamadhan – Role-Specific Dashboard Placeholders
 * Standard branded dashboard interface for each authenticated stakeholder role.
 */

import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  LogOut,
  User,
  Shield,
  Clock,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Building,
  CheckCircle2,
  FileText,
} from 'lucide-react';

const ROLE_META = {
  CITIZEN: {
    title: 'Citizen Dashboard',
    tag: 'Public Resident Portal',
    icon: User,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    actions: [
      { label: 'Report a Civic Issue', desc: 'Stage 4: Geo-tagged problem submission', path: '#report' },
      { label: 'My Reported Issues', desc: 'Stage 4: Track status from submission to resolution', path: '#my-reports' },
      { label: 'Community Feed', desc: 'Stage 6: Neighbourhood discussions & endorsements', path: '#community' },
    ],
  },
  GOVERNMENT: {
    title: 'Government Authority Portal',
    tag: 'Municipal Administration',
    icon: Building,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    actions: [
      { label: 'Department Triage Queue', desc: 'Stage 5: Review AI-categorized complaints', path: '#triage' },
      { label: 'Field Verification Tasks', desc: 'Stage 5: Assign inspection officers', path: '#tasks' },
      { label: 'Civic Health Metrics', desc: 'Stage 5: Municipal resolution analytics', path: '#metrics' },
    ],
  },
  UNIVERSITY: {
    title: 'University & Research Hub',
    tag: 'Academic Innovation Center',
    icon: GraduationCap,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    actions: [
      { label: 'Urban Research Projects', desc: 'Stage 6: Access civic datasets for analysis', path: '#research' },
      { label: 'Propose Sustainable Solutions', desc: 'Stage 6: Submit engineering & policy interventions', path: '#proposals' },
      { label: 'Student Hackathon Challenges', desc: 'Stage 6: Campus innovation challenges', path: '#challenges' },
    ],
  },
  EXPERT: {
    title: 'Domain Expert Console',
    tag: 'Technical Advisory Board',
    icon: Shield,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    actions: [
      { label: 'Technical Case Reviews', desc: 'Stage 5: Review high-priority engineering cases', path: '#reviews' },
      { label: 'Feasibility Assessments', desc: 'Stage 5: Provide structural and ecological sign-offs', path: '#feasibility' },
      { label: 'Policy Recommendations', desc: 'Stage 6: Publish civic guidelines', path: '#guidelines' },
    ],
  },
  INDUSTRY: {
    title: 'Industry Partner Workspace',
    tag: 'Corporate & CSR Collaboration',
    icon: Briefcase,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    actions: [
      { label: 'CSR Civic Sponsorships', desc: 'Stage 6: Fund local sanitation & road projects', path: '#sponsorship' },
      { label: 'Technology Deployments', desc: 'Stage 6: Sensor and IoT pilot programs', path: '#iot' },
      { label: 'Public-Private Partnerships', desc: 'Stage 6: Smart city procurement tenders', path: '#tenders' },
    ],
  },
  SUPER_ADMIN: {
    title: 'Super Administrator Console',
    tag: 'Central System Control',
    icon: Shield,
    color: 'text-navy',
    bg: 'bg-navy/10',
    border: 'border-navy/20',
    actions: [
      { label: 'User & Role Management', desc: 'Authorize officials, universities, and experts', path: '#users' },
      { label: 'Platform Security Logs', desc: 'Review audit trails & authentication logs', path: '#audit' },
      { label: 'System Configuration', desc: 'Configure Grok AI endpoints & city wards', path: '#config' },
    ],
  },
};

export default function RoleDashboard({ roleKey }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const meta = ROLE_META[roleKey] || ROLE_META.CITIZEN;
  const RoleIcon = meta.icon;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-civic-bg flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-civic-border sticky top-0 z-30">
        <div className="section-container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-navy flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="block text-sm font-bold text-navy">
                Jan<span className="text-green">Samadhan</span>
              </span>
              <span className="block text-[9px] font-medium text-civic-secondary uppercase tracking-widest">
                {meta.tag}
              </span>
            </div>
          </Link>

          {/* User profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-navy">{user?.name}</span>
              <span className="text-[10px] text-civic-secondary">{user?.email}</span>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>
              {user?.role}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10">
        <div className="section-container">
          {/* Welcome Banner */}
          <div className="card p-8 mb-8 border-l-4 border-l-green">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl ${meta.bg} border ${meta.border} flex items-center justify-center shrink-0`}>
                  <RoleIcon className={`w-7 h-7 ${meta.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-green">
                      Stage 3 Authentication Active
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-green" />
                  </div>
                  <h1 className="text-2xl font-bold text-navy">{meta.title}</h1>
                  <p className="text-sm text-civic-secondary mt-1 max-w-xl">
                    Welcome back, <strong className="text-navy">{user?.name}</strong>. You are authenticated with verified{' '}
                    <strong className="text-navy">{user?.role}</strong> role permissions.
                  </p>
                </div>
              </div>

              {/* Status pill */}
              <div className="bg-civic-bg p-4 rounded-xl border border-civic-border flex flex-col gap-1 text-xs">
                <div className="flex items-center gap-2 text-civic-secondary">
                  <Clock size={14} className="text-green" />
                  <span>Session: Active (HTTP-Only JWT)</span>
                </div>
                <div className="flex items-center gap-2 text-civic-secondary">
                  <Shield size={14} className="text-navy" />
                  <span>Phone: {user?.phone || 'Verified'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Planned Features Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3 mb-8">
            <FileText className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold mb-0.5">Stage 3 Milestone Completed:</strong>
              This dashboard is a secure role-protected placeholder demonstrating authentication, token validation, and RBAC redirects. Full functional modules (problem reporting, GIS maps, AI triage) will be integrated in subsequent stages.
            </div>
          </div>

          {/* Quick Action Cards */}
          <h2 className="text-lg font-bold text-navy mb-4">Planned Role Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {meta.actions.map((act) => (
              <div key={act.label} className="card p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-green uppercase tracking-wider block mb-1">
                    Upcoming Feature
                  </span>
                  <h3 className="text-base font-bold text-navy mb-2">{act.label}</h3>
                  <p className="text-xs text-civic-secondary leading-relaxed mb-4">
                    {act.desc}
                  </p>
                </div>
                <div className="pt-4 border-t border-civic-border flex items-center justify-between text-xs text-civic-secondary">
                  <span>Status: Pending Stage</span>
                  <ArrowRight size={14} className="text-civic-border" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-civic-border bg-white py-4 text-center text-xs text-civic-secondary">
        © {new Date().getFullYear()} JanSamadhan · Authenticated as {user?.role} ({user?.email})
      </footer>
    </div>
  );
}

// Named exports for each role
export function CitizenDashboard() {
  return <RoleDashboard roleKey="CITIZEN" />;
}

export function GovernmentDashboard() {
  return <RoleDashboard roleKey="GOVERNMENT" />;
}

export function UniversityDashboard() {
  return <RoleDashboard roleKey="UNIVERSITY" />;
}

export function ExpertDashboard() {
  return <RoleDashboard roleKey="EXPERT" />;
}

export function IndustryDashboard() {
  return <RoleDashboard roleKey="INDUSTRY" />;
}

export function AdminDashboard() {
  return <RoleDashboard roleKey="SUPER_ADMIN" />;
}
