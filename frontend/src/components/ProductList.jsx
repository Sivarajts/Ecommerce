import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import Pagination from "./Pagination";

export default function ProductList({ categoryId, showAll = false, qObj = null, perPage = 10 }) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const normalizeProduct = (p) => ({
    id: p.id,
    name: p.name ?? p.product_name ?? "",
    description: p.description ?? "",
    mrpPrice: p.mrpPrice ?? p.mrp_price ?? p.mrp_price,
    discountedPrice: p.discountedPrice ?? p.discounted_price ?? p.discounted_price,
    quantity: p.quantity ?? 0,
    imageUrl: p.imageUrl ?? p.image_url ?? null,
    category_id: p.category_id ?? p.categoryId ?? null,
  });

  const fetchProducts = async (p = 1) => {
    try {
      let endpoint;
      if (qObj?.q) {
        // search endpoint (fulltext flag currently handled server-side)
        endpoint = `/products/search?q=${encodeURIComponent(qObj.q)}&page=${p}&perPage=${perPage}`;
      } else if (showAll) {
        endpoint = `/products?page=${p}&perPage=${perPage}`;
      } else {
        if (!categoryId) {
          setProducts([]);
          setTotalPages(1);
          return;
        }
        endpoint = `/products/category/${categoryId}?page=${p}&perPage=${perPage}`;
      }

      const res = await api.get(endpoint);
      const dataProducts = res.data.products || [];
      setProducts(dataProducts.map(normalizeProduct));
      setPage(res.data.page || p);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("fetchProducts error", err);
      setProducts([]);
      setTotalPages(1);
    }
  };

  // fetch whenever key inputs change
  useEffect(() => {
    setPage(1);
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, showAll, qObj]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="p-4 bg-white shadow rounded">
            <h3 className="text-lg font-semibold truncate">{p.name}</h3>
            <p className="text-gray-500 line-clamp-2">{p.description}</p>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <div className="text-sm text-gray-500">MRP ₹{p.mrpPrice}</div>
                <div className="text-indigo-600 font-bold">₹{p.discountedPrice ?? p.mrpPrice}</div>
              </div>
              <div className="text-sm text-green-600">{p.quantity > 0 ? "In Stock" : "Out of Stock"}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPage={(p) => { setPage(p); fetchProducts(p); }}
          type={showAll ? "all" : "category"}
        />
      </div>
    </div>
  );
}
