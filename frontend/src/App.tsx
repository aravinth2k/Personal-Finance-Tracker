import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Overview } from '@/pages/Overview'
import { Settings } from '@/pages/Settings'
import { MonthDetail } from '@/pages/MonthDetail'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/overview" element={<Overview />} />
                <Route path="/month/:year/:month" element={<MonthDetail />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
