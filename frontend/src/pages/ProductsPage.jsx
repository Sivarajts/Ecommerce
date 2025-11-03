import React, { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import ProductList from "../components/ProductList.jsx";

export default function ProductsPage() {
  // --- FIX: qObj is now just a string 'q' ---
  const [q, setQ] = useState(null); // Was [qObj, setQObj]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- FIX: onSearch now only provides the query string --- */}
      <Navbar onSearch={(query) => setQ(query)} /> {/* Was (q, fulltext) => setQObj(...) */}
      <main className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">
          {q ? `Results for "${q}"` : "All Products"}
        </h2>
        
        {/* --- FIX: Pass 'q' string directly to ProductList, not qObj --- */}
        <ProductList showAll={true} q={q} perPage={12} /> {/* Was qObj={qObj} */}
      </main>
    </div>
  );
}