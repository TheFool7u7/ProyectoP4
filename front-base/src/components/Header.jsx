   import { useState, useRef, useEffect } from 'react';
   import SearchBar from "./SearchBar";
   import { useAuth } from './context/AuthContext';
   export const DEFAULT_THEME = "bg-gray-100";

   const Header = ({ searchTitle, searchTerm, setSearchTerm, toggleDarkMode, darkMode }) => {
     const { user } = useAuth(); // accede al usuario
     const [navOpen, setNavOpen] = useState(false);
     const { isAuthenticated } = useAuth();
     const backgroundTheme = user?.config?.theme || DEFAULT_THEME;

     const searchBarRef = useRef(null);

     useEffect(() => {
       const handleKeyDown = (e) => {
         if (e.ctrlKey && e.key.toLowerCase() === "b") {
           e.preventDefault();
           searchBarRef.current?.focus();
         }
       };
   
       window.addEventListener("keydown", handleKeyDown);
       return () => window.removeEventListener("keydown", handleKeyDown);
     }, []);

     return (
       <header>
          <div className={`flex justify-between items-center p-4 shadow-sm border-b bg-white ${backgroundTheme}`}>
            <h1 className="text-lg font-semibold text-gray-700">{searchTitle}</h1>
            <div className="w-full max-w-xs">
              <SearchBar 
                searchTerm={searchTerm} 
                searchTitle={searchTitle} 
                setSearchTerm={setSearchTerm}
                ref={searchBarRef}
             />
            </div>  
            <div className="flex justify-end mb-4">
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 text-sm px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>
            </div>
          </div>
       </header>
     );
   };

   export default Header;