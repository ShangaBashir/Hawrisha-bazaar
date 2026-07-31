import { useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import DashboardLogin from './components/DashboardLogin';

function App() {
  const [dashboardUser, setDashboardUser] = useState(() => {
    const saved = localStorage.getItem('dashboard_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (firstName, email, role, storeName) => {
    const user = { firstName, email, role, storeName };
    setDashboardUser(user);
    localStorage.setItem('dashboard_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setDashboardUser(null);
    localStorage.removeItem('dashboard_user');
  };

  if (!dashboardUser) {
    return (
      <DashboardLogin onLoginSuccess={handleLoginSuccess} />
    );
  }

  return (
    <AdminDashboard
      currentUserEmail={dashboardUser.email}
      currentUserRole={dashboardUser.role}
      currentUserStoreName={dashboardUser.storeName}
      onBackToHome={() => {
        window.location.href = 'http://localhost:5173/';
      }}
      onLogout={handleLogout}
      onViewProduct={(product) => {
        const prodId = typeof product === 'object' ? product?.id : product;
        if (prodId) {
          window.open(`http://localhost:5173/?product=${prodId}`, '_blank');
        } else {
          window.open(`http://localhost:5173/`, '_blank');
        }
      }}
      onViewStore={(storeId, storeName) => {
        if (storeId) {
          window.open(`http://localhost:5173/?store=${storeId}`, '_blank');
        } else {
          window.open(`http://localhost:5173/`, '_blank');
        }
      }}
    />
  );
}

export default App;
