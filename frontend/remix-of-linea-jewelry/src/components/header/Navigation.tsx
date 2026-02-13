import { ArrowRight, X, Minus, Plus, Search, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ShoppingBag from "./ShoppingBag";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { searchProducts } from "@/lib/api";
import * as wishlistApi from "@/lib/wishlist-api";
import type { Product } from "@/types/product";
import type { Wishlist } from "@/types/cart";


const Navigation = () => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [offCanvasType, setOffCanvasType] = useState<'favorites' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShoppingBagOpen, setIsShoppingBagOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<Wishlist[]>([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  
  // Use cart context
  const { cart, totalItems, updateItem, removeItem, isLoggedIn, logout } = useCart();
  
  // Load wishlist when favorites panel opens
  useEffect(() => {
    if (offCanvasType === 'favorites' && isLoggedIn) {
      loadWishlist();
    }
  }, [offCanvasType, isLoggedIn]);
  
  const loadWishlist = async () => {
    setIsLoadingWishlist(true);
    try {
      const items = await wishlistApi.getWishlist();
      setWishlistItems(items);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setIsLoadingWishlist(false);
    }
  };
  
  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await wishlistApi.removeFromWishlist(productId);
      setWishlistItems(wishlistItems.filter(item => item.productId !== productId));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };
  
  // Preload dropdown images for faster display
  useEffect(() => {
    const imagesToPreload = [
      "/rings-collection.png",
      "/earrings-collection.png", 
      "/arcus-bracelet.png",
      "/span-bracelet.png",
      "/founders.png"
    ];
    
    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchProducts({
        q: query,
        page: 1,
        limit: 8,
      });
      setSearchResults(result.items);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const performSearch = (query: string) => {
    if (query.trim()) {
      setIsSearchOpen(false);
      setSearchQuery("");
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  const handleSearchKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      performSearch(searchQuery);
    }
  };

  const popularSearches = [
    "Gold Rings",
    "Silver Necklaces", 
    "Pearl Earrings",
    "Designer Bracelets",
    "Wedding Rings",
    "Vintage Collection"
  ];
  
  const navItems = [
    { 
      name: "Shop", 
      href: "/category/shop",
      submenuItems: [
        "Rings",
        "Necklaces", 
        "Earrings",
        "Bracelets",
        "Watches"
      ],
      images: [
        { src: "/rings-collection.png", alt: "Rings Collection", label: "Rings" },
        { src: "/earrings-collection.png", alt: "Earrings Collection", label: "Earrings" }
      ]
    },
    { 
      name: "New in", 
      href: "/category/new-in",
      submenuItems: [
        "This Week's Arrivals",
        "Spring Collection",
        "Featured Designers",
        "Limited Edition",
        "Pre-Orders"
      ],
      images: [
        { src: "/arcus-bracelet.png", alt: "Arcus Bracelet", label: "Arcus Bracelet" },
        { src: "/span-bracelet.png", alt: "Span Bracelet", label: "Span Bracelet" }
      ]
    },
    { 
      name: "About", 
      href: "/about/our-story",
      submenuItems: [
        "Our Story",
        "Sustainability",
        "Size Guide",
        "Customer Care",
        "Store Locator"
      ],
      images: [
        { src: "/founders.png", alt: "Company Founders", label: "Read our story" }
      ]
    }
  ];

  return (
    <nav 
      className="relative" 
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="flex items-center justify-between h-16 px-6">
        {/* Mobile hamburger button */}
        <button
          className="lg:hidden p-2 mt-0.5 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 h-5 relative">
            <span className={`absolute block w-5 h-px bg-current transform transition-all duration-300 ${
              isMobileMenuOpen ? 'rotate-45 top-2.5' : 'top-1.5'
            }`}></span>
            <span className={`absolute block w-5 h-px bg-current transform transition-all duration-300 top-2.5 ${
              isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}></span>
            <span className={`absolute block w-5 h-px bg-current transform transition-all duration-300 ${
              isMobileMenuOpen ? '-rotate-45 top-2.5' : 'top-3.5'
            }`}></span>
          </div>
        </button>

        {/* Left navigation - Hidden on tablets and mobile */}
        <div className="hidden lg:flex space-x-8">
          {navItems.map((item) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => setActiveDropdown(item.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                to={item.href}
                className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-sm font-light py-6 block"
              >
                {item.name}
              </Link>
            </div>
          ))}
        </div>

        {/* Center logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link to="/" className="block">
            <img 
              src="/LINEA-1.svg" 
              alt="LINEA" 
              className="h-6 w-auto"
            />
          </Link>
        </div>

        {/* Right icons */}
        <div className="flex items-center space-x-2">
          <button 
            className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
            aria-label="Search"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
          <Link 
            to={isLoggedIn ? "/wishlist" : "/auth/login"}
            className="hidden lg:flex p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
            aria-label="Wishlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </Link>
          <button 
            className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200 relative"
            aria-label="Shopping bag"
            onClick={() => setIsShoppingBagOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[30%] text-[0.5rem] font-semibold text-black pointer-events-none">
                {totalItems}
              </span>
            )}
          </button>
          
          {/* Login/Logout button */}
          {isLoggedIn ? (
            <button 
              className="px-4 py-2 text-sm font-light text-nav-foreground hover:text-nav-hover transition-colors duration-200 border border-nav-foreground/30 rounded hover:border-nav-foreground/60"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Logout
            </button>
          ) : (
            <Link 
              to="/auth/login"
              className="px-4 py-2 text-sm font-light text-nav-foreground hover:text-nav-hover transition-colors duration-200 border border-nav-foreground/30 rounded hover:border-nav-foreground/60"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Full width dropdown */}
      {activeDropdown && (
        <div 
          className="absolute top-full left-0 right-0 bg-nav border-b border-border z-50"
          onMouseEnter={() => setActiveDropdown(activeDropdown)}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div className="px-6 py-8">
            <div className="flex justify-between w-full">
              {/* Left side - Menu items */}
              <div className="flex-1">
                <ul className="space-y-2">
                   {navItems
                     .find(item => item.name === activeDropdown)
                     ?.submenuItems.map((subItem, index) => (
                      <li key={index}>
                        <Link 
                          to={activeDropdown === "About" ? `/about/${subItem.toLowerCase().replace(/\s+/g, '-')}` : `/category/${subItem.toLowerCase()}`}
                          className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-sm font-light block py-2"
                        >
                          {subItem}
                        </Link>
                      </li>
                   ))}
                </ul>
              </div>

              {/* Right side - Images */}
              <div className="flex space-x-6">
                {navItems
                  .find(item => item.name === activeDropdown)
                  ?.images.map((image, index) => {
                    // Determine the link destination based on dropdown and image
                    let linkTo = "/";
                    if (activeDropdown === "Shop") {
                      if (image.label === "Rings") linkTo = "/category/rings";
                      else if (image.label === "Earrings") linkTo = "/category/earrings";
                    } else if (activeDropdown === "New in") {
                      if (image.label === "Arcus Bracelet") linkTo = "/product/arcus-bracelet";
                      else if (image.label === "Span Bracelet") linkTo = "/product/span-bracelet";
                    } else if (activeDropdown === "About") {
                      linkTo = "/about/our-story";
                    }
                    
                    return (
                      <Link key={index} to={linkTo} className="w-[400px] h-[280px] cursor-pointer group relative overflow-hidden block">
                        <img 
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-90"
                        />
                        {(activeDropdown === "Shop" || activeDropdown === "New in" || activeDropdown === "About") && (
                          <div className="absolute bottom-2 left-2 text-white text-xs font-light flex items-center gap-1">
                            <span>{image.label}</span>
                            <ArrowRight size={12} />
                          </div>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search overlay */}
      {isSearchOpen && (
        <div 
          className="absolute top-full left-0 right-0 bg-nav border-b border-border z-50"
        >
          <div className="px-6 py-8">
            <div className="max-w-2xl mx-auto">
              {/* Search input */}
              <div className="relative mb-8">
                <div className="flex items-center border-b border-border pb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-nav-foreground mr-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search for jewelry..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleSearchKeydown}
                    className="flex-1 bg-transparent text-nav-foreground placeholder:text-nav-foreground/60 outline-none text-lg"
                    autoFocus
                  />
                </div>
              </div>

              {/* Search results */}
              {searchQuery && isSearching && (
                <div className="mb-8">
                  <p className="text-nav-foreground text-sm font-light">Searching...</p>
                </div>
              )}

              {searchQuery && !isSearching && searchResults.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-nav-foreground text-sm font-light mb-4">Search Results</h3>
                  <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {searchResults.map((product) => (
                      <Link
                        key={product._id}
                        to={`/product/${product.slug}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex flex-col hover:opacity-70 transition-opacity"
                      >
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-32 object-cover mb-2"
                          />
                        )}
                        <p className="text-nav-foreground text-xs font-light">{product.name}</p>
                        <p className="text-nav-foreground/60 text-xs">{formatPrice(product.price)}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {searchQuery && !isSearching && searchResults.length === 0 && (
                <div className="mb-8">
                  <p className="text-nav-foreground text-sm font-light">No products found for "{searchQuery}"</p>
                </div>
              )}

              {!searchQuery && (
                <div>
                  <h3 className="text-nav-foreground text-sm font-light mb-4">Popular Searches</h3>
                  <div className="flex flex-wrap gap-3">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => performSearch(search)}
                        className="text-nav-foreground hover:text-nav-hover text-sm font-light py-2 px-4 border border-border rounded-full transition-colors duration-200 hover:border-nav-hover"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile navigation menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-nav border-b border-border z-50">
          <div className="px-6 py-8">
            <div className="space-y-6">
              {navItems.map((item, index) => (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-lg font-light block py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                   <div className="mt-3 pl-4 space-y-2">
                     {item.submenuItems.map((subItem, subIndex) => (
                       <Link
                         key={subIndex}
                         to={item.name === "About" ? `/about/${subItem.toLowerCase().replace(/\s+/g, '-')}` : `/category/${subItem.toLowerCase()}`}
                         className="text-nav-foreground/70 hover:text-nav-hover text-sm font-light block py-1"
                         onClick={() => setIsMobileMenuOpen(false)}
                       >
                         {subItem}
                       </Link>
                     ))}
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Shopping Bag Component */}
      <ShoppingBag 
        isOpen={isShoppingBagOpen}
        onClose={() => setIsShoppingBagOpen(false)}
        cart={cart}
        updateQuantity={updateItem}
        removeItem={removeItem}
        isLoggedIn={isLoggedIn}
        onViewFavorites={() => {
          setIsShoppingBagOpen(false);
          setOffCanvasType('favorites');
        }}
      />
      

    </nav>
  );
};

export default Navigation;