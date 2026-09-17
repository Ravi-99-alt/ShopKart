import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/accounts/login/", {
        username,
        password,
      });

      const data = response.data;

      localStorage.setItem("access_token", data.access);

      if (data.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
      }

      login(data.user || { username });

      navigate(data.user?.is_staff ? "/admin/dashboard" : "/products");
    } catch (err) {
      const data = err.response?.data;

      setError(
        data?.detail ||
        data?.non_field_errors?.[0] ||
        "Invalid username or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-brand"></div>

        <span className="cart-label">SHOPKART</span>

        <h1>Welcome Back</h1>
        <p>Login to continue shopping.</p>

        {error && <div className="auth-error">Error: {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">

          <label>
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </label>

          <label>
            Password

            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-eye"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5 0 8.5 4 9.5 6-.4.8-1.4 2.1-2.9 3.2" />
                    <path d="M6.1 6.1C4.4 7.3 3.3 8.8 2.5 10c1 2 4.5 6 9.5 6 1 0 2-.2 2.9-.5" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          <button
            className="primary-btn auth-submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="auth-footer">
          New to ShopKart?{" "}
          <Link to="/register">Create an account</Link>
        </p>

        <Link to="/admin/login" className="admin-login-link">
          Admin Login
        </Link>
      </div>
    </main>
  );
}

export default Login;