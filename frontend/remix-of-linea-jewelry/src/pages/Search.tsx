import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import ProductGrid from "../components/category/ProductGrid";
import Pagination from "../components/category/Pagination";
import { searchProducts } from "@/lib/api";
import type { Product } from "@/types/product";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadSearchResults() {
      try {
        setLoading(true);
        setError(null);

        const result = await searchProducts({
          q: query,
          page,
          limit: 12,
        });

        if (!isMounted) return;

        setItems(result.items);
        setTotalPages(result.pagination.totalPages);
        setTotalItems(result.pagination.total);
      } catch (err) {
        if (!isMounted) return;
        setError("Unable to load search results right now.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (query) {
      loadSearchResults();
    }

    return () => {
      isMounted = false;
    };
  }, [query, page]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-6">
        <div className="px-6 mb-8 border-b border-border pb-4">
          <h1 className="text-2xl font-light mb-2 text-foreground">
            Search Results
          </h1>
          <p className="text-sm text-muted-foreground">
            {query ? `Results for "${query}"` : "Enter a search query"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {totalItems} items found
          </p>
        </div>

        <ProductGrid products={items} loading={loading} error={error} />
        
        {totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Search;
