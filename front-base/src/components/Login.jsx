import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({ id: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        return;
      }

      login(form, data.token);
      navigate("/");
    } catch (err) {
      console.error("Error al intentar iniciar sesión:", err);
      setError("Error de conexión. Intenta nuevamente.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">Iniciar sesión</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          name="id"
          placeholder="Cédula"
          value={form.id}
          onChange={handleChange}
          required
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={loading}
        >
          {loading ? "Cargando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
};

export default Login;
