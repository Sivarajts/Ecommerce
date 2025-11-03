import React from "react";

export default function ProductCard({ p }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold">{p.name}</h3>
      <div className="text-sm text-gray-500">Category: {p.category_id}</div>
      <div className="mt-2 flex justify-between items-center">
        <div>
          <div className="text-gray-500 text-sm">MRP ₹{p.mrp_price}</div>
          <div className="font-medium text-indigo-600">₹{p.discounted_price}</div>
        </div>
        <div className="text-sm text-gray-600">Qty: {p.quantity}</div>
      </div>
    </div>
  );
}
