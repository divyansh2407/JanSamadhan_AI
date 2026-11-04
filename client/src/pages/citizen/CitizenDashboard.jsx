/**
 * JanSamadhan – Master Citizen Dashboard (Stage 5)
 * Modern, responsive, government-tech citizen portal.
 * Features:
 * - Collapsible Sidebar navigation with 7 core tabs
 * - Top navigation bar with live search, notifications badge, avatar dropdown
 * - Time-aware personalized greeting with actual citizen profile
 * - 4 live statistics summary cards
 * - Filterable, searchable, paginated My Reports table
 * - 7-step resolution progress timeline modal with actual history and rejection reasons
 * - Real-time activity stream and in-app notifications
 * - Full profile management view with civic scorecard
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Search,
  Bell,
  User,
  HelpCircle,
  LogOut,
  PlusCircle,
  Menu,
  X,
  ChevronDown,
  Clock,
  Wrench,
  CheckCircle2,
  FolderOpen,
  Sparkles,
  Shield,
  Activity,
} from 'lucide-react';

import citizenService from '../../services/citizenService';
import StatsCard from '../../components/citizen/StatsCard';
import ReportsTable from '../../components/citizen/ReportsTable';
import StatusTimelineModal from '../../components/citizen/StatusTimelineModal';
import ActivityStream from '../../components/citizen/ActivityStream';
import NotificationsModal from '../../components/citizen/NotificationsModal';
import ProfileView from '../../components/citizen/ProfileView';
import HelpSupportModal from '../../components/citizen/HelpSupportModal';
import PreReportNoticeModal from '../../components/citizen/PreReportNoticeModal';

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation and View states
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'reports' | 'profile'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Modal states
  const [selectedReport, setSelectedReport] = useState(null);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isReportNoticeOpen, setIsReportNoticeOpen] = useState(false);

  // Data states
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [reportsData, setReportsData] = useState({ reports: [], pagination: {} });
  const [categories, setCategories] = useState([]);
  const [filterParams, setFilterParams] = useState({ page: 1, limit: 10, search: '', status: '', categoryId: '' });
  const [userProfile, setUserProfile] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Time-aware greeting calculation
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Fetch dashboard summary
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const data = await citizenService.getDashboardSummary();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setFetchError('Could not connect to the JanSamadhan backend service. Please ensure the server is running.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch citizen reports
  const fetchReports = useCallback(async () => {
    try {
      const data = await citizenService.getMyReports(filterParams);
      if (data) {
        setReportsData({
          reports: data.reports || [],
          pagination: data.pagination || {},
        });
      }
    } catch (err) {
      console.error('Failed to load citizen reports:', err);
    }
  }, [filterParams]);

  // Fetch full profile info
  const fetchProfile = useCallback(async () => {
    try {
      const data = await citizenService.getProfile();
      setUserProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchReports();
    fetchProfile();
  }, [fetchDashboardData, fetchReports, fetchProfile]);

  // Extract distinct categories from reports for filtering
  useEffect(() => {
    if (reportsData.reports.length > 0) {
      const uniqueMap = {};
      reportsData.reports.forEach((r) => {
        if (r.category && !uniqueMap[r.category.id]) {
          uniqueMap[r.category.id] = r.category;
        }
      });
      setCategories(Object.values(uniqueMap));
    }
  }, [reportsData.reports]);

  // Handlers
  const handleOpenTimeline = async (report) => {
    try {
      // Fetch full details with status history
      const fullReport = await citizenService.getReportById(report.id);
      setSelectedReport(fullReport || report);
    } catch (err) {
      console.error('Error fetching report details:', err);
      setSelectedReport(report);
    }
    setIsTimelineModalOpen(true);
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await citizenService.markNotificationAsRead(id);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilterParams((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilterParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const citizenName = user?.name || dashboardData?.user?.name || 'Citizen';
  const unreadNotifications = dashboardData?.notifications?.unreadCount || 0;

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-civic-text flex">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. SIDEBAR NAVIGATION                                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-civic-border flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-6 border-b border-civic-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-green-600 text-white flex items-center justify-center font-extrabold shadow-sm">
                JS
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-navy">
                  JanSamadhan
                </span>
                <span className="text-[10px] uppercase font-bold text-green-700 block tracking-widest leading-none">
                  Citizen Portal
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 text-civic-secondary hover:text-civic-text md:hidden rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1 text-sm font-semibold">
            {/* 1. Dashboard */}
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-green-50 text-green-700 font-bold border border-green-200 shadow-xs'
                  : 'text-civic-secondary hover:bg-gray-100 hover:text-civic-text'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>

            {/* 2. My Reports */}
            <button
              onClick={() => {
                setActiveTab('reports');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'reports'
                  ? 'bg-green-50 text-green-700 font-bold border border-green-200 shadow-xs'
                  : 'text-civic-secondary hover:bg-gray-100 hover:text-civic-text'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 shrink-0" />
                <span>My Reports</span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-gray-100 text-civic-secondary">
                {dashboardData?.statistics?.totalReports ?? 0}
              </span>
            </button>

            {/* 3. Track Issues (Opens status timeline modal on most recent or switches to reports) */}
            <button
              onClick={() => {
                setActiveTab('reports');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-civic-secondary hover:bg-gray-100 hover:text-civic-text transition-all"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span>Track Issues</span>
            </button>

            {/* 4. Notifications */}
            <button
              onClick={() => {
                setIsNotificationsModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-civic-secondary hover:bg-gray-100 hover:text-civic-text transition-all"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 shrink-0" />
                <span>Notifications</span>
              </div>
              {unreadNotifications > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-600 text-white animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* 5. My Profile */}
            <button
              onClick={() => {
                setActiveTab('profile');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'profile'
                  ? 'bg-green-50 text-green-700 font-bold border border-green-200 shadow-xs'
                  : 'text-civic-secondary hover:bg-gray-100 hover:text-civic-text'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>My Profile</span>
            </button>

            {/* 6. Help & Support */}
            <button
              onClick={() => {
                setIsHelpModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-civic-secondary hover:bg-gray-100 hover:text-civic-text transition-all"
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Help & Support</span>
            </button>

            {/* 7. Government Administration Portal */}
            <button
              onClick={() => {
                navigate('/government/dashboard');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all font-semibold"
            >
              <Shield className="w-4 h-4 shrink-0 text-amber-700" />
              <span>Gov Admin Portal</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer with Logout */}
        <div className="p-4 border-t border-civic-border space-y-2">
          <div className="p-3 bg-gray-50 rounded-2xl border border-civic-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm shrink-0">
              {citizenName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <span className="font-bold text-xs text-civic-text block truncate">
                {citizenName}
              </span>
              <span className="text-[11px] text-civic-secondary block truncate">
                {user?.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-rose-700 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-xs"
        />
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MAIN CONTENT AREA                                                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* ───────────────────────────────────────────────────────────────── */}
        {/* 2. TOP NAVIGATION BAR                                             */}
        {/* ───────────────────────────────────────────────────────────────── */}
        <header className="h-16 bg-white border-b border-civic-border px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl border border-civic-border text-civic-secondary md:hidden hover:bg-gray-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Title */}
            <div>
              <h2 className="text-sm md:text-base font-bold text-civic-text capitalize">
                {activeTab === 'dashboard'
                  ? 'Citizen Dashboard'
                  : activeTab === 'reports'
                  ? 'My Submitted Complaints'
                  : 'Resident Profile & Settings'}
              </h2>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Gov Admin Portal Quick Link */}
            <button
              onClick={() => navigate('/government/dashboard')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-all shadow-xs"
              title="Switch to Municipal Administration & Verification Portal"
            >
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              <span>Gov Portal</span>
            </button>

            {/* Quick Action Button */}
            <button
              onClick={() => navigate('/report/submit?mode=registered')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotificationsModalOpen(true)}
              className="relative p-2.5 rounded-xl border border-civic-border text-civic-secondary hover:text-civic-text hover:bg-gray-50 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-600 ring-2 ring-white" />
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-civic-border hover:bg-gray-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-green-100 text-green-800 flex items-center justify-center font-bold text-xs">
                  {citizenName.charAt(0).toUpperCase()}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-civic-secondary hidden sm:block" />
              </button>

              {isProfileMenuOpen && (
                <div
                  onMouseLeave={() => setIsProfileMenuOpen(false)}
                  className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-civic-border shadow-xl py-2 z-50 text-xs font-semibold animate-fade-in-up"
                >
                  <div className="px-3 py-2 border-b border-civic-border">
                    <span className="font-bold text-civic-text block truncate">{citizenName}</span>
                    <span className="text-civic-secondary text-[11px] block truncate font-mono">
                      {user?.email}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 text-civic-text flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-green-600" />
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      setIsHelpModalOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 text-civic-text flex items-center gap-2"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-green-600" />
                    Help & Support
                  </button>
                  <div className="border-t border-civic-border my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 text-left hover:bg-rose-50 text-rose-700 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* 3. DASHBOARD MAIN VIEW CONTENT                                    */}
        {/* ───────────────────────────────────────────────────────────────── */}
        <main className="p-4 md:p-8 space-y-6">
          {fetchError && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                {fetchError}
              </span>
              <button
                onClick={fetchDashboardData}
                className="px-3 py-1 bg-amber-600 text-white rounded-lg font-bold text-xs hover:bg-amber-700 transition-colors"
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* TAB: DASHBOARD OVERVIEW                                          */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {activeTab === 'dashboard' && (
            <>
              {/* 3.1 WELCOME BANNER (Section 5) */}
              <div className="relative overflow-hidden bg-gradient-to-br from-green-700 via-green-800 to-navy text-white rounded-3xl p-6 md:p-8 shadow-md">
                <div className="relative z-10 max-w-2xl space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-green-100 border border-white/15">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Civic Problem Solving Platform
                  </div>

                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {getGreeting()}, {citizenName}!
                  </h1>

                  <p className="text-sm md:text-base text-green-100/90 leading-relaxed font-medium">
                    Your voice matters. Together, let&apos;s make our city better by identifying and solving civic bottlenecks.
                  </p>

                  <div className="pt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => navigate('/report/submit?mode=registered')}
                      className="px-5 py-2.5 rounded-xl bg-white text-green-900 font-bold text-xs md:text-sm hover:bg-green-50 shadow-sm transition-all flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4 text-green-700" />
                      Report a Civic Issue
                    </button>

                    <button
                      onClick={() => setActiveTab('reports')}
                      className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs md:text-sm border border-white/20 transition-all flex items-center gap-2"
                    >
                      <FolderOpen className="w-4 h-4" />
                      View All My Reports
                    </button>
                  </div>
                </div>

                {/* Subtle Decorative Pattern */}
                <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl" />
              </div>

              {/* 3.2 DASHBOARD STATISTICS (Section 3) */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                <StatsCard
                  title="Total Reports"
                  count={dashboardData?.statistics?.totalReports}
                  icon={FolderOpen}
                  accentColor="text-blue-700"
                  bgColor="bg-blue-50"
                  borderColor="border-blue-200"
                  description="Lifetime complaints"
                  isLoading={isLoading}
                />
                <StatsCard
                  title="Pending Reports"
                  count={dashboardData?.statistics?.pendingReports}
                  icon={Clock}
                  accentColor="text-amber-700"
                  bgColor="bg-amber-50"
                  borderColor="border-amber-200"
                  description="Awaiting triage"
                  isLoading={isLoading}
                />
                <StatsCard
                  title="Under Review"
                  count={dashboardData?.statistics?.underReviewReports || 0}
                  icon={Search}
                  accentColor="text-purple-700"
                  bgColor="bg-purple-50"
                  borderColor="border-purple-200"
                  description="In verification"
                  isLoading={isLoading}
                />
                <StatsCard
                  title="In Progress"
                  count={dashboardData?.statistics?.inProgressReports}
                  icon={Wrench}
                  accentColor="text-emerald-700"
                  bgColor="bg-emerald-50"
                  borderColor="border-emerald-200"
                  description="Field team deployed"
                  isLoading={isLoading}
                />
                <StatsCard
                  title="Resolved Reports"
                  count={dashboardData?.statistics?.resolvedReports}
                  icon={CheckCircle2}
                  accentColor="text-green-700"
                  bgColor="bg-green-50"
                  borderColor="border-green-200"
                  description="Verified completed"
                  isLoading={isLoading}
                />
              </div>

              {/* 3.3 GRID: MY RECENT REPORTS + ACTIVITY FEED */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ReportsTable
                    reports={reportsData.reports}
                    pagination={reportsData.pagination}
                    categories={categories}
                    onPageChange={handlePageChange}
                    onFilterChange={handleFilterChange}
                    onViewDetails={handleOpenTimeline}
                    isLoading={isLoading}
                  />
                </div>

                <div className="space-y-6">
                  {/* Recent Activity Stream (Section 9) */}
                  <ActivityStream
                    activities={dashboardData?.recentActivity}
                    onViewProblem={async (problemId) => {
                      const rep = await citizenService.getReportById(problemId);
                      if (rep) {
                        setSelectedReport(rep);
                        setIsTimelineModalOpen(true);
                      }
                    }}
                    isLoading={isLoading}
                  />

                  {/* Quick Civic Tips Card */}
                  <div className="p-5 rounded-3xl bg-emerald-50/60 border border-emerald-200 space-y-2 text-xs text-emerald-950">
                    <h4 className="font-bold flex items-center gap-1.5 text-sm">
                      <Shield className="w-4 h-4 text-emerald-700 shrink-0" />
                      Citizen Charter Guarantee
                    </h4>
                    <p className="leading-relaxed">
                      All civic reports on JanSamadhan are subject to statutory service delivery deadlines. If an issue is delayed, our system escalates it to the Zonal Ward Officer automatically.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* TAB: ALL MY REPORTS (Section 7)                                  */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <ReportsTable
                reports={reportsData.reports}
                pagination={reportsData.pagination}
                categories={categories}
                onPageChange={handlePageChange}
                onFilterChange={handleFilterChange}
                onViewDetails={handleOpenTimeline}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* TAB: MY PROFILE (Section 11)                                     */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <ProfileView
              profile={userProfile || dashboardData?.user}
              onProfileUpdated={fetchProfile}
            />
          )}
        </main>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. MODALS & DIALOGS                                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4.1 Resolution Progress Timeline Modal (Section 8) */}
      <StatusTimelineModal
        report={selectedReport}
        isOpen={isTimelineModalOpen}
        onClose={() => setIsTimelineModalOpen(false)}
      />

      {/* 4.2 Notifications Modal (Section 10) */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={dashboardData?.notifications?.items || []}
        unreadCount={unreadNotifications}
        onMarkRead={handleMarkNotificationRead}
        onViewReport={async (problemId) => {
          const rep = await citizenService.getReportById(problemId);
          if (rep) {
            setSelectedReport(rep);
            setIsTimelineModalOpen(true);
          }
        }}
      />

      {/* 4.3 Help & Civic Support Modal */}
      <HelpSupportModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* 4.4 Report Issue Notice Modal (Section 5) */}
      <PreReportNoticeModal
        isOpen={isReportNoticeOpen}
        onClose={() => setIsReportNoticeOpen(false)}
      />
    </div>
  );
}

