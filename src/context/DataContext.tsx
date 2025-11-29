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
    popularity: 'high' | 'medium' | 'low';
    image?: string;
    category?: string;
};

export type Category = 'knitwear' | 'topsBlouses' | 'dresses' | 'vacation' | null;

type DataContextType = {
    productsByCategory: Record<string, Product[]>;
    updateCategoryData: (category: string, data: Product[]) => void;
    transformSheinData: (sheinData: any[]) => Product[];
};

const DataContext = createContext<DataContextType | undefined>(undefined);

// Datos por defecto
const DEFAULT_DATA_BY_CATEGORY: Record<string, Product[]> = {
    knitwear: [],
    topsBlouses: [],
    dresses: [],
    vacation: []
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

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>(DEFAULT_DATA_BY_CATEGORY);

    // Escuchar cambios en tiempo real desde Firestore
    useEffect(() => {
        console.log('🔵 Iniciando listeners de Firestore...');
        const categories = ['knitwear', 'topsBlouses', 'dresses', 'vacation'];
        const unsubscribers: (() => void)[] = [];

        categories.forEach(category => {
            const docRef = doc(db, 'categories', category);

            const unsubscribe = onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    console.log(`📥 Datos recibidos de Firestore para ${category}:`, data.products?.length || 0, 'productos');
                    setProductsByCategory(prev => ({
                        ...prev,
                        [category]: data.products || []
                    }));
                } else {
                    console.log(`⚠️ Documento ${category} no existe en Firestore`);
                }
            }, (error) => {
                console.error(`❌ Error listening to ${category}:`, error);
            });

            unsubscribers.push(unsubscribe);
        });

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
            toast.error("Error al guardar en la nube. Intenta de nuevo.");
        }
    };

    const transformSheinData = (sheinData: any[]): Product[] => {
        return sheinData
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

                return {
                    id: item.id || item["Product Code"] || Math.random().toString(),
                    name: item["Product Name"] || "Sin nombre",
                    price: parsePrice(item["Sale Price"]),
                    original_price: parsePrice(item["Retail Price"]),
                    rating: rating,
                    reviews: reviews,
                    popularity: popularity,
                    image: item["Main Image"] || item["Detail Image 1"] || undefined,
                    category: item["Category Name"] || "General"
                };
            });
    };

    return (
        <DataContext.Provider value={{ productsByCategory, updateCategoryData, transformSheinData }}>
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
