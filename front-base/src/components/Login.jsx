import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"; 

const Login = () => {
    const navigate = useNavigate();
    const { signIn } = useAuth();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null); // Nuevo estado para el foco en campos

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null); // Limpiar error al escribir
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error } = await signIn(formData);
            if (error) throw error;
            navigate("/home"); // Redirige al inicio tras el login
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
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

            {/* Contenedor del formulario de Login */}
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
                            <GraduationCap size={32} style={{ color: '#EDEDDD' }} />
                        </div>
                        <h1
                            className="text-3xl font-bold mb-2 opacity-0 animate-fadeIn animation-delay-300"
                            style={{ color: '#1B1717' }}
                        >
                            Iniciar sesión
                        </h1>
                        <p
                            className="text-sm opacity-70 opacity-0 animate-fadeIn animation-delay-500"
                            style={{ color: '#630000' }}
                        >
                            Inicia sesión en tu cuenta
                        </p>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Campo de Correo Electrónico */}
                        <div className="relative opacity-0 animate-slideInLeft animation-delay-700">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail
                                        size={18}
                                        style={{
                                            color: focusedField === 'email' ? '#810100' : '#630000',
                                            transition: 'color 0.3s ease'
                                        }}
                                    />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Correo Electrónico"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    className={`
                                        w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300
                                        focus:outline-none focus:ring-0 placeholder-opacity-60
                                        ${focusedField === 'email'
                                            ? 'border-opacity-100 shadow-lg transform scale-105'
                                            : 'border-opacity-30 hover:border-opacity-50'
                                        }
                                    `}
                                    style={{
                                        backgroundColor: 'white',
                                        borderColor: '#630000',
                                        color: '#1B1717'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Campo de Contraseña */}
                        <div className="relative opacity-0 animate-slideInLeft animation-delay-900">
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
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Contraseña"
                                    autoComplete="current-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    className={`
                                        w-full pl-10 pr-12 py-3 rounded-xl border-2 transition-all duration-300
                                        focus:outline-none focus:ring-0 placeholder-opacity-60
                                        ${focusedField === 'password'
                                            ? 'border-opacity-100 shadow-lg transform scale-105'
                                            : 'border-opacity-30 hover:border-opacity-50'
                                        }
                                    `}
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

                        {/* Botón de Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`
                                w-full py-3 px-4 rounded-xl font-bold text-white
                                transition-all duration-300 transform relative overflow-hidden
                                focus:outline-none focus:ring-4 focus:ring-opacity-50
                                opacity-0 animate-slideUp animation-delay-1100
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
                                <span>{loading ? "Cargando..." : "Entrar"}</span>
                            </div>

                            {/* Efecto hover del botón */}
                            {!loading && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transform -skew-x-12 transition-opacity duration-500"></div>
                            )}
                        </button>

                        {/* Enlace de Olvidaste Contraseña */}
                        <div className="text-center mt-4 opacity-0 animate-fadeIn animation-delay-1200">
                            <Link
                                to="/forgot-password"
                                className="text-sm hover:underline transition-colors duration-200"
                                style={{ color: '#630000' }}
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                    </form>

                    {/* Enlace de Registro */}
                    <div className="mt-6 pt-6 border-t border-opacity-20 opacity-0 animate-fadeIn animation-delay-1300"
                        style={{ borderColor: '#630000' }}
                    >
                        <p className="text-center text-sm" style={{ color: '#630000' }}>
                            ¿No tienes una cuenta?{' '}
                            <Link
                                to="/signup"
                                className="font-medium hover:underline transition-colors duration-200"
                                style={{ color: '#1B1717' }}
                            >
                                Regístrate aquí
                            </Link>
                        </p>
                    </div>
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

export default Login;