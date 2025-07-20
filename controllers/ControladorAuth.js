import {db} from '../db.js';

export class ControladorAuth {
  static registrar(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json('Faltan datos');
    }

    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, password], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({message: 'El nombre de usuario ya está en uso', success: false});
        }
        return res.status(500).json({message: 'Error en la base de datos',success: false});
      }
      res.json({message: 'Usuario registrado exitosamente',success: true});
    });
  }

  static iniciarSesion(req, res) {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, results) => {
      if (err) return res.status(500).json({message: 'Error en la base de datos', success: false});
      if (results.length === 0) return res.status(401).json({message: 'Credenciales incorrectas', success: false});

       // Guardamos el nombre de usuario en una cookie
      res.cookie('usuario', username, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 día
      });

      res.json({success: true});
    });
  }
  static cerrarSesion(req, res) {
    res.clearCookie('usuario');
    res.json({ message: 'Sesión cerrada', success: true });
  }
  static verificarUsuario(req, res, next) {
    const username = req.cookies.usuario;
    if (!username) {
      return res.status(401).json({ mensaje: 'No autenticado' });
    }

    const sql = 'SELECT id FROM users WHERE username = ? LIMIT 1';
    db.query(sql, [username], (err, results) => {
      if (err) return res.status(500).json({ mensaje: 'Error en la base de datos' });

      if (results.length === 0) {
        return res.status(401).json({ mensaje: 'Usuario no válido' });
      }

      // Guardamos el ID del usuario para futuras consultas
      req.usuarioId = results[0].id;
      next();
  });
 }
 static verificarCookie(req, res) {
    const username = req.cookies.usuario;
    if (!username) {
      return false;
    }
    return true
  
 }
}