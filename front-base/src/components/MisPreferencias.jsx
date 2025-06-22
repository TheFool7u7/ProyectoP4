import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';

const MisPreferencias = () => {
    const { user } = useAuth(); // Se obtiene el usuario logueado del contexto
    const [allAreas, setAllAreas] = useState([]);
    const [selectedAreas, setSelectedAreas] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL;

    // Se usa useCallback para memorizar la función y evitar re-renders innecesarios
    const fetchPreferences = useCallback(async () => {
        if (!user?.id) return; // Si no hay ID de usuario, no se hace nada

        setLoading(true);
        try {
            // Se hace las dos llamadas a la API en paralelo para más eficiencia
            const [areasRes, prefsRes] = await Promise.all([
                fetch(`${API_URL}/api/areas`),
                fetch(`${API_URL}/api/preferencias/${user.id}`)
            ]);

            if (!areasRes.ok || !prefsRes.ok) throw new Error('Error al cargar los datos');

            const areasData = await areasRes.json();
            const prefsData = await prefsRes.json();

            setAllAreas(areasData);
            setSelectedAreas(new Set(prefsData)); // Se inicializa el Set con los IDs guardados
        } catch (error) {
            console.error(error);
            alert('No se pudieron cargar tus preferencias.');
        } finally {
            setLoading(false);
        }
    }, [user?.id, API_URL]);

    useEffect(() => {
        fetchPreferences();
    }, [fetchPreferences]);

    const handleCheckboxChange = (areaId) => {
        setSelectedAreas(prevSelected => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(areaId)) {
                newSelected.delete(areaId);
            } else {
                newSelected.add(areaId);
            }
            return newSelected;
        });
    };

    const handleSubmit = async () => {
        if (!user?.id) return;
        try {
            const response = await fetch(`${API_URL}/api/preferencias/${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preferenceIds: Array.from(selectedAreas) })
            });
            if (!response.ok) throw new Error('Error al guardar');
            alert('¡Preferencias guardadas con éxito!');
        } catch (error) {
            alert('No se pudieron guardar tus preferencias.');
        }
    };

    if (loading) return <p>Cargando tus preferencias...</p>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-1 text-gray-800">Hola, {user?.nombre_completo}</h1>
            <p className="text-gray-600 mb-6">Selecciona las áreas de tu interés para recibir notificaciones sobre nuevos talleres.</p>
            <div className="space-y-3">
                {allAreas.map(area => (
                    <label key={area.id} className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <input
                            type="checkbox"
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedAreas.has(area.id)}
                            onChange={() => handleCheckboxChange(area.id)}
                        />
                        <span className="ml-3 text-sm font-medium text-gray-800">{area.nombre_area}</span>
                    </label>
                ))}
            </div>
            <div className="text-right mt-6">
                <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
                    Guardar Preferencias
                </button>
            </div>
        </div>
    );
};

export default MisPreferencias;