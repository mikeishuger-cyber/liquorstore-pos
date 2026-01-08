import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Receipt() {
  const { saleId } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [storeName, setStoreName] = useState("");
  const [footer, setFooter] = useState("");

  useEffect(() => {
    loadReceipt();
  }, []);

  async function loadReceipt() {
    // Store settings
    const { data: settings } = await supabase
      .from("store_settings")
      .select("store_name, receipt_footer")
      .eq("id", 1)
      .single();

    if (settings) {
      setStoreName(settings.store_name);
      setFooter(settings.receipt_footer || "");
    }

    // Sale items
    const { data } = await supabase
      .from("sale_items")
      .select("quantity, price, products(name)")
      .eq("sale_id", saleId);

    const mapped = data.map((i) => ({
      name: i.products.name,
      qty: i.quantity,
      price: i.price,
      lineTotal: i.quantity * i.price,
    }));

    setItems(mapped);
    setTotal(mapped.reduce((s, i) => s + i.lineTotal, 0));

    // Auto print
    setTimeout(() => window.print(), 300);
  }

  return (
    <div style={pageStyle}>
      <div style={receiptStyle} className="receipt">
        <div style={center}>
          <div style={storeNameStyle}>{storeName}</div>
          <div style={smallText}>
            {new Date().toLocaleString()}
          </div>
        </div>

        <div style={divider} />

        {items.map((i, idx) => (
          <div key={idx} style={row}>
            <div>
              {i.name} x{i.qty} @{i.price}
            </div>
            <div>{i.lineTotal}</div>
          </div>
        ))}

        <div style={divider} />

        <div style={{ ...row, fontWeight: "bold" }}>
          <div>TOTAL</div>
          <div>{total}</div>
        </div>

        {footer && (
          <>
            <div style={divider} />
            <div style={footerStyle}>{footer}</div>
          </>
        )}

        <button
          onClick={() => navigate("/pos")}
          className="no-print"
          style={backBtn}
        >
          Back to POS
        </button>
      </div>

      {/* PRINT STYLES */}
      <style>
        {`
          @media print {
            body {
              background: white;
            }
            .receipt {
              box-shadow: none !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  paddingTop: 20,
  background: "#f3f4f6",
};

const receiptStyle = {
  width: 280, // thermal receipt width
  background: "white",
  padding: 16,
  borderRadius: 8,
  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  fontFamily:
    "Courier New, Consolas, Menlo, Monaco, monospace",
  fontSize: 12,
  lineHeight: "1.4",
};

const storeNameStyle = {
  fontWeight: "bold",
  fontSize: 14,
};

const smallText = {
  fontSize: 10,
};

const center = {
  textAlign: "center",
};

const divider = {
  borderTop: "1px dashed #999",
  margin: "8px 0",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
};

const footerStyle = {
  textAlign: "center",
  fontSize: 10,
  marginTop: 4,
};

const backBtn = {
  marginTop: 12,
  width: "100%",
  padding: "8px 0",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
