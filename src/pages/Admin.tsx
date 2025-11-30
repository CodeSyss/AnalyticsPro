import { useState } from 'react';
import { Upload, AlertCircle, Filter, ArrowLeft } from 'lucide-react';
import { useData, Category } from '@/context/DataContext';
import { Link } from 'react-router-dom';
import { toast } from "sonner";

// Reutilizamos las traducciones o las definimos aquí simplificadas para Admin
const translations = {
    selectCategory: "Seleccionar Categoría",
    uploadFile: "Cargar desde archivo",
    uploadDesc: "Sube un archivo JSON con datos de productos",
    clickUpload: "Click para subir",
    dragFile: "o arrastra el archivo",
    editManually: "Editar JSON manualmente",
    pasteHere: "O pega aquí tu JSON directamente",
    formatDetected: "Formato detectado automáticamente",
    formatDesc: "La aplicación detecta y transforma automáticamente el formato de datos de Shein.",
    categories: {
        knitwear: "Prendas Tejidas",
        topsBlouses: "Tops y Blusas",
        dresses: "Vestidos",
        vacation: "Ropa de Vacaciones"
    }
};

const Admin = () => {
    const { updateCategoryData, transformSheinData, cleanProducts } = useData();
    const [selectedCategory, setSelectedCategory] = useState<Category>(null);
    const [jsonInput, setJsonInput] = useState('[]');
    const [error, setError] = useState<string | null>(null);

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setJsonInput(value);
        if (!selectedCategory) {
            setError(translations.selectCategory);
            return;
        }
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                if (parsed.length > 0 && parsed[0]["Product Name"]) {
                    const transformed = transformSheinData(parsed);
                    updateCategoryData(selectedCategory, transformed);
                    setError(null);
                } else {
                    const cleaned = cleanProducts(parsed);
                    updateCategoryData(selectedCategory, cleaned);
                    setError(null);
                }
            } else {
                setError("El JSON debe ser un array de productos []");
            }
        } catch (err) {
            setError("Error de sintaxis en JSON: " + (err as Error).message);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!selectedCategory) {
            setError(translations.selectCategory);
            toast.error(translations.selectCategory);
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const parsed = JSON.parse(content);

                if (Array.isArray(parsed)) {
                    if (parsed.length > 0 && parsed[0]["Product Name"]) {
                        const transformed = transformSheinData(parsed);
                        updateCategoryData(selectedCategory, transformed);
                        setJsonInput(JSON.stringify(transformed, null, 2));
                        setError(null);
                    } else {
                        const cleaned = cleanProducts(parsed);
                        updateCategoryData(selectedCategory, cleaned);
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

    return (
        <div className="min-h-screen bg-background font-sans text-foreground p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="p-2 hover:bg-secondary rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold">Panel de Administración</h1>
                </div>

                {/* Selector de Categoría */}
                <div className="mb-6">
                    <div className="bg-card rounded-xl shadow-sm border border-border p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Filter size={18} className="text-muted-foreground" />
                            {translations.selectCategory}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(translations.categories).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedCategory(key as Category)}
                                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${selectedCategory === key
                                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                        : 'border-border hover:border-foreground/20 text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <span className="text-sm font-medium">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="animate-fade-in space-y-4">
                    {!selectedCategory && (
                        <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                            <p className="text-sm text-info font-medium flex items-center gap-2">
                                <AlertCircle size={16} />
                                {translations.selectCategory}
                            </p>
                        </div>
                    )}

                    {/* Sección de carga de archivo */}
                    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-semibold flex items-center gap-2 mb-1">
                                    <Upload size={18} /> {translations.uploadFile}
                                </h3>
                                <p className="text-xs text-muted-foreground">{translations.uploadDesc}</p>
                            </div>
                        </div>
                        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${selectedCategory
                            ? 'border-border hover:border-primary/50 bg-secondary/30 hover:bg-secondary/50'
                            : 'border-border/30 bg-secondary/10 cursor-not-allowed opacity-50'
                            }`}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="mb-1 text-sm font-medium text-foreground">
                                    <span className="text-primary">{translations.clickUpload}</span> {translations.dragFile}
                                </p>
                                <p className="text-xs text-muted-foreground">JSON (MAX. 20MB)</p>
                            </div>
                            <input
                                type="file"
                                accept=".json,application/json"
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={!selectedCategory}
                            />
                        </label>
                    </div>

                    {/* Sección de textarea manual */}
                    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                        <div className="p-4 border-b border-border bg-secondary flex justify-between items-center">
                            <h3 className="font-semibold flex items-center gap-2">
                                {translations.editManually}
                            </h3>
                            <span className="text-xs text-muted-foreground">{translations.pasteHere}</span>
                        </div>
                        <div className="relative">
                            <textarea
                                value={jsonInput}
                                onChange={handleJsonChange}
                                className="w-full h-96 p-4 font-mono text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                spellCheck="false"
                                placeholder={selectedCategory ? `{"id":"...","Product Name":"..."}` : translations.selectCategory}
                                disabled={!selectedCategory}
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
                            {translations.formatDetected}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            {translations.formatDesc}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
