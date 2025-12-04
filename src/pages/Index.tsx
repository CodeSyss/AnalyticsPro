import { useState, useMemo, useEffect } from 'react';
import { Star, TrendingUp, MessageCircle, DollarSign, Filter, ShoppingBag, Award, BarChart3, Shirt, Wind, PartyPopper, Sparkles, Footprints, Zap, User, Waves } from 'lucide-react';
import { useData, Category, Product } from '@/context/DataContext';
import { LanguageSelector, Language } from '@/components/LanguageSelector';

// Sistema de idiomas
const translations = {
  es: {
    title: "Analytics",
    dashboard: "Dashboard",
    totalSales: "Ventas Totales Est.",
    unitsSold: "Unidades vendidas (Dataset)",
    totalReviews: "Total Reviews",
    userInteractions: "Interacciones de usuarios",
    avgPrice: "Precio Promedio",
    perUnit: "Por unidad",
    topSeller: "Top Seller",
    sold: "vendidos",
    sortBy: "Ordenar productos por:",
    mostSold: "Más Vendidos",
    mostCommented: "Más Comentados",
    bestRated: "Mejor Calificación",
    priceLowHigh: "Precio: Bajo a Alto",
    priceHighLow: "Precio: Alto a Bajo",
    reviews: "reviews",
    noProducts: "Seleccione una categoría.",
    selectCategory: "Seleccionar Categoría",
    popularity: "Popularidad",
    high: "Alta",
    medium: "Media",
    low: "Baja",
    trendsNow: "Tendencias Ahora",
    trendsDescription: "Descubre los productos más populares y mejor valorados del momento",
    categories: {
      knitwear: "Prendas Tejidas",
      topsBlouses: "Tops y Blusas",
      dresses: "Vestidos",
      vacation: "Ropa de Vacaciones",
      pants: "Pantalones",
      jumpsuits: "Monos y Bodys",
      tshirts: "Camisetas",
      leggings: "Leggings"
    }
  },
  en: {
    title: "Analytics",
    dashboard: "Dashboard",
    totalSales: "Total Sales Est.",
    unitsSold: "Units sold (Dataset)",
    totalReviews: "Total Reviews",
    userInteractions: "User interactions",
    avgPrice: "Average Price",
    perUnit: "Per unit",
    topSeller: "Top Seller",
    sold: "sold",
    sortBy: "Sort products by:",
    mostSold: "Best Sellers",
    mostCommented: "Most Commented",
    bestRated: "Best Rated",
    priceLowHigh: "Price: Low to High",
    priceHighLow: "Price: High to Low",
    reviews: "reviews",
    noProducts: "No products to show. Upload data in the admin panel.",
    selectCategory: "Select Category",
    popularity: "Popularity",
    high: "High",
    medium: "Medium",
    low: "Low",
    trendsNow: "Trends Now",
    trendsDescription: "Discover the most popular and best-rated products of the moment",
    categories: {
      knitwear: "Knitwear",
      topsBlouses: "Tops & Blouses",
      dresses: "Dresses",
      vacation: "Vacation Wear",
      pants: "Pants",
      jumpsuits: "Jumpsuits & Bodysuits",
      tshirts: "T-Shirts",
      leggings: "Leggings"
    }
  },
  zh: {
    title: "分析",
    dashboard: "仪表板",
    totalSales: "总销售估算",
    unitsSold: "已售单位（数据集）",
    totalReviews: "总评论数",
    userInteractions: "用户互动",
    avgPrice: "平均价格",
    perUnit: "每单位",
    topSeller: "热销产品",
    sold: "已售",
    sortBy: "排序产品：",
    mostSold: "最畅销",
    mostCommented: "评论最多",
    bestRated: "评分最高",
    priceLowHigh: "价格：从低到高",
    priceHighLow: "价格：从高到低",
    reviews: "评论",
    noProducts: "没有产品显示。请在管理面板上传数据。",
    selectCategory: "选择类别",
    popularity: "热度",
    high: "高",
    medium: "中",
    low: "低",
    trendsNow: "热门趋势",
    trendsDescription: "发现当下最受欢迎和评分最高的产品",
    categories: {
      knitwear: "针织服装",
      topsBlouses: "上衣和衬衫",
      dresses: "连衣裙",
      vacation: "度假装",
      pants: "裤子",
      jumpsuits: "连身衣",
      tshirts: "T恤",
      leggings: "紧身裤"
    }
  }
};

// Iconos por categoría
const categoryIcons = {
  knitwear: Shirt,           // Prendas Tejidas - Camisa
  topsBlouses: Wind,         // Tops y Blusas - Viento (ligero)
  dresses: Sparkles,         // Vestidos - Destellos (elegante)
  vacation: PartyPopper,     // Ropa de Vacaciones - Fiesta
  pants: Footprints,         // Pantalones - Huellas (movimiento/piernas)
  jumpsuits: Zap,            // Monos y Bodys - Rayo (dinámico)
  tshirts: User,             // Camisetas - Usuario (casual/básico)
  leggings: Waves            // Leggings - Ondas (flexibilidad/movimiento)
};

// Componente para mostrar estrellas
const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          className={`${i < Math.floor(rating) ? 'text-fashion-gold fill-fashion-gold' : 'text-muted-foreground/30'
            }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground font-medium">{rating}</span>
    </div>
  );
};

// Componente de Tarjeta de Estadística
const StatCard = ({ title, value, subtext, icon: Icon, color }: {
  title: string;
  value: string;
  subtext: string;
  icon: any;
  color: string;
}) => (
  <div className="bg-card p-4 rounded-xl shadow-sm border border-border flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">{title}</p>
      <h3 className="text-2xl font-bold text-foreground mt-1">{value}</h3>
      <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
    </div>
    <div className={`p-2 rounded-lg ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
  </div>
);

const Index = () => {
  const { productsByCategory } = useData();
  const [language, setLanguage] = useState<Language>('es');
  const [selectedCategory, setSelectedCategory] = useState<Category>('trendsNow'); // Por defecto muestra Trends Now
  const [sortBy, setSortBy] = useState<'popularity' | 'reviews' | 'rating' | 'priceAsc' | 'priceDesc'>('popularity');

  const t = translations[language];
  const products = selectedCategory ? productsByCategory[selectedCategory] || [] : [];

  // Lógica de ordenamiento y análisis
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    const popularityOrder = { high: 3, medium: 2, low: 1 };

    switch (sortBy) {
      case 'popularity':
        return sorted.sort((a, b) => {
          const aVal = popularityOrder[a.popularity] || 0;
          const bVal = popularityOrder[b.popularity] || 0;
          return bVal - aVal;
        });
      case 'reviews':
        return sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'priceAsc':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'priceDesc':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      default:
        return sorted;
    }
  }, [products, sortBy]);

  // Cálculo de estadísticas globales
  const stats = useMemo(() => {
    if (products.length === 0) return null;

    const highPopularity = products.filter(p => p.popularity === 'high').length;
    const totalReviews = products.reduce((acc, curr) => acc + (curr.reviews || 0), 0);
    const avgPrice = products.reduce((acc, curr) => acc + curr.price, 0) / products.length;
    const topProduct = [...products].sort((a, b) => {
      const popOrder = { high: 3, medium: 2, low: 1 };
      return popOrder[b.popularity] - popOrder[a.popularity] || b.rating - a.rating;
    })[0];

    return { highPopularity, totalReviews, avgPrice, topProduct };
  }, [products]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedCategory('trendsNow')}>
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <BarChart3 size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Shein<span className="font-light text-muted-foreground">{t.title}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Selector de Idioma */}
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={setLanguage}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Selector de Categoría - Siempre visible */}
        <div className="mb-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Filter size={18} className="text-muted-foreground" />
              {t.selectCategory}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {(Object.keys(categoryIcons) as Category[]).map((cat) => {
                if (!cat) return null;
                const Icon = categoryIcons[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${selectedCategory === cat
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border hover:border-foreground/20 text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <Icon size={24} />
                    <span className="text-sm font-medium">{t.categories[cat]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Header especial para Tendencias - Debajo de categorías */}
        {selectedCategory === 'trendsNow' && (
          <div className="mb-6 bg-gradient-to-r from-fashion-blue to-fashion-purple rounded-xl shadow-lg border border-border/50 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <TrendingUp size={28} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold">{t.trendsNow}</h2>
            </div>
            <p className="text-white/90 text-sm">
              {t.trendsDescription}
            </p>
          </div>
        )}

        {/* Vista Dashboard */}
        {!selectedCategory && (
          <div className="text-center py-20 text-muted-foreground animate-fade-in">
            <Filter size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">{t.selectCategory}</p>
          </div>
        )}

        {selectedCategory && (
          <div className="space-y-8 animate-fade-in">
            {products.length > 0 && stats ? (
              <>
                {/* Sección de Estadísticas - Solo para categorías, NO para trendsNow */}
                {selectedCategory !== 'trendsNow' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                      title={t.popularity + " " + t.high}
                      value={stats.highPopularity.toString()}
                      subtext="Productos de alta demanda"
                      icon={TrendingUp}
                      color="bg-fashion-blue"
                    />
                    <StatCard
                      title={t.totalReviews}
                      value={stats.totalReviews.toLocaleString()}
                      subtext={t.userInteractions}
                      icon={MessageCircle}
                      color="bg-fashion-purple"
                    />
                    <StatCard
                      title={t.avgPrice}
                      value={`$${stats.avgPrice.toFixed(2)}`}
                      subtext={t.perUnit}
                      icon={DollarSign}
                      color="bg-fashion-green"
                    />
                    <StatCard
                      title={t.topSeller}
                      value={stats.topProduct?.name.substring(0, 15) + "..."}
                      subtext={`${t.popularity}: ${t[stats.topProduct?.popularity]}`}
                      icon={Award}
                      color="bg-fashion-orange"
                    />
                  </div>
                )}


                {/* Barra de Herramientas / Filtros */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-4 rounded-xl shadow-sm border border-border">
                  <div className="flex items-center gap-2">
                    <Filter size={18} className="text-muted-foreground" />
                    <span className="font-semibold text-foreground">
                      {t.sortBy}
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                    <button
                      onClick={() => setSortBy('popularity')}
                      className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-all border font-medium ${sortBy === 'popularity'
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground'
                        }`}
                    >
                      {t.popularity}
                    </button>
                    <button
                      onClick={() => setSortBy('reviews')}
                      className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-all border font-medium ${sortBy === 'reviews'
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground'
                        }`}
                    >
                      {t.mostCommented}
                    </button>
                    <button
                      onClick={() => setSortBy('rating')}
                      className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-all border font-medium ${sortBy === 'rating'
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground'
                        }`}
                    >
                      {t.bestRated}
                    </button>
                    <button
                      onClick={() => setSortBy('priceAsc')}
                      className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-all border font-medium ${sortBy === 'priceAsc'
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground'
                        }`}
                    >
                      {t.priceLowHigh}
                    </button>
                    <button
                      onClick={() => setSortBy('priceDesc')}
                      className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-all border font-medium ${sortBy === 'priceDesc'
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground'
                        }`}
                    >
                      {t.priceHighLow}
                    </button>
                  </div>
                </div>

                {/* Grilla de Productos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedProducts.map((product, index) => {
                    const popularityColors = {
                      high: 'bg-fashion-green text-white',
                      medium: 'bg-fashion-orange text-white',
                      low: 'bg-muted text-muted-foreground'
                    };

                    return (
                      <ProductCard
                        key={product.id || index}
                        product={product}
                        index={index}
                        t={t}
                        sortBy={sortBy}
                        popularityColors={popularityColors}
                      />
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                <p>{t.noProducts}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// Componente ProductCard con carrusel de imágenes
const ProductCard = ({ product, index, t, sortBy, popularityColors }: {
  product: Product;
  index: number;
  t: any;
  sortBy: string;
  popularityColors: Record<string, string>;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const images = product.images && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : ["https://placehold.co/400x600?text=No+Image"];

  // Auto-rotate images on hover
  useEffect(() => {
    if (!isHovering || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 1000); // Change image every 1 second

    return () => clearInterval(interval);
  }, [isHovering, images.length]);

  // Reset to first image when not hovering
  useEffect(() => {
    if (!isHovering) {
      setCurrentImageIndex(0);
    }
  }, [isHovering]);

  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Imagen y Badges */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-muted"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img
          src={images[currentImageIndex]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badge de Ranking */}
        <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
          #{index + 1}
        </div>

        {/* Badge de Popularidad */}
        <div className={`absolute top-2 right-2 ${popularityColors[product.popularity]} text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-sm`}>
          {t[product.popularity]}
        </div>

        {/* Indicadores de imagen (dots) */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex
                  ? 'bg-white w-4'
                  : 'bg-white/50'
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-xs text-muted-foreground mb-1">{product.category || 'General'}</div>
        <h3 className="font-medium text-foreground line-clamp-2 leading-tight mb-2 group-hover:text-accent transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto pt-3 border-t border-border">
          <div className="flex items-end justify-between mb-2">
            <div>
              <span className="text-lg font-bold text-foreground">${product.price}</span>
              {product.original_price && product.original_price > product.price && (
                <span className="ml-2 text-xs text-muted-foreground line-through">${product.original_price}</span>
              )}
            </div>
            <RatingStars rating={product.rating} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-secondary p-2 rounded-lg">
            <div className="flex items-center gap-1">
              <TrendingUp size={12} className={sortBy === 'popularity' ? 'text-fashion-blue' : ''} />
              <span className={sortBy === 'popularity' ? 'font-bold text-foreground' : ''}>{t[product.popularity]}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle size={12} className={sortBy === 'reviews' ? 'text-fashion-blue' : ''} />
              <span className={sortBy === 'reviews' ? 'font-bold text-foreground' : ''}>{product.reviewsDisplay} {t.reviews}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
