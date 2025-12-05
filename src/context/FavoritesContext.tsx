import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from './DataContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';

type FavoritesContextType = {
    favorites: Product[];
    addFavorite: (product: Product) => void;
    removeFavorite: (productId: string) => void;
    isFavorite: (productId: string) => boolean;
    toggleFavorite: (product: Product) => void;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const [favorites, setFavorites] = useState<Product[]>([]);

    // Escuchar cambios en tiempo real desde Firestore
    useEffect(() => {
        const docRef = doc(db, 'user_data', 'favorites');
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setFavorites(data.products || []);
                console.log('📥 Favoritos cargados desde Firebase:', data.products?.length || 0);
            } else {
                console.log('⚠️ No hay favoritos guardados');
                setFavorites([]);
            }
        }, (error) => {
            console.error('❌ Error listening to favorites:', error);
        });

        return () => unsubscribe();
    }, []);

    // Guardar favoritos en Firebase
    const saveFavorites = async (newFavorites: Product[]) => {
        try {
            const docRef = doc(db, 'user_data', 'favorites');
            await setDoc(docRef, { products: newFavorites });
            console.log('✅ Favoritos guardados en Firebase');
        } catch (error) {
            console.error('❌ Error saving favorites:', error);
            toast.error('Error al guardar favoritos');
        }
    };

    const addFavorite = (product: Product) => {
        const newFavorites = [...favorites, product];
        setFavorites(newFavorites);
        saveFavorites(newFavorites);
        toast.success(`⭐ ${product.name} agregado a favoritos`);
    };

    const removeFavorite = (productId: string) => {
        const newFavorites = favorites.filter(p => p.id !== productId);
        setFavorites(newFavorites);
        saveFavorites(newFavorites);
        toast.info('Producto removido de favoritos');
    };

    const isFavorite = (productId: string) => {
        return favorites.some(p => p.id === productId);
    };

    const toggleFavorite = (product: Product) => {
        if (isFavorite(product.id)) {
            removeFavorite(product.id);
        } else {
            addFavorite(product);
        }
    };

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};
