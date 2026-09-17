import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Product loading
  const [loading, setLoading] = useState(true);

  // Cart
  const [addingToCart, setAddingToCart] = useState(false);

  // Wishlist
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [removingFromWishlist, setRemovingFromWishlist] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");

  // Messages
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [wishlistMessage, setWishlistMessage] = useState("");

  useEffect(() => {
    fetchProduct();
    fetchWishlist();
    fetchReviews();
  }, [id]);

  // =========================
  // FETCH PRODUCT
  // =========================

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/products/${id}/`);

      setProduct(response.data);
    } catch (err) {
      console.error("Product Detail API Error:", err);

      if (err.response) {
        if (err.response.status === 404) {
          setError("Product not found.");
        } else if (err.response.status === 401) {
          setError("Please login to view this product.");
        } else {
          setError(`Server error: ${err.response.status}`);
        }
      } else {
        setError("Unable to connect to the Django backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH WISHLIST
  // =========================

  const fetchWishlist = async () => {
    try {
      const response = await api.get("/wishlist/");

      const wishlistItems = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      const found = wishlistItems.some(
        (item) =>
          Number(item.product) === Number(id) ||
          Number(item.product_id) === Number(id)
      );

      setIsWishlisted(found);
    } catch (err) {
      console.error("Wishlist API Error:", err);

      if (err.response?.status === 401) {
        setIsWishlisted(false);
      }
    }
  };

  // =========================
  // FETCH REVIEWS
  // =========================

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      setReviewsError("");

      const response = await api.get(`/reviews/product/${id}/`);

      const reviewData = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setReviews(reviewData);
    } catch (err) {
      console.error("Reviews API Error:", err);

      if (err.response?.status === 401) {
        setReviewsError("Please login to view product reviews.");
      } else if (err.response?.data?.detail) {
        setReviewsError(err.response.data.detail);
      } else {
        setReviewsError("Unable to load product reviews.");
      }
    } finally {
      setReviewsLoading(false);
    }
  };

  // =========================
  // PRICE
  // =========================

  const getPrice = () => {
    if (
      product?.discount_price !== null &&
      product?.discount_price !== undefined
    ) {
      return product.discount_price;
    }

    return product?.price;
  };

  const hasDiscount = () => {
    if (
      product?.discount_price === null ||
      product?.discount_price === undefined
    ) {
      return false;
    }

    return Number(product.discount_price) < Number(product.price);
  };

  // =========================
  // QUANTITY
  // =========================

  const increaseQuantity = () => {
    if (!product) {
      return;
    }

    if (quantity < Number(product.stock)) {
      setQuantity((previous) => previous + 1);
    }
  };

  const decreaseQuantity = () => {
    setQuantity((previous) => Math.max(1, previous - 1));
  };

  // =========================
  // ADD TO CART
  // =========================

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }

    setAddingToCart(true);
    setCartMessage("");
    setError("");

    try {
      await api.post("/cart/add/", {
        product: product.id,
        quantity: quantity,
      });

      setCartMessage(
        `${product.name} added to your cart successfully.`
      );
    } catch (err) {
      console.error("Add to Cart Error:", err);

      if (err.response?.data) {
        const data = err.response.data;

        if (data.detail) {
          setError(data.detail);
        } else {
          setError("Unable to add product to cart.");
        }
      } else {
        setError("Unable to connect to the Django backend.");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  // =========================
  // ADD TO WISHLIST
  // =========================

  const handleAddToWishlist = async () => {
    if (!product) {
      return;
    }

    setAddingToWishlist(true);
    setError("");
    setWishlistMessage("");

    try {
      await api.post("/wishlist/add/", {
        product: product.id,
      });

      setIsWishlisted(true);

      setWishlistMessage(
        `${product.name} added to your wishlist successfully.`
      );
    } catch (err) {
      console.error("Add to Wishlist Error:", err);

      if (err.response?.data) {
        const data = err.response.data;

        if (data.detail) {
          setError(data.detail);
        } else {
          setError("Unable to add product to wishlist.");
        }
      } else {
        setError("Unable to connect to the Django backend.");
      }
    } finally {
      setAddingToWishlist(false);
    }
  };

  // =========================
  // REMOVE FROM WISHLIST
  // =========================

  const handleRemoveFromWishlist = async () => {
    if (!product) {
      return;
    }

    setRemovingFromWishlist(true);
    setError("");
    setWishlistMessage("");

    try {
      await api.delete(`/wishlist/remove/${product.id}/`);

      setIsWishlisted(false);

      setWishlistMessage(
        `${product.name} removed from your wishlist.`
      );
    } catch (err) {
      console.error("Remove from Wishlist Error:", err);

      if (err.response?.data) {
        const data = err.response.data;

        if (data.detail) {
          setError(data.detail);
        } else {
          setError("Unable to remove product from wishlist.");
        }
      } else {
        setError("Unable to connect to the Django backend.");
      }
    } finally {
      setRemovingFromWishlist(false);
    }
  };

  // =========================
  // FORMAT REVIEW DATE
  // =========================

  const formatReviewDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // =========================
  // REVIEW STARS
  // =========================

  const renderStars = (rating) => {
    const numericRating = Number(rating) || 0;

    return (
      <span className="review-stars" aria-label={`${numericRating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= numericRating ? "★" : "☆"}
          </span>
        ))}
      </span>
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading-box">
          <div className="loading-spinner"></div>

          <h2>Loading Product...</h2>

          <p>
            Please wait while we load the product details.
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error && !product) {
    return (
      <div className="products-page">
        <div className="error-box">
          <div className="error-icon">⚠️</div>

          <h2>Unable to Load Product</h2>

          <p>{error}</p>

          <button
            type="button"
            className="primary-btn retry-btn"
            onClick={fetchProduct}
          >
            Try Again
          </button>

          <br />

          <Link
            to="/products"
            className="product-btn"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const currentPrice = getPrice();

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">

        {/* BACK TO PRODUCTS */}

        <Link
          to="/products"
          className="back-link"
        >
          ← Back to Products
        </Link>

        {/* PRODUCT CARD */}

        <div className="product-detail-card">

          {/* PRODUCT IMAGE */}

          <div className="product-detail-image">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
              />
            ) : (
              <div className="no-image large">
                🛍️
              </div>
            )}
          </div>

          {/* PRODUCT INFORMATION */}

          <div className="product-detail-info">

            {/* CATEGORY */}

            <p className="product-category">
              {product.category_name || "ShopKart"}
            </p>

            {/* PRODUCT NAME */}

            <h1>{product.name}</h1>

            {/* RATING */}

            <div className="product-rating detail-rating">
              <span>⭐</span>

              <span>
                {product.average_rating !== null &&
                product.average_rating !== undefined
                  ? Number(product.average_rating).toFixed(1)
                  : "No rating"}
              </span>

              {product.review_count !== undefined && (
                <span className="review-count">
                  ({product.review_count} reviews)
                </span>
              )}
            </div>

            {/* PRICE */}

            <div className="product-detail-price">
              <strong>
                ₹{Number(currentPrice).toLocaleString("en-IN")}
              </strong>

              {hasDiscount() && (
                <span className="old-price">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* DISCOUNT */}

            {hasDiscount() && (
              <p className="discount-label">
                Special Discount Available
              </p>
            )}

            {/* DESCRIPTION */}

            <div className="product-description">
              <h3>Product Description</h3>

              <p>
                {product.description ||
                  "No product description available."}
              </p>
            </div>

            {/* STOCK */}

            <div className="product-stock-detail">
              {Number(product.stock) > 0 ? (
                <>
                  <span className="stock-dot"></span>

                  <strong>In Stock</strong>

                  <span>
                    ({product.stock} available)
                  </span>
                </>
              ) : (
                <>
                  <span className="out-stock-dot"></span>

                  <strong>Out of Stock</strong>
                </>
              )}
            </div>

            {/* ERROR MESSAGE */}

            {error && (
              <div className="auth-error">
                ⚠️ {error}
              </div>
            )}

            {/* CART SUCCESS MESSAGE */}

            {cartMessage && (
              <div className="auth-success">
                ✅ {cartMessage}
              </div>
            )}

            {/* WISHLIST SUCCESS MESSAGE */}

            {wishlistMessage && (
              <div className="auth-success">
                ❤️ {wishlistMessage}
              </div>
            )}

            {/* QUANTITY */}

            {Number(product.stock) > 0 && (
              <div className="quantity-section">

                <span className="quantity-label">
                  Quantity
                </span>

                <div className="quantity-controls">

                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>

                  <span>{quantity}</span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={
                      quantity >= Number(product.stock)
                    }
                  >
                    +
                  </button>

                </div>

              </div>
            )}

            {/* PRODUCT ACTIONS */}

            <div className="product-actions">

              {Number(product.stock) > 0 ? (
                <button
                  type="button"
                  className="primary-btn add-cart-btn"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                >
                  {addingToCart
                    ? "Adding..."
                    : "🛒 Add to Cart"}
                </button>
              ) : (
                <button
                  type="button"
                  className="primary-btn add-cart-btn"
                  disabled
                >
                  Out of Stock
                </button>
              )}

              {isWishlisted ? (
                <button
                  type="button"
                  className="secondary-btn wishlist-btn"
                  onClick={handleRemoveFromWishlist}
                  disabled={removingFromWishlist}
                >
                  {removingFromWishlist
                    ? "Removing..."
                    : "❤️ Remove from Wishlist"}
                </button>
              ) : (
                <button
                  type="button"
                  className="secondary-btn wishlist-btn"
                  onClick={handleAddToWishlist}
                  disabled={addingToWishlist}
                >
                  {addingToWishlist
                    ? "Adding..."
                    : "♡ Add to Wishlist"}
                </button>
              )}

            </div>

          </div>

        </div>

        {/* =========================
            REVIEWS SECTION
        ========================= */}

        <section className="reviews-section">

          <div className="reviews-header">
            <div>
              <h2>Customer Reviews</h2>

              <p>
                See what customers are saying about this product.
              </p>
            </div>

            <div className="reviews-summary">
              <strong>
                {product.average_rating !== null &&
                product.average_rating !== undefined
                  ? Number(product.average_rating).toFixed(1)
                  : "—"}
              </strong>

              <span>⭐</span>

              <small>
                {reviews.length} review
                {reviews.length !== 1 ? "s" : ""}
              </small>
            </div>
          </div>

          {/* REVIEWS LOADING */}

          {reviewsLoading && (
            <div className="reviews-loading">
              <div className="loading-spinner"></div>

              <p>Loading reviews...</p>
            </div>
          )}

          {/* REVIEWS ERROR */}

          {!reviewsLoading && reviewsError && (
            <div className="auth-error">
              ⚠️ {reviewsError}
            </div>
          )}

          {/* NO REVIEWS */}

          {!reviewsLoading &&
            !reviewsError &&
            reviews.length === 0 && (
              <div className="empty-reviews">
                <div className="empty-reviews-icon">
                  ⭐
                </div>

                <h3>No Reviews Yet</h3>

                <p>
                  Be the first customer to review this product.
                </p>
              </div>
            )}

          {/* REVIEW LIST */}

          {!reviewsLoading &&
            !reviewsError &&
            reviews.length > 0 && (
              <div className="reviews-list">

                {reviews.map((review) => (
                  <article
                    className="review-card"
                    key={review.id}
                  >

                    <div className="review-card-header">

                      <div className="review-user">
                        <div className="review-avatar">
                          {(review.username ||
                            "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {review.username ||
                              "Customer"}
                          </strong>

                          <div className="review-rating">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>

                      <span className="review-date">
                        {formatReviewDate(
                          review.created_at
                        )}
                      </span>

                    </div>

                    {review.comment && (
                      <p className="review-comment">
                        {review.comment}
                      </p>
                    )}

                  </article>
                ))}

              </div>
            )}

        </section>

      </div>
    </div>
  );
}

export default ProductDetail;