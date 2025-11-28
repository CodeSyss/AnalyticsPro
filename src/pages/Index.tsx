import { useState, useMemo } from 'react';
import { Star, TrendingUp, MessageCircle, DollarSign, Filter, ShoppingBag, Award, BarChart3, Shirt, Wind, PartyPopper, Sparkles } from 'lucide-react';
import { useData, Category, Product } from '@/context/DataContext';

// Sistema de idiomas
const translations = {
  es: {
    title: "Analytics Pro",
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
    reviews: "reviews",
    noProducts: "No hay productos para mostrar. Carga datos en el panel de administración.",
    selectCategory: "Seleccionar Categoría",
    popularity: "Popularidad",
    high: "Alta",
    medium: "Media",
    low: "Baja",
    categories: {
      knitwear: "Prendas Tejidas",
      topsBlouses: "Tops y Blusas",
      dresses: "Vestidos",
      vacation: "Ropa de Vacaciones"
    }
  },
  en: {
    title: "Analytics Pro",
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
    reviews: "reviews",
    noProducts: "No products to show. Upload data in the admin panel.",
    selectCategory: "Select Category",
    popularity: "Popularity",
    high: "High",
    medium: "Medium",
    low: "Low",
    categories: {
      knitwear: "Knitwear",
      topsBlouses: "Tops & Blouses",
      dresses: "Dresses",
      vacation: "Vacation Wear"
    }
  },
  zh: {
    title: "分析专业版",
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
    reviews: "评论",
    noProducts: "没有产品显示。请在管理面板上传数据。",
    selectCategory: "选择类别",
    popularity: "热度",
    high: "高",
    medium: "中",
    low: "低",
    categories: {
      knitwear: "针织服装",
      topsBlouses: "上衣和衬衫",
      dresses: "连衣裙",
      vacation: "度假装"
    }
  }
};

type Language = 'es' | 'en' | 'zh';

// Iconos por categoría
const categoryIcons = {
  knitwear: Shirt,
  topsBlouses: Wind,
  dresses: Sparkles,
  vacation: PartyPopper
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
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);
  const [sortBy, setSortBy] = useState<'popularity' | 'reviews' | 'rating' | 'priceAsc' | 'priceDesc'>('popularity');

  const t = translations[language];
  const products = selectedCategory ? productsByCategory[selectedCategory] || [] : [];

  // Lógica de ordenamiento y análisis
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    const popularityOrder = { high: 3, medium: 2, low: 1 };

    switch (sortBy) {
      case 'popularity':
        return sorted.sort((a, b) => popularityOrder[b.popularity] - popularityOrder[a.popularity]);
      case 'reviews':
        return sorted.sort((a, b) => b.reviews - a.reviews);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'priceAsc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'priceDesc':
        return sorted.sort((a, b) => b.price - a.price);
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
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <BarChart3 size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Shein<span className="font-light text-muted-foreground">{t.title}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Selector de Idioma */}
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setLanguage('es')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${language === 'es'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
                title="Español"
              >
                🇪🇸 ES
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${language === 'en'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
                title="English"
              >
                🇺🇸 US
              </button>
              <button
                onClick={() => setLanguage('zh')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${language === 'zh'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
                title="中文"
              >
                🇨🇳 CN
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Selector de Categoría */}
        <div className="mb-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Filter size={18} className="text-muted-foreground" />
              {t.selectCategory}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

        {/* Vista Dashboard */}
        {!selectedCategory && (
          <div className="text-center py-20 text-muted-foreground animate-fade-in">
            <Filter size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">{t.selectCategory}</p>
          </div>
        )}

        {selectedCategory && stats && (
          <div className="space-y-8 animate-fade-in">

            {/* Sección de Estadísticas */}
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

            {/* Barra de Herramientas / Filtros */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-4 rounded-xl shadow-sm border border-border">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-muted-foreground" />
                <span className="font-semibold text-foreground">{t.sortBy}</span>
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
                  <div key={product.id || index} className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
                    {/* Imagen y Badges */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                      <img
                        src={product.image || "https://placehold.co/400x600?text=No+Image"}
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
                            <span className={sortBy === 'reviews' ? 'font-bold text-foreground' : ''}>{product.reviews?.toLocaleString()} {t.reviews}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {sortedProducts.length === 0 && (
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

export default Index;
