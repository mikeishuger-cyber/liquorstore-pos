import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    /* =============================
       PRODUCTS
    ============================== */
    const { data: productsData } = await supabase
      .from("products")
      .select("id, name");

    setProducts(productsData || []);

    /* =============================
       STOCK PURCHASES
    ============================== */
    const { data: purchases } = await supabase
      .from("stock_purchases")
      .select("product_id, quantity, cost_price");

    /* =============================
       SALES ITEMS
    ============================== */
    const { data: salesItems } = await supabase
      .from("sale_items")
      .select(`
        product_id,
        quantity,
        subtotal,
        products ( name )
      `);

    if (!productsData || !purchases || !salesItems) return;

    /* =============================
       TOTAL REVENUE
    ============================== */
    const revenue = salesItems.reduce(
      (sum, item) => sum + Number(item.subtotal || 0),
      0
    );
    setTotalRevenue(revenue);

    /* =============================
       AVERAGE COST PER PRODUCT
    ============================== */
    const costMap = {};

    purchases.forEach(p => {
      if (!costMap[p.product_id]) {
        costMap[p.product_id] = { qty: 0, totalCost: 0 };
      }
      costMap[p.product_id].qty += p.quantity;
      costMap[p.product_id].totalCost +=
        p.quantity * Number(p.cost_price);
    });

    const avgCost = {};
    Object.keys(costMap).forEach(pid => {
      avgCost[pid] =
        costMap[pid].totalCost / costMap[pid].qty;
    });

    /* =============================
       TOTAL PROFIT
    ============================== */
    let profit = 0;

    salesItems.forEach(item => {
      const cost = avgCost[item.product_id] || 0;
      profit +=
        Number(item.subtotal) - cost * item.quantity;
    });

    setTotalProfit(Math.round(profit));

    /* =============================
       INVENTORY (PURCHASES − SALES)
    ============================== */
    const inventoryMap = {};

    productsData.forEach(p => {
      inventoryMap[p.id] = {
        id: p.id,
        name: p.name,
        purchased: 0,
        sold: 0,
        stock: 0,
      };
    });

    purchases.forEach(p => {
      if (inventoryMap[p.product_id]) {
        inventoryMap[p.product_id].purchased += p.quantity;
      }
    });

    salesItems.forEach(s => {
      if (inventoryMap[s.product_id]) {
        inventoryMap[s.product_id].sold += s.quantity;
      }
    });

    const inventoryArray = Object.values(inventoryMap).map(i => ({
      ...i,
      stock: i.purchased - i.sold,
    }));

    setInventory(inventoryArray);

    /* =============================
       BEST SELLING PRODUCTS
    ============================== */
    const salesMap = {};

    salesItems.forEach(item => {
      const name = item.products?.name;
      if (!name) return;
      salesMap[name] = (salesMap[name] || 0) + item.quantity;
    });

    const sortedSales = Object.entries(salesMap)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty);

    setBestSellers(sortedSales);
  }

  /* =============================
     DERIVED METRICS
  ============================== */
  const totalProducts = products.length;
  const totalUnits = inventory.reduce((s, i) => s + i.stock, 0);
  const lowStockCount = inventory.filter(i => i.stock <= 5).length;

  const topStocked = [...inventory]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5);

  const maxSold =
    bestSellers.length > 0 ? bestSellers[0].qty : 1;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Inventory, sales and profit insights
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
        <StatCard title="Total Products" value={totalProducts} />
        <StatCard
          title="Total Units in Stock"
          value={totalUnits}
          accent="green"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          accent="red"
        />
        <StatCard
          title="Total Revenue"
          value={`KES ${totalRevenue.toLocaleString()}`}
          accent="blue"
        />
        <StatCard
          title="Total Profit"
          value={`KES ${totalProfit.toLocaleString()}`}
          accent="purple"
        />
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border rounded-xl p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Best Selling Products
          </h2>

          {bestSellers.length === 0 ? (
            <p className="text-sm text-gray-500">
              No sales data available yet.
            </p>
          ) : (
            <div className="space-y-4">
              {bestSellers.map(item => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.name}</span>
                    <span>{item.qty} sold</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(item.qty / maxSold) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Top Stocked Products
          </h2>

          <ul className="space-y-3 text-sm">
            {topStocked.map((p, i) => (
              <li key={p.id} className="flex justify-between">
                <span>{i + 1}. {p.name}</span>
                <span className="font-medium">{p.stock}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, accent }) {
  const accents = {
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div
      className={`rounded-xl border p-6 ${
        accents[accent] || "bg-gray-50 text-gray-800"
      }`}
    >
      <p className="text-sm font-medium">{title}</p>
      <p className="text-2xl font-semibold mt-2">{value}</p>
    </div>
  );
}
