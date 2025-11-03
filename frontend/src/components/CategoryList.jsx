// src/components/CategoryList.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import Pagination from "./Pagination";

export default function CategoryList({ onSelectCategory }) {
  const [cats, setCats] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 5;

  const fetchCats = async (p = 1) => {
    try {
      const res = await api.get(`/products/categories?page=${p}&limit=${perPage}`);
      setCats(res.data.categories || []);
      setPage(res.data.page || p);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) { console.error("fetchCats", err); }
  };

  useEffect(() => { fetchCats(1); }, []);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {cats.map(c => (
          <div key={c.category_id} onClick={() => onSelectCategory(c.category_id)} className="p-6 bg-white rounded shadow hover:shadow-lg cursor-pointer">
            <h3 className="text-xl font-semibold">{c.category_name}</h3>
            <p className="text-gray-500">{c.description}</p>
            <div className="mt-3">
              <button className="bg-indigo-600 text-white px-3 py-1 rounded">View Products</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <Pagination page={page} totalPages={totalPages} onPage={(p)=>fetchCats(p)} type="category" />
      </div>
    </div>
  );
}
