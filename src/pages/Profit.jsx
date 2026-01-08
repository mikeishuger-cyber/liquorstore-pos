import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Profit() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    supabase.from('profit_summary').select('*').then(({ data }) => setRows(data));
  }, []);

  const total = rows.reduce((s, r) => s + r.profit, 0);

  return (
    <>
      <h1>Profit & Loss</h1>
      <h2>{total >= 0 ? '🟢' : '🔴'} {Math.abs(total)}</h2>

      {rows.map(r => (
        <div key={r.product_id}>
          {r.name}: {r.profit >= 0 ? '🟢' : '🔴'} {Math.abs(r.profit)}
        </div>
      ))}
    </>
  );
}
