import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders/list/");
      setOrders(Array.isArray(response.data) ? response.data : response.data?.results || []);
    } catch (err) { setError(err.response?.data?.detail || "Please login to view your orders."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  if (loading) return <main className="products-page"><div className="loading-box"><div className="loading-spinner" /><h2>Loading Orders...</h2><p>Please wait.</p></div></main>;
  return <main className="products-page"><div className="products-container"><div className="products-header"><div><span className="cart-label">SHOPKART</span><h1>My Orders</h1><p>View your recent orders and status.</p></div></div>{error && <div className="auth-error">Error: {error}</div>}{!error && orders.length === 0 ? <div className="empty-cart-box"><div className="empty-cart-icon"></div><h2>No Orders Yet</h2><p>Your completed purchases will appear here.</p><Link to="/products" className="primary-btn">Shop Products</Link></div> : <div className="orders-list">{orders.map((order) => <article className="order-card" key={order.id}><div><span className="order-number">Order #{order.id}</span><h2>₹{Number(order.total || 0).toLocaleString("en-IN")}</h2><p>{order.created_at ? new Date(order.created_at).toLocaleString("en-IN") : ""}</p></div><div className="order-status">{order.status || "pending"}</div><Link to={`/orders/${order.id}`} className="product-btn">View Details</Link></article>)}</div>}</div></main>;
}

export default Orders;
