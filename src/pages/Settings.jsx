import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user, role } = useAuth();

  const [storeName, setStoreName] = useState("");
  const [receiptFooter, setReceiptFooter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data, error } = await supabase
      .from("store_settings")
      .select("store_name, receipt_footer")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Failed to load store settings:", error);
      return;
    }

    setStoreName(data.store_name);
    setReceiptFooter(data.receipt_footer || "");
    setLoading(false);
  }

  async function saveSettings() {
    setSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from("store_settings")
      .update({
        store_name: storeName,
        receipt_footer: receiptFooter,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings");
      setSaving(false);
      return;
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return <div className="p-8 text-sm text-gray-500">Loading settings…</div>;
  }

  return (
    <div className="p-8 space-y-8 max-w-xl">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
        <p className="text-sm text-gray-500">Store configuration</p>
      </div>

      {/* STORE SETTINGS */}
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <h3 className="font-medium text-gray-700">Store Settings</h3>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">Store Name</label>
          <input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">Receipt Footer</label>
          <textarea
            value={receiptFooter}
            onChange={(e) => setReceiptFooter(e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
          />
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>

        {saved && (
          <div className="text-sm text-green-600">Settings saved</div>
        )}
      </div>

      {/* ACCOUNT */}
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-2">
        <h3 className="font-medium text-gray-700">Account</h3>
        <p className="text-sm">
          <strong>Email:</strong> {user.email}
        </p>
        <p className="text-sm">
          <strong>Role:</strong> {role}
        </p>

        <button
          onClick={logout}
          className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
