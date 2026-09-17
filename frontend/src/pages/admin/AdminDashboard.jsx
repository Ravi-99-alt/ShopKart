import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context";

const emptyProduct = {
  name: "",
  category: "",
  description: "",
  price: "",
  discount_price: "",
  stock: "",
  image: "",
  is_active: true,
};

const emptyCoupon = {
  code: "",
  discount_type: "percentage",
  discount_value: "",
  minimum_order_amount: "",
  maximum_discount_amount: "",
  valid_from: "",
  valid_to: "",
  usage_limit: "",
  active: true,
};

function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [tab, setTab] = useState("overview");

  const [summary, setSummary] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);

  const [couponForm, setCouponForm] = useState(emptyCoupon);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [imagePreviewError, setImagePreviewError] = useState(false);

  const adminError = (err, fallback) => {
    const data = err.response?.data;

    if (!data) {
      return fallback;
    }

    if (data.detail) {
      return data.detail;
    }

    if (typeof data === "object") {
      return Object.entries(data)
        .map(([field, messages]) => {
          const text = Array.isArray(messages)
            ? messages.join(", ")
            : String(messages);

          return `${field}: ${text}`;
        })
        .join(" | ");
    }

    return fallback;
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        summaryResponse,
        productsResponse,
        categoriesResponse,
        ordersResponse,
        paymentsResponse,
        couponsResponse,
      ] = await Promise.all([
        api.get("/orders/admin/summary/"),
        api.get("/products/"),
        api.get("/categories/").catch(() => ({ data: [] })),
        api.get("/orders/admin/"),
        api.get("/payments/list/"),
        api.get("/coupons/"),
      ]);

      setSummary(summaryResponse.data || {});

      setProducts(
        Array.isArray(productsResponse.data)
          ? productsResponse.data
          : productsResponse.data?.results || []
      );

      setCategories(
        Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : categoriesResponse.data?.results || []
      );

      setOrders(
        Array.isArray(ordersResponse.data)
          ? ordersResponse.data
          : ordersResponse.data?.results || []
      );

      setPayments(
        Array.isArray(paymentsResponse.data)
          ? paymentsResponse.data
          : paymentsResponse.data?.results || []
      );

      setCoupons(
        Array.isArray(couponsResponse.data)
          ? couponsResponse.data
          : couponsResponse.data?.results || []
      );
    } catch (err) {
      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        logout();
        navigate("/admin/login");
      } else {
        setError(
          adminError(
            err,
            "Unable to load the admin dashboard."
          )
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleImageUrlChange = (value) => {
    setProductForm({
      ...productForm,
      image: value,
    });

    setImagePreviewError(false);
  };

  const saveProduct = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setMessage("");

      const payload = {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        category: Number(productForm.category),
        discount_price:
          productForm.discount_price === ""
            ? null
            : Number(productForm.discount_price),
      };

      if (editingId) {
        await api.patch(
          `/products/${editingId}/`,
          payload
        );
      } else {
        await api.post(
          "/products/",
          payload
        );
      }

      setMessage(
        editingId
          ? "Product updated successfully."
          : "Product added successfully."
      );

      setProductForm(emptyProduct);
      setEditingId(null);
      setImagePreviewError(false);

      await loadAll();
    } catch (err) {
      setError(
        adminError(
          err,
          "Unable to save product."
        )
      );
    }
  };

  const editProduct = (product) => {
    setEditingId(product.id);

    setProductForm({
      name: product.name || "",
      category:
        product.category ||
        product.category_id ||
        "",
      description:
        product.description || "",
      price:
        product.price ?? "",
      discount_price:
        product.discount_price ?? "",
      stock:
        product.stock ?? "",
      image:
        product.image || "",
      is_active:
        product.is_active !== false,
    });

    setImagePreviewError(false);
    setTab("products");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setProductForm(emptyProduct);
    setImagePreviewError(false);
    setError("");
    setMessage("");
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.delete(`/products/${id}/`);

      setMessage(
        "Product deleted successfully."
      );

      await loadAll();
    } catch (err) {
      setError(
        adminError(
          err,
          "Unable to delete product."
        )
      );
    }
  };

  const updateOrderStatus = async (
    id,
    status
  ) => {
    try {
      setError("");
      setMessage("");

      await api.patch(
        `/orders/${id}/status/`,
        { status }
      );

      setMessage(
        `Order #${id} updated.`
      );

      await loadAll();
    } catch (err) {
      setError(
        adminError(
          err,
          "Unable to update order."
        )
      );
    }
  };

  const updatePaymentStatus = async (
    id,
    status
  ) => {
    try {
      setError("");
      setMessage("");

      await api.patch(
        `/payments/${id}/status/`,
        { status }
      );

      setMessage(
        `Payment #${id} updated.`
      );

      await loadAll();
    } catch (err) {
      setError(
        adminError(
          err,
          "Unable to update payment."
        )
      );
    }
  };

  const saveCoupon = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setMessage("");

      const payload = {
        ...couponForm,
        code:
          couponForm.code.toUpperCase(),

        discount_value:
          Number(
            couponForm.discount_value
          ),

        minimum_order_amount:
          couponForm.minimum_order_amount
            ? Number(
                couponForm.minimum_order_amount
              )
            : 0,

        maximum_discount_amount:
          couponForm.maximum_discount_amount
            ? Number(
                couponForm.maximum_discount_amount
              )
            : null,

        usage_limit:
          couponForm.usage_limit
            ? Number(
                couponForm.usage_limit
              )
            : null,
      };

      await api.post(
        "/coupons/",
        payload
      );

      setCouponForm(emptyCoupon);

      setMessage(
        "Coupon created successfully."
      );

      await loadAll();
    } catch (err) {
      setError(
        adminError(
          err,
          "Unable to create coupon."
        )
      );
    }
  };

  const logoutAdmin = () => {
    logout();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <main className="admin-page">
        <div className="loading-box">
          <div className="loading-spinner" />

          <h2>
            Loading Admin Dashboard...
          </h2>

          <p>
            Please wait.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-shell">

        <header className="admin-header">
          <div>
            <span className="cart-label">
              SHOPKART ADMIN
            </span>

            <h1>
              Dashboard
            </h1>

            <p>
              Manage your e-commerce store.
            </p>
          </div>

          <div className="admin-header-actions">
            <Link
              to="/"
              className="secondary-btn"
            >
              Store
            </Link>

            <button
              className="danger-btn"
              onClick={logoutAdmin}
            >
              Logout
            </button>
          </div>
        </header>

        {error && (
          <div className="auth-error">
            Error: {error}
          </div>
        )}

        {message && (
          <div className="auth-success">
            {message}
          </div>
        )}

        <div className="admin-tabs">
          {[
            ["overview", "Overview"],
            ["products", "Products"],
            ["orders", "Orders"],
            ["payments", "Payments"],
            ["coupons", "Coupons"],
          ].map(
            ([value, label]) => (
              <button
                key={value}
                className={
                  tab === value
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setTab(value)
                }
              >
                {label}
              </button>
            )
          )}
        </div>

        {tab === "overview" && (
          <section className="admin-section">

            <div className="admin-stat-grid">

              <Stat
                title="Orders"
                value={
                  summary.orders ??
                  orders.length
                }
              />

              <Stat
                title="Sales"
                value={`₹${Number(
                  summary.total_sales ??
                  summary.total_revenue ??
                  0
                ).toLocaleString(
                  "en-IN"
                )}`}
              />

              <Stat
                title="Products"
                value={
                  products.length
                }
              />

              <Stat
                title="Payments"
                value={
                  payments.length
                }
              />

            </div>

            <div className="admin-card">
              <h2>
                Quick Actions
              </h2>

              <div className="quick-actions">

                <button
                  onClick={() =>
                    setTab("products")
                  }
                >
                  Add or Manage Products
                </button>

                <button
                  onClick={() =>
                    setTab("orders")
                  }
                >
                  Manage Orders
                </button>

                <button
                  onClick={() =>
                    setTab("payments")
                  }
                >
                  Manage Payments
                </button>

                <button
                  onClick={() =>
                    setTab("coupons")
                  }
                >
                  Create Coupon
                </button>

              </div>
            </div>

          </section>
        )}

        {tab === "products" && (
          <section className="admin-section">

            <div className="admin-card">

              <div className="admin-card-title">

                <div>
                  <span className="cart-label">
                    PRODUCT MANAGEMENT
                  </span>

                  <h2>
                    {editingId
                      ? "Edit Product"
                      : "Add Product"}
                  </h2>
                </div>

                {editingId && (
                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={
                      cancelEdit
                    }
                  >
                    Cancel Edit
                  </button>
                )}

              </div>

              <form
                className="admin-form"
                onSubmit={saveProduct}
              >

                <label>
                  Product Name

                  <input
                    value={
                      productForm.name
                    }
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        name:
                          e.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label>
                  Category

                  <select
                    value={
                      productForm.category
                    }
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category:
                          e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          value={
                            category.id
                          }
                          key={
                            category.id
                          }
                        >
                          {
                            category.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  Description

                  <textarea
                    value={
                      productForm.description
                    }
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description:
                          e.target.value,
                      })
                    }
                    rows="4"
                  />
                </label>

                <div className="form-grid">

                  <label>
                    Price

                    <input
                      type="number"
                      min="0"
                      value={
                        productForm.price
                      }
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price:
                            e.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <label>
                    Discount Price

                    <input
                      type="number"
                      min="0"
                      value={
                        productForm.discount_price
                      }
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          discount_price:
                            e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Stock

                    <input
                      type="number"
                      min="0"
                      value={
                        productForm.stock
                      }
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stock:
                            e.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <label className="image-field">
                    Image URL

                    <input
                      type="url"
                      value={
                        productForm.image
                      }
                      onChange={(e) =>
                        handleImageUrlChange(
                          e.target.value
                        )
                      }
                      placeholder="https://example.com/product.jpg"
                    />

                    {productForm.image && (
                      <div className="admin-image-preview">

                        {!imagePreviewError ? (
                          <img
                            src={
                              productForm.image
                            }
                            alt="Product preview"
                            onError={() =>
                              setImagePreviewError(
                                true
                              )
                            }
                            onLoad={() =>
                              setImagePreviewError(
                                false
                              )
                            }
                          />
                        ) : (
                          <div className="image-preview-error">
                            Image URL could not be loaded.
                          </div>
                        )}

                      </div>
                    )}

                  </label>

                </div>

                <label className="checkbox-label">

                  <input
                    type="checkbox"
                    checked={
                      productForm.is_active
                    }
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        is_active:
                          e.target.checked,
                      })
                    }
                  />

                  Active Product

                </label>

                <button
                  className="primary-btn"
                  type="submit"
                >
                  {editingId
                    ? "Update Product"
                    : "Add Product"}
                </button>

              </form>
            </div>

            <div className="admin-card">

              <h2>
                Products
              </h2>

              <div className="admin-table-wrap">

                <table className="admin-table">

                  <thead>
                    <tr>
                      <th>
                        Image
                      </th>

                      <th>
                        Product
                      </th>

                      <th>
                        Price
                      </th>

                      <th>
                        Stock
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {products.map(
                      (product) => (
                        <tr
                          key={
                            product.id
                          }
                        >

                          <td>
                            <div className="admin-product-thumb">

                              {product.image ? (
                                <img
                                  src={
                                    product.image
                                  }
                                  alt={
                                    product.name
                                  }
                                />
                              ) : (
                                <span>
                                  No image
                                </span>
                              )}

                            </div>
                          </td>

                          <td>
                            <strong>
                              {
                                product.name
                              }
                            </strong>
                          </td>

                          <td>
                            ₹
                            {Number(
                              product.discount_price ??
                              product.price ??
                              0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td>
                            {
                              product.stock
                            }
                          </td>

                          <td>
                            {
                              product.is_active ===
                              false
                                ? "Inactive"
                                : "Active"
                            }
                          </td>

                          <td>

                            <button
                              className="small-btn"
                              onClick={() =>
                                editProduct(
                                  product
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="small-danger-btn"
                              onClick={() =>
                                deleteProduct(
                                  product.id
                                )
                              }
                            >
                              Delete
                            </button>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </section>
        )}

        {tab === "orders" && (
          <section className="admin-section">

            <div className="admin-card">

              <h2>
                Manage Orders
              </h2>

              <div className="admin-table-wrap">

                <table className="admin-table">

                  <thead>
                    <tr>
                      <th>
                        Order
                      </th>

                      <th>
                        User
                      </th>

                      <th>
                        Total
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Update
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {orders.map(
                      (order) => (
                        <tr
                          key={
                            order.id
                          }
                        >

                          <td>
                            #{order.id}
                          </td>

                          <td>
                            {
                              order.username ||
                              order.user_name ||
                              order.user ||
                              "Customer"
                            }
                          </td>

                          <td>
                            ₹
                            {Number(
                              order.total ||
                              0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td>
                            <span className="status-badge">
                              {
                                order.status
                              }
                            </span>
                          </td>

                          <td>

                            <select
                              value={
                                order.status
                              }
                              onChange={(e) =>
                                updateOrderStatus(
                                  order.id,
                                  e.target.value
                                )
                              }
                            >
                              <option value="pending">
                                Pending
                              </option>

                              <option value="confirmed">
                                Confirmed
                              </option>

                              <option value="shipped">
                                Shipped
                              </option>

                              <option value="delivered">
                                Delivered
                              </option>

                              <option value="cancelled">
                                Cancelled
                              </option>
                            </select>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </section>
        )}

        {tab === "payments" && (
          <section className="admin-section">

            <div className="admin-card">

              <h2>
                Manage Payments
              </h2>

              <div className="admin-table-wrap">

                <table className="admin-table">

                  <thead>
                    <tr>
                      <th>
                        Payment
                      </th>

                      <th>
                        Order
                      </th>

                      <th>
                        Amount
                      </th>

                      <th>
                        Method
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Update
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {payments.map(
                      (payment) => (
                        <tr
                          key={
                            payment.id
                          }
                        >

                          <td>
                            #
                            {
                              payment.id
                            }
                          </td>

                          <td>
                            #
                            {
                              payment.order
                            }
                          </td>

                          <td>
                            ₹
                            {Number(
                              payment.amount ||
                              0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td>
                            {
                              payment.payment_method
                            }
                          </td>

                          <td>
                            <span className="status-badge">
                              {
                                payment.status
                              }
                            </span>
                          </td>

                          <td>

                            {payment.status ===
                            "pending" ? (
                              <select
                                value={
                                  payment.status
                                }
                                onChange={(e) =>
                                  updatePaymentStatus(
                                    payment.id,
                                    e.target.value
                                  )
                                }
                              >
                                <option value="pending">
                                  Pending
                                </option>

                                <option value="paid">
                                  Paid
                                </option>

                                <option value="failed">
                                  Failed
                                </option>
                              </select>
                            ) : (
                              "Completed"
                            )}

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </section>
        )}

        {tab === "coupons" && (
          <section className="admin-section">

            <div className="admin-card">

              <div className="admin-card-title">

                <div>
                  <span className="cart-label">
                    COUPONS
                  </span>

                  <h2>
                    Create Coupon
                  </h2>
                </div>

              </div>

              <form
                className="admin-form"
                onSubmit={
                  saveCoupon
                }
              >

                <div className="form-grid">

                  <label>
                    Coupon Code

                    <input
                      value={
                        couponForm.code
                      }
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          code:
                            e.target.value,
                        })
                      }
                      placeholder="SAVE10"
                      required
                    />
                  </label>

                  <label>
                    Discount Type

                    <select
                      value={
                        couponForm.discount_type
                      }
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          discount_type:
                            e.target.value,
                        })
                      }
                    >
                      <option value="percentage">
                        Percentage
                      </option>

                      <option value="fixed">
                        Fixed Amount
                      </option>
                    </select>
                  </label>

                  <label>
                    Discount Value

                    <input
                      type="number"
                      min="0"
                      value={
                        couponForm.discount_value
                      }
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          discount_value:
                            e.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <label>
                    Minimum Order Amount

                    <input
                      type="number"
                      min="0"
                      value={
                        couponForm.minimum_order_amount
                      }
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          minimum_order_amount:
                            e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Maximum Discount

                    <input
                      type="number"
                      min="0"
                      value={
                        couponForm.maximum_discount_amount
                      }
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          maximum_discount_amount:
                            e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Usage Limit

                    <input
                      type="number"
                      min="1"
                      value={
                        couponForm.usage_limit
                      }
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          usage_limit:
                            e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Valid From

                    <input
                      type="datetime-local"
                      value={
                        couponForm.valid_from
                      }
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          valid_from:
                            e.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <label>
                    Valid To

                    <input
                      type="datetime-local"
                      value={
                        couponForm.valid_to
                      }
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          valid_to:
                            e.target.value,
                        })
                      }
                      required
                    />
                  </label>

                </div>

                <label className="checkbox-label">

                  <input
                    type="checkbox"
                    checked={
                      couponForm.active
                    }
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        active:
                          e.target.checked,
                      })
                    }
                  />

                  Active Coupon

                </label>

                <button
                  className="primary-btn"
                  type="submit"
                >
                  Create Coupon
                </button>

              </form>

            </div>

            <div className="admin-card">

              <h2>
                Existing Coupons
              </h2>

              <div className="admin-table-wrap">

                <table className="admin-table">

                  <thead>
                    <tr>
                      <th>
                        Code
                      </th>

                      <th>
                        Discount
                      </th>

                      <th>
                        Minimum
                      </th>

                      <th>
                        Usage
                      </th>

                      <th>
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {coupons.map(
                      (coupon) => (
                        <tr
                          key={
                            coupon.id
                          }
                        >

                          <td>
                            <strong>
                              {
                                coupon.code
                              }
                            </strong>
                          </td>

                          <td>
                            {
                              coupon.discount_value
                            }
                            {coupon.discount_type ===
                            "percentage"
                              ? "%"
                              : ""}
                          </td>

                          <td>
                            ₹
                            {Number(
                              coupon.minimum_order_amount ||
                              0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td>
                            {
                              coupon.used_count ??
                              0
                            }

                            {coupon.usage_limit
                              ? ` / ${coupon.usage_limit}`
                              : ""}
                          </td>

                          <td>
                            {coupon.active
                              ? "Active"
                              : "Inactive"}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </section>
        )}

      </div>
    </main>
  );
}

function Stat({
  title,
  value,
}) {
  return (
    <div className="admin-stat">
      <span>
        {title}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

export default AdminDashboard;