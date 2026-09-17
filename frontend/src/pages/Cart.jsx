import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCart = async () => {
    try {
      setLoading(true); setError("");
      const response = await api.get("/cart/");
      setCart(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Please login to view your cart.");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadCart(); }, []);

  const items = Array.isArray(cart) ? cart : cart?.items || cart?.results || [];
  const total = Number(cart?.total ?? items.reduce((sum, item) => sum + Number(item.subtotal ?? (item.price || item.product?.discount_price || item.product?.price || 0) * Number(item.quantity || 1)), 0));

  const updateQuantity = async (item, quantity) => {
    if (quantity < 1) return;
    try {
      setBusyId(item.id); setError(""); setMessage("");
      await api.patch(`/cart/items/${item.id}/update/`, { quantity });
      await loadCart();
    } catch (err) { setError(err.response?.data?.detail || "Unable to update quantity."); }
    finally { setBusyId(null); }
  };

  const removeItem = async (id) => {
    try {
      setBusyId(id); setError(""); setMessage("");
      await api.delete(`/cart/items/${id}/`);
      setMessage("Item removed from your cart.");
      await loadCart();
    } catch (err) { setError(err.response?.data?.detail || "Unable to remove item."); }
    finally { setBusyId(null); }
  };

  if (loading) return <main className="cart-page"><div className="loading-box"><div className="loading-spinner" /><h2>Loading Cart...</h2><p>Please wait.</p></div></main>;

  return (
    <main className="cart-page">
      <div className="cart-container">
        <div className="products-header">
          <div><span className="cart-label">SHOPKART</span><h1>My Cart</h1><p>Review your items before checkout.</p></div>
          <Link to="/products" className="continue-shopping">← Continue Shopping</Link>
        </div>
        {error && <div className="auth-error">Error: {error}</div>}
        {message && <div className="auth-success">✓ {message}</div>}
        {items.length === 0 ? (
          <div className="empty-cart-box"><div className="empty-cart-icon"></div><h2>Your Cart is Empty</h2><p>Add products to continue.</p><Link to="/products" className="primary-btn">Start Shopping</Link></div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items">
              {items.map((item) => {
                const productId = item.product_id ?? item.product?.id ?? item.product;
                const name = item.product_name ?? item.product?.name ?? "Product";
                const image = item.product_image ?? item.product?.image;
                const price = Number(item.price ?? item.product?.discount_price ?? item.product?.price ?? 0);
                const quantity = Number(item.quantity || 1);
                return (
                  <article className="cart-item" key={item.id}>
                    <div className="cart-item-image">{image ? <img src={image} alt={name} /> : ""}</div>
                    <div className="cart-item-info">
                      <Link to={`/products/${productId}`}><h3>{name}</h3></Link>
                      <p>₹{price.toLocaleString("en-IN")} each</p>
                      <div className="quantity-controls">
                        <button disabled={busyId === item.id || quantity <= 1} onClick={() => updateQuantity(item, quantity - 1)}>−</button>
                        <span>{quantity}</span>
                        <button disabled={busyId === item.id} onClick={() => updateQuantity(item, quantity + 1)}>+</button>
                      </div>
                    </div>
                    <div className="cart-item-side">
                      <strong>₹{Number(item.subtotal ?? price * quantity).toLocaleString("en-IN")}</strong>
                      <button className="text-danger" onClick={() => removeItem(item.id)} disabled={busyId === item.id}>Remove</button>
                    </div>
                  </article>
                );
              })}
            </section>
            <aside className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row"><span>Items</span><span>{items.reduce((sum, item) => sum + Number(item.quantity || 1), 0)}</span></div>
              <div className="summary-row"><span>Subtotal</span><span>₹{total.toLocaleString("en-IN")}</span></div>
              <div className="summary-row"><span>Delivery</span><span className="free-delivery">FREE</span></div>
              <div className="summary-divider" />
              <div className="summary-total"><span>Total</span><strong>₹{total.toLocaleString("en-IN")}</strong></div>
              <button className="primary-btn checkout-btn" onClick={() => navigate("/checkout")}>Proceed to Checkout</button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default Cart;
