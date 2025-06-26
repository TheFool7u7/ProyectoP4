import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const UpdatePassword = () => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Cuando el usuario llega a esta página desde el enlace del correo,
    // Supabase detecta automáticamente el token en la URL y prepara la sesión.
    // Solo se necesita darle al usuario un formulario para que actualice su contraseña.

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        // Este es el comando clave: actualiza la contraseña del usuario actual.
        const { error } = await supabase.auth.updateUser({ password: password });

        if (error) {
            setError('Error al actualizar la contraseña: ' + error.message);
        } else {
            setMessage('¡Tu contraseña ha sido actualizada con éxito! Serás redirigido al inicio de sesión en 3 segundos.');
            // Se redirige al usuario al login para que inicie sesión con su nueva contraseña.
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Crear Nueva Contraseña</h2>
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div>
                        <label htmlFor="new-password">Nueva Contraseña</label>
                        <input
                            id="new-password"
                            type="password"
                            required
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md"
                            placeholder="Escribe tu nueva contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                        >
                            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </button>
                    </div>
                </form>
                {message && <p className="text-center text-sm text-green-600 mt-4">{message}</p>}
                {error && <p className="text-center text-sm text-red-600 mt-4">{error}</p>}
            </div>
        </div>
    );
};

export default UpdatePassword;
