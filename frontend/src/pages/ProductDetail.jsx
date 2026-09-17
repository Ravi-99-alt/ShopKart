import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const productResponse = await api.get(`/products/${id}/`);
        setProduct(productResponse.data);
        const reviewsResponse = await api.get(`/reviews/product/${id}/`).catch(() => ({ data: [] }));
        setReviews(Array.isArray(reviewsResponse.data) ? reviewsResponse.data : reviewsResponse.data?.results || []);
      } catch (err) {
        setError(err.response?.data?.detail || "Unable to load this product.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const addToCart = async () => {
    try {
      setBusy(true); setError(""); setMessage("");
      await api.post("/cart/add/", { product: product.id, quantity });
      setMessage(`${product.name} added to your cart.`);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to add the product to your cart.");
    } finally { setBusy(false); }
  };

  const addToWishlist = async () => {
    try {
      setBusy(true); setError(""); setMessage("");
      await api.post("/wishlist/add/", { product: product.id });
      setMessage(`${product.name} added to your wishlist.`);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to add the product to your wishlist.");
    } finally { setBusy(false); }
  };

  if (loading) return <main className="products-page"><div className="loading-box"><div className="loading-spinner" /><h2>Loading Product...</h2><p>Please wait.</p></div></main>;
  if (error && !product) return <main className="products-page"><div className="error-box"><div className="error-icon">Error:</div><h2>Product Not Found</h2><p>{error}</p><Link to="/products" className="primary-btn">Back to Products</Link></div></main>;

  const price = product.discount_price ?? product.price;
  const discounted = product.discount_price != null && Number(product.discount_price) < Number(product.price);

  return (
    <main className="product-detail-page">
      <div className="product-detail-container">
        <Link to="/products" className="back-link">← Back to Products</Link>
        <div className="product-detail-card">
          <div className="product-detail-image">
            {product.image ? <img src={product.image} alt={product.name} /> : <div className="no-image large"></div>}
          </div>
          <div className="product-detail-info">
            <span className="product-category">{product.category_name || "ShopKart"}</span>
            <h1>{product.name}</h1>
            <div className="product-rating detail-rating">★ {product.average_rating != null ? Number(product.average_rating).toFixed(1) : "No rating"} <span className="review-count">({reviews.length} reviews)</span></div>
            <div className="product-detail-price">
              <strong>₹{Number(price || 0).toLocaleString("en-IN")}</strong>
              {discounted && <span className="old-price">₹{Number(product.price).toLocaleString("en-IN")}</span>}
            </div>
            {discounted && <span className="discount-label">Special Discount Available</span>}
            <div className="product-description"><h3>Product Description</h3><p>{product.description || "No product description available."}</p></div>
            <div className="product-stock-detail">
              <span className={Number(product.stock) > 0 ? "stock-dot" : "out-stock-dot"} />
              <strong>{Number(product.stock) > 0 ? "In Stock" : "Out of Stock"}</strong>
              {Number(product.stock) > 0 && <span>({product.stock} available)</span>}
            </div>
            {error && <div className="auth-error">Error: {error}</div>}
            {message && <div className="auth-success">✓ {message}</div>}
            {Number(product.stock) > 0 && (
              <div className="quantity-section">
                <span className="quantity-label">Quantity</span>
                <div className="quantity-controls">
                  <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
                  <span>{quantity}</span>
                  <button type="button" onClick={() => setQuantity((value) => Math.min(Number(product.stock), value + 1))}>+</button>
                </div>
              </div>
            )}
            <div className="product-actions">
              <button className="primary-btn add-cart-btn" type="button" onClick={addToCart} disabled={busy || Number(product.stock) === 0}>
                {busy ? "Please wait..." : Number(product.stock) > 0 ? " Add to Cart" : "Out of Stock"}
              </button>
              <button className="secondary-btn wishlist-btn" type="button" onClick={addToWishlist} disabled={busy}>♡ Wishlist</button>
            </div>
          </div>
        </div>

        <section className="reviews-section">
          <div className="section-heading left"><span>CUSTOMER FEEDBACK</span><h2>Reviews</h2></div>
          {reviews.length === 0 ? <div className="simple-card">No reviews yet.</div> : reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="review-top"><strong>{review.username || "Customer"}</strong><span>★ {review.rating}/5</span></div>
              <p>{review.comment || "No comment."}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

export default ProductDetail;
