import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/format";
import pantheonImage from "@/assets/pantheon.jpg";
import organicEarring from "@/assets/organic-earring.png";
import linkBracelet from "@/assets/link-bracelet.png";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
}

const ProductGrid = ({ products, loading, error }: ProductGridProps) => {
  if (loading) {
    return (
      <section className="w-full px-6 mb-16">
        <p className="text-sm font-light text-muted-foreground">Loading products...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full px-6 mb-16">
        <p className="text-sm font-light text-muted-foreground">{error}</p>
      </section>
    );
  }

  if (!products.length) {
    return (
      <section className="w-full px-6 mb-16">
        <p className="text-sm font-light text-muted-foreground">No products found.</p>
      </section>
    );
  }

  return (
    <section className="w-full px-6 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <Link key={product._id} to={`/product/${product.slug}`}>
              <Card 
                className="border-none shadow-none bg-transparent group cursor-pointer"
              >
                <CardContent className="p-0">
                  <div className="aspect-square mb-3 overflow-hidden bg-muted/10 relative">
                    <img
                      src={product.images?.[0]?.url || pantheonImage}
                      alt={product.name}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-0"
                    />
                    <img
                      src={product.category === "Earrings" ? organicEarring : linkBracelet}
                      alt={`${product.name} lifestyle`}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-300 opacity-0 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-black/[0.03]"></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-light text-foreground">
                      {product.category}
                    </p>
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-foreground">
                        {product.name}
                      </h3>
                      <p className="text-sm font-light text-foreground">
                        {formatPrice(product.finalPrice)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
    </section>
  );
};

export default ProductGrid;