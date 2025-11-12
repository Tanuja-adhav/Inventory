import React, { useEffect, useState } from 'react';
import API from '../api/axios';

export default function ProductForm({ editing, onSaved }) {
  const [form, setForm] = useState({ name:'', description:'', quantity:0, price:0, category:'' });

  useEffect(()=> {
    if (editing) setForm({
      name: editing.name || '',
      description: editing.description || '',
      quantity: editing.quantity || 0,
      price: editing.price || 0,
      category: editing.category || ''
    });
  }, [editing]);

  const submit = async e => {
    e.preventDefault();
    try {
      if (editing && editing._id) {
        await API.put(`/products/${editing._id}`, form);
      } else {
        await API.post('/products', form);
      }
      setForm({ name:'', description:'', quantity:0, price:0, category:'' });
      onSaved?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <form onSubmit={submit} style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
      <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
      <input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} />
      <input type="number" placeholder="Quantity" value={form.quantity} onChange={e=>setForm({...form,quantity: Number(e.target.value)})}/>
      <input type="number" placeholder="Price" value={form.price} onChange={e=>setForm({...form,price: Number(e.target.value)})}/>
      <input placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
      <button>{editing ? 'Update' : 'Add'} Product</button>
    </form>
  );
}
