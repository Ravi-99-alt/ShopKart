import { Link } from "react-router-dom";

const categories = [
  { title: "Electronics", text: "Mobiles, laptops, audio and accessories", className: "cat-electronics" },
  { title: "Fashion", text: "Clothing, footwear and everyday styles", className: "cat-fashion" },
  { title: "Home", text: "Kitchen, home essentials and more", className: "cat-home" },
  { title: "Accessories", text: "Useful products for work and travel", className: "cat-accessories" },
];

function Home() {
  return (
    <main className="home-page">
      <section className="market-hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">SHOPKART MARKETPLACE</p>
            <h1>Everything you need, in one place.</h1>
            <p className="hero-text">Browse products, compare prices, save favorites and place your order in a few simple steps.</p>
            <div className="hero-actions"><Link to="/products" className="primary-btn">Shop Now</Link><Link to="/products" className="secondary-btn">View All Products</Link></div>
            <div className="hero-points"><span>Secure checkout</span><span>Fast delivery</span><span>Easy returns</span></div>
          </div>
          <div className="hero-panel">
            <div className="hero-panel-top">Featured shopping</div>
            <div className="hero-product-lines"><span>Electronics</span><strong>Latest tech</strong></div>
            <div className="hero-product-lines"><span>Fashion</span><strong>Everyday styles</strong></div>
            <div className="hero-product-lines"><span>Home</span><strong>Daily essentials</strong></div>
            <Link to="/products" className="hero-panel-link">Explore the store</Link>
          </div>
        </div>
      </section>

      <section className="service-strip"><div className="content-width service-grid"><div><strong>Free delivery</strong><span>On eligible orders</span></div><div><strong>Secure payments</strong><span>Protected checkout</span></div><div><strong>Easy shopping</strong><span>Simple order tracking</span></div><div><strong>Customer support</strong><span>Help when you need it</span></div></div></section>

      <section className="home-section content-width">
        <div className="section-title-row"><div><p className="eyebrow">SHOP BY CATEGORY</p><h2>Explore categories</h2></div><Link to="/products" className="section-link">See all products</Link></div>
        <div className="category-grid">{categories.map((category) => <Link to="/products" className={`market-category ${category.className}`} key={category.title}><div><h3>{category.title}</h3><p>{category.text}</p></div><span>View products</span></Link>)}</div>
      </section>

      <section className="deal-banner content-width"><div><p className="eyebrow">SHOPKART DEALS</p><h2>Great products. Clear prices. Simple shopping.</h2><p>Find current products and offers in the ShopKart catalog.</p></div><Link to="/products" className="primary-btn">Browse Deals</Link></section>
    </main>
  );
}
export default Home;
