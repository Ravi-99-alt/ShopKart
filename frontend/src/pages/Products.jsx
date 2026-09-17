import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get("/products/"),
          api.get("/categories/").catch(() => ({ data: [] })),
        ]);
        setProducts(Array.isArray(productsResponse.data) ? productsResponse.data : productsResponse.data?.results || []);
        setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : categoriesResponse.data?.results || []);
        setError("");
      } catch (err) {
        setError(err.response?.data?.detail || "Unable to load products.");
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const term = search.trim().toLowerCase();
      const name = `${product.name || ""} ${product.description || ""}`.toLowerCase();
      const productCategory = String(product.category ?? product.category_id ?? "");
      return (!term || name.includes(term)) && (!category || productCategory === category);
    });
    if (sort === "price-low") return [...result].sort((a,b) => Number(a.discount_price ?? a.price) - Number(b.discount_price ?? b.price));
    if (sort === "price-high") return [...result].sort((a,b) => Number(b.discount_price ?? b.price) - Number(a.discount_price ?? a.price));
    if (sort === "rating") return [...result].sort((a,b) => Number(b.average_rating || 0) - Number(a.average_rating || 0));
    return result;
  }, [products, search, category, sort]);

  if (loading) return <PageMessage title="Loading products" text="Please wait while the catalog loads." loading />;
  if (error) return <PageMessage title="Unable to load products" text={error} />;

  return <main className="catalog-page"><div className="content-width">
    <div className="catalog-heading"><div><p className="eyebrow">SHOPKART CATALOG</p><h1>Products</h1><p>Browse the latest products available in the store.</p></div><strong>{filteredProducts.length} results</strong></div>
    <div className="catalog-layout">
      <aside className="filter-panel"><h3>Filters</h3><label>Search<input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search products" /></label><label>Category<select value={category} onChange={(e)=>setCategory(e.target.value)}><option value="">All Categories</option>{categories.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label><button className="text-button" onClick={()=>{setSearch("");setCategory("");setSort("featured");}}>Clear filters</button></aside>
      <section className="catalog-results"><div className="sort-row"><span>{filteredProducts.length} products</span><label>Sort by<select value={sort} onChange={(e)=>setSort(e.target.value)}><option value="featured">Featured</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="rating">Customer Rating</option></select></label></div>
      {filteredProducts.length === 0 ? <div className="empty-state"><h2>No products found</h2><p>Try changing your search or filters.</p></div> : <div className="market-product-grid">{filteredProducts.map((product)=><ProductCard product={product} key={product.id}/>)}</div>}</section>
    </div>
  </div></main>;
}

function ProductCard({ product }) {
  const price = product.discount_price ?? product.price;
  const discounted = product.discount_price != null && Number(product.discount_price) < Number(product.price);
  const rating = product.average_rating != null ? Number(product.average_rating).toFixed(1) : null;
  return <article className="market-product-card"><Link to={`/products/${product.id}`} className="market-product-image">{product.image ? <img src={product.image} alt={product.name}/> : <div className="image-placeholder">No image</div>}{discounted && <span className="sale-badge">Deal</span>}</Link><div className="market-product-info"><span className="product-category">{product.category_name || "ShopKart"}</span><Link to={`/products/${product.id}`}><h2>{product.name}</h2></Link>{rating && <div className="rating-line"><span>{rating}</span><span className="rating-star">★</span>{product.review_count != null && <span>({product.review_count})</span>}</div>}<div className="price-line"><strong>₹{Number(price || 0).toLocaleString("en-IN")}</strong>{discounted && <del>₹{Number(product.price).toLocaleString("en-IN")}</del>}</div><p className={Number(product.stock)>0?"stock-line":"stock-line out"}>{Number(product.stock)>0 ? `${product.stock} in stock` : "Currently unavailable"}</p><Link to={`/products/${product.id}`} className="buy-button">View product</Link></div></article>;
}

function PageMessage({ title, text, loading=false }) { return <main className="catalog-page"><div className="content-width"><div className="page-message">{loading && <div className="loading-spinner"/>}<h2>{title}</h2><p>{text}</p></div></div></main>; }
export default Products;
