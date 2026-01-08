import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";

const LOW_STOCK_THRESHOLD = 5;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);

  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    sell_price: "",
    cost_price: "",
  });

  const [stockForm, setStockForm] = useState({
    product_id: "",
    quantity: "",
    cost_price: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data: productsData } = await supabase
      .from("products")
      .select("id, name, category, sell_price, cost_price")
      .order("name");

    const { data: inventoryData } = await supabase
      .from("inventory_live")
      .select("product_id, available_stock");

    const inventoryMap = {};
    inventoryData?.forEach((row) => {
      inventoryMap[row.product_id] = row.available_stock;
    });

    const merged = (productsData || []).map((p) => ({
      ...p,
      available_stock: inventoryMap[p.id] ?? 0,
    }));

    setProducts(merged);
  }

  /* ---------------- ADD / EDIT PRODUCT ---------------- */

  function openEdit(product) {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      sell_price: product.sell_price,
      cost_price: product.cost_price,
    });
    setShowEditProduct(true);
  }

  async function updateProduct() {
    const { name, category, sell_price, cost_price } = productForm;

    if (!name || !category || !sell_price || !cost_price) {
      alert("All fields are required.");
      return;
    }

    setSaving(true);

    await supabase
      .from("products")
      .update({
        name,
        category,
        sell_price: Number(sell_price),
        cost_price: Number(cost_price),
      })
      .eq("id", editingProduct.id);

    setShowEditProduct(false);
    setEditingProduct(null);
    setSaving(false);
    loadProducts();
  }

  async function addProduct() {
    const { name, category, sell_price, cost_price } = productForm;
    if (!name || !category || !sell_price || !cost_price) return;

    setSaving(true);

    await supabase.from("products").insert({
      name,
      category,
      sell_price: Number(sell_price),
      cost_price: Number(cost_price),
    });

    setProductForm({
      name: "",
      category: "",
      sell_price: "",
      cost_price: "",
    });

    setShowAddProduct(false);
    setSaving(false);
    loadProducts();
  }

  async function addStock() {
    const { product_id, quantity, cost_price } = stockForm;
    if (!product_id || !quantity || !cost_price) return;

    await supabase.from("stock_purchases").insert({
      product_id: Number(product_id),
      quantity: Number(quantity),
      cost_price: Number(cost_price),
    });

    setStockForm({ product_id: "", quantity: "", cost_price: "" });
    setShowAddStock(false);
    loadProducts();
  }

  /* ---------------- DERIVED ---------------- */

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalStockUnits = products.reduce(
    (sum, p) => sum + p.available_stock,
    0
  );

  const lowStockCount = products.filter(
    (p) => p.available_stock > 0 && p.available_stock <= LOW_STOCK_THRESHOLD
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500">Manage your inventory</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAddStock(true)}
            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm"
          >
            + Add Stock
          </button>
          <button
            onClick={() => setShowAddProduct(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        className="w-full max-w-md px-4 py-2 border rounded-lg text-sm"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Products"
          value={products.length}
          bg="bg-slate-50"
          text="text-slate-700"
        />
        <StatCard
          title="Total Stock Units"
          value={totalStockUnits}
          bg="bg-blue-50"
          text="text-blue-700"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          bg="bg-amber-50"
          text="text-amber-700"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-left">Sell Price</th>
              <th className="px-6 py-3 text-left">Available Stock</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-6 py-4 font-medium">{p.name}</td>
                <td className="px-6 py-4">{p.category}</td>
                <td className="px-6 py-4">KES {p.sell_price}</td>
                <td
                  className={`px-6 py-4 font-semibold ${
                    p.available_stock <= LOW_STOCK_THRESHOLD
                      ? "text-red-600"
                      : ""
                  }`}
                >
                  {p.available_stock}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => openEdit(p)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALS (unchanged) */}
      {showAddProduct && (
        <Modal title="Add Product" onClose={() => setShowAddProduct(false)}>
          <Input label="Product Name" value={productForm.name} onChange={(v) => setProductForm({ ...productForm, name: v })} />
          <Input label="Category" value={productForm.category} onChange={(v) => setProductForm({ ...productForm, category: v })} />
          <Input label="Sell Price (KES)" type="number" value={productForm.sell_price} onChange={(v) => setProductForm({ ...productForm, sell_price: v })} />
          <Input label="Buying Price (Cost)" type="number" value={productForm.cost_price} onChange={(v) => setProductForm({ ...productForm, cost_price: v })} />

          <button onClick={addProduct} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm">
            Save Product
          </button>
        </Modal>
      )}

      {showEditProduct && (
        <Modal title="Edit Product" onClose={() => setShowEditProduct(false)}>
          <Input label="Product Name" value={productForm.name} onChange={(v) => setProductForm({ ...productForm, name: v })} />
          <Input label="Category" value={productForm.category} onChange={(v) => setProductForm({ ...productForm, category: v })} />
          <Input label="Sell Price (KES)" type="number" value={productForm.sell_price} onChange={(v) => setProductForm({ ...productForm, sell_price: v })} />
          <Input label="Buying Price (Cost)" type="number" value={productForm.cost_price} onChange={(v) => setProductForm({ ...productForm, cost_price: v })} />

          <button onClick={updateProduct} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm">
            Update Product
          </button>
        </Modal>
      )}

      {showAddStock && (
        <Modal title="Add Stock" onClose={() => setShowAddStock(false)}>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={stockForm.product_id}
            onChange={(e) =>
              setStockForm({ ...stockForm, product_id: e.target.value })
            }
          >
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <Input label="Quantity Bought" type="number" value={stockForm.quantity} onChange={(v) => setStockForm({ ...stockForm, quantity: v })} />
          <Input label="Buying Price (Cost)" type="number" value={stockForm.cost_price} onChange={(v) => setStockForm({ ...stockForm, cost_price: v })} />

          <button onClick={addStock} className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm">
            Add Stock
          </button>
        </Modal>
      )}
    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */

function StatCard({ title, value, bg, text }) {
  return (
    <div
      className={`rounded-xl border p-6 ${bg} ${text}`}
      style={{
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
      }}
    >
      <p className="text-sm font-medium">{title}</p>
      <p className="text-2xl font-semibold mt-2">{value}</p>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {children}
        <button onClick={onClose} className="text-sm text-gray-500 hover:underline">
          Cancel
        </button>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
    </div>
  );
}
