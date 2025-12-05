import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, setDoc, getDoc, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';

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
    bodyType?: 'standard' | 'curvy';
};

export type Category = 'knitwear' | 'topsBlouses' | 'dresses' | 'vacation' | 'pants' | 'jumpsuits' | 'tshirts' | 'leggings' | 'futureModels' | 'trendsNow' | 'favorites' | null;

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
    futureModels: [],
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

    // Escuchar cambios en tiempo real desde Firestore (con soporte para CHUNKS)
    useEffect(() => {
        console.log('🔵 Iniciando listeners de Firestore (modo chunks)...');
        const unsubscribers: (() => void)[] = [];

        const categoriesToListen = [
            'trendsNow', 'knitwear', 'topsBlouses', 'dresses',
            'vacation', 'pants', 'jumpsuits', 'tshirts', 'leggings', 'futureModels'
        ];

        categoriesToListen.forEach((category, index) => {
            // Escuchar la subcolección 'chunks' de cada categoría
            const chunksCollRef = collection(db, 'categories', category, 'chunks');

            // Usamos un delay escalonado para no saturar la red al inicio
            setTimeout(() => {
                const unsubscribe = onSnapshot(chunksCollRef, (snapshot) => {
                    if (!snapshot.empty) {
                        // Reconstruir los datos desde los chunks
                        let allProducts: Product[] = [];
                        // Ordenar por ID del chunk (0, 1, 2...) para mantener orden
                        const sortedDocs = snapshot.docs.sort((a, b) => {
                            const idA = parseInt(a.id);
                            const idB = parseInt(b.id);
                            return idA - idB;
                        });

                        sortedDocs.forEach(doc => {
                            const data = doc.data();
                            if (data.products && Array.isArray(data.products)) {
                                allProducts = [...allProducts, ...data.products];
                            }
                        });

                        const cleanedProducts = cleanProducts(allProducts);
                        console.log(`📥 Datos recibidos (CHUNKS) para ${category}:`, cleanedProducts.length, 'productos');

                        setProductsByCategory(prev => ({
                            ...prev,
                            [category]: cleanedProducts
                        }));
                    } else {
                        // Intentar leer el modo antiguo (documento único) por compatibilidad
                        // o si no hay chunks aún
                        const docRef = doc(db, 'categories', category);
                        getDoc(docRef).then(docSnap => {
                            if (docSnap.exists()) {
                                const data = docSnap.data();
                                const rawProducts = data.products || [];
                                if (rawProducts.length > 0) {
                                    console.log(`⚠️ Leyendo formato LEGACY para ${category}:`, rawProducts.length);
                                    setProductsByCategory(prev => ({
                                        ...prev,
                                        [category]: cleanProducts(rawProducts)
                                    }));
                                }
                            }
                        });
                    }
                }, (error) => {
                    console.error(`❌ Error listening to chunks for ${category}:`, error);
                });
                unsubscribers.push(unsubscribe);
            }, index * 100); // 100ms de delay entre cada listener
        });

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, []);

    const updateCategoryData = async (category: string, newData: Product[]) => {
        try {
            console.log('🔵 Iniciando guardado por CHUNKS en:', category, 'nuevos:', newData.length);

            // 1. Obtener TODOS los chunks actuales para reconstruir el estado actual
            const chunksCollRef = collection(db, 'categories', category, 'chunks');
            const snapshot = await getDocs(chunksCollRef);

            let currentProducts: Product[] = [];

            if (!snapshot.empty) {
                // Reconstruir desde chunks
                const sortedDocs = snapshot.docs.sort((a, b) => parseInt(a.id) - parseInt(b.id));
                sortedDocs.forEach(doc => {
                    const data = doc.data();
                    if (data.products) currentProducts = [...currentProducts, ...data.products];
                });
            } else {
                // Intentar leer legacy si no hay chunks
                const legacyDocRef = doc(db, 'categories', category);
                const legacySnap = await getDoc(legacyDocRef);
                if (legacySnap.exists()) {
                    currentProducts = legacySnap.data().products || [];
                    console.log('⚠️ Leídos datos legacy para migración:', currentProducts.length);
                }
            }

            // 2. Lógica de Merge (Igual que antes)
            const incomingBodyType = newData.length > 0 ? newData[0].bodyType : null;
            let finalProducts: Product[] = [];

            if (incomingBodyType) {
                console.log(`🔄 Merge: Actualizando ${incomingBodyType}...`);
                const productsToKeep = currentProducts.filter(p => p.bodyType !== incomingBodyType);
                console.log(`📦 Preservando ${productsToKeep.length} productos de otras contexturas`);
                finalProducts = [...newData, ...productsToKeep];
            } else {
                finalProducts = newData;
            }

            finalProducts = cleanProducts(finalProducts);
            console.log(`📊 Total final a guardar: ${finalProducts.length} productos`);

            // 3. CHUNKING y Guardado
            const CHUNK_SIZE = 450; // Menos de 500 para seguridad (evitar límite 1MB)
            const totalChunks = Math.ceil(finalProducts.length / CHUNK_SIZE);
            const batch = writeBatch(db);

            console.log(`📦 Dividiendo en ${totalChunks} chunks de ${CHUNK_SIZE} productos...`);

            // Crear/Actualizar chunks
            for (let i = 0; i < totalChunks; i++) {
                const chunkData = finalProducts.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
                const chunkRef = doc(db, 'categories', category, 'chunks', i.toString());
                batch.set(chunkRef, { products: chunkData });
            }

            // Borrar chunks sobrantes (si antes habían 5 y ahora solo 3, borrar 3 y 4)
            if (!snapshot.empty) {
                const existingChunkIds = snapshot.docs.map(d => parseInt(d.id));
                const maxExistingId = Math.max(...existingChunkIds);

                if (maxExistingId >= totalChunks) {
                    for (let i = totalChunks; i <= maxExistingId; i++) {
                        const chunkToDelete = doc(db, 'categories', category, 'chunks', i.toString());
                        batch.delete(chunkToDelete);
                        console.log(`🗑️ Eliminando chunk obsoleto: ${i}`);
                    }
                }
            }

            // También borrar el documento LEGACY principal para evitar confusión
            const legacyDocRef = doc(db, 'categories', category);
            batch.delete(legacyDocRef);

            await batch.commit();

            console.log('✅ Guardado exitoso por CHUNKS');

            setProductsByCategory(prev => ({
                ...prev,
                [category]: finalProducts
            }));

            toast.success(`Datos guardados: ${finalProducts.length} productos en ${totalChunks} paquetes`);
        } catch (error) {
            console.error("❌ Error saving to Firestore:", error);
            toast.error(`Error al guardar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
