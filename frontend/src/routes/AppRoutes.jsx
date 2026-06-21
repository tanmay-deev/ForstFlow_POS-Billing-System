import { Routes, Route } from 'react-router-dom';
import LandingLayout from '../layouts/LandingLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';

import LandingPage from '../pages/landing/LandingPage.jsx';
import Login from '../pages/auth/Login.jsx';
import DashboardHome from '../pages/dashboard/DashboardHome.jsx';

import POS from '../pages/dashboard/POS.jsx';
import Products from '../pages/dashboard/Products.jsx';
import Inventory from '../pages/dashboard/Inventory.jsx';
import Orders from '../pages/dashboard/Orders.jsx';
import Customers from '../pages/dashboard/Customers.jsx';
import Employees from '../pages/dashboard/Employees.jsx';
import Offers from '../pages/dashboard/Offers.jsx';
import Reports from '../pages/dashboard/Reports.jsx';
import Settings from '../pages/dashboard/Settings.jsx';

import ProtectedRoute from './ProtectedRoute.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<LandingLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/pos" element={<POS />} />
          <Route path="/dashboard/products" element={<Products />} />
          <Route path="/dashboard/inventory" element={<Inventory />} />
          <Route path="/dashboard/orders" element={<Orders />} />
          <Route path="/dashboard/customers" element={<Customers />} />
          <Route path="/dashboard/employees" element={<Employees />} />
          <Route path="/dashboard/offers" element={<Offers />} />
          <Route path="/dashboard/reports" element={<Reports />} />
          <Route path="/dashboard/settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
