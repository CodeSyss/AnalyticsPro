import { useState, useMemo } from 'react';
import { Star, TrendingUp, MessageCircle, DollarSign, Upload, Filter, ShoppingBag, Award, BarChart3, AlertCircle } from 'lucide-react';

// Datos de ejemplo estilo Shein para la carga inicial
const DEFAULT_DATA = [
  {
    "id": "sh001",
    "name": "Vestido Floral con Hombros Descubiertos",
    "price": 12.99,
    "original_price": 18.00,
    "rating": 4.8,
    "reviews": 1240,
    "sold": 5400,
    "image": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    "category": "Vestidos"
  },
  {
    "id": "sh002",
    "name": "Top Corto de Canalé Básico",
    "price": 5.50,
    "original_price": 8.00,
    "rating": 4.5,
    "reviews": 850,
    "sold": 3200,
    "image": "https://images.unsplash.com/photo-1521577306547-80f7546e627b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    "category": "Tops"
  },
  {
    "id": "sh003",
    "name": "Jeans de Talle Alto Desgarro",
    "price": 22.00,
    "original_price": 25.00,
    "rating": 4.2,
    "reviews": 3100,
    "sold": 8900,
    "image": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    "category": "Denim"
  },
  {
    "id": "sh004",
    "name": "Blusa Satinada Elegante Oficina",
    "price": 14.99,
    "original_price": 19.99,
    "rating": 4.9,
    "reviews": 420,
    "sold": 1200,
    "image": "https://images.unsplash.com/photo-1551163943-3f6a29e39426?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    "category": "Blusas"
  },
  {
    "id": "sh005",
    "name": "Conjunto Deportivo Dos Piezas",
    "price": 18.50,
    "original_price": 22.00,
    "rating": 3.8,
    "reviews": 150,
    "sold": 800,
    "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    "category": "Deportivo"
  },
  {
    "id": "sh006",
    "name": "Chaqueta Bomber Oversize",
    "price": 28.99,
    "original_price": 35.00,
    "rating": 4.7,
    "reviews": 5600,
    "sold": 12500,
    "image": "https://images.unsplash.com/photo-1551488852-d814c9e88d5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    "category": "Abrigos"
  }
];

// Componente para mostrar estrellas
const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          className={`${
            i < Math.floor(rating) ? 'text-fashion-gold fill-fashion-gold' : 'text-muted-foreground/30'
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

type Product = {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  rating: number;
  reviews: number;
  sold: number;
  image?: string;
  category?: string;
};

const Index = () => {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(DEFAULT_DATA, null, 2));
  const [products, setProducts] = useState<Product[]>(DEFAULT_DATA);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'editor'>('dashboard');
  const [sortBy, setSortBy] = useState<'sold' | 'reviews' | 'rating' | 'priceAsc' | 'priceDesc'>('sold');

  // Función para transformar datos de Shein al formato interno
  const transformSheinData = (sheinData: any[]): Product[] => {
    return sheinData
      .filter(item => item.id && item.id !== "Free Version is limited to 25 rows, upgrade to see the 95 other rows")
      .map(item => {
        // Parsear precio (eliminar $ y convertir a número)
        const parsePrice = (priceStr: string): number => {
          if (!priceStr || priceStr === "Not Available") return 0;
          return parseFloat(priceStr.replace('$', '').replace(',', '')) || 0;
        };

        // Parsear conteo de comentarios (manejar "1000+", "100+", etc.)
        const parseCommentCount = (countStr: string): number => {
          if (!countStr || countStr === "Not Available") return 0;
          const cleanStr = countStr.replace(/\+/g, '').replace(',', '');
          return parseInt(cleanStr) || 0;
        };

        // Parsear rating
        const parseRating = (ratingStr: string): number => {
          if (!ratingStr || ratingStr === "Not Available" || ratingStr === "0") return 0;
          return parseFloat(ratingStr) || 0;
        };

        // Calcular sold basado en comentarios (estimación)
        const reviews = parseCommentCount(item["Comment Count"]);
        const estimatedSold = Math.round(reviews * 5); // Estimación: 5 ventas por review

        return {
          id: item.id || item["Product Code"] || Math.random().toString(),
          name: item["Product Name"] || "Sin nombre",
          price: parsePrice(item["Sale Price"]),
          original_price: parsePrice(item["Retail Price"]),
          rating: parseRating(item["Average Rating"]),
          reviews: reviews,
          sold: estimatedSold,
          image: item["Main Image"] || item["Detail Image 1"] || undefined,
          category: item["Category Name"] || "General"
        };
      });
  };

  // Manejar cambio en el textarea
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonInput(value);
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        // Detectar si es formato Shein y transformar
        if (parsed.length > 0 && parsed[0]["Product Name"]) {
          const transformed = transformSheinData(parsed);
          setProducts(transformed);
          setError(null);
        } else {
          setProducts(parsed);
          setError(null);
        }
      } else {
        setError("El JSON debe ser un array de productos []");
      }
    } catch (err) {
      setError("Error de sintaxis en JSON: " + (err as Error).message);
    }
  };

  // Manejar carga de archivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        if (Array.isArray(parsed)) {
          // Detectar y transformar formato Shein
          if (parsed.length > 0 && parsed[0]["Product Name"]) {
            const transformed = transformSheinData(parsed);
            setProducts(transformed);
            setJsonInput(JSON.stringify(transformed, null, 2));
            setError(null);
          } else {
            setProducts(parsed);
            setJsonInput(content);
            setError(null);
          }
        } else {
          setError("El archivo debe contener un array de productos");
        }
      } catch (err) {
        setError("Error al leer el archivo: " + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  // Lógica de ordenamiento y análisis
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case 'sold':
        return sorted.sort((a, b) => b.sold - a.sold);
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
    
    const totalSales = products.reduce((acc, curr) => acc + (curr.sold || 0), 0);
    const totalReviews = products.reduce((acc, curr) => acc + (curr.reviews || 0), 0);
    const avgPrice = products.reduce((acc, curr) => acc + curr.price, 0) / products.length;
    const topSeller = [...products].sort((a, b) => b.sold - a.sold)[0];

    return { totalSales, totalReviews, avgPrice, topSeller };
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
              Shein<span className="font-light text-muted-foreground">Analytics Pro</span>
            </h1>
          </div>
          <div className="flex gap-2 text-sm">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-full transition-all font-medium ${
                activeTab === 'dashboard' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 rounded-full transition-all font-medium ${
                activeTab === 'editor' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              Editor JSON
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Vista Editor de JSON */}
        {activeTab === 'editor' && (
          <div className="animate-fade-in space-y-4">
            {/* Sección de carga de archivo */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-1">
                    <Upload size={18} /> Cargar desde archivo
                  </h3>
                  <p className="text-xs text-muted-foreground">Sube un archivo JSON con datos de productos de Shein</p>
                </div>
              </div>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30 hover:bg-secondary/50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="mb-1 text-sm font-medium text-foreground">
                    <span className="text-primary">Click para subir</span> o arrastra el archivo
                  </p>
                  <p className="text-xs text-muted-foreground">JSON (MAX. 20MB)</p>
                </div>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Sección de textarea manual */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="p-4 border-b border-border bg-secondary flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2">
                  Editar JSON manualmente
                </h3>
                <span className="text-xs text-muted-foreground">O pega aquí tu JSON directamente</span>
              </div>
              <div className="relative">
                <textarea
                  value={jsonInput}
                  onChange={handleJsonChange}
                  className="w-full h-96 p-4 font-mono text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  spellCheck="false"
                  placeholder='Pega tu JSON aquí... Formato aceptado: datos de Shein o formato estándar'
                />
                {error && (
                  <div className="absolute bottom-4 left-4 right-4 bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-destructive/20">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}
              </div>
            </div>

            {/* Información sobre el formato */}
            <div className="bg-info/10 border border-info/20 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertCircle size={16} className="text-info" />
                Formato detectado automáticamente
              </h4>
              <p className="text-xs text-muted-foreground">
                La aplicación detecta y transforma automáticamente el formato de datos de Shein. 
                Solo sube el archivo o pega el JSON y los datos se convertirán al formato correcto.
              </p>
            </div>
          </div>
        )}

        {/* Vista Dashboard */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Sección de Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard 
                title="Ventas Totales Est."
                value={stats.totalSales.toLocaleString()}
                subtext="Unidades vendidas (Dataset)"
                icon={ShoppingBag}
                color="bg-fashion-blue"
              />
              <StatCard 
                title="Total Reviews"
                value={stats.totalReviews.toLocaleString()}
                subtext="Interacciones de usuarios"
                icon={MessageCircle}
                color="bg-fashion-purple"
              />
              <StatCard 
                title="Precio Promedio"
                value={`$${stats.avgPrice.toFixed(2)}`}
                subtext="Por unidad"
                icon={DollarSign}
                color="bg-fashion-green"
              />
              <StatCard 
                title="Top Seller"
                value={stats.topSeller?.name.substring(0, 15) + "..."}
                subtext={`${stats.topSeller?.sold} vendidos`}
                icon={Award}
                color="bg-fashion-orange"
              />
            </div>

            {/* Barra de Herramientas / Filtros */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-4 rounded-xl shadow-sm border border-border">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-muted-foreground" />
                <span className="font-semibold text-foreground">Ordenar productos por:</span>
              </div>
              <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                <button 
                  onClick={() => setSortBy('sold')}
                  className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-all border font-medium ${
                    sortBy === 'sold' 
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                      : 'bg-card text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground'
                  }`}
                >
                  Más Vendidos
                </button>
                <button 
                  onClick={() => setSortBy('reviews')}
                  className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-all border font-medium ${
                    sortBy === 'reviews' 
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                      : 'bg-card text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground'
                  }`}
                >
                  Más Comentados
                </button>
                <button 
                  onClick={() => setSortBy('rating')}
                  className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-all border font-medium ${
                    sortBy === 'rating' 
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                      : 'bg-card text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground'
                  }`}
                >
                  Mejor Calificación
                </button>
                <button 
                  onClick={() => setSortBy('priceAsc')}
                  className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-all border font-medium ${
                    sortBy === 'priceAsc' 
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                      : 'bg-card text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground'
                  }`}
                >
                  Precio: Bajo a Alto
                </button>
              </div>
            </div>

            {/* Grilla de Productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product, index) => (
                <div key={product.id || index} className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
                  {/* Imagen y Badges */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    <img 
                      src={product.image || "https://placehold.co/400x600?text=No+Image"} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Badge de Ranking según el filtro actual */}
                    <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                      #{index + 1}
                    </div>

                    {/* Badge Condicional */}
                    {product.sold > 5000 && (
                      <div className="absolute bottom-2 left-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        Hot Sale
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
                          <TrendingUp size={12} className={sortBy === 'sold' ? 'text-fashion-blue' : ''} />
                          <span className={sortBy === 'sold' ? 'font-bold text-foreground' : ''}>{product.sold?.toLocaleString()} vendidos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle size={12} className={sortBy === 'reviews' ? 'text-fashion-blue' : ''} />
                          <span className={sortBy === 'reviews' ? 'font-bold text-foreground' : ''}>{product.reviews?.toLocaleString()} reviews</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {sortedProducts.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                <p>No hay productos para mostrar. Revisa tu JSON.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
