import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cart/");
      setCart(response.data);
    } catch (err) {
      console.error("Cart API Error:", err);

      if (err.response?.status === 401) {
        setError("Please login to view your cart.");
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Unable to connect to the Django backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getItems = () => {
    if (!cart) {
      return [];
    }

    if (Array.isArray(cart)) {
      return cart;
    }

    if (Array.isArray(cart.items)) {
      return cart.items;
    }

    if (Array.isArray(cart.results)) {
      return cart.results;
    }

    return [];
  };

  const getItemId = (item) => {
    return item.id || item.pk;
  };

  const getProductName = (item) => {
    return (
      item.product_name ||
      item.product?.name ||
      item.name ||
      "Product"
    );
  };

  const getProductImage = (item) => {
    return (
      item.product_image ||
      item.product?.image ||
      item.image ||
      null
    );
  };

  const getProductPrice = (item) => {
    if (item.price !== undefined && item.price !== null) {
      return Number(item.price);
    }

    if (
      item.product?.discount_price !== undefined &&
      item.product?.discount_price !== null
    ) {
      return Number(item.product.discount_price);
    }

    if (
      item.product?.price !== undefined &&
      item.product?.price !== null
    ) {
      return Number(item.product.price);
    }

    return 0;
  };

  const getQuantity = (item) => {
    return Number(item.quantity || 1);
  };

  const getSubtotal = (item) => {
    if (
      item.subtotal !== undefined &&
      item.subtotal !== null
    ) {
      return Number(item.subtotal);
    }

    return getProductPrice(item) * getQuantity(item);
  };

  const getCartTotal = () => {
    if (
      cart &&
      cart.total !== undefined &&
      cart.total !== null
    ) {
      return Number(cart.total);
    }

    return getItems().reduce(
      (total, item) => total + getSubtotal(item),
      0
    );
  };

  const updateQuantity = async (item, newQuantity) => {
    const itemId = getItemId(item);

    if (!itemId || newQuantity < 1) {
      return;
    }

    try {
      setUpdatingItem(itemId);
      setError("");

      await api.patch(
        `/cart/items/${itemId}/update/`,
        {
          quantity: newQuantity,
        }
      );

      await fetchCart();
    } catch (err) {
      console.error("Update Cart Error:", err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Unable to update cart quantity.");
      }
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (item) => {
    const itemId = getItemId(item);

    if (!itemId) {
      return;
    }

    try {
      setRemovingItem(itemId);
      setError("");

      await api.delete(`/cart/items/${itemId}/`);

      await fetchCart();
    } catch (err) {
      console.error("Remove Cart Item Error:", err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Unable to remove item from cart.");
      }
    } finally {
      setRemovingItem(null);
    }
  };

  const items = getItems();
  const cartTotal = getCartTotal();

  const totalQuantity = items.reduce(
    (total, item) => total + getQuantity(item),
    0
  );

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading-box">
          <div className="loading-spinner"></div>

          <h2>Loading Your Cart...</h2>

          <p>
            Please wait while we load your shopping cart.
          </p>
        </div>
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="cart-page">
        <div className="error-box">
          <div className="error-icon">⚠️</div>

          <h2>Unable to Load Cart</h2>

          <p>{error}</p>

          <button
            className="primary-btn retry-btn"
            onClick={fetchCart}
          >
            Try Again
          </button>

          <br />

          <Link
            to="/products"
            className="product-btn"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart-box">

          <div className="empty-cart-icon">
            🛒
          </div>

          <h1>Your Cart is Empty</h1>

          <p>
            You haven't added any products to your cart yet.
          </p>

          <Link
            to="/products"
            className="primary-btn"
          >
            Start Shopping
          </Link>

        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">

      <div className="cart-container">

        <div className="cart-header">

          <div>
            <span className="cart-label">
              SHOPKART
            </span>

            <h1>Shopping Cart</h1>

            <p>
              Review your products before checkout.
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
          <div className="auth-error cart-error">
            ⚠️ {error}
          </div>
        )}

        <div className="cart-layout">

          <section className="cart-items">

            {items.map((item) => {

              const itemId = getItemId(item);
              const quantity = getQuantity(item);
              const price = getProductPrice(item);
              const subtotal = getSubtotal(item);
              const image = getProductImage(item);
              const name = getProductName(item);

              return (
                <article
                  className="cart-item"
                  key={itemId}
                >

                  <div className="cart-item-image">

                    {image ? (
                      <img
                        src={image}
                        alt={name}
                      />
                    ) : (
                      <div className="no-image">
                        🛍️
                      </div>
                    )}

                  </div>

                  <div className="cart-item-details">

                    <h2>{name}</h2>

                    <p className="cart-item-price">
                      ₹{price.toLocaleString("en-IN")}
                    </p>

                    <div className="cart-item-actions">

                      <div className="quantity-controls">

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item,
                              quantity - 1
                            )
                          }
                          disabled={
                            quantity <= 1 ||
                            updatingItem === itemId
                          }
                        >
                          −
                        </button>

                        <span>
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item,
                              quantity + 1
                            )
                          }
                          disabled={
                            updatingItem === itemId
                          }
                        >
                          +
                        </button>

                      </div>

                      <button
                        type="button"
                        className="remove-item-btn"
                        onClick={() =>
                          removeItem(item)
                        }
                        disabled={
                          removingItem === itemId
                        }
                      >
                        {removingItem === itemId
                          ? "Removing..."
                          : "Remove"}
                      </button>

                    </div>

                  </div>

                  <div className="cart-item-subtotal">

                    <span>
                      Subtotal
                    </span>

                    <strong>
                      ₹{subtotal.toLocaleString("en-IN")}
                    </strong>

                  </div>

                </article>
              );
            })}

          </section>

          <aside className="cart-summary">

            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Items</span>

              <span>
                {totalQuantity}
              </span>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>

              <span>
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="summary-row">
              <span>Delivery</span>

              <span className="free-delivery">
                FREE
              </span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total">

              <span>Total</span>

              <strong>
                ₹{cartTotal.toLocaleString("en-IN")}
              </strong>

            </div>

            <button
              type="button"
              className="primary-btn checkout-btn"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>

          </aside>

        </div>

      </div>

    </div>
  );
}

export default Cart;