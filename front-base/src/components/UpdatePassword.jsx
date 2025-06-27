import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from "lucide-react"; 
import { supabase } from '../supabaseClient'; 

const UpdatePassword = () => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false); 
    const [focusedField, setFocusedField] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setPassword(e.target.value);
        if (error) setError(''); 
        if (message) setMessage('');
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        const { error } = await supabase.auth.updateUser({ password: password });

        if (error) {
            setError('Error al actualizar la contraseña: ' + error.message);
        } else {
            setMessage('¡Tu contraseña ha sido actualizada con éxito! Serás redirigido al inicio de sesión en 3 segundos.');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
        setLoading(false);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #1B1717 0%, #630000 50%, #810100 100%)'
            }}
        >
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10"
                    style={{ backgroundColor: '#EDEDDD' }}
                ></div>
                <div
                    className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-5"
                    style={{ backgroundColor: '#EDEDDD' }}
                ></div>
                <div
                    className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full opacity-30 animate-pulse"
                    style={{ backgroundColor: '#EDEDDD' }}
                ></div>
                <div
                    className="absolute top-3/4 right-1/3 w-1 h-1 rounded-full opacity-40 animate-pulse animation-delay-1000"
                    style={{ backgroundColor: '#EDEDDD' }}
                ></div>
            </div>

            {/* Tarjeta de Crear Nueva Contraseña */}
            <div className="relative z-10 w-full max-w-md">
                <div
                    className="backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white border-opacity-10 opacity-0 animate-slideUp"
                    style={{ backgroundColor: 'rgba(237, 237, 221, 0.95)' }}
                >
                    {/* Encabezado */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300"
                            style={{ backgroundColor: '#1B1717' }}
                        >
                            <Lock size={32} style={{ color: '#EDEDDD' }} />
                        </div>
                        <h1
                            className="text-3xl font-bold mb-2 opacity-0 animate-fadeIn animation-delay-300"
                            style={{ color: '#1B1717' }}
                        >
                            Crear Nueva Contraseña
                        </h1>
                        <p
                            className="text-sm opacity-70 opacity-0 animate-fadeIn animation-delay-500"
                            style={{ color: '#630000' }}
                        >
                            Ingresa tu nueva contraseña para acceder.
                        </p>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        {/* Campo Nueva Contraseña */}
                        <div className="relative opacity-0 animate-slideInLeft animation-delay-700">
                            <label
                                htmlFor="new-password"
                                className="block text-sm font-medium mb-2"
                                style={{ color: '#1B1717' }}
                            >
                                Nueva Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock
                                        size={18}
                                        style={{
                                            color: focusedField === 'password' ? '#810100' : '#630000',
                                            transition: 'color 0.3s ease'
                                        }}
                                    />
                                </div>
                                <input
                                    id="new-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className={`
                                        w-full pl-10 pr-12 py-3 rounded-xl border-2 transition-all duration-300
                                        focus:outline-none focus:ring-0 placeholder-opacity-60
                                        ${focusedField === 'password'
                                            ? 'border-opacity-100 shadow-lg transform scale-105'
                                            : 'border-opacity-30 hover:border-opacity-50'
                                        }
                                    `}
                                    placeholder="Escribe tu nueva contraseña"
                                    value={password}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    style={{
                                        backgroundColor: 'white',
                                        borderColor: '#630000',
                                        color: '#1B1717'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform duration-200"
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} style={{ color: '#630000' }} />
                                    ) : (
                                        <Eye size={18} style={{ color: '#630000' }} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Mensaje de Error */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 opacity-0 animate-shake">
                                <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Mensaje de Éxito */}
                        {message && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 opacity-0 animate-slideInLeft">
                                <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                                <p className="text-green-600 text-sm">{message}</p>
                            </div>
                        )}

                        {/* Botón de Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`
                                w-full py-3 px-4 rounded-xl font-bold text-white
                                transition-all duration-300 transform relative overflow-hidden
                                focus:outline-none focus:ring-4 focus:ring-opacity-50
                                opacity-0 animate-slideUp animation-delay-900
                                ${loading
                                    ? 'cursor-not-allowed'
                                    : 'hover:scale-105 hover:shadow-xl active:scale-95'
                                }
                            `}
                            style={{
                                background: loading
                                    ? 'linear-gradient(135deg, #9CA3AF, #6B7280)'
                                    : 'linear-gradient(135deg, #630000, #810100)',
                                boxShadow: loading
                                    ? 'none'
                                    : '0 10px 30px rgba(129, 1, 0, 0.3)',
                                focusRingColor: '#810100'
                            }}
                        >
                            <div className="flex items-center justify-center gap-2">
                                {loading && (
                                    <Loader2 size={18} className="animate-spin" />
                                )}
                                <span>{loading ? 'Actualizando...' : 'Actualizar Contraseña'}</span>
                            </div>

                            {/* Efecto hover del botón */}
                            {!loading && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transform -skew-x-12 transition-opacity duration-500"></div>
                            )}
                        </button>
                    </form>
                </div>

                {/* Elementos flotantes */}
                <div className="absolute -top-6 -right-6 w-12 h-12 rounded-full opacity-20 animate-float"
                    style={{ backgroundColor: '#EDEDDD' }}
                ></div>
                <div className="absolute -bottom-4 -left-4 w-8 h-8 rounded-full opacity-30 animate-float animation-delay-2000"
                    style={{ backgroundColor: '#EDEDDD' }}
                ></div>
            </div>

            {/* Estilos CSS para las animaciones */}
            <style jsx>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes shake {
                    0%, 100% {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }

                .animate-slideUp {
                    animation: slideUp 0.8s ease-out forwards;
                }

                .animate-slideInLeft {
                    animation: slideInLeft 0.6s ease-out forwards;
                }

                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out forwards;
                }

                .animate-shake {
                    animation: shake 0.5s ease-out forwards;
                }

                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }

                .animation-delay-300 { animation-delay: 300ms; }
                .animation-delay-500 { animation-delay: 500ms; }
                .animation-delay-700 { animation-delay: 700ms; }
                .animation-delay-900 { animation-delay: 900ms; }
                .animation-delay-1000 { animation-delay: 1000ms; }
                .animation-delay-1100 { animation-delay: 1100ms; }
                .animation-delay-1200 { animation-delay: 1200ms; }
                .animation-delay-1300 { animation-delay: 1300ms; }
                .animation-delay-1400 { animation-delay: 1400ms; }
                .animation-delay-2000 { animation-delay: 2000ms; }
            `}</style>
        </div>
    );
};

export default UpdatePassword;