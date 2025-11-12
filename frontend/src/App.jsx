import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage.jsx";
import Home from "./pages/Home.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";

export default function App() {
  const { user, checking } = useAuth();
  if (checking) return <div className="text-center mt-20">Checking session...</div>;
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/home" /> : <AuthPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/products" element={user ? <ProductsPage /> : <Navigate to="/" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
