import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const Login = () => {
    const navigate = useNavigate();
    const { signIn } = useAuth();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
        // Contenedor para centrar el formulario en la página 
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Iniciar sesión</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="email" name="email" placeholder="Correo Electrónico" autoComplete="email" value={formData.email} onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    <input type="password" name="password" placeholder="Contraseña" autoComplete="current-password" value={formData.password} onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    {error && <p className="text-red-600 text-sm text-center bg-red-100 p-2 rounded-lg">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg disabled:bg-gray-400 font-bold transition-transform transform hover:scale-105">
                        {loading ? "Cargando..." : "Entrar"}
                    </button>
                </form>
                <p className="text-center mt-6 text-sm text-gray-600">
                    ¿No tienes una cuenta?{' '}
                    <Link to="/signup" className="font-medium text-blue-600 hover:underline">
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;