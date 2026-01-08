import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Cashier from "./pages/Cashier";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import Receipt from "./pages/Receipt";
import Login from "./pages/Login";

import RequireAuth from "./components/RequireAuth";
import RequireRole from "./components/RequireRole";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Navigate to="/pos" />} />

            <Route
              path="/dashboard"
              element={
                <RequireRole allowed={["admin"]}>
                  <Dashboard />
                </RequireRole>
              }
            />

            <Route path="/pos" element={<Cashier />} />

            <Route
              path="/products"
              element={
                <RequireRole allowed={["admin"]}>
                  <Products />
                </RequireRole>
              }
            />

            <Route
              path="/settings"
              element={
                <RequireRole allowed={["admin"]}>
                  <Settings />
                </RequireRole>
              }
            />
          </Route>

          <Route
            path="/receipt/:saleId"
            element={
              <RequireAuth>
                <Receipt />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
