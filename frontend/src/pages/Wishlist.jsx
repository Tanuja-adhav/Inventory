import React, { useEffect, useState } from 'react';
import API from '../api/axios';

export default function Wishlist(){
  const [items, setItems] = useState([]);
  const fetch = async () => {
    try {
      const res = await API.get('/wishlist');
      setItems(res.data);
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };
  useEffect(()=>{ fetch(); }, []);

  const remove = async (id) => {
    try { await API.delete(`/wishlist/remove/${id}`); fetch(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  return (
    <div>
      <h2>Your Wishlist</h2>
      <table border="1" cellPadding="6" style={{width:'100%'}}>
        <thead><tr><th>Name</th><th>Price</th><th>Category</th><th>Action</th></tr></thead>
        <tbody>
          {items.map(p => (
            <tr key={p._id}>
              <td>{p.name}</td><td>{p.price}</td><td>{p.category}</td>
              <td><button onClick={()=>remove(p._id)}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
