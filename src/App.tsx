import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { FacilityProvider } from './contexts/FacilityContext';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { RoleGuard } from './components/auth/RoleGuard';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Checklists } from './pages/Checklists';
import { PoolTesting } from './pages/PoolTesting';
import { Maintenance } from './pages/Maintenance';
import { Incidents } from './pages/Incidents';
import { Reports } from './pages/Reports';
import { Staff } from './pages/Staff';
import { Facilities } from './pages/Facilities';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FacilityProvider>
          <ToastProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected routes */}
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="checklists" element={<Checklists />} />
                <Route path="pool-testing" element={<PoolTesting />} />
                <Route path="maintenance" element={<Maintenance />} />
                <Route path="incidents" element={<Incidents />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />

                {/* Admin routes */}
                <Route
                  path="admin/staff"
                  element={
                    <RoleGuard allowedRoles={['admin', 'manager']}>
                      <Staff />
                    </RoleGuard>
                  }
                />
                <Route
                  path="admin/facilities"
                  element={
                    <RoleGuard allowedRoles={['admin']}>
                      <Facilities />
                    </RoleGuard>
                  }
                />

                {/* Default redirect */}
                <Route path="" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </ToastProvider>
        </FacilityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
