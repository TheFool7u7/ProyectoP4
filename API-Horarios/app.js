const express = require('express')
const app = express()
const cors = require('cors');
const port = 3000
app.use(express.json())
app.use(express.urlencoded({extended:true}))

const login = require("./src/routes/login")

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
app.get("/api", function(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('SERVIDOR SISTEMA');
});

app.use("/api/login", login);


 
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
