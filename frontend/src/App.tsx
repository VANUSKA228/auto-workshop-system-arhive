/**
 * App.tsx — Версия 1 (auth-only)
 * Только авторизация и регистрация
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage/LoginPage';
import ClientRegisterPage from './pages/ClientRegisterPage/ClientRegisterPage';
import Layout from './components/Layout/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Заглушка для страницы заявок
function OrdersPlaceholder() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-primary-dark mb-4">📋 Мои заявки</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            <strong>✅ Страница работает!</strong>
          </p>
          <p className="text-blue-700 mt-2">
            Вы вошли как: <strong>{user?.name}</strong> ({user?.role})
          </p>
          <p className="text-blue-600 mt-2 text-sm">
            Функционал заявок будет добавлен в следующей версии.
          </p>
        </div>
      </div>
    </div>
  );
}

// Заглушка для страницы услуг
function ServicesPlaceholder() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-primary-dark mb-4">🔧 Услуги</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            <strong>✅ Страница работает!</strong>
          </p>
          <p className="text-green-700 mt-2 text-sm">
            Список услуг будет добавлен в следующей версии.
          </p>
        </div>
      </div>
    </div>
  );
}

// Заглушка для страницы работников
function WorkersPlaceholder() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-primary-dark mb-4">👷 Работники</h2>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800">
            <strong>✅ Страница работает!</strong>
          </p>
          <p className="text-purple-700 mt-2 text-sm">
            Управление техниками будет добавлено в следующей версии.
          </p>
        </div>
      </div>
    </div>
  );
}

// Заглушка для страницы пользователей
function UsersPlaceholder() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-primary-dark mb-4">👥 Пользователи</h2>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800">
            <strong>✅ Страница работает!</strong>
          </p>
          <p className="text-orange-700 mt-2 text-sm">
            Управление пользователями будет добавлено в следующей версии.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<ClientRegisterPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="orders" element={<OrdersPlaceholder />} />
        <Route path="services" element={<ServicesPlaceholder />} />
        <Route path="workers" element={<WorkersPlaceholder />} />
        <Route path="users" element={<UsersPlaceholder />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
