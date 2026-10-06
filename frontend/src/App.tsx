import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { PageLoader } from './components/ui'
import HomePage from './pages/HomePage'
import CategoriesPage from './pages/CategoriesPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'

// Heavy screens (recharts, leaflet) load on demand so the landing page stays small.
const MyComplaintsPage = lazy(() => import('./pages/MyComplaintsPage'))
const NewComplaintPage = lazy(() => import('./pages/NewComplaintPage'))
const ComplaintDetailPage = lazy(() => import('./pages/ComplaintDetailPage'))
const MyMapPage = lazy(() => import('./pages/MyMapPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const WorkPage = lazy(() => import('./pages/WorkPage'))
const StaffMapPage = lazy(() => import('./pages/StaffMapPage'))
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'))
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'))
const AdminCategoriesPage = lazy(() => import('./pages/AdminCategoriesPage'))

const STAFF = ['ADMIN', 'DEPARTMENT_MANAGER', 'FIELD_EMPLOYEE'] as const

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route
          path="complaints/new"
          element={
            <ProtectedRoute roles={['CITIZEN']}>
              <NewComplaintPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="complaints/mine"
          element={
            <ProtectedRoute roles={['CITIZEN']}>
              <MyComplaintsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="complaints/mine/map"
          element={
            <ProtectedRoute roles={['CITIZEN']}>
              <MyMapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="complaints/:id"
          element={
            <ProtectedRoute>
              <ComplaintDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="work"
          element={
            <ProtectedRoute roles={[...STAFF]}>
              <WorkPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="work/map"
          element={
            <ProtectedRoute roles={[...STAFF]}>
              <StaffMapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="statistics"
          element={
            <ProtectedRoute roles={[...STAFF]}>
              <StatisticsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/users"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/categories"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminCategoriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}