import { db } from '../db.js';

export class ModeloAdjuntos {
  static guardar(nodoId, nombreArchivo, callback) {
    const archivoId= Date.now().toString(); // Generar un ID único para el archivo
    const sql = 'INSERT INTO archivos (id,nodo_id, nombre_archivo) VALUES (?, ?,?)';
    db.query(sql, [archivoId,nodoId, nombreArchivo], (err,result) => {
       return callback(err);
   
    });
  
  }
  static eliminarArchivo(nodoId, nombreArchivo, callback) {
    const sql = 'DELETE FROM archivos WHERE nodo_id = ? AND nombre_archivo = ?';
    db.query(sql, [nodoId, nombreArchivo], (err) => {
      return callback(err);
    });
  }
  
}