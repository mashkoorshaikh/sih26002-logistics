import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LandingPage       from './pages/LandingPage'
import Login             from './pages/Login'
import Register          from './pages/Register'
import Dashboard         from './pages/Dashboard'
import RoutePlanning     from './pages/RoutePlanning'
import RouteComparison   from './pages/RouteComparison'
import LiveMap           from './pages/LiveMap'
import RiskAnalysis      from './pages/RiskAnalysis'
import AccessibilityPage from './pages/AccessibilityPage'
import Analytics         from './pages/Analytics'
import Assistant         from './pages/Assistant'
import AlertsPage        from './pages/AlertsPage'
import Settings          from './pages/Settings'
import AdminDashboard   from './pages/AdminDashboard'
import VehiclesPage     from './pages/VehiclesPage'
import TripsPage        from './pages/TripsPage'
import DashboardLayout   from './components/layout/DashboardLayout'

function ProtectedRoute({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 1. Overview Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout><Dashboard /></DashboardLayout>
          </ProtectedRoute>
        }/>

        {/* 2. Route Planner */}
        <Route path="/plan" element={
          <ProtectedRoute>
            <DashboardLayout><RoutePlanning /></DashboardLayout>
          </ProtectedRoute>
        }/>

        {/* 3. Route Comparison */}
        <Route path="/comparison" element={
          <ProtectedRoute>
            <DashboardLayout><RouteComparison /></DashboardLayout>
          </ProtectedRoute>
        }/>

        {/* 4. Live Map */}
        <Route path="/live-map" element={
          <ProtectedRoute>
            <DashboardLayout><LiveMap /></DashboardLayout>
          </ProtectedRoute>
        }/>

        {/* 5. Risk Analysis */}
        <Route path="/risk" element={
          <ProtectedRoute>
            <DashboardLayout><RiskAnalysis /></DashboardLayout>
          </ProtectedRoute>
        }/>

        {/* 6. Accessibility */}
        <Route path="/accessibility" element={
          <ProtectedRoute>
            <DashboardLayout><AccessibilityPage /></DashboardLayout>
          </ProtectedRoute>
        }/>

        {/* 7. Analytics */}
        <Route path="/analytics" element={
          <ProtectedRoute>
            <DashboardLayout><Analytics /></DashboardLayout>
          </ProtectedRoute>
        }/>

        {/* 8. AI Assistant */}
        <Route path="/assistant" element={
          <ProtectedRoute>
            <DashboardLayout><Assistant /></DashboardLayout>
          </ProtectedRoute>
        }/>

        {/* 9. Alerts */}
        <Route path="/alerts" element={
          <ProtectedRoute>
            <DashboardLayout><AlertsPage /></DashboardLayout>
          </ProtectedRoute>
        }/>

        {/* Fleet Vehicles */}
        <Route path="/vehicles" element={
          <ProtectedRoute>
            <DashboardLayout><VehiclesPage /></DashboardLayout>
          </ProtectedRoute>
        }/>

        {/* Trips History & Telemetry */}
        <Route path="/trips" element={
          <ProtectedRoute>
            <DashboardLayout><TripsPage /></DashboardLayout>
          </ProtectedRoute>
        }/>

        {/* 10. Settings */}
        <Route path="/settings" element={
          <ProtectedRoute>
            <DashboardLayout><Settings /></DashboardLayout>
          </ProtectedRoute>
        }/>

        {/* 11. Government Admin Portal */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <DashboardLayout><AdminDashboard /></DashboardLayout>
          </ProtectedRoute>
        }/>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
