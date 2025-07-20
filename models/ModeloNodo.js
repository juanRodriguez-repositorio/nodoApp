import { db } from '../db.js';
import fs from 'fs';
import path from 'path';


export class ModeloNodo {
  static obtenerTodosPorUsuario(usuarioId, callback) {
    const sql = 'SELECT nodos.id,padre_id,titulo,descripcion,color,nombre_archivo,importante,colorTexto FROM nodos LEFT JOIN archivos ON nodos.id = archivos.nodo_id WHERE usuario_id = ?';
    db.query(sql, [usuarioId], (err, results) => {
     return callback(err,results);
    });
  }
  static crearNodo(nodo, usuarioId, callback) {
    const sql = `
      INSERT INTO nodos (id, usuario_id, padre_id, titulo, descripcion, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      nodo.id,
      usuarioId,
      nodo.padre_id || null,
      nodo.titulo,
      nodo.descripcion,
      nodo.color || '#4fc3f7',

    ];

    db.query(sql, params, (err, result) => {
      if (err) {
        console.error('Error al crear nodo:', err);
        return callback(err);
      }
      return callback(err,result);
    });
  }
  static actualizar(nodoId,datosActualizados,usuarioId, callback) {
    const sql = `
      UPDATE nodos
      SET titulo = ?, descripcion = ?, color = ?, importante = ?,colorTexto = ?
      WHERE id = ? AND usuario_id = ?
    `;

    const params = [
      datosActualizados.titulo,
      datosActualizados.descripcion,
      datosActualizados.color || '#4fc3f7',
      datosActualizados.importante || false,
      datosActualizados.colorTexto || '#fff',
      nodoId,
      usuarioId
    ];

    db.query(sql, params, (err, result) => {
      return callback(err);
    });

  }
  static eliminarNodoYArchivos(nodoId, callback) {
   const sqlArchivos = 'SELECT nombre_archivo FROM archivos WHERE nodo_id = ?';
    db.query(sqlArchivos, [nodoId], (err, archivos) => {
      if (err) return callback(err);

      archivos.forEach(a => {
        const ruta = path.join('uploads', a.nombre_archivo);
        fs.unlink(ruta, (err) => {
          if (err) console.warn('No se pudo borrar:', ruta);
        });
      });

      db.query('DELETE FROM archivos WHERE nodo_id = ?', [nodoId], (err) => {
        if (err) return callback(err);

        db.query('DELETE FROM nodos WHERE id = ?', [nodoId], callback);
      });
    });
  }
  static verificarNodo(nodoId, usuarioId, callback) {
    const sqlVerificar = 'SELECT id FROM nodos WHERE id = ? AND usuario_id = ?';
    db.query(sqlVerificar, [nodoId, usuarioId], (err, results) => {
      if (err) return callback(err);
      if (results.length === 0) {
        return callback("err");
      }
      return callback(null);
    });
  }
  static eliminarNodoConHijos(nodoId, usuarioId, callback) {
    const sqlHijos = 'SELECT id FROM nodos WHERE padre_id = ? AND usuario_id = ?';
    db.query(sqlHijos, [nodoId, usuarioId], (err, hijos) => {
      if (err) return callback(err);

      let pendientes = hijos.length;

      if (pendientes === 0) {
        // Si no hay hijos, simplemente eliminar el nodo actual
        return ModeloNodo.eliminarNodoYArchivos(nodoId, callback);
      }

      // Eliminar todos los hijos recursivamente
      hijos.forEach(hijo => {
        ModeloNodo.eliminarNodoConHijos(hijo.id, usuarioId, (err) => {
          if (err) return callback(err);

          pendientes--;
          if (pendientes === 0) {
            // Cuando todos los hijos se han eliminado, eliminar el nodo actual
            ModeloNodo.eliminarNodoYArchivos(nodoId, callback);
          }
        });
      });
    });
  }
  static obtenerNodosRelevantes(usuarioId, callback) {
    const sql = 'SELECT id,titulo,color FROM nodos WHERE usuario_id = ? AND importante = true';
    db.query(sql, [usuarioId], (err, results) => {
      return callback(err, results);
    });
  }
  static buscarNodoPorTitulo(titulo, usuarioId, callback) {
    const sql = 'SELECT id,titulo,color FROM nodos WHERE usuario_id = ? AND LOWER(titulo) LIKE LOWER(?)';
    db.query(sql, [usuarioId, `%${titulo}%`], (err, results) => {
      return callback(err, results);
    });
  }
}