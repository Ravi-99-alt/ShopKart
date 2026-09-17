import {
  BrowserRouter,
  Link,
  Route,
  Routes,
} from "react-router-dom";

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

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="logo">
            ShopKart
          </Link>

          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
            <Link to="/cart">🛒 Cart</Link>
            <Link to="/orders">📦 Orders</Link>
            <Link to="/wishlist">❤️ Wishlist</Link>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/products" element={<Products />} />

        <Route
          path="/products/:id"
          element={<ProductDetail />}
        />

        <Route path="/cart" element={<Cart />} />

        <Route path="/checkout" element={<Checkout />} />

        <Route path="/orders" element={<Orders />} />

        <Route
          path="/orders/:id"
          element={<OrderDetail />}
        />

        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

        <Route path="/login" element={<Login />} />

        <Route
          path="/register"
          element={<Register />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;