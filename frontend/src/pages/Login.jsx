import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Login({ switchToSignup }) {
  const { signin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!form.email || !form.password) return setMsg("Missing credentials");
    try {
      setLoading(true);
      await signin({ email: form.email, password: form.password });
      navigate("/home");
    } catch (err) {
      setMsg(err.response?.data?.error || "Invalid credentials");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="bg-white p-8 rounded-2xl shadow w-96">
        <h2 className="text-2xl font-bold mb-4">Sign in</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <input name="email" placeholder="Email" value={form.email} onChange={onChange} className="w-full border p-2 rounded" />
          <input name="password" placeholder="Password" type="password" value={form.password} onChange={onChange} className="w-full border p-2 rounded" />
          <button className="w-full bg-indigo-600 text-white p-2 rounded">{loading ? "Signing in..." : "Sign in"}</button>
        </form>
        <p className="mt-3 text-sm text-center">
          Don’t have account? <button className="text-indigo-600" onClick={switchToSignup}>Sign up</button>
        </p>
        {msg && <p className="mt-3 text-center text-red-500">{msg}</p>}
      </div>
    </div>
  );
}
