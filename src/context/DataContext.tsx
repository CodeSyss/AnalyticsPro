import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";

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

// Función para calcular popularidad (movida aquí para reutilizar si es necesario)
const calculatePopularity = (rating: number, reviews: number): 'high' | 'medium' | 'low' => {
    const ratingScore = (rating / 5) * 40;
    const reviewScore = Math.min((reviews / 1000) * 60, 60);
    const totalScore = ratingScore + reviewScore;

    if (totalScore >= 70) return 'high';
    if (totalScore >= 40) return 'medium';
    return 'low';
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
    // Inicializar estado desde localStorage si existe
    const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>(() => {
        try {
            const savedData = localStorage.getItem('shein_insights_data');
            return savedData ? JSON.parse(savedData) : DEFAULT_DATA_BY_CATEGORY;
        } catch (error) {
            console.error("Error loading data from localStorage:", error);
            return DEFAULT_DATA_BY_CATEGORY;
        }
    });

    // Guardar en localStorage cada vez que cambie
    useEffect(() => {
        try {
            localStorage.setItem('shein_insights_data', JSON.stringify(productsByCategory));
        } catch (error) {
            console.error("Error saving data to localStorage:", error);
            toast.error("Error al guardar los datos localmente");
        }
    }, [productsByCategory]);

    const updateCategoryData = (category: string, data: Product[]) => {
        setProductsByCategory(prev => ({
            ...prev,
            [category]: data
        }));
        toast.success(`Datos actualizados para la categoría: ${category}`);
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
