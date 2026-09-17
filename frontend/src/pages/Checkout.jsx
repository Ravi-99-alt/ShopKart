import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Checkout() {
  const [cart, setCart] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    api.get("/cart/").then((response) => setCart(response.data)).catch((err) => setError(err.response?.data?.detail || "Please login to continue.")).finally(() => setLoading(false));
  }, []);

  const items = Array.isArray(cart) ? cart : cart?.items || cart?.results || [];
  const total = Number(cart?.total ?? items.reduce((sum, item) => sum + Number(item.subtotal ?? 0), 0));

  const placeOrder = async () => {
    if (!items.length) return setError("Your cart is empty.");
    try {
      setPlacing(true); setError("");
      const orderResponse = await api.post("/orders/", {});
      const order = orderResponse.data;
      await api.post("/payments/", { order: order.id, payment_method: paymentMethod });
      setSuccess(order);
    } catch (err) {
      const data = err.response?.data;
      if (data?.detail) setError(data.detail);
      else if (data && typeof data === "object") setError(Object.entries(data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(" ") : value}`).join(" "));
      else setError("Unable to place the order.");
    } finally { setPlacing(false); }
  };

  if (loading) return <main className="checkout-page"><div className="loading-box"><div className="loading-spinner" /><h2>Loading Checkout...</h2><p>Please wait.</p></div></main>;
  if (success) return <main className="checkout-page"><div className="checkout-container"><div className="empty-cart-box"><div className="empty-cart-icon">✓</div><span className="cart-label">SHOPKART</span><h1>Order Created</h1><p>Your order has been created successfully.</p><p><strong>Order #{success.id}</strong></p><p>Total: <strong>₹{Number(success.total || total).toLocaleString("en-IN")}</strong></p><Link to={`/orders/${success.id}`} className="primary-btn">View Order</Link></div></div></main>;

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header"><div><span className="cart-label">SHOPKART</span><h1>Checkout</h1><p>Review your order and choose a payment method.</p></div><Link to="/cart" className="continue-shopping">← Back to Cart</Link></div>
        {error && <div className="auth-error">Error: {error}</div>}
        {!items.length ? <div className="empty-cart-box"><div className="empty-cart-icon"></div><h1>Your Cart is Empty</h1><Link to="/products" className="primary-btn">Start Shopping</Link></div> : (
          <div className="checkout-layout">
            <section className="checkout-main">
              <div className="checkout-card"><div className="checkout-card-header"><span className="checkout-step">1</span><div><h2>Order Items</h2><p>{items.length} product{items.length !== 1 ? "s" : ""}</p></div></div>
                <div className="checkout-items">{items.map((item) => <div className="checkout-item" key={item.id}><div><h3>{item.product_name || item.product?.name || "Product"}</h3><p>₹{Number(item.price || 0).toLocaleString("en-IN")} × {item.quantity}</p></div><strong>₹{Number(item.subtotal || 0).toLocaleString("en-IN")}</strong></div>)}</div>
              </div>
              <div className="checkout-card"><div className="checkout-card-header"><span className="checkout-step">2</span><div><h2>Payment Method</h2><p>Choose how you want to pay.</p></div></div>
                <div className="payment-options">{[["cod", "Cash on Delivery", "Pay when your order arrives."], ["card", "Credit / Debit Card", "Choose card payment."], ["upi", "UPI", "Pay using your UPI application."], ["netbanking", "Net Banking", "Pay through your bank."]].map(([value, title, text]) => <label className="payment-option" key={value}><input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={(e) => setPaymentMethod(e.target.value)} /><div><strong>{title}</strong><span>{text}</span></div></label>)}</div>
              </div>
            </section>
            <aside className="checkout-summary"><h2>Order Summary</h2><div className="summary-row"><span>Items</span><span>{items.reduce((sum, item) => sum + Number(item.quantity || 1), 0)}</span></div><div className="summary-row"><span>Subtotal</span><span>₹{total.toLocaleString("en-IN")}</span></div><div className="summary-row"><span>Delivery</span><span className="free-delivery">FREE</span></div><div className="summary-divider" /><div className="summary-total"><span>Total</span><strong>₹{total.toLocaleString("en-IN")}</strong></div><button className="primary-btn checkout-btn" onClick={placeOrder} disabled={placing}>{placing ? "Placing Order..." : "Place Order"}</button><p className="secure-checkout">Secure ShopKart Checkout</p></aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default Checkout;
