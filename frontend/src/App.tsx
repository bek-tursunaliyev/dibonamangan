import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import BottomNav from './components/BottomNav'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Compare from './pages/Compare'
import Sell from './pages/Sell'
import QuizAI from './pages/QuizAI'
import Profile from './pages/Profile'
import Admin from './pages/admin/Admin'
import { UserProvider } from './lib/UserContext'
import { CompareProvider } from './lib/CompareContext'
import { ThemeProvider } from './lib/ThemeContext'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <CompareProvider>
          <HashRouter>
            <ScrollToTop />
            <div className="mx-auto min-h-screen w-full max-w-[1280px] pb-20">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/sell" element={<Sell />} />
                  <Route path="/quiz" element={<QuizAI />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<Admin />} />
                </Routes>
              </ErrorBoundary>
            </div>
            <BottomNav />
          </HashRouter>
        </CompareProvider>
      </UserProvider>
    </ThemeProvider>
  )
}
