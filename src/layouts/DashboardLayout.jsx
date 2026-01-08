import { Outlet, NavLink, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

const MOBILE_NAV_HEIGHT = 64;

export default function DashboardLayout() {
  const { role } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Only admin on mobile gets mobile layout
  const isAdminMobile = role === "admin" && isMobile;

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        overflow: "hidden", // 🔒 prevent sideways scroll
      }}
    >
      {/* SIDEBAR — desktop only */}
      {!isAdminMobile && (
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
          <div style={{ marginBottom: 30 }}>
            <strong style={{ fontSize: 18 }}>POS System</strong>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Business Management
            </div>
          </div>

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
      )}

      {/* MAIN CONTENT (scrollable) */}
      <main
        style={{
          flex: 1,
          background: "#f9fafb",
          padding: isAdminMobile ? 16 : 30,
          paddingBottom: isAdminMobile
            ? MOBILE_NAV_HEIGHT + 16
            : 30,
          overflowY: "auto", // ✅ content scrolls
          overflowX: "hidden", // 🔒 no sideways scroll
        }}
      >
        <Outlet />
      </main>

      {/* ADMIN MOBILE BOTTOM NAV — FIXED */}
      {isAdminMobile && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: MOBILE_NAV_HEIGHT,
            background: "#ffffff",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          <BottomNavItem
            to="/dashboard"
            label="Dashboard"
            active={location.pathname === "/dashboard"}
          />
          <BottomNavItem
            to="/products"
            label="Products"
            active={location.pathname === "/products"}
          />
          <BottomNavItem
            to="/settings"
            label="Settings"
            active={location.pathname === "/settings"}
          />
        </div>
      )}
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

/* ---------- MOBILE BOTTOM NAV ---------- */

function BottomNavItem({ to, label, active }) {
  return (
    <NavLink
      to={to}
      style={{
        textDecoration: "none",
        fontSize: 13,
        fontWeight: 600,
        color: active ? "#1e40af" : "#6b7280",
      }}
    >
      {label}
    </NavLink>
  );
}
