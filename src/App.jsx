import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Route-level code splitting: each page is its own chunk.
const Landing = lazy(() => import('./pages/Landing'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ReportEmergency = lazy(() => import('./pages/ReportEmergency'));
const SafeZones = lazy(() => import('./pages/SafeZones'));
const RescueTracking = lazy(() => import('./pages/RescueTracking'));
const Resources = lazy(() => import('./pages/Resources'));
const CalmSpace = lazy(() => import('./pages/CalmSpace'));
const Authority = lazy(() => import('./pages/Authority'));
const Profile = lazy(() => import('./pages/Profile'));

export default function App() {
  return (
    <Suspense fallback={<div className="skeleton" style={{ margin: 40 }} />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Dashboard />} />
            <Route path="/report" element={<ReportEmergency />} />
            <Route path="/zones" element={<SafeZones />} />
            <Route path="/tracking" element={<RescueTracking />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/calm" element={<CalmSpace />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route element={<ProtectedRoute role="AUTHORITY" />}>
            <Route path="/authority" element={<Authority />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
