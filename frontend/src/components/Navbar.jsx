import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar({ onSearch }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [fulltext, setFulltext] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  // Debounced suggestions
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      try {
        // use small limit for dropdown
        const res = await api.get(`/products/search?q=${encodeURIComponent(query)}&page=1&perPage=5`);
        setSuggestions(res.data.products || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error("suggest error", err);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timerRef.current);
  }, [query]);

  const runSearch = (q = query, ft = fulltext) => {
    const trimmed = (q || "").trim();
    if (!trimmed) return;
    // navigate to products page and call parent's onSearch so ProductsPage shows result
    navigate("/products");
    onSearch?.(trimmed, ft);
    setShowSuggestions(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const onSelectSuggestion = (p) => {
    setQuery(p.name);
    runSearch(p.name, fulltext);
  };

  const clearInput = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    // keep focus
    inputRef.current?.focus();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("logout failed", err);
    }
  };

  const displayName = user?.firstname || user?.name || user?.email?.split?.("@")?.[0] || "User";

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Left logo + links */}
        <div className="flex items-center gap-6">
          <Link to="/home" className="text-indigo-700 font-bold text-xl">EasyBuy</Link>
          <Link to="/home" className={`hidden sm:inline hover:text-indigo-600 ${location.pathname === "/home" ? "font-semibold" : ""}`}>Home</Link>
          <Link to="/products" className={`hidden sm:inline hover:text-indigo-600 ${location.pathname === "/products" ? "font-semibold" : ""}`}>All Products</Link>
        </div>

        {/* Search center */}
        <div className="relative flex-1 max-w-2xl">
          <div className="flex items-center">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
              placeholder="Search products..."
              className="w-full border rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            {query && (
              <button onClick={clearInput} aria-label="Clear search" className="px-2">
                ✕
              </button>
            )}
            <button
              onClick={() => runSearch()}
              className="bg-indigo-600 text-white px-3 py-2 rounded-r-md hover:bg-indigo-700"
            >
              Search
            </button>

            <label className="ml-3 inline-flex items-center text-sm">
              <input type="checkbox" checked={fulltext} onChange={(e) => setFulltext(e.target.checked)} className="mr-1" />
              Full-text
            </label>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 bg-white border rounded-b-md shadow mt-1 z-50 max-h-56 overflow-auto text-sm">
              {suggestions.map((p) => (
                <li key={p.id} onMouseDown={() => onSelectSuggestion(p)} className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between">
                  <span className="truncate mr-3">{p.name}</span>
                  <span className="font-medium text-indigo-600">₹{p.discountedPrice ?? p.price ?? p.mrpPrice}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right — user */}
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <div className="text-sm">Welcome, <strong>{displayName}</strong>!</div>
              <button onClick={handleLogout} className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Logout</button>
            </>
          ) : (
            <Link to="/" className="text-sm text-indigo-600">Sign in</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
