import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">
            WELCOME TO SHOPKART
          </span>

          <h1>
            Shop Smart.
            <br />
            Live Better.
          </h1>

          <p>
            Discover quality products at great prices and enjoy a
            simple, secure shopping experience.
          </p>

          <div className="hero-buttons">
            <Link to="/products" className="primary-btn">
              Shop Now
            </Link>

            <Link to="/products" className="secondary-btn">
              Explore Products
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-icon">🛍️</div>

          <h2>Everything You Need</h2>

          <p>
            Electronics, fashion, home essentials and more.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">

        <div className="feature-card">
          <div className="feature-icon">🚚</div>
          <h3>Fast Delivery</h3>
          <p>
            Get your orders delivered quickly and safely.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Secure Shopping</h3>
          <p>
            Your account and shopping experience stay protected.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">💳</div>
          <h3>Easy Payments</h3>
          <p>
            Choose from multiple convenient payment methods.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⭐</div>
          <h3>Trusted Products</h3>
          <p>
            Find products and share your shopping experience.
          </p>
        </div>

      </section>

      {/* Categories */}
      <section className="home-section">

        <div className="section-heading">
          <span>EXPLORE</span>

          <h2>Shop by Category</h2>

          <p>
            Find exactly what you're looking for.
          </p>
        </div>

        <div className="category-grid">

          <Link to="/products" className="category-card">
            <div className="category-icon">💻</div>
            <h3>Electronics</h3>
            <p>Phones, laptops and gadgets</p>
          </Link>

          <Link to="/products" className="category-card">
            <div className="category-icon">👕</div>
            <h3>Fashion</h3>
            <p>Style for every occasion</p>
          </Link>

          <Link to="/products" className="category-card">
            <div className="category-icon">🏠</div>
            <h3>Home</h3>
            <p>Everything for your home</p>
          </Link>

          <Link to="/products" className="category-card">
            <div className="category-icon">🎧</div>
            <h3>Accessories</h3>
            <p>Complete your everyday setup</p>
          </Link>

        </div>

      </section>

      {/* Call To Action */}
      <section className="cta-section">

        <div>
          <span>READY TO SHOP?</span>

          <h2>
            Find something you'll love.
          </h2>

          <p>
            Browse our collection and start shopping today.
          </p>
        </div>

        <Link to="/products" className="primary-btn">
          Browse Products
        </Link>

      </section>

    </div>
  );
}

export default Home;