import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

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
      console.error("Checkout Cart Error:", err);

      if (err.response?.status === 401) {
        setError("Please login to continue to checkout.");
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Unable to load your cart.");
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

  const getItemName = (item) =>
    item.product_name ||
    item.product?.name ||
    item.name ||
    "Product";

  const getItemPrice = (item) => {
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

  const getQuantity = (item) => Number(item.quantity || 1);

  const getSubtotal = (item) => {
    if (item.subtotal !== undefined && item.subtotal !== null) {
      return Number(item.subtotal);
    }

    return getItemPrice(item) * getQuantity(item);
  };

  const getTotal = () => {
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

  // Validate and apply coupon
  const handleApplyCoupon = async () => {
    const code = couponCode.trim();

    if (!code) {
      setCouponError("Please enter a coupon code.");
      setCouponSuccess("");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError("");
      setCouponSuccess("");

      const response = await api.post("/coupons/validate/", {
        code,
        order_amount: getTotal(),
      });

      setAppliedCoupon(response.data);

      setCouponSuccess(
        `${response.data.code} applied successfully. You saved ₹${Number(
          response.data.discount_amount
        ).toLocaleString("en-IN")}.`
      );
    } catch (err) {
      console.error("Coupon Validation Error:", err);

      setAppliedCoupon(null);

      if (err.response?.data?.detail) {
        setCouponError(err.response.data.detail);
      } else {
        setCouponError("Unable to validate coupon.");
      }
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setCouponSuccess("");
  };

  const getDiscountAmount = () => {
    if (!appliedCoupon) {
      return 0;
    }

    return Number(appliedCoupon.discount_amount || 0);
  };

  const getFinalTotal = () => {
    const subtotal = getTotal();
    const discount = getDiscountAmount();

    return Math.max(subtotal - discount, 0);
  };

  const handlePlaceOrder = async () => {
    const items = getItems();

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");

      setOrderSuccess(null);

      /*
       * The order is created from the authenticated user's cart.
       *
       * If a coupon is applied, send its code to the backend.
       */
      const orderPayload = {};

      if (appliedCoupon?.code) {
        orderPayload.coupon_code = appliedCoupon.code;
      }

      const response = await api.post(
        "/orders/",
        orderPayload
      );

      const createdOrder = response.data;

      await api.post("/payments/", {
        order: createdOrder.id,
        payment_method: paymentMethod,
      });

      setOrderSuccess({
        order: createdOrder,
        paymentMethod,
      });
    } catch (err) {
      console.error("Place Order Error:", err);

      if (err.response?.data) {
        const data = err.response.data;

        if (data.detail) {
          setError(data.detail);
        } else if (typeof data === "string") {
          setError(data);
        } else {
          const messages = Object.entries(data)
            .map(([field, value]) => {
              const message = Array.isArray(value)
                ? value.join(" ")
                : String(value);

              return `${field}: ${message}`;
            })
            .join(" ");

          setError(
            messages || "Unable to place order."
          );
        }
      } else {
        setError(
          "Unable to connect to the Django backend."
        );
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  const items = getItems();
  const total = getTotal();
  const discountAmount = getDiscountAmount();
  const finalTotal = getFinalTotal();

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="loading-box">
          <div className="loading-spinner"></div>

          <h2>Loading Checkout...</h2>

          <p>
            Please wait while we prepare your order.
          </p>
        </div>
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="checkout-page">
        <div className="error-box">
          <div className="error-icon">⚠️</div>

          <h2>Unable to Load Checkout</h2>

          <p>{error}</p>

          <Link
            to="/cart"
            className="product-btn"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    const order = orderSuccess.order;

    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="empty-cart-box">
            <div className="empty-cart-icon">
              ✅
            </div>

            <span className="cart-label">
              SHOPKART
            </span>

            <h1>Order Created Successfully!</h1>

            <p>
              Your order has been created successfully.
            </p>

            {order?.id && (
              <p>
                <strong>
                  Order #{order.id}
                </strong>
              </p>
            )}

            {order?.total !== undefined && (
              <p>
                Total:{" "}
                <strong>
                  ₹
                  {Number(order.total).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </p>
            )}

            {order?.discount_amount !== undefined &&
              Number(order.discount_amount) > 0 && (
                <p>
                  Discount:{" "}
                  <strong>
                    -₹
                    {Number(
                      order.discount_amount
                    ).toLocaleString("en-IN")}
                  </strong>
                </p>
              )}

            <p>
              Payment Method:{" "}
              <strong>
                {orderSuccess.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : orderSuccess.paymentMethod === "card"
                  ? "Credit / Debit Card"
                  : orderSuccess.paymentMethod === "upi"
                  ? "UPI"
                  : "Net Banking"}
              </strong>
            </p>

            <div style={{ marginTop: "20px" }}>
              <Link
                to="/products"
                className="primary-btn"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-cart-box">
          <div className="empty-cart-icon">
            🛒
          </div>

          <h1>Your Cart is Empty</h1>

          <p>
            Add some products before proceeding to
            checkout.
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
    <div className="checkout-page">
      <div className="checkout-container">

        <div className="checkout-header">
          <div>
            <span className="cart-label">
              SHOPKART
            </span>

            <h1>Checkout</h1>

            <p>
              Review your order and select a payment
              method.
            </p>
          </div>

          <Link
            to="/cart"
            className="continue-shopping"
          >
            ← Back to Cart
          </Link>
        </div>

        {error && (
          <div className="auth-error cart-error">
            ⚠️ {error}
          </div>
        )}

        <div className="checkout-layout">

          <section className="checkout-main">

            <div className="checkout-card">

              <div className="checkout-card-header">
                <span className="checkout-step">
                  1
                </span>

                <div>
                  <h2>Order Items</h2>

                  <p>
                    {items.length} product
                    {items.length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>
              </div>

              <div className="checkout-items">

                {items.map((item) => {
                  const price = getItemPrice(item);
                  const quantity = getQuantity(item);
                  const subtotal = getSubtotal(item);

                  return (
                    <div
                      className="checkout-item"
                      key={item.id || item.pk}
                    >
                      <div>
                        <h3>
                          {getItemName(item)}
                        </h3>

                        <p>
                          ₹
                          {price.toLocaleString(
                            "en-IN"
                          )}{" "}
                          × {quantity}
                        </p>
                      </div>

                      <strong>
                        ₹
                        {subtotal.toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Coupon Section */}
            <div className="checkout-card">

              <div className="checkout-card-header">
                <span className="checkout-step">
                  2
                </span>

                <div>
                  <h2>Coupon</h2>

                  <p>
                    Apply a coupon to save on your
                    order.
                  </p>
                </div>
              </div>

              {!appliedCoupon ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "15px",
                    }}
                  >
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(event) =>
                        setCouponCode(
                          event.target.value
                        )
                      }
                      placeholder="Enter coupon code"
                      style={{
                        flex: 1,
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "15px",
                      }}
                    />

                    <button
                      type="button"
                      className="primary-btn"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                    >
                      {couponLoading
                        ? "Applying..."
                        : "Apply Coupon"}
                    </button>
                  </div>

                  {couponError && (
                    <div
                      className="auth-error"
                      style={{
                        marginTop: "12px",
                      }}
                    >
                      ⚠️ {couponError}
                    </div>
                  )}
                </>
              ) : (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "15px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                >
                  <strong>
                    🎟️ {appliedCoupon.code}
                  </strong>

                  <p>
                    You saved ₹
                    {discountAmount.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={handleRemoveCoupon}
                  >
                    Remove Coupon
                  </button>
                </div>
              )}

              {couponSuccess && (
                <div
                  className="auth-success"
                  style={{
                    marginTop: "12px",
                  }}
                >
                  ✅ {couponSuccess}
                </div>
              )}

            </div>

            {/* Payment Section */}
            <div className="checkout-card">

              <div className="checkout-card-header">
                <span className="checkout-step">
                  3
                </span>

                <div>
                  <h2>Payment Method</h2>

                  <p>
                    Choose how you want to pay.
                  </p>
                </div>
              </div>

              <div className="payment-options">

                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={
                      paymentMethod === "cod"
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                  />

                  <div>
                    <strong>
                      Cash on Delivery
                    </strong>

                    <span>
                      Pay when your order arrives.
                    </span>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment_method"
                    value="card"
                    checked={
                      paymentMethod === "card"
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                  />

                  <div>
                    <strong>
                      Credit / Debit Card
                    </strong>

                    <span>
                      Pay securely using your card.
                    </span>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment_method"
                    value="upi"
                    checked={
                      paymentMethod === "upi"
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                  />

                  <div>
                    <strong>UPI</strong>

                    <span>
                      Pay using your UPI application.
                    </span>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment_method"
                    value="netbanking"
                    checked={
                      paymentMethod ===
                      "netbanking"
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                  />

                  <div>
                    <strong>
                      Net Banking
                    </strong>

                    <span>
                      Pay directly through your bank.
                    </span>
                  </div>
                </label>

              </div>
            </div>

          </section>

          <aside className="checkout-summary">

            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Items</span>

              <span>
                {items.reduce(
                  (totalItems, item) =>
                    totalItems +
                    getQuantity(item),
                  0
                )}
              </span>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>

              <span>
                ₹
                {total.toLocaleString("en-IN")}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="summary-row">
                <span>
                  Coupon Discount
                </span>

                <span>
                  -₹
                  {discountAmount.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>
            )}

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
                ₹
                {finalTotal.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <button
              type="button"
              className="primary-btn checkout-btn"
              onClick={handlePlaceOrder}
              disabled={placingOrder}
            >
              {placingOrder
                ? "Placing Order..."
                : "Place Order"}
            </button>

            <p className="secure-checkout">
              🔒 Secure ShopKart Checkout
            </p>

          </aside>

        </div>
      </div>
    </div>
  );
}

export default Checkout;