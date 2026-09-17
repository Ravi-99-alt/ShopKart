import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const response = await api.get("/wishlist/");
      setItems(Array.isArray(response.data) ? response.data : response.data?.results || []);
    } catch (err) { setError(err.response?.data?.detail || "Please login to view your wishlist."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const remove = async (productId) => {
    try { await api.delete(`/wishlist/remove/${productId}/`); setMessage("Product removed from wishlist."); await load(); }
    catch (err) { setError(err.response?.data?.detail || "Unable to remove product."); }
  };

  if (loading) return <main className="products-page"><div className="loading-box"><div className="loading-spinner" /><h2>Loading Wishlist...</h2><p>Please wait.</p></div></main>;
  return <main className="products-page"><div className="products-container"><div className="products-header"><div><span className="cart-label">SHOPKART</span><h1>My Wishlist</h1><p>Save your favorite products for later.</p></div><Link to="/products" className="continue-shopping">← Continue Shopping</Link></div>{error && <div className="auth-error">Error: {error}</div>}{message && <div className="auth-success">✓ {message}</div>}{items.length === 0 ? <div className="empty-cart-box"><div className="empty-cart-icon">♡</div><h2>Your Wishlist is Empty</h2><p>Save products you love and find them here later.</p><Link to="/products" className="primary-btn">Browse Products</Link></div> : <div className="products-grid">{items.map((item) => { const product = item.product_details || item.product_data || (typeof item.product === "object" ? item.product : null); const id = product?.id || item.product || item.product_id; const name = product?.name || item.product_name || "Product"; const image = product?.image || item.product_image || item.image; const price = product?.discount_price ?? product?.price ?? item.discount_price ?? item.price ?? 0; return <article className="product-card" key={item.id}><div className="product-image">{image ? <img src={image} alt={name} /> : <div className="no-image"></div>}</div><div className="product-info"><span className="product-category">Wishlist</span><h2>{name}</h2><div className="product-price"><strong>₹{Number(price).toLocaleString("en-IN")}</strong></div><div className="product-actions"><Link to={`/products/${id}`} className="product-btn">View Product</Link><button className="secondary-btn wishlist-btn" onClick={() => remove(id)}>Remove</button></div></div></article>; })}</div>}</div></main>;
}

export default Wishlist;
