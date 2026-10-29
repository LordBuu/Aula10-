/**
 * Main Application Component for Vacation Management System
 */
import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { VacationRequest, UserProfile, VacationLog } from './types/vacation';
import {
  subscribeToAllVacationRequests,
  subscribeToAllUsers,
  subscribeToLogs,
} from './services/firebaseService';

// Pages
import { LoginView } from './pages/LoginView';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { RequestVacationView } from './pages/RequestVacationView';
import { EmployeeHistoryView } from './pages/EmployeeHistoryView';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { ManagerReviewView } from './pages/ManagerReviewView';
import { ManagerTeamHistoryView } from './pages/ManagerTeamHistoryView';
import { TeamCalendarView } from './pages/TeamCalendarView';
import { HrDashboard } from './pages/HrDashboard';
import { HrRegistrationView } from './pages/HrRegistrationView';
import { HrEmployeesView } from './pages/HrEmployeesView';
import { HrAuditView } from './pages/HrAuditView';
import { ProfileAndSettingsView } from './pages/ProfileAndSettingsView';
import { AcademicRequirementsView } from './pages/AcademicRequirementsView';

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Firestore real-time collections - kept warm in memory
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<VacationLog[]>([]);

  // Track previous role to automatically switch dashboard view only when role changes
  const prevRoleRef = useRef<string | undefined>(currentUser?.role);

  // Subscribe to Firestore collections ONCE on mount so data is always instantly ready
  useEffect(() => {
    const unsubRequests = subscribeToAllVacationRequests((data) => {
      setRequests(data);
    });

    const unsubUsers = subscribeToAllUsers((data) => {
      setAllUsers(data);
    });

    const unsubLogs = subscribeToLogs((data) => {
      setLogs(data);
    });

    return () => {
      unsubRequests();
      unsubUsers();
      unsubLogs();
    };
  }, []); // Run once! Persistent listener

  // Automatically update tab when switching to a different user role
  useEffect(() => {
    if (!currentUser) {
      setActiveTab('login');
      return;
    }

    const prevRole = prevRoleRef.current;
    const currentRole = currentUser.role;

    if (prevRole !== currentRole) {
      prevRoleRef.current = currentRole;

      // Keep shared tabs like calendar, profile, requirements
      if (activeTab === 'calendar' || activeTab === 'profile' || activeTab === 'requirements') {
        return;
      }

      // Route to role's home panel
      if (currentRole === 'employee') {
        setActiveTab('dashboard');
      } else if (currentRole === 'manager') {
        setActiveTab('manager_dashboard');
      } else if (currentRole === 'hr') {
        setActiveTab('hr_dashboard');
      }
    }
  }, [currentUser?.role, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Carregando sistema de férias...</p>
        </div>
      </div>
    );
  }

  // If not logged in or in login tab
  if (!currentUser || activeTab === 'login') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <LoginView
          onSuccess={() => {
            // Tab will be automatically set by the effect
          }}
        />
      </div>
    );
  }

  // Synchronize current active employee profile with the latest Firestore data from allUsers
  const liveProfile = allUsers.find(u => u.uid === currentUser.uid) || currentUser;

  // Count badges
  const pendingManagerCount = requests.filter(
    r =>
      r.status === 'pending' &&
      (r.managerId === liveProfile.uid || r.department === liveProfile.department)
  ).length;

  const pendingHrCount = requests.filter(r => r.status === 'approved').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          pendingManagerCount={pendingManagerCount}
          pendingHrCount={pendingHrCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {/* Employee Views */}
          {activeTab === 'dashboard' && (
            <EmployeeDashboard
              requests={requests}
              onNavigateToRequest={() => setActiveTab('request_vacation')}
              onNavigateToHistory={() => setActiveTab('employee_history')}
            />
          )}

          {activeTab === 'request_vacation' && (
            <RequestVacationView
              existingRequests={requests.filter(r => r.employeeId === liveProfile.uid)}
              onSuccess={() => setActiveTab('employee_history')}
              onCancel={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'employee_history' && (
            <EmployeeHistoryView
              requests={requests}
              onNavigateToRequest={() => setActiveTab('request_vacation')}
            />
          )}

          {/* Manager Views */}
          {activeTab === 'manager_dashboard' && (
            <ManagerDashboard
              requests={requests}
              allUsers={allUsers}
              onNavigateToReview={() => setActiveTab('manager_review')}
              onNavigateToCalendar={() => setActiveTab('calendar')}
            />
          )}

          {activeTab === 'manager_review' && (
            <ManagerReviewView requests={requests} allUsers={allUsers} />
          )}

          {activeTab === 'manager_team_history' && (
            <ManagerTeamHistoryView requests={requests} />
          )}

          {/* HR Views */}
          {activeTab === 'hr_dashboard' && (
            <HrDashboard
              requests={requests}
              allUsers={allUsers}
              logs={logs}
              onNavigateToRegistration={() => setActiveTab('hr_registration')}
              onNavigateToEmployees={() => setActiveTab('hr_employees')}
              onNavigateToAudit={() => setActiveTab('hr_audit')}
            />
          )}

          {activeTab === 'hr_registration' && (
            <HrRegistrationView requests={requests} allUsers={allUsers} />
          )}

          {activeTab === 'hr_employees' && (
            <HrEmployeesView allUsers={allUsers} />
          )}

          {activeTab === 'hr_audit' && (
            <HrAuditView logs={logs} />
          )}

          {/* Shared Views */}
          {activeTab === 'calendar' && (
            <TeamCalendarView requests={requests} />
          )}

          {activeTab === 'profile' && (
            <ProfileAndSettingsView />
          )}

          {activeTab === 'requirements' && (
            <AcademicRequirementsView onNavigateToTab={(tab) => setActiveTab(tab)} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
