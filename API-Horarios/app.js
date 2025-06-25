const express = require('express')
const app = express()
const cors = require('cors');
const port = 3001
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const login = require("./src/routes/login")
const graduadosRouter = require("./src/routes/graduados");
const areasRouter = require("./src/routes/areasDeInteres");
const preferenciasRouter = require("./src/routes/preferencias");
const talleresRouter = require("./src/routes/talleres");
const catalogoRouter = require("./src/routes/catalogo");
const inscripcionesRouter = require("./src/routes/inscripciones");
const documentosRouter = require("./src/routes/documentos");
const usuariosRouter = require("./src/routes/usuarios"); 
const perfilesRouter = require("./src/routes/perfiles.js");
const asistenciaRouter = require("./src/routes/asistencia.js");

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5175'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: false,
}));

// Ruta base para utilizar el servicio
app.get("/api", function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('SERVIDOR SISTEMA ACTIVO');
});

app.use("/api/login", login);
app.use("/api/graduados", graduadosRouter);
app.use("/api/areas", areasRouter);
app.use("/api/preferencias", preferenciasRouter);
app.use("/api/talleres", talleresRouter);
app.use("/api/catalogo", catalogoRouter);
app.use("/api/inscripciones", inscripcionesRouter);
app.use("/api/documentos", documentosRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/perfiles", perfilesRouter);
app.use("/api/asistencia", asistenciaRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
