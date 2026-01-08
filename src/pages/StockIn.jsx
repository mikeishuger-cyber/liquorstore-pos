import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function StockIn() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState('');
  const [cost, setCost] = useState('');

  useEffect(() => {
    supabase.from('products').select('*').then(({ data }) => setProducts(data));
  }, []);

  const save = async () => {
    await supabase.from('stock_purchases').insert({
      product_id: productId,
      quantity: qty,
      cost_price: cost
    });
    alert('Stock added');
  };

  return (
    <>
      <h1>Stock In</h1>

      <select onChange={e => setProductId(e.target.value)}>
        <option>Select product</option>
        {products.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <input placeholder="Quantity" onChange={e => setQty(e.target.value)} />
      <input placeholder="Cost price" onChange={e => setCost(e.target.value)} />
      <button onClick={save}>Save</button>
    </>
  );
}
