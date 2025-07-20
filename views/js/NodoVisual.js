import { Nodo } from "./Nodo.js";
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { API } from "./Api.js";
export class NodoVisual {
  constructor(nodo, svg,ArbolVisualController,x=window.innerWidth / 2, y=window.innerHeight / 2,curva=null) {
    this.nodo = nodo;
    this.x = x;
    this.y = y;
    console.log(x,"",y,"del constructor");
    this.svg = svg;
    this.rectW = 300;
    this.rectH = 210;
    this.popupVisible = false;
    this.popupElement = null;
    this.controlador = ArbolVisualController; // Referencia al controlador del árbol
    this.inputFile = document.createElement("input");
    this.inputFile.type = "file";
    this.inputFile.accept = "*/*";
    this.inputFile.style.display = "none";

    this.inputFile.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if(!this.nodo.id){
        return alert("No puedes subir un archivo en el nodo de bienvenida");
      }
      console.log(this.nodo.id);
      if (file) {
        const formData = new FormData();
        formData.append("archivo", file); // ⬅️ El campo debe coincidir con .single('archivo') en multer
        try {
          const respuesta = await API.subirArchivo(formData,this.nodo.id); // ⬅️ Ajusta según cómo llamas a la función
          const nombre = respuesta.nombre;
          const ruta = respuesta.ruta;

          this.nodo.archivos.push({ nombre, ruta });

          if (this.popupVisible) {
            this.popupElement.remove();
            this.popupVisible = false;
            this.toggleListaArchivos();
          }
        } catch (error) {
          alert("No se pudo subir el archivo.");
        }
  }
});

    document.body.appendChild(this.inputFile);

    this.elementos = {}; // para guardar referencias a partes visuales

    this.dibujar(curva);
  }

  dibujar(curva) {
   if (curva!=null) {
    this.flecha = this.svg.append("path")
    .attr("d",curva)
    .attr("stroke", "	#FBC02D")
    .attr("stroke-width", 2)
    .attr("fill", "none")
    .attr("marker-end", "url(#flecha)")
    
   }
   this.grupo = this.svg.append("g");
   this.grupo.on("contextmenu", (event) => {
    event.preventDefault();
    this.mostrarMenuContextual(event.pageX, event.pageY);
    console.log("Menú contextual");
});
   this.grupo.attr("transform", `translate(${this.x}, ${this.y})`)
   const { x, y, rectW, rectH, svg, nodo } = this;

    // Fondo
    this.elementos.fondo = this.grupo.append("rect")
      .attr("x", - rectW / 2)
      .attr("y", - rectH / 2)
      .attr("width", rectW)
      .attr("height", rectH)
      .attr("rx", 20)
      .attr("ry", 20)
      .attr("fill",  this.nodo.color || "#4fc3f7")
      .attr("stroke", this.nodo.color || "#4fc3f7")
      .attr("stroke-width", 2)
      

    // Título
    this.elementos.titulo = this.grupo.append("foreignObject")
   .attr("x", -130)
   .attr("y", -76)
   .attr("width", 260)
   .attr("height", 24)
   .append("xhtml:div")
   .style("color", this.nodo.colorTexto || "#fff")
   .style("font-size", "18px")
   .style("font-weight", "bold")
   .style("font-family", "Segoe UI")
   .style("text-align", "center")
   .style("display", "-webkit-box")
   .style("-webkit-line-clamp", "1")
   .style("-webkit-box-orient", "vertical")
   .style("overflow", "hidden")
   .style("text-overflow", "ellipsis")
   .style("white-space", "nowrap")
   .style("user-select", "none")
   .style("cursor", "pointer")
   .text(nodo.titulo)
   .on("click", () => this.editarTextoInline("titulo"));

    // Descripción truncada
    this.elementos.descripcion = this.grupo.append("foreignObject")
      .attr("x",- 120)
      .attr("y",- 20)
      .attr("width", 260)
      .attr("height", 60)
      .append("xhtml:div")
      .style("color", this.nodo.colorTexto || "#fff")
      .style("font-size", "14px")
      .style("font-family", "Segoe UI")
      .style("display", "-webkit-box")
      .style("-webkit-line-clamp", "3")
      .style("-webkit-box-orient", "vertical")
      .style("overflow", "hidden")
      .style("text-overflow", "ellipsis")
      .style("white-space", "normal")         // ✅ permite saltos de línea
      .style("line-height", "1.2em")          // ✅ espaciado entre líneas
      .style("word-wrap", "break-word") 
      .style("cursor", "pointer")
      .style("user-select", "none")
      .text(nodo.descripcion)
      .on("click", () => this.editarTextoInline("descripcion"));

    // Botones
    this.agregarBotones();
    lucide.createIcons();
    this.toggleImportante()
  }

  editarTextoInline(tipo) {
    const { x, y, svg, nodo, elementos } = this;

    if (tipo === "titulo") {
      elementos.titulo.style("display", "none");
    } else {
      elementos.descripcion.style("display", "none");
    }

    const coords = tipo === "titulo"
      ? { x: - 120, y: - 73, w: 260, h: 24 }
      : { x: - 130, y: - 20, w: 260, h: 70 };

    const foreign = this.grupo.append("foreignObject")
      .attr("x", coords.x)
      .attr("y", coords.y)
      .attr("width", coords.w)
      .attr("height", coords.h);

    const div = foreign.append("xhtml:div")
      .style("width", "100%")
      .style("height", "100%");

    const campo = div.append(tipo === "titulo" ? "xhtml:input" : "xhtml:textarea")
      .style("width", "100%")
      .style("height", "100%")
      .style("font-family", "Segoe UI")
      .style("font-size", "14px")
      .style("background-color", this.nodo.color || "#4fc3f7")
      .style("color", "white")
      .style("border", "none")
      .style("padding", "5px")
      .style("border-radius", "8px")
      .style("outline", "none")
      .style("resize", "none")
      .style("box-sizing", "border-box")
      .node();

    campo.value = tipo === "titulo" ? nodo.titulo : nodo.descripcion;
    campo.focus();
    const valorOriginal=campo.value;
    campo.addEventListener("blur", () => {
      let nuevoValor = campo.value.trim();
      foreign.remove();
      if(nuevoValor==""){
        nuevoValor=tipo=== "titulo" ? "Nuevo Tema" : "Descripción...";
      }
      if (tipo === "titulo") {
        nodo.titulo = nuevoValor;
        elementos.titulo.text(nodo.titulo).style("display", "block");
      } else {
        nodo.descripcion = nuevoValor;
        elementos.descripcion.text(nodo.descripcion).style("display", "-webkit-box");
      }
      if (nuevoValor !== valorOriginal && nodo.id!==null) {
        API.actualizarNodo(nodo).then(() => {
          console.log("Nodo actualizado correctamente");
        }).catch(error => {
          console.error('Error al actualizar el nodo:', error);
          alert('Error al actualizar el nodo. Inténtalo de nuevo.');
        });
      }
    });

    if (tipo === "titulo") {
      campo.addEventListener("keydown", (e) => {
        if (e.key === "Enter") campo.blur();
      });
    }
  }

  agregarBotones() {
    const { x, y, svg } = this;
    const ancho = 170;
    const alto = 45;

    const foreign = this.grupo.append("foreignObject")
      .attr("x", - ancho / 2)
      .attr("y", + 60)
      .attr("width", ancho)
      .attr("height", alto);

    const div = foreign.append("xhtml:div")
      .style("display", "flex")
      .style("justify-content", "space-between")
      .style("align-items", "center")
      .style("width", "fit-content")
      .style("height", "fit-content")
      .style("padding", "4px 4px")
      

    const botones = [
      { id: "colapsar" },
      { id: "subir"},
      { id: "añadir" },
      { id: "adjuntos"}
    ];

    botones.forEach(btn => {
      const obtenerIcono = (id) => {
        if (id === "colapsar") {
          return this.nodo.colapsado ? "eye-off" : "eye";
        }
        return {
          subir: "chevron-up",
          añadir: "plus",
          adjuntos: "paperclip"
        }[id];
      };
      const contenedor=div.append("xhtml:div")
        .style("width", "34px")
        .style("height", "32px")
        .style("border", "none")
        .style("border-radius", "50%")
        .style("background-color", "#FF9800")
        .style("color", "white")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center")
        .attr("title", btn.id)
        .style("cursor", "pointer")
        .style("margin-right", "9px")
        
      const icono=contenedor.append("xhtml:i")
        .attr("data-lucide", obtenerIcono(btn.id))
        .style("color", "white")
        .style("width", "20px")
        .style("height", "20px");

      contenedor.on("mouseover", function () {
          d3.select(this).style("transform", "scale(1.1)");
         })
        .on("mouseout", function () {
          d3.select(this).style("transform", "scale(1)");
         })
        .on("click", () => {
          console.log(`Botón '${btn.id}' presionado`);
          if(btn.id=="adjuntos") {
            this.toggleListaArchivos();
            
          }else if(btn.id=="añadir"){
            this.crearHijo();
          }else if(btn.id=="colapsar") {
            if(this.controlador.nodoActual !== this.nodo) {
              return alert("Debes estar en el nodo actual para colapsar o expandir.");
            }
            this.nodo.colapsado = !this.nodo.colapsado;
            this.controlador.mostrarNodo(this.nodo);

             // 🔄 Actualizar icono dinámicamente
            icono.attr("data-lucide", obtenerIcono("colapsar"));
            lucide.createIcons(); // re-renderiza el nuevo ícono
          }else if (btn.id === "subir") {
            
            this.controlador.subirNivelDesde(this.nodo,this.x,this.y);
          }
        });
    });
  }
  toggleListaArchivos() {
   if (this.popupVisible) {
     this.popupElement.remove();
     this.popupVisible = false;
     return;
   }

   const ancho = 260;
   const alto = 180;

   this.popupElement = this.grupo.append("foreignObject")
    .attr("x", - ancho / 2)
    .attr("y", - alto / 2)
    .attr("width", ancho)
    .attr("height", alto)
    .attr("class", "popup-archivos");

   const contenedor = this.popupElement.append("xhtml:div")
    .style("width", "100%")
    .style("height", "100%")
    .style("background-color", "#263238ee")
    .style("border", "2px solid #ffffff66")
    .style("border-radius", "10px")
    .style("padding", "10px")
    .style("color", "white")
    .style("font-family", "Segoe UI")
    .style("font-size", "13px")
    .style("position", "relative")
    .style("box-sizing", "border-box")
    .style("overflow-y", "auto");

   contenedor.append("xhtml:strong").text("📎 Archivos adjuntos");

   // ❌ Botón cerrar
   contenedor.append("xhtml:button")
    .text("❌")
    .style("position", "absolute")
    .style("top", "6px")
    .style("right", "6px")
    .style("background", "transparent")
    .style("border", "none")
    .style("color", "white")
    .style("font-size", "14px")
    .style("cursor", "pointer")
    .on("click", () => {
      this.popupElement.remove();
      this.popupVisible = false;
    });

   contenedor.append("xhtml:button")
    .text("➕")
    .style("margin-top", "8px")
    .style("padding", "4px 8px")
    .style("background-color", "#4fc3f7")
    .style("color", "#fff")
    .style("border", "none")
    .style("border-radius", "6px")
    .style("cursor", "pointer")
    .style("margin-left", "5px")
    .on("click", () => this.inputFile.click());

   // 🗂 Lista de archivos
   const lista = contenedor.append("xhtml:ul")
    .style("margin", "10px 0 0 0")
    .style("padding", "0")
    .style("list-style", "none")
    .style("max-height", "80px")
    .style("overflow-y", "auto");

   this.nodo.archivos.forEach((archivo, index) => {
    const item = lista.append("xhtml:li")
      .style("margin-bottom", "6px")
      .style("display", "flex")
      .style("justify-content", "space-between")
      .style("align-items", "center");

    item.append("xhtml:a")
      .attr("href", archivo.ruta)
      .attr("target", "_blank")
      .style("color", "#81d4fa")
      .style("text-decoration", "none")
      .text(archivo.nombre);

    item.append("xhtml:button")
      .text("🗑️")
      .style("background", "transparent")
      .style("border", "none")
      .style("color", "#e57373")
      .style("cursor", "pointer")
      .style("font-size", "14px")
      .on("click", ()=>this.eliminarArchivo(index));
    });

    this.popupVisible = true;
  }
  async crearHijo() {
   if (this.controlador.nodoActual !== this.nodo) {
     return alert("Debes estar en el nodo actual para crear un hijo.");
   }
   const id=Date.now().toString(); // Generar un ID único
   let nuevoHijo = new Nodo(id, "Nuevo Tema", "Descripción...");
   const success= await API.crearNodo(nuevoHijo,this.controlador.nodoActual).then(respuesta => {
    return true;
   }).catch(error => {
    console.error('Error al crear el nodo hijo');
    alert('Error al crear el nodo hijo. Inténtalo de nuevo.');
    nuevoHijo = null;
    return false;
   })
   if(success){
    this.nodo.hijos.push(nuevoHijo);

    // 👇 Mostramos de nuevo al padre para que se vean todos los hijos (incluyendo el nuevo)
    console.log(this.x,this.y,"de crearHijo");
    this.controlador.mostrarNodo(this.nodo,false,"abajo");
   }
  }
  async eliminarArchivo(index){
   const nombreArchivo=this.nodo.archivos[index].nombre;
   const nodoId = this.nodo.id; 
   if (!nodoId || !nombreArchivo) { 
      return alert("Error al eliminar archivo");
   }
   const result=await API.eliminarArchivo(nodoId,nombreArchivo).then(respuesta => {
    return true;
   }).catch(error => {
      console.error('Error al eliminar el archivo:', error);
      alert('Error al eliminar el archivo. Inténtalo de nuevo.');
      return false;
   });
   if (!result) return;
   this.nodo.archivos.splice(index, 1);
   this.popupElement.remove();
   this.popupVisible = false;
   this.toggleListaArchivos(); // Redibujar lista  
  }
  moverA(xFinal, yFinal) {
   this.grupo.transition()
    .duration(400)
    .attr("transform", `translate(${xFinal}, ${yFinal})`);
   this.x = xFinal;
   this.y = yFinal;

  }
  mostrarMenuContextual(x, y) {
   // Si ya hay un menú abierto, eliminarlo
   d3.select(".menu-contextual").remove();

   const menu = d3.select("body")
    .append("div")
    .attr("class", "menu-contextual")
    .style("position", "absolute")
    .style("left", `${x}px`)
    .style("top", `${y}px`)
    .style("background-color", "#263238")
    .style("border", "1px solid #ccc")
    .style("border-radius", "6px")
    .style("padding", "6px 10px")
    .style("color", "white")
    .style("font-family", "Segoe UI")
    .style("font-size", "14px")
    .style("box-shadow", "0px 2px 8px rgba(0,0,0,0.3)")
    .style("z-index", "10000");

   menu.append("div")
    .text("🗑️ Eliminar")
    .style("padding", "4px 0")
    .style("cursor", "pointer")
    .on("click", () => {
      menu.remove(); // cerrar el menú al hacer clic
      this.controlador.eliminarNodo(this.nodo);
    });
   menu.append("div")
   .text("🎨 Cambiar color")
   .style("padding", "4px 0")
   .style("cursor", "pointer")
   .on("click", () => {
    menu.remove(); // cerrar el menú
    this.mostrarSelectorDeColor(); // llamar a un método que abre un selector
   });
   menu.append("div")
   .text("🖍️ Cambiar color de texto")
   .style("padding", "4px 0")
   .style("cursor", "pointer")
   .on("click", () => {
    menu.remove(); // cerrar el menú
    this.mostrarSelectorColorTexto(); // 👈 método nuevo
   });
   menu.append("div")
   .text(this.nodo.importante ? "✔️ Desmarcar importante" : "✔️ Marcar como importante")
   .style("padding", "4px 0")
   .style("cursor", "pointer")
   .on("click", () => {
    menu.remove();
    this.nodo.importante = !this.nodo.importante;
    this.toggleImportante(); // 👈 método que crearemos
    if(this.nodo.id === null) return;
    API.actualizarNodo(this.nodo).then(() => {
      console.log("Importante actualizado correctamente");
    }).catch(error => {
      console.error('Error al actualizar el estado importante del nodo:', error);
      alert('Error al actualizar el estado importante del nodo. Inténtalo de nuevo.');
    });
  });

   // Cierra el menú al hacer clic fuera
   const cerrarMenu = (event) => {
    if (!menu.node().contains(event.target)) {
      menu.remove();
      window.removeEventListener("click", cerrarMenu);
    }
   };
   window.addEventListener("click", cerrarMenu);
  }
  mostrarSelectorDeColor() {
   // Eliminar si ya hay uno abierto
   d3.select(".selector-color").remove();

   const selector = d3.select("body")
    .append("input")
    .attr("type", "color")
    .attr("class", "selector-color")
    .style("position", "absolute")
    .style("left", `${this.x}px`)
    .style("top", `${this.y}px`)
    .style("z-index", "10000")
    .node();

   selector.addEventListener("input", (e) => {
    const nuevoColor = e.target.value;
    this.elementos.fondo.attr("fill", nuevoColor);
    this.elementos.fondo.attr("stroke", nuevoColor); // Cambiar el borde también
    this.nodo.color = nuevoColor; // Guardar el color en el nodo
    try{selector.remove();}catch(e){console.warn("Selector de color ya eliminado");}
    if(this.nodo.id === null) return;
    API.actualizarNodo(this.nodo).then(() => {
      console.log("Color actualizado correctamente");
    }).catch(error => {
      console.error('Error al actualizar el color del nodo:', error);
      alert('Error al actualizar el color del nodo. Inténtalo de nuevo.');
    });
   });

   // Si el usuario cierra el selector sin elegir, eliminarlo
   selector.addEventListener("blur", () => {
    selector.remove();
   });
   selector.focus(); // Abrir el selector de color
  
  
 }
 mostrarSelectorColorTexto() {
  // Eliminar si ya hay uno abierto
  d3.select(".selector-color-texto").remove();

  const selector = d3.select("body")
    .append("input")
    .attr("type", "color")
    .attr("class", "selector-color-texto")
    .style("position", "absolute")
    .style("left", `${this.x}px`)
    .style("top", `${this.y}px`)
    .style("z-index", "10000")
    .node();

  selector.addEventListener("input", (e) => {
    const nuevoColor = e.target.value;

    // Aplicar color al texto visual
    this.elementos.titulo.style("color", nuevoColor);
    this.elementos.descripcion.style("color", nuevoColor);

    // Guardar en el nodo
    this.nodo.colorTexto = nuevoColor;

    try { selector.remove(); } catch(e) {}

    // Si está guardado en BD, actualizar
    if (this.nodo.id === null) return;
    API.actualizarNodo(this.nodo).then(() => {
      console.log("Color de texto actualizado correctamente");
    }).catch(error => {
      console.error('Error al actualizar el color del texto:', error);
      alert('Error al actualizar el color del texto. Inténtalo de nuevo.');
    });
  });

  selector.addEventListener("blur", () => {
    selector.remove();
  });

  selector.focus();
 }
 toggleImportante() {
  if (this.elementos.checkIcono) {
    this.elementos.checkIcono.remove();
    this.elementos.checkIcono = null;
  }

  if (this.nodo.importante) {
    this.elementos.checkIcono = this.grupo.append("foreignObject")
    .attr("x", this.rectW / 2 - 38) // posición en esquina superior derecha
    .attr("y", -this.rectH / 2 + 6)
    .attr("width", 24)
    .attr("height", 24)
    .append("xhtml:img")
    .attr("src", "/images/checkNode-icon.png") // 🔁 Ruta a tu imagen
    .style("width", "24px")
    .style("height", "24px")
    .style("pointer-events", "none") // para que no interfiera con clicks
    .style("opacity", "0.9");
  }
}

}