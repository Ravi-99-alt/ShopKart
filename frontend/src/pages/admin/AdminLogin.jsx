import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context";

function AdminLogin() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true); setError("");
      const response = await api.post("/accounts/login/", { username, password });
      localStorage.setItem("access_token", response.data.access);
      if (response.data.refresh) localStorage.setItem("refresh_token", response.data.refresh);
      login(response.data.user || { username });

      const adminCheck = await api.get("/orders/admin/summary/");
      if (!adminCheck.data) throw new Error("Not an admin");
      navigate("/admin/dashboard");
    } catch (err) {
      logout();
      if (err.response?.status === 403) setError("This account does not have admin access.");
      else setError(err.response?.data?.detail || "Admin login failed.");
    } finally { setLoading(false); }
  };

  return <main className="admin-login-page"><div className="admin-login-card"><div className="admin-logo"></div><span className="cart-label">SHOPKART ADMIN</span><h1>Admin Login</h1><p>Manage products, orders, payments and coupons.</p>{error && <div className="auth-error">Error: {error}</div>}<form className="auth-form" onSubmit={submit}><label>Username<input value={username} onChange={(e) => setUsername(e.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label><button className="primary-btn auth-submit" disabled={loading}>{loading ? "Checking..." : "Login to Dashboard"}</button></form></div></main>;
}

export default AdminLogin;
