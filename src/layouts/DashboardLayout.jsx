import { Outlet, NavLink } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
  const { role } = useAuth();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: 260,
          background: "#ffffff",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          boxShadow: "2px 0 10px rgba(0,0,0,0.08)",
        }}
      >
        {/* HEADER */}
        <div style={{ marginBottom: 30 }}>
          <strong style={{ fontSize: 18 }}>POS System</strong>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            Business Management
          </div>
        </div>

        {/* NAV */}
        <nav
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {role === "admin" && (
            <>
              <SidebarLink to="/dashboard" label="Dashboard" />
              <SidebarLink to="/products" label="Products" />
              <SidebarLink to="/settings" label="Settings" />
            </>
          )}

          <SidebarLink to="/pos" label="POS" />
        </nav>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: "auto",
            padding: "12px 16px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 6px 16px rgba(239,68,68,0.35)",
          }}
        >
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main
        style={{
          flex: 1,
          background: "#f9fafb",
          padding: 30,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

/* ---------- SIDEBAR LINK ---------- */

function SidebarLink({ to, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        padding: "12px 16px",
        borderRadius: 12,
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 500,
        color: isActive ? "#1e40af" : "#111827",
        background: isActive ? "#e0e7ff" : "#ffffff",
        boxShadow: isActive
          ? "0 6px 16px rgba(59,130,246,0.35)"
          : "0 2px 6px rgba(0,0,0,0.08)",
        transition: "all 0.2s ease",
      })}
    >
      {label}
    </NavLink>
  );
}
