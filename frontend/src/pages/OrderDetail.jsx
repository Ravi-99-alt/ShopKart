import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchOrderAndPayment();
  }, [id]);

  const fetchOrderAndPayment = async () => {
    try {
      setLoading(true);
      setError("");

      const [orderResponse, paymentResponse] = await Promise.all([
        api.get(`/orders/${id}/`),
        api.get("/payments/list/"),
      ]);

      setOrder(orderResponse.data);

      const payments = Array.isArray(paymentResponse.data)
        ? paymentResponse.data
        : paymentResponse.data?.results || [];

      const matchingPayment = payments.find(
        (item) => Number(item.order) === Number(id)
      );

      setPayment(matchingPayment || null);
    } catch (err) {
      console.error("Order Detail API Error:", err);

      if (err.response?.status === 401) {
        setError("Please login to view this order.");
      } else if (err.response?.status === 404) {
        setError("Order not found.");
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Unable to load order details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    if (!order) return;

    try {
      setCancelling(true);
      setError("");
      setSuccessMessage("");

      await api.patch(`/orders/${order.id}/cancel/`);

      setSuccessMessage(
        `Order #${order.id} cancelled successfully.`
      );

      await fetchOrderAndPayment();
    } catch (err) {
      console.error("Cancel Order Error:", err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Unable to cancel the order.");
      }
    } finally {
      setCancelling(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "confirmed":
        return "status-confirmed";
      case "shipped":
        return "status-shipped";
      case "delivered":
        return "status-delivered";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case "card":
        return "Credit / Debit Card";
      case "upi":
        return "UPI";
      case "cod":
        return "Cash on Delivery";
      default:
        return method || "Not available";
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "status-delivered";
      case "pending":
        return "status-pending";
      case "failed":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading-box">
          <div className="loading-spinner"></div>
          <h2>Loading Order...</h2>
          <p>
            Please wait while we load your order details.
          </p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="orders-page">
        <div className="error-box">
          <div className="error-icon">⚠️</div>

          <h2>Unable to Load Order</h2>

          <p>{error}</p>

          <button
            type="button"
            className="primary-btn retry-btn"
            onClick={fetchOrderAndPayment}
          >
            Try Again
          </button>

          <br />

          <Link
            to="/orders"
            className="product-btn"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  return (
    <div className="orders-page">
      <div className="orders-container">

        <div className="orders-header">
          <div>
            <span className="cart-label">
              SHOPKART
            </span>

            <h1>
              Order #{order.id}
            </h1>

            <p>
              View your complete order details.
            </p>
          </div>

          <Link
            to="/orders"
            className="continue-shopping"
          >
            ← Back to Orders
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

        <div className="order-detail-layout">

          <main className="order-detail-main">

            {/* ORDER STATUS */}

            <section className="order-detail-card">

              <div className="order-detail-header">

                <div>
                  <span className="order-label">
                    ORDER STATUS
                  </span>

                  <h2>
                    Order #{order.id}
                  </h2>
                </div>

                <span
                  className={`order-status ${getStatusClass(
                    order.status
                  )}`}
                >
                  {getStatusLabel(order.status)}
                </span>

              </div>

              <div className="order-detail-info-grid">

                <div className="order-info">
                  <span>Order Date</span>

                  <strong>
                    {order.created_at
                      ? new Date(
                          order.created_at
                        ).toLocaleDateString("en-IN")
                      : "—"}
                  </strong>
                </div>

                <div className="order-info">
                  <span>Last Updated</span>

                  <strong>
                    {order.updated_at
                      ? new Date(
                          order.updated_at
                        ).toLocaleDateString("en-IN")
                      : "—"}
                  </strong>
                </div>

                <div className="order-info">
                  <span>Payment Method</span>

                  <strong>
                    {payment
                      ? getPaymentMethodLabel(
                          payment.payment_method
                        )
                      : "Not available"}
                  </strong>
                </div>

              </div>

            </section>


            {/* PAYMENT DETAILS */}

            <section className="order-detail-card">

              <div className="checkout-card-header">

                <span className="checkout-step">
                  2
                </span>

                <div>
                  <h2>
                    Payment Details
                  </h2>

                  <p>
                    Payment information for this order.
                  </p>
                </div>

              </div>

              {payment ? (
                <div className="order-detail-info-grid">

                  <div className="order-info">
                    <span>
                      Payment Method
                    </span>

                    <strong>
                      {getPaymentMethodLabel(
                        payment.payment_method
                      )}
                    </strong>
                  </div>

                  <div className="order-info">
                    <span>
                      Payment Status
                    </span>

                    <strong
                      className={`order-status ${getPaymentStatusClass(
                        payment.status
                      )}`}
                    >
                      {getStatusLabel(
                        payment.status
                      )}
                    </strong>
                  </div>

                  <div className="order-info">
                    <span>
                      Transaction ID
                    </span>

                    <strong>
                      {payment.transaction_id ||
                        "Not available"}
                    </strong>
                  </div>

                  <div className="order-info">
                    <span>
                      Amount
                    </span>

                    <strong>
                      ₹
                      {Number(
                        payment.amount || 0
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>

                </div>
              ) : (
                <p>
                  No payment record found for this
                  order.
                </p>
              )}

            </section>


            {/* ORDER ITEMS */}

            <section className="order-detail-card">

              <div className="checkout-card-header">

                <span className="checkout-step">
                  3
                </span>

                <div>
                  <h2>
                    Order Items
                  </h2>

                  <p>
                    {items.length} product
                    {items.length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>

              </div>

              <div className="checkout-items">

                {items.length === 0 ? (
                  <p>
                    No order items found.
                  </p>
                ) : (
                  items.map((item) => (
                    <div
                      className="checkout-item"
                      key={item.id}
                    >
                      <div>

                        <h3>
                          {item.product_name ||
                            item.product?.name ||
                            "Product"}
                        </h3>

                        <p>
                          ₹
                          {Number(
                            item.price || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                          {" × "}
                          {item.quantity}
                        </p>

                      </div>

                      <strong>
                        ₹
                        {Number(
                          item.subtotal || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>
                  ))
                )}

              </div>

            </section>

          </main>


          {/* ORDER SUMMARY */}

          <aside className="order-detail-summary">

            <h2>
              Order Summary
            </h2>

            <div className="summary-row">
              <span>Items</span>

              <span>
                {items.reduce(
                  (total, item) =>
                    total +
                    Number(
                      item.quantity || 0
                    ),
                  0
                )}
              </span>
            </div>

            <div className="summary-row">

              <span>
                Subtotal
              </span>

              <span>
                ₹
                {Number(
                  order.total || 0
                ).toLocaleString("en-IN")}
              </span>

            </div>

            {Number(
              order.discount_amount || 0
            ) > 0 && (
              <div className="summary-row">

                <span>
                  Discount
                </span>

                <span>
                  -₹
                  {Number(
                    order.discount_amount
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>
            )}

            <div className="summary-row">

              <span>
                Delivery
              </span>

              <span className="free-delivery">
                FREE
              </span>

            </div>

            <div className="summary-divider"></div>

            <div className="summary-total">

              <span>
                Total
              </span>

              <strong>
                ₹
                {Number(
                  order.total || 0
                ).toLocaleString("en-IN")}
              </strong>

            </div>

            {order.status === "pending" && (
              <button
                type="button"
                className="cancel-order-btn full-width"
                onClick={cancelOrder}
                disabled={cancelling}
              >
                {cancelling
                  ? "Cancelling..."
                  : "Cancel Order"}
              </button>
            )}

            <button
              type="button"
              className="secondary-btn full-width"
              onClick={() =>
                navigate("/orders")
              }
            >
              Back to Orders
            </button>

          </aside>

        </div>
      </div>
    </div>
  );
}

export default OrderDetail;