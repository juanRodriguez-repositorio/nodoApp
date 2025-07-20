export class Nodo {
  constructor(id, titulo, descripcion,color = '#4fc3f7',archivos=[],importante=false,padre_id=null,colorTexto="#fff") {
    this.id = id; // identificador único
    this.titulo = titulo; // título visible
    this.descripcion = descripcion; // texto principal o descripción
    this.hijos = []; // arreglo de nodos hijos
    this.colapsado = false; // ⬅️ nuevo atributo
    this.color = color; // color por defecto
    this.archivos = archivos; // ⬅️ nuevo atributo para almacenar archivos adjuntos
    this.importante = importante; // ⬅️ nuevo atributo para marcar como importante
    this.colorTexto = colorTexto; // color del texto, por defecto
    this.padre_id = padre_id; // ⬅️ nuevo atributo para referencia al nodo padre
  }

  agregarHijo(nodoHijo) {
    if (nodoHijo instanceof Nodo) { 
      this.hijos.push(nodoHijo);
    } else {
      throw new Error("Solo se pueden agregar instancias de Nodo");
    }
  }

  eliminarHijoPorId(id) {
    this.hijos = this.hijos.filter(hijo => hijo.id !== id);
  }

  obtenerHijoPorId(id) {
    return this.hijos.find(hijo => hijo.id === id);
  }

  tieneHijos() {
    return this.hijos.length > 0;
  }
}