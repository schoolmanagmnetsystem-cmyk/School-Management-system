import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';
import PublicLayout from './components/layout/PublicLayout';

// Public Pages
import LandingPage from './app/public/LandingPage';
import Login from './pages/Login';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Finance from './pages/Finance';
import Courses from './pages/Courses';
import Results from './pages/Results';
import Attendance from './pages/Attendance';
import PlatformAdmin from './pages/PlatformAdmin';
import AcademicPeriods from './pages/AcademicPeriods';
import GuardianPortal from './pages/GuardianPortal';
import FinanceOperations from './pages/FinanceOperations';
import Mentorship from './pages/Mentorship';
import { ROLE_ACCESS } from './utils/roleAccess';

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    user = {};
  }

  const allowedRoles = ROLE_ACCESS[location.pathname];
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard Routes wrapped in DashboardLayout and protected */}
        <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/platform" element={<PlatformAdmin />} />
          <Route path="/academic-periods" element={<AcademicPeriods />} />
          <Route path="/guardians" element={<GuardianPortal />} />
          <Route path="/finance-operations" element={<FinanceOperations />} />
          <Route path="/students" element={<Students />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/results" element={<Results />} />
          <Route path="/mentorship" element={<Mentorship />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

