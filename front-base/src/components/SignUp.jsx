import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const SignUp = () => {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [formData, setFormData] = useState({ email: "", password: "", nombre_completo: "", identificacion: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        setMessage("");

        try {
            const { error } = await signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        nombre_completo: formData.nombre_completo,
                        identificacion: formData.identificacion,
                    }
                }
            });
            if (error) throw error;
            setMessage("¡Registro exitoso! Por favor, revisa tu correo para confirmar la cuenta.");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        //contenedor para centrar
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Crear una Cuenta</h1>
                <form onSubmit={handleSignUp} className="space-y-4">
                    <input type="text" name="nombre_completo" placeholder="Nombre Completo" onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    <input type="text" name="identificacion" placeholder="Identificación (Cédula)" onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    <input type="email" name="email" placeholder="Correo Electrónico" autoComplete="email" onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    <input type="password" name="password" placeholder="Contraseña (mínimo 6 caracteres)" autoComplete="new-password" onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />

                    {error && <p className="text-red-600 text-sm text-center bg-red-100 p-2 rounded-lg">{error}</p>}
                    {message && <p className="text-green-600 text-sm text-center bg-green-100 p-2 rounded-lg">{message}</p>}

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg disabled:bg-gray-400 font-bold transition-transform transform hover:scale-105">
                        {loading ? "Registrando..." : "Registrarse"}
                    </button>
                </form>
                <p className="text-center mt-6 text-sm text-gray-600">
                    ¿Ya tienes una cuenta? <Link to="/login" className="font-medium text-blue-600 hover:underline">Inicia sesión aquí</Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;