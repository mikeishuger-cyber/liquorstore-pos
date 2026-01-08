import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Cashier() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadInventory();
    setCart([]);
  }, []);

  async function loadInventory() {
    const { data, error } = await supabase
      .from("inventory_live")
      .select("product_id, name, sell_price, available_stock")
      .order("name");

    if (error) {
      console.error("Inventory load failed:", error);
      return;
    }

    setProducts(
      (data || []).map((p) => ({
        id: p.product_id,
        name: p.name,
        price: p.sell_price,
        stock: p.available_stock,
      }))
    );
  }

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);

      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }

      if (product.stock <= 0) return prev;
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function removeFromCart(productId) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === productId ? { ...i, qty: i.qty - 1 } : i
        )
        .filter((i) => i.qty > 0)
    );
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  async function completeSale() {
    if (cart.length === 0) return;

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert([{ total }])
      .select("id")
      .single();

    if (saleError || !sale) {
      console.error("Sale insert failed:", saleError);
      return;
    }

    const saleItems = cart.map((item) => ({
      sale_id: sale.id,
      product_id: item.id,
      quantity: item.qty,
      price: item.price,
      subtotal: item.price * item.qty,
    }));

    const { error: itemsError } = await supabase
      .from("sale_items")
      .insert(saleItems);

    if (itemsError) {
      console.error("Sale items insert failed:", itemsError);
      return;
    }

    setCart([]);
    navigate(`/receipt/${sale.id}`);
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <h2 style={{ marginBottom: 16 }}>Cashier POS</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
        }}
      >
        {/* PRODUCTS */}
        <div>
          {/* SEARCH */}
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Search product…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: 340,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                fontSize: 14,
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
            }}
          >
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                style={{
                  background: "#f0f9ff",
                  padding: 16,
                  borderRadius: 14,
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                }}
              >
                <strong style={{ fontSize: 14 }}>{p.name}</strong>

                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  KES {p.price}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color:
                      p.stock === 0
                        ? "#dc2626"
                        : p.stock <= 5
                        ? "#f97316"
                        : "#16a34a",
                  }}
                >
                  {p.stock === 0
                    ? "Out of stock"
                    : `${p.stock} in stock`}
                </div>

                <button
                  type="button"
                  onClick={() => addToCart(p)}
                  style={{
                    marginTop: 10,
                    padding: "6px 10px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: 13,
                  }}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CART */}
        <div
          style={{
            background: "white",
            padding: 20,
            borderRadius: 16,
            height: "fit-content",
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            border: "1px solid #e5e7eb",
          }}
        >
          <strong style={{ fontSize: 16 }}>Cart</strong>

          <div style={{ marginTop: 12 }}>
            {cart.length === 0 && (
              <div style={{ color: "#777" }}>No items</div>
            )}

            {cart.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <span>
                  {item.name} × {item.qty}
                </span>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <hr style={{ margin: "12px 0" }} />
          <strong>Total: KES {total}</strong>

          <button
            type="button"
            onClick={completeSale}
            style={{
              marginTop: 18,
              width: "100%",
              padding: "12px 16px",
              background: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Complete Sale
          </button>
        </div>
      </div>
    </>
  );
}
