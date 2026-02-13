import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import CategoryHeader from "../components/category/CategoryHeader";
import FilterSortBar from "../components/category/FilterSortBar";
import ProductGrid from "../components/category/ProductGrid";
import Pagination from "../components/category/Pagination";
import { fetchProducts } from "@/lib/api";
import type { Product } from "@/types/product";

const Category = () => {
  const { category } = useParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const categoryLabel = useMemo(() => {
    if (!category || category === "shop" || category === "all") return "All Products";
    if (category === "new-in") return "New in";
    return category.replace(/-/g, " ");
  }, [category]);

  const apiCategory = useMemo(() => {
    if (!category || category === "shop" || category === "all" || category === "new-in") {
      return undefined;
    }

    const normalized = category
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    return normalized;
  }, [category]);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchProducts({
          page,
          limit: 12,
          category: apiCategory,
          newArrivals: category === "new-in" ? 30 : undefined,
          sort: "newest",
        });

        if (!isMounted) return;

        setItems(result.items);
        setTotalPages(result.pagination.totalPages);
        setTotalItems(result.pagination.total);
      } catch (err) {
        if (!isMounted) return;
        setError("Unable to load products right now.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, [apiCategory, category, page]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-6">
        <CategoryHeader category={categoryLabel} />
        
        <FilterSortBar 
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          itemCount={totalItems}
        />
        <ProductGrid products={items} loading={loading} error={error} />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </main>
      
      <Footer />
    </div>
  );
};

export default Category;