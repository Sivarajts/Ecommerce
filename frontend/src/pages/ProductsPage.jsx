import React, { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import ProductList from "../components/ProductList.jsx";

export default function ProductsPage() {
  // qObj: { q: string, fulltext: boolean } — passed from Navbar via App/App-level handler
  const [qObj, setQObj] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearch={(q, fulltext) => setQObj(q ? { q, fulltext } : null)} />
      <main className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">All Products</h2>
        {/* showAll = true -> list all products or the search results */}
        <ProductList showAll={true} qObj={qObj} perPage={12} />
      </main>
    </div>
  );
}
