import { NodoVisual } from './NodoVisual.js';
import { Nodo } from './Nodo.js';
import { API } from './Api.js';
export class ArbolVisualController {
  static svg;
  static stackPadres = [];
  static nodoActual = null;
  static mapa= new Map();
  static nodoRaiz=null;

  static inicializar(svgElement, nodoRaiz,animar=false) {
    this.svg = svgElement;
    this.nodoRaiz = nodoRaiz;
    this.stackPadres = [nodoRaiz];
    if(animar){
      this.mostrarNodo(nodoRaiz, true, "centro");
    }else{
      this.mostrarNodo(nodoRaiz);
    }
  }

static mostrarNodo(nodoPadre, animar = false, direccion = "abajo",x=0,y=0) {
  const svg = this.svg;
  const padreX = window.innerWidth / 2;
  const padreY = 200;

  const mostrar = () => {
    this.nodoActual = nodoPadre;

    // Nodo padre
    new NodoVisual(nodoPadre, svg, this, padreX, padreY);
    

    // Hijos
    if (!nodoPadre.colapsado) {
      const numHijos = nodoPadre.hijos.length;
      const separacion = 320;
      const totalWidth = (numHijos - 1) * separacion;
      const inicioX = padreX - totalWidth / 2;

      nodoPadre.hijos.forEach((hijo, i) => {
        const xFinal = inicioX + i * separacion;
        const yFinal = padreY + 250;

        const curva = `M ${padreX},${padreY + 100}
                       C ${padreX},${padreY + 150},
                         ${xFinal},${yFinal - 150},
                         ${xFinal},${yFinal - 50}`;


        const hijoVisual = new NodoVisual(hijo, svg, this, xFinal, yFinal,curva);
        hijoVisual.moverA(xFinal, yFinal);
      });
    }
  };
  //document.querySelectorAll('input').forEach(input => input.remove());
  if (animar) {
    this.transicionarYMostrar(x,y, direccion, mostrar); 
  } else {
    svg.selectAll("*").remove(); // Limpiar sin animar
    mostrar();
  }
  
}
 static irAlPadre() {
   if (this.stackPadres.length > 0) {
      const padre = this.stackPadres.pop();
      this.mostrarNodo(padre);
   }
 }
 static subirNivelDesde(nodoSolicitante,x,y) {
  // ✅ Si el nodo clicado no es el nodo actual, entonces enfocarlo
  if (nodoSolicitante !== this.nodoActual) {
    this.stackPadres.push(nodoSolicitante);
    this.mostrarNodo(nodoSolicitante, true, "abajo",x,y);
    return;
  }

  // ✅ Si ya estamos enfocados en ese nodo, subir un nivel si es posible
  if (this.stackPadres.length > 1) {
    this.stackPadres.pop(); // remover el actual
    const nuevoPadre = this.stackPadres[this.stackPadres.length - 1];
    this.mostrarNodo(nuevoPadre, true, "arriba");
  }
 }
 static transicionarYMostrar(x,y, direccion, callback) {
  const svg = this.svg;
  let dx = 0, dy = 0;
  
  console.log(direccion);
  if(direccion!=="centro"){
    console.log("cumplido");
    dx = direccion === "arriba" ? window.innerWidth/2 :x;
    dy = direccion === "arriba" ? -100 : y;
  }else{
    dx = window.innerWidth / 2;
    dy = window.innerHeight / 2;
  }
  console.log(dx,dy);
  const nodosVisibles = svg.selectAll("g");

  if (nodosVisibles.empty()) {
    // No hay nodos visibles (primera vez), no animamos nada
    callback();
    return;
  }
  this.svg.selectAll('path')
  .attr("opacity", 0)
  
  nodosVisibles
    .transition()
    .duration(600)
    .attr("transform", `translate(${dx}, ${dy})`)
    .style("opacity", 0)
    .on("end", (_, i, nodes) => {
      if (i === nodes.length - 1) {
        svg.selectAll("*").remove();
        callback();
      }
    });
 }
 static eliminarNodo(nodoAEliminar) {
  const padre = this.nodoActual;

  if (nodoAEliminar === padre) {
    alert("No se puede eliminar el nodo actual.");
    return;
  }
  // Eliminar el hijo directamente
  padre.hijos = padre.hijos.filter(hijo => hijo !== nodoAEliminar);

  // Redibujar al padre con los hijos actualizados
  this.mostrarNodo(padre);
  API.eliminarNodo(nodoAEliminar.id)
    .then(() => {
      console.log("Nodo eliminado correctamente");
    })
    .catch(error => {
      console.error('Error al eliminar el nodo:', error);
      alert('Error al eliminar el nodo. Inténtalo de nuevo.');
    });

 }
 static construirArbolDesdePlano(listaPlano) {
   // Paso 1: crear instancias de Nodo
   listaPlano.forEach(n => {
     this.mapa.set(n.id, new Nodo(n.id, n.titulo, n.descripcion, n.color, n.archivos,n.importante,n.padre_id, n.colorTexto));
   });

   const nodoRaiz = new Nodo(null, '📘 Inicio', 'Bienvenido a tu árbol de ideas.');

   // Paso 2: construir jerarquía con Nodo.agregarHijo
   listaPlano.forEach(n => {
    if (n.padre_id === null) {
      nodoRaiz.agregarHijo(this.mapa.get(n.id));
    } else {
      const padre = this.mapa.get(n.padre_id);
      const hijo = this.mapa.get(n.id);
      if (padre && hijo) {
        padre.agregarHijo(hijo);
      }
    }
   });

   return nodoRaiz;
 }
 static irAnodo(nodoId){
  let nodo=this.mapa.get(nodoId);
  if(nodo){
    let temporalStack = [];
    let newStackPadres=[];
    while (nodo) {
      temporalStack.push(nodo);
      nodo = this.mapa.get(nodo.padre_id);
      
    }
    temporalStack.push(this.nodoRaiz,); // Agregar nodo raíz
    for(let i=0;i<temporalStack.length;i++){
      newStackPadres.push(temporalStack[temporalStack.length-1-i]);
    }
    this.stackPadres = newStackPadres;
    console.log("Nueva pila de padres:", this.stackPadres);
    this.mostrarNodo(this.mapa.get(nodoId),true,"centro");
  }else{
    console.warn("Nodo no encontrado en el mapa:", nodoId);
    alert("Error al ir al nodo. Por favor, intenta de nuevo.");
  }
 }
 
}