import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';

// Tipos
export type Product = {
    id: string;
    name: string;
    price: number;
    original_price?: number;
    rating: number;
    reviews: number;
    reviewsDisplay: string;
    popularity: 'high' | 'medium' | 'low';
    image?: string | null;
    images?: string[];
    category?: string;
};

export type Category = 'knitwear' | 'topsBlouses' | 'dresses' | 'vacation' | 'pants' | 'jumpsuits' | 'tshirts' | 'leggings' | 'trendsNow' | null;

type DataContextType = {
    productsByCategory: Record<string, Product[]>;
    updateCategoryData: (category: string, data: Product[]) => void;
    transformSheinData: (sheinData: any[]) => Product[];
    cleanProducts: (products: Product[]) => Product[];
};

const DataContext = createContext<DataContextType | undefined>(undefined);

// Datos por defecto
const DEFAULT_DATA_BY_CATEGORY: Record<string, Product[]> = {
    knitwear: [],
    topsBlouses: [],
    dresses: [],
    vacation: [],
    pants: [],
    jumpsuits: [],
    tshirts: [],
    leggings: [],
    trendsNow: [] // Categoría especial para admin
};

// Función para calcular popularidad
const calculatePopularity = (rating: number, reviews: number): 'high' | 'medium' | 'low' => {
    const ratingScore = (rating / 5) * 40;
    const reviewScore = Math.min((reviews / 1000) * 60, 60);
    const totalScore = ratingScore + reviewScore;

    if (totalScore >= 70) return 'high';
    if (totalScore >= 40) return 'medium';
    return 'low';
};

// Palabras clave para excluir productos que no son ropa
const EXCLUDED_KEYWORDS = [
    'pegamento', 'glue',
    'colchón', 'mattress',
    'pestañas', 'lash',
    'figura', 'figure', 'toy',
    'uñas', 'nail',
    'adhesivo', 'adhesive',
    'maquillaje', 'makeup',
    'funda', 'case', 'cover',
    'cable', 'charger',
    'audífonos', 'headphone', 'earphone', 'botas', 'cabello ', 'juego', 'riñonera', 'desinfectante',
    'calcetines', 'manta',

];

// Función para limpiar productos (validación y deduplicación)
const cleanProducts = (products: Product[]): Product[] => {
    const seen = new Set();
    return products.filter(product => {
        // 1. Validaciones básicas
        const isValid =
            product.name &&
            product.name !== "Sin nombre" &&
            product.price > 0 &&
            product.image;

        if (!isValid) return false;

        // 2. Filtrado por palabras clave excluidas
        const lowerName = product.name.toLowerCase();
        const hasExcludedKeyword = EXCLUDED_KEYWORDS.some(keyword =>
            lowerName.includes(keyword.toLowerCase())
        );

        if (hasExcludedKeyword) return false;

        // 3. Deduplicación
        // Usamos el ID si parece real (no generado por Math.random que empieza con 0.)
        // O el nombre como fallback para evitar duplicados visuales
        const uniqueKey = (product.id && !product.id.startsWith('0.'))
            ? product.id
            : product.name;

        if (seen.has(uniqueKey)) return false;
        seen.add(uniqueKey);

        return true;
    });
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>(DEFAULT_DATA_BY_CATEGORY);

    // Escuchar cambios en tiempo real desde Firestore
    useEffect(() => {
        console.log('🔵 Iniciando listeners de Firestore...');
        const unsubscribers: (() => void)[] = [];

        // Cargar trendsNow primero (prioridad)
        const trendsNowRef = doc(db, 'categories', 'trendsNow');
        const trendsNowUnsubscribe = onSnapshot(trendsNowRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const rawProducts = data.products || [];
                const cleanedProducts = cleanProducts(rawProducts);
                console.log(`📥 Datos recibidos de Firestore para trendsNow:`, cleanedProducts.length, 'productos (limpios)');
                setProductsByCategory(prev => ({
                    ...prev,
                    trendsNow: cleanedProducts
                }));
            } else {
                console.log(`⚠️ Documento trendsNow no existe en Firestore`);
            }
        }, (error) => {
            console.error(`❌ Error listening to trendsNow:`, error);
        });
        unsubscribers.push(trendsNowUnsubscribe);

        // Cargar las demás categorías después con un pequeño delay
        const otherCategories = ['knitwear', 'topsBlouses', 'dresses', 'vacation', 'pants', 'jumpsuits', 'tshirts', 'leggings'];
        setTimeout(() => {
            otherCategories.forEach(category => {
                const docRef = doc(db, 'categories', category);
                const unsubscribe = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const rawProducts = data.products || [];
                        const cleanedProducts = cleanProducts(rawProducts);
                        console.log(`📥 Datos recibidos de Firestore para ${category}:`, cleanedProducts.length, 'productos (limpios)');
                        setProductsByCategory(prev => ({
                            ...prev,
                            [category]: cleanedProducts
                        }));
                    } else {
                        console.log(`⚠️ Documento ${category} no existe en Firestore`);
                    }
                }, (error) => {
                    console.error(`❌ Error listening to ${category}:`, error);
                });
                unsubscribers.push(unsubscribe);
            });
        }, 500); // Delay de 500ms para cargar las otras categorías

        // Cleanup: desuscribirse cuando el componente se desmonte
        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, []);

    const updateCategoryData = async (category: string, data: Product[]) => {
        try {
            console.log('🔵 Guardando en Firestore:', category, 'productos:', data.length);

            // Guardar en Firestore
            const docRef = doc(db, 'categories', category);
            await setDoc(docRef, { products: data });

            console.log('✅ Guardado exitoso en Firestore');

            // Actualizar estado local inmediatamente (el listener también lo hará)
            setProductsByCategory(prev => ({
                ...prev,
                [category]: data
            }));

            toast.success(`Datos sincronizados en la nube para: ${category}`);
        } catch (error) {
            console.error("❌ Error saving to Firestore:", error);
            toast.error(`Error al guardar en la nube: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    };

    const transformSheinData = (sheinData: any[]): Product[] => {
        const rawProducts = sheinData
            .filter(item => item.id && item.id !== "Free Version is limited to 25 rows, upgrade to see the 95 other rows")
            .map(item => {
                const parsePrice = (priceStr: string): number => {
                    if (!priceStr || priceStr === "Not Available") return 0;
                    return parseFloat(priceStr.replace('$', '').replace(',', '')) || 0;
                };

                const parseCommentCount = (countStr: string): number => {
                    if (!countStr || countStr === "Not Available") return 0;
                    const cleanStr = countStr.replace(/\+/g, '').replace(',', '');
                    return parseInt(cleanStr) || 0;
                };

                const parseRating = (ratingStr: string): number => {
                    if (!ratingStr || ratingStr === "Not Available" || ratingStr === "0") return 0;
                    return parseFloat(ratingStr) || 0;
                };

                const reviews = parseCommentCount(item["Comment Count"]);
                const rating = parseRating(item["Average Rating"]);
                const popularity = calculatePopularity(rating, reviews);

                // Formato de display para reviews (manteniendo el + si existe)
                const reviewsDisplay = item["Comment Count"] && item["Comment Count"] !== "Not Available"
                    ? item["Comment Count"]
                    : "0";

                // Extraer todas las imágenes disponibles
                const images: string[] = [];
                if (item["Main Image"]) images.push(item["Main Image"]);

                // Buscar Detail Image X
                Object.keys(item).forEach(key => {
                    if (key.startsWith("Detail Image") && item[key]) {
                        images.push(item[key]);
                    }
                });

                return {
                    id: item.id || item["Product Code"] || Math.random().toString(),
                    name: item["Product Name"] || "Sin nombre",
                    price: parsePrice(item["Sale Price"]),
                    original_price: parsePrice(item["Retail Price"]),
                    rating: rating,
                    reviews: reviews,
                    reviewsDisplay: reviewsDisplay,
                    popularity: popularity,
                    image: item["Main Image"] || item["Detail Image 1"] || null,
                    images: images,
                    category: item["Category Name"] || "General"
                };
            });

        return cleanProducts(rawProducts);
    };

    return (
        <DataContext.Provider value={{ productsByCategory, updateCategoryData, transformSheinData, cleanProducts }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
