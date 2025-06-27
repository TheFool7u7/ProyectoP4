// En src/components/SearchBar.jsx

import { forwardRef, useImperativeHandle, useRef } from "react";
import { Search } from "lucide-react"; // Usamos el ícono estándar de búsqueda

const SearchBar = forwardRef(({ searchTitle, searchTerm, setSearchTerm, onSearchSubmit }, ref) => {
  const inputRef = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Llamamos a la función de búsqueda del componente padre con el valor actual
    if (onSearchSubmit) {
      onSearchSubmit(searchTerm);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      <div className="flex space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder={searchTitle ? `Buscar ${searchTitle.toLowerCase()}...` : "Buscar..."}
            value={searchTerm} // Controlamos el valor desde el padre
            onChange={(e) => setSearchTerm(e.target.value)} // El padre maneja el cambio
            className="w-full pl-10 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
          title="Buscar"
        >
          <Search size={18} />
        </button>
      </div>
    </form>
  );
});

export default SearchBar;