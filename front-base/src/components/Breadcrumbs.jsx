import { useLocation, Link } from "react-router-dom";

const Breadcrumbs = () => {
const routeNameMap = {
    home: "Inicio",
    teachers: "Profesores",
    students: "Estudiantes",
    groups: "Grupos",
    subjects: "Asignaturas",
    teacherGroups : "Grupos",
    "sign-in": "Iniciar sesión",
    "add": "Agregar",
    "edit": "Editar",
    "details": "Detalles",
    };  
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  return (
    <nav className="bg-gray-100 py-2 px-4 text-sm text-gray-700">
      <ol className="flex space-x-1">
        <li>
          <Link to="/" className="text-blue-600 hover:underline">Inicio</Link>
          {pathnames.length > 0 && <span className="mx-1">/</span>}
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const label = routeNameMap[name] || decodeURIComponent(name).replace(/-/g, " ");

          return (
            <li key={routeTo}>
              {!isLast ? (
                <>
                  <Link to={routeTo} className="text-blue-600 hover:underline capitalize">
                    {label}
                  </Link>
                  <span className="mx-1">/</span>
                </>
              ) : (
                <span className="text-gray-500 capitalize">{label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
