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
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [] as string[],
    priceRanges: [] as string[],
    materials: [] as string[],
  });
  const [sortBy, setSortBy] = useState("featured");

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

  // Convert price ranges to min/max values
  const getPriceRange = () => {
    let minPrice = undefined;
    let maxPrice = undefined;

    if (selectedFilters.priceRanges.length > 0) {
      const priceRanges = selectedFilters.priceRanges;
      
      if (priceRanges.includes("Under €1,000")) {
        minPrice = 0;
      }
      if (priceRanges.includes("€1,000 - €2,000")) {
        minPrice = Math.min(minPrice ?? 1000, 1000);
        maxPrice = Math.max(maxPrice ?? 2000, 2000);
      }
      if (priceRanges.includes("€2,000 - €3,000")) {
        minPrice = Math.min(minPrice ?? 2000, 2000);
        maxPrice = Math.max(maxPrice ?? 3000, 3000);
      }
      if (priceRanges.includes("Over €3,000")) {
        minPrice = Math.min(minPrice ?? 3000, 3000);
        maxPrice = undefined; // No max for "Over €3,000"
      }
    }

    return { minPrice, maxPrice };
  };

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        const { minPrice, maxPrice } = getPriceRange();
        const categoryFilter = selectedFilters.categories.length > 0 
          ? selectedFilters.categories[0] 
          : apiCategory;

        const result = await fetchProducts({
          page,
          limit: 12,
          category: categoryFilter,
          newArrivals: category === "new-in" ? 30 : undefined,
          sort: sortBy,
          minPrice,
          maxPrice,
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
  }, [apiCategory, category, page, selectedFilters, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-6">
        <CategoryHeader category={categoryLabel} />
        
        <FilterSortBar 
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          itemCount={totalItems}
          onFilterChange={(filters) => {
            setSelectedFilters(filters);
            setPage(1); // Reset to page 1 when filters change
          }}
          onSortChange={(sort) => {
            setSortBy(sort);
            setPage(1); // Reset to page 1 when sort changes
          }}
          currentSort={sortBy}
        />
        <ProductGrid products={items} loading={loading} error={error} />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </main>
      
      <Footer />
    </div>
  );
};

export default Category;