import React from "react";

export default function Pagination({ page, totalPages, onPage, type = "category" }) {
  if (!totalPages || totalPages <= 1) return null;

  if (type === "category") {
    // show only up to 3 pages for category (common pattern you requested)
    const maxPages = Math.min(totalPages, 3);
    const pages = Array.from({ length: maxPages }, (_, i) => i + 1);
    return (
      <div className="flex items-center justify-center mt-6 space-x-2">
        <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
        {pages.map(p => (
          <button key={p} onClick={() => onPage(p)} className={`px-3 py-1 border rounded ${p === page ? 'bg-indigo-600 text-white' : ''}`}>{p}</button>
        ))}
        <button onClick={() => onPage(Math.min(maxPages, page + 1))} disabled={page >= maxPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    );
  }

  // full pagination for "All Products"
  const maxVisible = 5;
  let start = Math.max(1, page - 2);
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center mt-6 space-x-1">
      <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>

      {start > 1 && <>
        <button onClick={() => onPage(1)} className="px-3 py-1 border rounded">1</button>
        {start > 2 && <span className="px-2">…</span>}
      </>}

      {pages.map(p => (
        <button key={p} onClick={() => onPage(p)} className={`px-3 py-1 border rounded ${p === page ? 'bg-indigo-600 text-white' : ''}`}>{p}</button>
      ))}

      {end < totalPages && <>
        {end < totalPages - 1 && <span className="px-2">…</span>}
        <button onClick={() => onPage(totalPages)} className="px-3 py-1 border rounded">{totalPages}</button>
      </>}

      <button onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
    </div>
  );
}
