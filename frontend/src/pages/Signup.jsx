import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup({ switchToLogin }) {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstname: "", lastname: "", email: "", password: "", confirmPassword: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!form.firstname || !form.lastname || !form.email || !form.password || !form.confirmPassword) return setMsg("All fields required");
    if (form.password.length < 5) return setMsg("Password must be >=5 chars");
    if (form.password !== form.confirmPassword) return setMsg("Passwords must match");
    try {
      setLoading(true);
      await signup({ firstname: form.firstname, lastname: form.lastname, email: form.email, password: form.password });
      setMsg("Account created — please sign in");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setMsg(err.response?.data?.error || "Signup failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="bg-white p-8 rounded-2xl shadow w-96">
        <h2 className="text-2xl font-bold mb-4">Create account</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <input name="firstname" placeholder="First name" value={form.firstname} onChange={onChange} className="w-full border p-2 rounded" />
          <input name="lastname" placeholder="Last name" value={form.lastname} onChange={onChange} className="w-full border p-2 rounded" />
          <input name="email" placeholder="Email" value={form.email} onChange={onChange} className="w-full border p-2 rounded" />
          <input name="password" placeholder="Password" type="password" value={form.password} onChange={onChange} className="w-full border p-2 rounded" />
          <input name="confirmPassword" placeholder="Confirm password" type="password" value={form.confirmPassword} onChange={onChange} className="w-full border p-2 rounded" />
          <button className="w-full bg-indigo-600 text-white p-2 rounded">{loading ? "Signing..." : "Sign up"}</button>
        </form>
        <p className="mt-3 text-sm text-center">
          Already have account? <button className="text-indigo-600" onClick={switchToLogin}>Sign in</button>
        </p>
        {msg && <p className="mt-3 text-center text-red-500">{msg}</p>}
      </div>
    </div>
  );
}
