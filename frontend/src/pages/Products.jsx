import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products/");

      const data = response.data;

      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data.results && Array.isArray(data.results)) {
        setProducts(data.results);
      } else {
        setProducts([]);
      }

    } catch (err) {
      console.error("Product API Error:", err);

      if (err.response) {
        setError(
          `Server error: ${err.response.status}`
        );
      } else {
        setError(
          "Unable to connect to the Django backend."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (product) => {
    if (
      product.discount_price !== null &&
      product.discount_price !== undefined
    ) {
      return product.discount_price;
    }

    return product.price;
  };

  const hasDiscount = (product) => {
    if (
      product.discount_price === null ||
      product.discount_price === undefined
    ) {
      return false;
    }

    return (
      Number(product.discount_price) <
      Number(product.price)
    );
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading-box">
          <div className="loading-spinner"></div>
          <h2>Loading Products...</h2>
          <p>Please wait while we load the ShopKart products.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="error-box">
          <div className="error-icon">⚠️</div>

          <h2>Unable to Load Products</h2>

          <p>{error}</p>

          <button
            className="primary-btn retry-btn"
            onClick={fetchProducts}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">

      {/* Header */}
      <section className="products-header">

        <span>SHOPKART COLLECTION</span>

        <h1>All Products</h1>

        <p>
          Discover quality products from our collection.
        </p>

        <div className="product-count">
          {products.length}{" "}
          {products.length === 1
            ? "Product"
            : "Products"}
        </div>

      </section>

      {/* Products */}
      {products.length === 0 ? (
        <div className="empty-box">

          <div className="empty-icon">🛍️</div>

          <h2>No Products Available</h2>

          <p>
            There are currently no products available.
          </p>

        </div>
      ) : (

        <section className="product-grid">

          {products.map((product) => {

            const currentPrice = getPrice(product);

            return (
              <article
                className="product-card"
                key={product.id}
              >

                {/* Product Image */}
                <div className="product-image">

                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                    />
                  ) : (
                    <div className="no-image">
                      🛍️
                    </div>
                  )}

                </div>

                {/* Product Details */}
                <div className="product-info">

                  <p className="product-category">
                    {product.category_name ||
                      "ShopKart"}
                  </p>

                  <h2>
                    {product.name}
                  </h2>

                  {/* Rating */}
                  <div className="product-rating">

                    <span>
                      ⭐
                    </span>

                    <span>
                      {product.average_rating !==
                        null &&
                      product.average_rating !==
                        undefined
                        ? Number(
                            product.average_rating
                          ).toFixed(1)
                        : "No rating"}
                    </span>

                    {product.review_count !==
                      undefined && (
                      <span className="review-count">
                        ({product.review_count})
                      </span>
                    )}

                  </div>

                  {/* Price */}
                  <div className="product-price">

                    <strong>
                      ₹
                      {Number(
                        currentPrice
                      ).toLocaleString("en-IN")}
                    </strong>

                    {hasDiscount(product) && (
                      <span className="old-price">
                        ₹
                        {Number(
                          product.price
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    )}

                  </div>

                  {/* Stock */}
                  <p
                    className={
                      Number(product.stock) > 0
                        ? "stock-available"
                        : "stock-unavailable"
                    }
                  >
                    {Number(product.stock) > 0
                      ? `${product.stock} available`
                      : "Out of stock"}
                  </p>

                  {/* View Product */}
                  <Link
                    to={`/products/${product.id}`}
                    className="product-btn"
                  >
                    View Product
                  </Link>

                </div>

              </article>
            );
          })}

        </section>

      )}

    </div>
  );
}

export default Products;