import { X, Star as StarIcon, TrendingUp, MessageCircle } from 'lucide-react';
import { Product } from '@/context/DataContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useState, useEffect } from 'react';

interface ProductDetailModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    t: any;
}

const ProductDetailModal = ({ product, isOpen, onClose, t }: ProductDetailModalProps) => {
    const { isFavorite, toggleFavorite } = useFavorites();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Reset image index when product changes
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [product]);

    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !product) return null;

    const images = product.images && product.images.length > 0
        ? product.images
        : product.image
            ? [product.image]
            : ["https://placehold.co/600x800?text=No+Image"];

    const popularityColors = {
        high: 'bg-fashion-green text-white',
        medium: 'bg-fashion-orange text-white',
        low: 'bg-muted text-muted-foreground'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all"
                    aria-label="Cerrar"
                >
                    <X size={24} className="text-white" />
                </button>

                <div className="grid md:grid-cols-2 gap-6 p-6">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted">
                            <img
                                src={images[currentImageIndex]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />

                            {/* Favorite Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(product);
                                }}
                                className="absolute top-4 left-4 p-3 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all group/fav"
                            >
                                <StarIcon
                                    size={24}
                                    className={`transition-all ${isFavorite(product.id)
                                            ? 'fill-yellow-400 text-yellow-400 scale-110'
                                            : 'text-white group-hover/fav:text-yellow-400 group-hover/fav:scale-110'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Thumbnail Gallery */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${idx === currentImageIndex
                                                ? 'border-primary scale-105'
                                                : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`${product.name} - ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Category */}
                        <div className="text-sm text-muted-foreground uppercase tracking-wide">
                            {product.category || 'General'}
                        </div>

                        {/* Product Name */}
                        <h2 className="text-3xl font-bold text-foreground leading-tight">
                            {product.name}
                        </h2>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-bold text-primary">
                                ${product.price}
                            </span>
                            {product.original_price && product.original_price > product.price && (
                                <>
                                    <span className="text-xl text-muted-foreground line-through">
                                        ${product.original_price}
                                    </span>
                                    <span className="px-2 py-1 bg-fashion-green text-white text-sm font-bold rounded">
                                        {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Rating & Reviews */}
                        <div className="flex items-center gap-4 pb-4 border-b border-border">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        size={20}
                                        className={`${i < Math.floor(product.rating)
                                                ? 'text-fashion-gold fill-fashion-gold'
                                                : 'text-muted-foreground/30'
                                            }`}
                                    />
                                ))}
                                <span className="ml-2 text-lg font-semibold">{product.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <MessageCircle size={18} />
                                <span>{product.reviewsDisplay} {t.reviews}</span>
                            </div>
                        </div>

                        {/* Popularity Badge */}
                        <div className="flex items-center gap-3">
                            <TrendingUp size={20} className="text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{t.popularity}:</span>
                            <span className={`${popularityColors[product.popularity]} px-3 py-1 rounded-full text-sm font-bold uppercase`}>
                                {t[product.popularity]}
                            </span>
                        </div>

                        {/* Additional Info */}
                        <div className="bg-secondary rounded-lg p-4 space-y-2">
                            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                Información del Producto
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Categoría:</span>
                                    <span className="ml-2 font-medium">{product.category || 'General'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">ID:</span>
                                    <span className="ml-2 font-mono text-xs">{product.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;
