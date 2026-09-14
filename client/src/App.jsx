import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { TripProvider } from './context/TripContext';
import { AuthProvider } from './context/AuthContext';
import { MemoryProvider } from './context/MemoryContext';
import MemoryDrawer from './components/MemoryDrawer';
import Home from './pages/Home';
import Login from './pages/Login';
import Planning from './pages/Planning';
import Itinerary from './pages/Itinerary';
import Confirmation from './pages/Confirmation';
import Disruption from './pages/Disruption';
import ProviderDashboard from './pages/ProviderDashboard';
import FlightDeck from './pages/FlightDeck';
import VoiceIntake from './pages/VoiceIntake';
import TripPlannerStart from './pages/TripPlannerStart';
import Dashboard from './pages/Dashboard';
import SkyReveal from './components/SkyReveal';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/planner" element={<Dashboard />} />
        <Route path="/overview" element={<Dashboard />} />
        <Route path="/plan/start" element={<TripPlannerStart />} />
        <Route path="/plan" element={<TripPlannerStart />} />
        <Route path="/deck" element={<SkyReveal><FlightDeck /></SkyReveal>} />
        <Route path="/flightdeck" element={<SkyReveal><FlightDeck /></SkyReveal>} />
        <Route path="/flight-deck" element={<SkyReveal><FlightDeck /></SkyReveal>} />
        <Route path="/voice" element={<VoiceIntake />} />
        <Route path="/voice-intake" element={<VoiceIntake />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth" element={<Login />} />
        <Route path="/planning" element={<Planning />} />
        <Route path="/workspace" element={<Planning />} />
        <Route path="/plan-expedition" element={<Planning />} />
        <Route path="/itinerary" element={<Itinerary />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/disruption" element={<Disruption />} />
        <Route path="/disruption-lab" element={<Disruption />} />
        <Route path="/provider" element={<ProviderDashboard />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <MemoryProvider>
            <TripProvider>
              <AppRoutes />
              <MemoryDrawer />
            </TripProvider>
          </MemoryProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
