import { forwardRef, useImperativeHandle, useRef } from "react";
import { SearchCheck } from "lucide-react";

const SearchBar = forwardRef(({ searchTitle, searchTerm, setSearchTerm }, ref) => {
  const inputRef = useRef();

  // Exponer método al padre
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(inputRef.current.value.trim());
    inputRef.current.select(); // opcional: seleccionar todo al buscar
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      <div className="flex space-x-2">
        <input
          ref={inputRef}
          type="text"
          placeholder={`Buscar ${searchTitle.toLowerCase()}...`}
          defaultValue={searchTerm}
          className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          title="Buscar"
        >
          <SearchCheck size={16}/>
        </button>
      </div>
    </form>
  );
});

export default SearchBar;
