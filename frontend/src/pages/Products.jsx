import React, { useEffect, useState } from "react";
import API from "../api/axios";

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/products");
        setProducts(res.data);
      } catch (err) {
        console.error("API fetch error:", err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Products</h1>
      {products.length === 0 ? (
        <p>No products available</p>
      ) : (
        <ul>
          {products.map(p => <li key={p._id}>{p.name}</li>)}
        </ul>
      )}
    </div>
  );
}
