import { useState, useMemo, useEffect, useRef } from 'react';
import { Star, TrendingUp, MessageCircle, DollarSign, Filter, ShoppingBag, Award, BarChart3, Shirt, Wind, PartyPopper, Sparkles, Footprints, Zap, User, Waves, ArrowUp, Star as StarIcon } from 'lucide-react';
import { useData, Category, Product } from '@/context/DataContext';
import { useFavorites } from '@/context/FavoritesContext';
import { LanguageSelector, Language } from '@/components/LanguageSelector';
import ProductDetailModal from '@/components/ProductDetailModal';

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
    mostCommented: "Más Comentados y Vendidos",
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
    bodyType: "Contextura",
    all: "Todos",
    standard: "Standard",
    curvy: "Curvy",
    categories: {
      knitwear: "Prendas Tejidas",
      topsBlouses: "Tops y Blusas",
      dresses: "Vestidos",
      vacation: "Ropa de Vacaciones",
      pants: "Pantalones",
      jumpsuits: "Monos y Bodys",
      tshirts: "Camisetas",
      leggings: "Leggings",
      futureModels: "Modelos Futuros",
      favorites: "Favoritos"
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
    mostCommented: "Most Commented & Sold",
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
    bodyType: "Body Type",
    all: "All",
    standard: "Standard",
    curvy: "Curvy",
    categories: {
      knitwear: "Knitwear",
      topsBlouses: "Tops & Blouses",
      dresses: "Dresses",
      vacation: "Vacation Wear",
      pants: "Pants",
      jumpsuits: "Jumpsuits & Bodysuits",
      tshirts: "T-Shirts",
      leggings: "Leggings",
      futureModels: "Future Models",
      favorites: "Favorites"
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
    mostCommented: "评论和销量最多",
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
    bodyType: "体型",
    all: "全部",
    standard: "标准",
    curvy: "丰满",
    categories: {
      knitwear: "针织服装",
      topsBlouses: "上衣和衬衫",
      dresses: "连衣裙",
      vacation: "度假装",
      pants: "裤子",
      jumpsuits: "连身衣",
      tshirts: "T恤",
      leggings: "紧身裤",
      futureModels: "未来模型",
      favorites: "收藏夹"
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
  leggings: Waves,           // Leggings - Ondas (flexibilidad/movimiento)
  futureModels: TrendingUp,  // Modelos Futuros - Tendencia ascendente
  favorites: StarIcon        // Favoritos - Estrella
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
  const { favorites } = useFavorites();
  const [language, setLanguage] = useState<Language>('es');
  const [selectedCategory, setSelectedCategory] = useState<Category>('trendsNow'); // Por defecto muestra Trends Now
  const [sortBy, setSortBy] = useState<'popularity' | 'reviews' | 'rating' | 'priceAsc' | 'priceDesc'>('popularity');
  const [displayCount, setDisplayCount] = useState(24); // Mostrar 24 productos inicialmente
  const [showScrollTop, setShowScrollTop] = useState(false); // Mostrar botón scroll to top
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // Producto seleccionado para modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado del modal
  const [bodyTypeFilter, setBodyTypeFilter] = useState<'all' | 'standard' | 'curvy'>('all'); // Filtro de contextura
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const t = translations[language];
  // Si la categoría es 'favorites', usar los favoritos, sino usar productsByCategory
  const productsRaw = selectedCategory === 'favorites'
    ? favorites
    : (selectedCategory ? productsByCategory[selectedCategory] || [] : []);

  // Filtrar por contextura
  const products = useMemo(() => {
    console.log(`🔍 Filtrando productos - Categoría: ${selectedCategory}, BodyType Filter: ${bodyTypeFilter}`);
    console.log(`📦 Total productos raw:`, productsRaw.length);

    // Contar cuántos productos tienen bodyType
    const withBodyType = productsRaw.filter(p => p.bodyType).length;
    console.log(`✅ Productos con bodyType:`, withBodyType);
    console.log(`❌ Productos SIN bodyType:`, productsRaw.length - withBodyType);

    if (bodyTypeFilter === 'all') {
      console.log(`📋 Mostrando TODOS los productos:`, productsRaw.length);
      return productsRaw;
    }

    const filtered = productsRaw.filter(p => p.bodyType === bodyTypeFilter);
    console.log(`🎯 Productos filtrados por "${bodyTypeFilter}":`, filtered.length);

    if (filtered.length === 0 && productsRaw.length > 0) {
      console.warn(`⚠️ No hay productos con bodyType="${bodyTypeFilter}". Verifica que los productos se hayan subido con la contextura correcta.`);
    }

    return filtered;
  }, [productsRaw, bodyTypeFilter, selectedCategory]);

  // Reset displayCount cuando cambia la categoría o el ordenamiento
  useEffect(() => {
    setDisplayCount(24);
  }, [selectedCategory, sortBy]);

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

  // Productos a mostrar (limitados por displayCount)
  const displayedProducts = useMemo(() => {
    return sortedProducts.slice(0, displayCount);
  }, [sortedProducts, displayCount]);

  // Intersection Observer para infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && displayCount < sortedProducts.length) {
          // Cargar 24 productos más
          setDisplayCount(prev => Math.min(prev + 24, sortedProducts.length));
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [displayCount, sortedProducts.length]);

  // Detectar scroll para mostrar/ocultar botón "Scroll to Top"
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Función para volver arriba
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Funciones para el modal
  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductDetail = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300); // Delay para animación
  };

  // Función para ir a Trends Now y scroll al top
  const goToTrendsNow = () => {
    setSelectedCategory('trendsNow');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={goToTrendsNow}>
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <BarChart3 size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Shein<span className="font-light text-muted-foreground">{t.title}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Selector de Contextura - Desktop (botones) */}
            <div className="hidden md:flex items-center gap-2 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setBodyTypeFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${bodyTypeFilter === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {t.all}
              </button>
              <button
                onClick={() => setBodyTypeFilter('standard')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${bodyTypeFilter === 'standard'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {t.standard}
              </button>
              <button
                onClick={() => setBodyTypeFilter('curvy')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${bodyTypeFilter === 'curvy'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {t.curvy}
              </button>
            </div>

            {/* Selector de Contextura - Mobile (dropdown) */}
            <div className="md:hidden relative">
              <select
                value={bodyTypeFilter}
                onChange={(e) => setBodyTypeFilter(e.target.value as 'all' | 'standard' | 'curvy')}
                className="appearance-none bg-gradient-to-r from-secondary to-secondary/80 text-foreground border-2 border-primary/20 rounded-lg px-4 py-2 pr-8 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer"
              >
                <option value="all">{t.all}</option>
                <option value="standard">{t.standard}</option>
                <option value="curvy">{t.curvy}</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Selector de Idioma */}
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={setLanguage}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Selector de Categoría */}
        <div className="mb-6">
          {/* Desktop - Grid de categorías */}
          <div className="hidden md:block bg-card rounded-xl shadow-sm border border-border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Filter size={18} className="text-muted-foreground" />
              {t.selectCategory}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {(Object.keys(categoryIcons) as Category[]).map((cat) => {
                if (!cat) return null;
                const Icon = categoryIcons[cat];
                const isFavorites = cat === 'favorites';

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 relative overflow-hidden ${isFavorites
                      ? selectedCategory === cat
                        ? 'border-yellow-400 bg-gradient-to-br from-yellow-400/20 via-amber-500/20 to-orange-500/20 text-yellow-500 shadow-lg shadow-yellow-500/30 scale-105'
                        : 'border-yellow-400/50 bg-gradient-to-br from-yellow-400/10 via-amber-500/10 to-orange-500/10 text-yellow-600 hover:border-yellow-400 hover:shadow-md hover:shadow-yellow-500/20 hover:scale-105'
                      : selectedCategory === cat
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border hover:border-foreground/20 text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {/* Efecto de brillo para favoritos */}
                    {isFavorites && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
                        style={{ animation: 'shimmer 3s infinite' }} />
                    )}
                    <Icon size={24} className={isFavorites ? 'relative z-10' : ''} />
                    <span className={`text-sm font-medium ${isFavorites ? 'relative z-10 font-bold' : ''}`}>
                      {t.categories[cat]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile - Dropdown de categorías */}
          <div className="md:hidden bg-gradient-to-br from-card via-card to-secondary/20 rounded-xl shadow-lg border-2 border-primary/10 p-5">
            <label htmlFor="category-select" className="font-bold text-base mb-3 flex items-center gap-2 text-foreground">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Filter size={20} className="text-primary" />
              </div>
              {t.selectCategory}
            </label>
            <div className="relative">
              <select
                id="category-select"
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value as Category)}
                className="w-full mt-2 appearance-none bg-gradient-to-r from-background to-secondary/30 text-foreground border-2 border-primary/20 rounded-xl px-5 py-4 pr-12 text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer hover:shadow-lg"
              >
                {(Object.keys(categoryIcons) as Category[]).map((cat) => {
                  if (!cat) return null;
                  const emoji = cat === 'favorites' ? '' : cat === 'trendsNow' ? '' : cat === 'dresses' ? '' : cat === 'pants' ? '' : cat === 'tshirts' ? '' : cat === 'knitwear' ? '' : cat === 'topsBlouses' ? '' : cat === 'vacation' ? '' : cat === 'jumpsuits' ? '' : '';
                  return (
                    <option key={cat} value={cat}>
                      {emoji} {t.categories[cat]}
                    </option>
                  );
                })}
              </select>
              <div className="absolute right-4 top-1/2 translate-y-[-25%] pointer-events-none">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
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
                  {displayedProducts.map((product, index) => {
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
                        onClick={() => openProductDetail(product)}
                      />
                    );
                  })}
                </div>

                {/* Elemento de referencia para infinite scroll */}
                {displayCount < sortedProducts.length && (
                  <div ref={loadMoreRef} className="flex justify-center items-center py-8">
                    <div className="animate-pulse flex items-center gap-2 text-muted-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      <span className="ml-2 text-sm">Cargando más productos...</span>
                    </div>
                  </div>
                )}

                {/* Indicador de productos cargados */}
                {displayCount >= sortedProducts.length && sortedProducts.length > 24 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">✓ Todos los productos cargados ({sortedProducts.length} productos)</p>
                  </div>
                )}
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

      {/* Bot\u00f3n flotante "Scroll to Top" */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-fade-in group"
          aria-label="Volver arriba"
        >
          <ArrowUp size={24} className="group-hover:animate-bounce" />
        </button>
      )}

      {/* Modal de Detalles del Producto */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeProductDetail}
        t={t}
      />
    </div>
  );
};

// Componente ProductCard con carrusel de imágenes
const ProductCard = ({ product, index, t, sortBy, popularityColors, onClick }: {
  product: Product;
  index: number;
  t: any;
  sortBy: string;
  popularityColors: Record<string, string>;
  onClick?: () => void;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  // Filtrar imágenes válidas (no vacías, no null, no undefined)
  const images = useMemo(() => {
    const validImages: string[] = [];

    // Verificar si hay array de imágenes
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && typeof img === 'string' && img.trim() !== '') {
          validImages.push(img);
        }
      });
    }

    // Si no hay imágenes válidas en el array, intentar con la imagen principal
    if (validImages.length === 0 && product.image && typeof product.image === 'string' && product.image.trim() !== '') {
      validImages.push(product.image);
    }

    // Si aún no hay imágenes, usar placeholder
    if (validImages.length === 0) {
      validImages.push("https://placehold.co/400x600?text=No+Image");
    }

    return validImages;
  }, [product.images, product.image]);

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

  // Función para cambiar imagen al hacer click en los dots
  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Función para toggle favorito
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product);
  };

  return (
    <div
      className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
      onClick={onClick}
    >
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

        {/* Botón de Favorito (Estrella) */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all duration-200 group/fav z-10"
          aria-label={isFavorite(product.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <StarIcon
            size={18}
            className={`transition-all duration-200 ${isFavorite(product.id)
              ? 'fill-yellow-400 text-yellow-400 scale-110'
              : 'text-white group-hover/fav:text-yellow-400 group-hover/fav:scale-110'
              }`}
          />
        </button>

        {/* Badge de Popularidad - Movido debajo del botón de favorito */}
        <div className={`absolute top-14 right-2 ${popularityColors[product.popularity]} text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-sm`}>
          {t[product.popularity]}
        </div>

        {/* Indicadores de imagen (dots) - Clickeables */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDotClick(idx);
                }}
                className={`rounded-full transition-all cursor-pointer hover:bg-white ${idx === currentImageIndex
                  ? 'bg-white w-4 h-1.5'
                  : 'bg-white/50 w-1.5 h-1.5 hover:bg-white/75'
                  }`}
                aria-label={`Ver imagen ${idx + 1}`}
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
