import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setSuccess("");

    if (
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.password2
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password !== formData.password2) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/accounts/register/", {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password2: formData.password2,
      });

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setFormData({
        username: "",
        email: "",
        password: "",
        password2: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Registration Error:", err);

      if (err.response?.data) {
        const data = err.response.data;

        if (typeof data === "string") {
          setError(data);
        } else {
          const messages = Object.entries(data)
            .map(([field, value]) => {
              const message = Array.isArray(value)
                ? value.join(" ")
                : String(value);

              return `${field}: ${message}`;
            })
            .join(" ");

          setError(messages || "Registration failed.");
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
          <div className="auth-icon">🛍️</div>

          <p className="auth-label">
            SHOPKART ACCOUNT
          </p>

          <h1>Create Account</h1>

          <p>
            Join ShopKart and start shopping today.
          </p>
        </div>

        {error && (
          <div className="auth-error">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="auth-success">
            ✅ {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >

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
              placeholder="Choose a username"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
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
              placeholder="Create a password"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password2">
              Confirm Password
            </label>

            <input
              id="password2"
              name="password2"
              type="password"
              value={formData.password2}
              onChange={handleChange}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="primary-btn auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <div className="auth-footer">
          <p>
            Already have an account?
          </p>

          <Link to="/login">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Register;