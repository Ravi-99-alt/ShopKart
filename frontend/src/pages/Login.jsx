import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.username.trim() || !formData.password) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/accounts/login/", {
        username: formData.username.trim(),
        password: formData.password,
      });

      const { access, refresh } = response.data;

      if (!access || !refresh) {
        setError("Login response did not contain valid tokens.");
        return;
      }

      let userData = null;

      try {
        const profileResponse = await api.get("/accounts/profile/", {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });

        userData = profileResponse.data;
      } catch (profileError) {
        console.warn("Profile could not be loaded:", profileError);
      }

      login(access, refresh, userData);

      navigate("/");
    } catch (err) {
      console.error("Login Error:", err);

      if (err.response) {
        if (err.response.status === 401) {
          setError("Invalid username or password.");
        } else if (err.response.data?.detail) {
          setError(err.response.data.detail);
        } else {
          setError(`Login failed. Server error: ${err.response.status}`);
        }
      } else {
        setError("Unable to connect to the Django backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <div className="auth-icon">🔐</div>

          <p className="auth-label">
            SHOPKART ACCOUNT
          </p>

          <h1>Welcome Back</h1>

          <p>
            Login to continue shopping with ShopKart.
          </p>
        </div>

        {error && (
          <div className="auth-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="form-group">
            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="primary-btn auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?
          </p>

          <Link to="/register">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Login;