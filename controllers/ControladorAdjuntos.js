import { ModeloAdjuntos } from '../models/ModeloAdjuntos.js';
import { ModeloNodo } from '../models/ModeloNodo.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export class ControladorAdjuntos {
 
  static storage= multer.diskStorage({
        destination: (req, file, cb) => cb(null, 'uploads'),
        filename: (req, file, cb) => cb(null,`${Date.now().toString(36)}-${file.originalname}`)
  });
  static upload = multer({ storage: this.storage });
  
  static subir(req, res) {
    const archivo = req.file;
    const nodoId = req.query.id;

    if (!archivo) {
      return res.status(400).json({ mensaje: 'Archivo no recibido' });
    }

    ModeloAdjuntos.guardar(nodoId, archivo.filename, (err, result) => {
      if (err) return res.status(500).json({ mensaje: 'Error al guardar en BD' });

      res.status(201).json({
        mensaje: 'Archivo guardado exitosamente',
        nombre: archivo.filename,
        ruta: `/uploads/${archivo.filename}`,
      });
    });
  }
  static eliminarAdjunto(req, res) {
    const nodoId = req.params.nodo_id;
    const nombreArchivo = req.params.nombre_archivo;
    const usuarioId = req.usuarioId;

    if (!nodoId || !nombreArchivo) {
      console.log("faltan datos");
      return res.status(400).json({ mensaje: 'Faltan datos' });
      
    }

    ModeloNodo.verificarNodo(nodoId, usuarioId, (err) => {
      if (err) return res.status(404).json({ mensaje: 'Nodo no encontrado' });
    })

    ModeloAdjuntos.eliminarArchivo(nodoId, nombreArchivo, (err) => {
      if (err) return res.status(500).json({ mensaje: 'Error al eliminar adjunto' });

      // Eliminar el archivo del sistema de archivos
      const ruta = path.join('uploads', nombreArchivo);
      fs.unlink(ruta, (err) => {
        if (err) console.warn('No se pudo borrar:', ruta);
      });
      res.json({ mensaje: 'Adjunto eliminado exitosamente' });
    });
  }
  static verificarNodoYadjunto(req, res, next) {
    const nodoId = req.query.id;
    const usuarioId = req.usuarioId;
    console.log(nodoId);
    if (!nodoId) return res.status(400).json({ mensaje: 'Falta el nodo_id' });

    ModeloNodo.verificarNodo(nodoId, usuarioId, (err) => {
      if (err) return res.status(404).json({ mensaje: 'Nodo no encontrado' });
      next(); // ✅ Todo bien, sigue al siguiente middleware
    });
  }
  
}