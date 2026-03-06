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
    if (selectedFilters.priceRanges.length === 0) {
      return { minPrice: undefined, maxPrice: undefined };
    }

    const rangeConfig: Record<string, { min: number; max?: number }> = {
      "Under ₹1,000": { min: 0, max: 1000 },
      "₹1,000 - ₹2,000": { min: 1000, max: 2000 },
      "₹2,000 - ₹3,000": { min: 2000, max: 3000 },
      "Over ₹3,000": { min: 3000 },
    };

    const selectedRanges = selectedFilters.priceRanges
      .map((label) => rangeConfig[label])
      .filter(Boolean);

    if (selectedRanges.length === 0) {
      return { minPrice: undefined, maxPrice: undefined };
    }

    const minPrice = Math.min(...selectedRanges.map((range) => range.min));
    const hasOpenEndedRange = selectedRanges.some((range) => range.max === undefined);
    const maxPrice = hasOpenEndedRange
      ? undefined
      : Math.max(...selectedRanges.map((range) => range.max as number));

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
          ? selectedFilters.categories.join(',')
          : apiCategory;

        const result = await fetchProducts({
          page,
          limit: 12,
          category: categoryFilter,
          newArrivals: category === "new-in" ? 30 : undefined,
          sort: sortBy,
          minPrice,
          maxPrice,
          materials: selectedFilters.materials,
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