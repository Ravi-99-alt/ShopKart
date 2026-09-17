import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AuthProvider, useAuth } from "./context";
import "./App.css";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Wishlist from "./pages/Wishlist";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  if (location.pathname.startsWith("/admin")) return null;

  const submitSearch = (event) => {
    event.preventDefault();
    const value = search.trim();
    navigate(value ? `/products?search=${encodeURIComponent(value)}` : "/products");
  };

  return (
    <header className="site-header">
      <div className="top-header">
        <div className="header-inner">
          <Link to="/" className="brand">ShopKart</Link>
          <form className="header-search" onSubmit={submitSearch}>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, brands and more" />
            <button type="submit">Search</button>
          </form>
          <div className="header-actions">
            {user ? (
              <div className="account-menu">
                <span className="account-label">Hello, {user.username}</span>
                <button type="button" onClick={logout}>Logout</button>
              </div>
            ) : (
              <Link to="/login" className="header-link">Login</Link>
            )}
            {isAdmin && <Link to="/admin/dashboard" className="header-link">Admin</Link>}
            <Link to="/orders" className="header-link">Orders</Link>
            <Link to="/cart" className="header-cart">Cart</Link>
          </div>
        </div>
      </div>
      <nav className="category-nav">
        <div className="header-inner category-nav-inner">
          <Link to="/products">All Products</Link>
          <Link to="/products">Electronics</Link>
          <Link to="/products">Fashion</Link>
          <Link to="/products">Home</Link>
          <Link to="/products">Accessories</Link>
          <Link to="/wishlist">Wishlist</Link>
          <span className="nav-spacer" />
          <span>ShopKart Marketplace</span>
        </div>
      </nav>
    </header>
  );
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <footer className="site-footer">
        <div className="footer-inner">
          <div><strong>ShopKart</strong><p>Your everyday online marketplace.</p></div>
          <div><strong>Customer Service</strong><p>Orders · Returns · Support</p></div>
          <div><strong>Account</strong><p>Login · Register · Wishlist</p></div>
        </div>
        <div className="footer-bottom">© {new Date().getFullYear()} ShopKart. All rights reserved.</div>
      </footer>
    </>
  );
}

function App() {
  return <BrowserRouter><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter>;
}

export default App;
