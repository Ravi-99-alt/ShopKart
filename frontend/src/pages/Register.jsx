import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const update = (field) => (event) =>
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password !== form.password2) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/accounts/register/", {
        username: form.username,
        email: form.email,
        password: form.password,
        password2: form.password2,
      });

      navigate("/login");
    } catch (err) {
      const data = err.response?.data;

      if (typeof data === "object" && data !== null) {
        setError(
          Object.entries(data)
            .map(
              ([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(" ") : value}`
            )
            .join(" ")
        );
      } else {
        setError("Unable to create your account.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card wide">
        <div className="auth-brand"></div>

        <span className="cart-label">SHOPKART</span>

        <h1>Create Account</h1>
        <p>Join ShopKart and start shopping.</p>

        {error && <div className="auth-error">Error: {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">

          <label>
            Username
            <input
              type="text"
              value={form.username}
              onChange={update("username")}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              required
            />
          </label>

          <label>
            Password
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={update("password")}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <label>
            Confirm Password
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={form.password2}
                onChange={update("password2")}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword((current) => !current)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <button
            className="primary-btn auth-submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}

export default Register;