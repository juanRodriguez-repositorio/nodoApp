import { ModeloNodo } from '../models/ModeloNodo.js';

export class ControladorNodos {
  static obtenerNodos(req, res) {
    const usuarioId = req.usuarioId; // ← ya viene desde el middlewarer

    ModeloNodo.obtenerTodosPorUsuario(usuarioId, (err, nodos) => {
      if (err) return res.status(500).json({ mensaje: 'Error al obtener nodos' });

      const map = new Map();

      for (const fila of nodos) {
        const nodoId = fila.id;

        if (!map.has(nodoId)) {
          map.set(nodoId, {
          id: nodoId,
          titulo: fila.titulo,
          descripcion: fila.descripcion,
          color: fila.color,
          padre_id: fila.padre_id,
          importante: fila.importante, // ⬅️ nuevo atributo
          archivos: [],
          colorTexto: fila.colorTexto // ⬅️ nuevo atributo
          });
        }

        // Agregar archivo solo si existe
        if (fila.nombre_archivo) {
          map.get(nodoId).archivos.push({
            nombre:fila.nombre_archivo,
            ruta: `/uploads/${fila.nombre_archivo}`,
          });
        }
      }
      const nodosAgrupados = Array.from(map.values())

      res.json({ nodosAgrupados });
    });
  }
  static crearNodo(req, res) {
    const usuarioId = req.usuarioId;
    const nodo = req.body;

    if (!nodo.id || !nodo.titulo || !nodo.descripcion) {
      return res.status(400).json({ mensaje: 'Datos incompletos' });
    }
    ModeloNodo.crearNodo(nodo, usuarioId, (err) => {
      if (err) return res.status(500).json({ mensaje: 'Error al guardar nodo' });
      res.status(201).json({ mensaje: 'Nodo creado exitosamente'});
    });
  }
  static actualizarNodo(req, res) { 
        const usuarioId = req.usuarioId;
        const datosActualizados = req.body;
        const nodoId=req.params.nodo_id;
    
        if (!nodoId || !datosActualizados.titulo || !datosActualizados.descripcion || !datosActualizados.color) {
        return res.status(400).json({ mensaje: 'Datos incompletos' });
        }
    
        ModeloNodo.actualizar(nodoId,datosActualizados, usuarioId, (err) => {
        if (err) return res.status(500).json({ mensaje: 'Error al actualizar nodo' });
        res.json({ mensaje: 'Nodo actualizado exitosamente' });
        });
  }
  static eliminarNodo(req, res) {
    const usuarioId = req.usuarioId;
    const nodoId = req.params.nodo_id;

    if (!nodoId) {
      return res.status(400).json({ mensaje: 'ID de nodo requerido' });
    }

    ModeloNodo.eliminarNodoConHijos(nodoId, usuarioId, (err) => {
      if (err) return res.status(500).json({ mensaje: 'Error al eliminar nodo' });
      res.json({ mensaje: 'Nodo eliminado exitosamente' });
    });
    
  }
  static verificarUsuarioYNodoPadre(req, res, next) {
    const usuarioId = req.usuarioId;
    const nodoPadreId = req.body.padre_id;

    if(nodoPadreId){
      ModeloNodo.verificarNodo(nodoPadreId, usuarioId, (err) => {
        if (err) return res.status(500).json({ mensaje: 'Error al verificar nodo padre' });
        next();
      })
    }else{
      next();
    }
  }
  static verificarNodoYUsuario(req, res, next) {
    const usuarioId = req.usuarioId;
    const nodoId = req.params.nodo_id;

    if (!nodoId) {
      return res.status(400).json({ mensaje: 'ID de nodo requerido' });
    }

    ModeloNodo.verificarNodo(nodoId, usuarioId, (err) => {
      if (err) return res.status(500).json({ mensaje: 'Error al verificar nodo' });
      next();
    });
  }
  static obtenerNodosRelevantes(req, res) {
    const usuarioId = req.usuarioId;

    ModeloNodo.obtenerNodosRelevantes(usuarioId, (err, nodosId) => {
      if (err) return res.status(500).json({ mensaje: 'Error al obtener nodos relevantes' });
      res.json({ nodosId });
    });
  }
  static buscarNodoPorTitulo(req, res) {
    const usuarioId = req.usuarioId;
    const titulo = req.query.titulo;

    if (!titulo) {
      return res.status(400).json({ mensaje: 'Título de nodo requerido' });
    }

    ModeloNodo.buscarNodoPorTitulo(titulo, usuarioId, (err, nodos) => {
      if (err) return res.status(500).json({ mensaje: 'Error al buscar nodo' });
      res.json({ nodos });
    });
  }
}