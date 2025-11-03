import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import CategoryList from "../components/CategoryList";
import ProductList from "../components/ProductList";
import axios from "axios";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get(`http://localhost:5000/api/products/categories?page=${page}&limit=5`);
      setCategories(res.data.categories);
      setTotalPages(res.data.totalPages);
    };
    fetchCategories();
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-indigo-700 mb-3">Welcome to EasyBuy</h1>
          <p className="text-gray-600">Your one-stop shop for all categories — Shop Now!</p>
        </div>

        <CategoryList
          categories={categories}
          page={page}
          totalPages={totalPages}
          onSelectCategory={(id) => setSelectedCategory(id)}
          onPageChange={setPage}
        />

        {selectedCategory && <ProductList categoryId={selectedCategory} />}
      </div>
    </div>
  );
}
