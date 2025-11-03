// src/pages/AuthPage.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const { signup, signin } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      setLoading(true);
      if (isSignup) {
        if (form.password !== form.confirmPassword)
          return setMsg("Passwords do not match");
        const res = await signup({
          firstname: form.firstname,
          lastname: form.lastname,
          email: form.email,
          password: form.password,
        });
        setMsg(res.message || "Account created successfully!");
        setTimeout(() => setIsSignup(false), 1000);
      } else {
        const res = await signin({
          email: form.email,
          password: form.password,
        });
        if (res?.user) navigate("/home");
      }
    } catch (err) {
      setMsg(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4">
          {isSignup ? "Create Account" : "Sign In"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignup && (
            <>
              <input
                name="firstname"
                placeholder="First Name"
                value={form.firstname}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
              <input
                name="lastname"
                placeholder="Last Name"
                value={form.lastname}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </>
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          {isSignup && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded"
          >
            {loading
              ? "Processing..."
              : isSignup
              ? "Sign Up"
              : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setIsSignup(false)}
                className="text-indigo-600"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setIsSignup(true)}
                className="text-indigo-600"
              >
                Sign Up
              </button>
            </>
          )}
        </p>
        {msg && <p className="mt-3 text-center text-red-500">{msg}</p>}
      </div>
    </div>
  );
}
