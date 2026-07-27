import { Routes, Route, Navigate } from 'react-router-dom'
import { DataProvider } from './context/DataContext.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ConfigBanner from './components/ConfigBanner.jsx'
import Home from './pages/Home.jsx'
import Fixtures from './pages/Fixtures.jsx'
import Standings from './pages/Standings.jsx'
import Bracket from './pages/Bracket.jsx'
import Stats from './pages/Stats.jsx'
import Teams from './pages/Teams.jsx'
import MatchDetail from './pages/MatchDetail.jsx'
import Login from './pages/Login.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminTeams from './pages/admin/AdminTeams.jsx'
import AdminPlayers from './pages/admin/AdminPlayers.jsx'
import AdminMatches from './pages/admin/AdminMatches.jsx'

export default function App() {
  return (
    <DataProvider>
      <div className="min-h-full flex flex-col">
        <Navbar />
        <ConfigBanner />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/fixtures" element={<Fixtures />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/bracket" element={<Bracket />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/match/:id" element={<MatchDetail />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="teams" element={<AdminTeams />} />
              <Route path="players" element={<AdminPlayers />} />
              <Route path="matches" element={<AdminMatches />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </DataProvider>
  )
}
