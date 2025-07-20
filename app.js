import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { ControladorAuth } from './controllers/ControladorAuth.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cookieParser from 'cookie-parser';
import { ControladorNodos } from './controllers/ControladorNodos.js';
import { ControladorAdjuntos } from './controllers/ControladorAdjuntos.js';


// Necesario en ES Modules para obtener __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));
app.use('/uploads',express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(cookieParser()); 

app.get('/', (req, res) => {
  if(ControladorAuth.verificarCookie(req,res)){
    return res.redirect('/dashBoard');
  }
  return res.sendFile(path.join(__dirname, 'views', 'bienvenida.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.get('/dashBoard', ControladorAuth.verificarUsuario,(req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashBoard.html'));});
app.get('/nodos', ControladorAuth.verificarUsuario,ControladorNodos.obtenerNodos);
app.get("/username",(req,res)=>{
  try{
    const username = req.cookies.usuario;
    res.json({ username });
  }catch{
    console.log('Error al obtener el nombre de usuario desde la cookie');
    res.status(500).json({ error: 'Error al obtener el nombre de usuario' });
  }
  
})
app.get('/relevantNodes', ControladorAuth.verificarUsuario, ControladorNodos.obtenerNodosRelevantes);
app.get('/searchNode', ControladorAuth.verificarUsuario, ControladorNodos.buscarNodoPorTitulo);
// Rutas POST
app.post('/login', ControladorAuth.iniciarSesion);
app.post('/register', ControladorAuth.registrar);
app.post('/nodos', ControladorAuth.verificarUsuario,ControladorNodos.verificarUsuarioYNodoPadre, ControladorNodos.crearNodo);
app.post('/adjuntar', ControladorAuth.verificarUsuario,ControladorAdjuntos.verificarNodoYadjunto,ControladorAdjuntos.upload.single('archivo'), ControladorAdjuntos.subir);
app.post('/logout', ControladorAuth.cerrarSesion);


//rutas UPDATE
app.put('/nodos/:nodo_id', ControladorAuth.verificarUsuario, ControladorNodos.actualizarNodo);


// Rutas DELETE
app.delete('/nodos/:nodo_id', ControladorAuth.verificarUsuario,ControladorNodos.verificarNodoYUsuario,ControladorNodos.eliminarNodo);
app.delete('/adjuntos/:nodo_id/:nombre_archivo', ControladorAuth.verificarUsuario, ControladorAdjuntos.eliminarAdjunto);


// Servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});