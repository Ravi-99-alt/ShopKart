import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/wishlist/");

      const items = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setWishlistItems(items);
    } catch (err) {
      console.error("Wishlist API Error:", err);

      if (err.response?.status === 401) {
        setError("Please login to view your wishlist.");
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Unable to load your wishlist.");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      setRemovingId(productId);
      setError("");
      setSuccessMessage("");

      await api.delete(`/wishlist/remove/${productId}/`);

      setWishlistItems((previous) =>
        previous.filter(
          (item) =>
            Number(item.product) !== Number(productId) &&
            Number(item.product_id) !== Number(productId)
        )
      );

      setSuccessMessage("Product removed from your wishlist.");
    } catch (err) {
      console.error("Remove Wishlist Error:", err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Unable to remove product from wishlist.");
      }
    } finally {
      setRemovingId(null);
    }
  };

  const addToCart = async (productId, productName) => {
    try {
      setAddingToCartId(productId);
      setError("");
      setSuccessMessage("");

      await api.post("/cart/add/", {
        product: productId,
        quantity: 1,
      });

      setSuccessMessage(
        `${productName || "Product"} added to your cart successfully.`
      );
    } catch (err) {
      console.error("Wishlist Add to Cart Error:", err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Unable to add product to cart.");
      }
    } finally {
      setAddingToCartId(null);
    }
  };

  const getProduct = (item) => {
    return item.product_details || item.product_data || item.product;
  };

  const getProductId = (item) => {
    if (typeof item.product === "object" && item.product !== null) {
      return item.product.id;
    }

    return item.product || item.product_id;
  };

  const getProductName = (item) => {
    const product = getProduct(item);

    if (typeof product === "object" && product !== null) {
      return product.name || "Product";
    }

    return item.product_name || "Product";
  };

  const getProductImage = (item) => {
    const product = getProduct(item);

    if (typeof product === "object" && product !== null) {
      return product.image || null;
    }

    return item.product_image || item.image || null;
  };

  const getProductPrice = (item) => {
    const product = getProduct(item);

    if (typeof product === "object" && product !== null) {
      if (
        product.discount_price !== null &&
        product.discount_price !== undefined
      ) {
        return product.discount_price;
      }

      return product.price;
    }

    return item.discount_price || item.price || 0;
  };

  const getOriginalPrice = (item) => {
    const product = getProduct(item);

    if (typeof product === "object" && product !== null) {
      return product.price;
    }

    return item.price || null;
  };

  const getStock = (item) => {
    const product = getProduct(item);

    if (typeof product === "object" && product !== null) {
      return Number(product.stock || 0);
    }

    return Number(item.stock || 0);
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading-box">
          <div className="loading-spinner"></div>

          <h2>Loading Wishlist...</h2>

          <p>
            Please wait while we load your saved products.
          </p>
        </div>
      </div>
    );
  }

  if (error && wishlistItems.length === 0) {
    return (
      <div className="products-page">
        <div className="error-box">
          <div className="error-icon">⚠️</div>

          <h2>Unable to Load Wishlist</h2>

          <p>{error}</p>

          <button
            type="button"
            className="primary-btn retry-btn"
            onClick={fetchWishlist}
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

  return (
    <div className="products-page">
      <div className="products-container">

        <div className="products-header">
          <div>
            <span className="cart-label">
              SHOPKART
            </span>

            <h1>My Wishlist</h1>

            <p>
              Save your favorite products and shop them anytime.
            </p>
          </div>

          <Link
            to="/products"
            className="continue-shopping"
          >
            ← Continue Shopping
          </Link>
        </div>

        {error && (
          <div className="auth-error">
            ⚠️ {error}
          </div>
        )}

        {successMessage && (
          <div className="auth-success">
            ✅ {successMessage}
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">
              ❤️
            </div>

            <h2>Your Wishlist is Empty</h2>

            <p>
              Save products you love and find them here later.
            </p>

            <Link
              to="/products"
              className="primary-btn"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="products-count">
              <strong>
                {wishlistItems.length}
              </strong>{" "}
              {wishlistItems.length === 1
                ? "Product"
                : "Products"}{" "}
              Saved
            </div>

            <div className="products-grid">
              {wishlistItems.map((item) => {
                const productId = getProductId(item);
                const productName = getProductName(item);
                const image = getProductImage(item);
                const price = getProductPrice(item);
                const originalPrice = getOriginalPrice(item);
                const stock = getStock(item);

                const hasDiscount =
                  originalPrice &&
                  Number(price) < Number(originalPrice);

                return (
                  <div
                    className="product-card"
                    key={item.id}
                  >
                    <div className="product-image">
                      {image ? (
                        <img
                          src={image}
                          alt={productName}
                        />
                      ) : (
                        <div className="no-image">
                          🛍️
                        </div>
                      )}
                    </div>

                    <div className="product-info">

                      <div className="product-category">
                        ❤️ Wishlist
                      </div>

                      <h2>
                        {productName}
                      </h2>

                      <div className="product-price">

                        <strong>
                          ₹
                          {Number(
                            price || 0
                          ).toLocaleString("en-IN")}
                        </strong>

                        {hasDiscount && (
                          <span className="old-price">
                            ₹
                            {Number(
                              originalPrice
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        )}

                      </div>

                      <div className="product-stock">
                        {stock > 0 ? (
                          <span>
                            {stock} available
                          </span>
                        ) : (
                          <span>
                            Out of stock
                          </span>
                        )}
                      </div>

                      <div className="product-actions">

                        <Link
                          to={`/products/${productId}`}
                          className="product-btn"
                        >
                          View Product
                        </Link>

                        {stock > 0 && (
                          <button
                            type="button"
                            className="primary-btn"
                            onClick={() =>
                              addToCart(
                                productId,
                                productName
                              )
                            }
                            disabled={
                              addingToCartId ===
                              productId
                            }
                          >
                            {addingToCartId ===
                            productId
                              ? "Adding..."
                              : "🛒 Add to Cart"}
                          </button>
                        )}

                        <button
                          type="button"
                          className="secondary-btn wishlist-btn"
                          onClick={() =>
                            removeFromWishlist(
                              productId
                            )
                          }
                          disabled={
                            removingId ===
                            productId
                          }
                        >
                          {removingId ===
                          productId
                            ? "Removing..."
                            : "❤️ Remove"}
                        </button>

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Wishlist;