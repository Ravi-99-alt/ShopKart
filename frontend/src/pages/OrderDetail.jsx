import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const orderResponse = await api.get(`/orders/${id}/`);
      setOrder(orderResponse.data);
      const paymentResponse = await api.get(`/payments/list/`).catch(() => ({ data: [] }));
      const payments = Array.isArray(paymentResponse.data) ? paymentResponse.data : paymentResponse.data?.results || [];
      setPayment(payments.find((item) => Number(item.order) === Number(id)) || null);
    } catch (err) { setError(err.response?.data?.detail || "Unable to load this order."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const cancelOrder = async () => {
    try { setCancelling(true); await api.patch(`/orders/${id}/cancel/`); await load(); }
    catch (err) { setError(err.response?.data?.detail || "Unable to cancel the order."); }
    finally { setCancelling(false); }
  };

  if (loading) return <main className="products-page"><div className="loading-box"><div className="loading-spinner" /><h2>Loading Order...</h2><p>Please wait.</p></div></main>;
  if (!order) return <main className="products-page"><div className="error-box"><h2>Order Not Found</h2><p>{error}</p><Link to="/orders" className="primary-btn">Back to Orders</Link></div></main>;

  const items = order.items || order.order_items || [];
  return <main className="order-detail-page"><div className="order-detail-container"><Link to="/orders" className="back-link">← Back to Orders</Link><div className="order-detail-header"><div><span className="cart-label">SHOPKART</span><h1>Order #{order.id}</h1><p>{order.created_at ? new Date(order.created_at).toLocaleString("en-IN") : ""}</p></div><span className="status-badge">{order.status}</span></div>{error && <div className="auth-error">Error: {error}</div>}<section className="order-detail-card"><h2>Order Items</h2>{items.length ? items.map((item, index) => <div className="order-item" key={item.id || index}><div><strong>{item.product_name || item.product?.name || `Product ${item.product || ""}`}</strong><p>Quantity: {item.quantity}</p></div><strong>₹{Number(item.subtotal || item.price || 0).toLocaleString("en-IN")}</strong></div>) : <p>Order items are not available in this response.</p>}<div className="summary-divider" /><div className="summary-total"><span>Total</span><strong>₹{Number(order.total || 0).toLocaleString("en-IN")}</strong></div></section>{payment && <section className="order-detail-card"><h2>Payment</h2><div className="summary-row"><span>Method</span><span>{payment.payment_method}</span></div><div className="summary-row"><span>Status</span><span>{payment.status}</span></div></section>}{order.status === "pending" && <button className="danger-btn" onClick={cancelOrder} disabled={cancelling}>{cancelling ? "Cancelling..." : "Cancel Order"}</button>}</div></main>;
}

export default OrderDetail;
