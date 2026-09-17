import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders/list/");

      const data = response.data;

      if (Array.isArray(data)) {
        setOrders(data);
      } else if (Array.isArray(data.results)) {
        setOrders(data.results);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Orders API Error:", err);

      if (err.response?.status === 401) {
        setError("Please login to view your orders.");
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Unable to load your orders.");
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      setCancellingOrder(orderId);
      setError("");
      setSuccessMessage("");

      await api.patch(`/orders/${orderId}/cancel/`);

      setSuccessMessage(
        `Order #${orderId} cancelled successfully.`
      );

      await fetchOrders();
    } catch (err) {
      console.error("Cancel Order Error:", err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Unable to cancel the order.");
      }
    } finally {
      setCancellingOrder(null);
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
    if (!status) {
      return "Unknown";
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading-box">
          <div className="loading-spinner"></div>

          <h2>Loading Your Orders...</h2>

          <p>
            Please wait while we load your order history.
          </p>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="error-box">
          <div className="error-icon">⚠️</div>

          <h2>Unable to Load Orders</h2>

          <p>{error}</p>

          <button
            type="button"
            className="primary-btn retry-btn"
            onClick={fetchOrders}
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

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="empty-orders-box">
          <div className="empty-cart-icon">📦</div>

          <span className="cart-label">
            SHOPKART
          </span>

          <h1>No Orders Yet</h1>

          <p>
            You haven't placed any orders yet.
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
    <div className="orders-page">
      <div className="orders-container">

        <div className="orders-header">
          <div>
            <span className="cart-label">
              SHOPKART
            </span>

            <h1>My Orders</h1>

            <p>
              View and manage your ShopKart orders.
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

        <div className="orders-list">

          {orders.map((order) => (
            <article
              className="order-card"
              key={order.id}
            >

              <div className="order-card-header">

                <div>
                  <span className="order-label">
                    ORDER
                  </span>

                  <h2>
                    #{order.id}
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

              <div className="order-card-body">

                <div className="order-info">
                  <span>Order Date</span>

                  <strong>
                    {order.created_at
                      ? new Date(
                          order.created_at
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "—"}
                  </strong>
                </div>

                <div className="order-info">
                  <span>Total</span>

                  <strong>
                    ₹
                    {Number(
                      order.total || 0
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="order-info">
                  <span>Items</span>

                  <strong>
                    {Array.isArray(order.items)
                      ? order.items.reduce(
                          (total, item) =>
                            total +
                            Number(
                              item.quantity || 0
                            ),
                          0
                        )
                      : "—"}
                  </strong>
                </div>

              </div>

              <div className="order-card-footer">

                <Link
                  to={`/orders/${order.id}`}
                  className="product-btn"
                >
                  View Order
                </Link>

                {order.status === "pending" && (
                  <button
                    type="button"
                    className="cancel-order-btn"
                    onClick={() =>
                      cancelOrder(order.id)
                    }
                    disabled={
                      cancellingOrder === order.id
                    }
                  >
                    {cancellingOrder === order.id
                      ? "Cancelling..."
                      : "Cancel Order"}
                  </button>
                )}

              </div>

            </article>
          ))}

        </div>

      </div>
    </div>
  );
}

export default Orders;