import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { ArbolVisualController } from './ArbolVisualController.js';
import { API } from './Api.js';


const menu = document.getElementById("profile-menu");
const profilePic = document.getElementById("profile-pic");
const cerrarSesionElement = document.getElementById("cerrar-sesion");
const temaElement = document.getElementById("tema");
const body = document.querySelector("body");
const pageTitle = document.querySelector(".site-title");
const inputSearch = document.getElementById("searcher");
const searchIcon = document.querySelector(".search-icon");
const raizBoton = document.querySelector(".nav-options_root");
const checkButton=document.querySelector(".nav-options_marked");
const contenerdorListaDeNodos = document.querySelector('.listNodes');
const PROFILE_COLORS = [
  "#6C5CE7", // Purple
  "#00B894", // Teal
  "#0984E3", // Blue
  "#E84393", // Pink
  "#D63031", // Red
  "#F39C12", // Orange
  "#2ECC71", // Green
  "#1ABC9C", // Turquoise
  "#34495E", // Dark blue-gray
  "#8E44AD"  // Deep violet
];
async function getMyName() {
  return await API.obtenerNombreUsuario().then(data => {
    return data.username;
  }).catch(error => {
    console.error('Error al obtener el nombre de usuario:', error);
    return 'err'; // Valor por defecto si hay un error
  })
}
function getProfileColor(username) {
   let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PROFILE_COLORS.length;
  return PROFILE_COLORS[index];;
}
async function setProfileInitial() {
  const username = await getMyName();
  const usernameElement = document.getElementById("menu-username");
  usernameElement.textContent = username; 
  usernameElement.title = username; // Para mostrar el nombre completo al pasar el mouse
  if (username && username.length > 0) {
    const initial = username[0].toUpperCase();
    const bgColor = getProfileColor(username);
    
    profilePic.textContent = initial;
    profilePic.style.backgroundColor = bgColor;
 }
}
profilePic.addEventListener("click", () => {
  const rect = profilePic.getBoundingClientRect();
  menu.style.top = `${rect.bottom + window.scrollY+5}px`;
  menu.style.left = `${rect.left + window.scrollX-100}px`;
  menu.classList.toggle("hidden");
});
// Cerrar si se hace clic fuera
document.addEventListener("click", (e) => {
  if (!profilePic.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.add("hidden");
  }
});

setProfileInitial();
cerrarSesionElement.addEventListener("click", () => {
  API.cerrarSesion().then(() => {
    window.location.href = "/login";
  }).catch(error => {
    console.error('Error al cerrar sesión:', error);
    alert('Error al cerrar sesión. Por favor, inténtalo de nuevo.');
  });
});
temaElement.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
  pageTitle.classList.toggle("dark-mode-title");
  menu.classList.toggle("hidden");
  inputSearch.classList.toggle("dark-mode-searcher");

});
checkButton.addEventListener("click", () => {
  API.obtenerNodosRelevantes().then(nodos => {
    contenerdorListaDeNodos.innerHTML = ''; // Limpiar anterior
    const nodosImportantes = nodos.nodosId;

    if(nodosImportantes.length === 0) {
      const mensaje = document.createElement('div');
      mensaje.textContent = 'No hay nodos marcados';
      mensaje.style.color = '#555';
      mensaje.style.position = 'relative';
      mensaje.style.top = '30%';
      mensaje.style.textAlign = 'center';
      contenerdorListaDeNodos.appendChild(mensaje);

    }else{
      nodosImportantes.forEach(nodo => {
       const item = document.createElement('div');
       item.className = 'listNodes_item';
       item.title=nodo.titulo;

       const colorBox = document.createElement('div');
       colorBox.className = 'listNodes_item_color';
       console.log(nodo);
       colorBox.style.backgroundColor = nodo.color;

       const texto = document.createElement('span');
       texto.textContent = nodo.titulo;

       item.appendChild(colorBox);
       item.appendChild(texto);
       item.addEventListener("click", () => {
        contenerdorListaDeNodos.style.display = 'none'; // Ocultar la lista al hacer clic
        ArbolVisualController.irAnodo(nodo.id);
       });
       contenerdorListaDeNodos.appendChild(item);
     });
    }
     // Posicionar debajo del botón
      const rect = checkButton.getBoundingClientRect();
      contenerdorListaDeNodos.style.top = `${rect.bottom + window.scrollY}px`;
      contenerdorListaDeNodos.style.left = `${rect.left + window.scrollX-50}px`;
      contenerdorListaDeNodos.style.display = 'block';

      const handleClickOutside = (event) => {
        if (!contenerdorListaDeNodos.contains(event.target)) {
          contenerdorListaDeNodos.style.display = 'none';
          window.removeEventListener('click', handleClickOutside);
        }
      }
      window.addEventListener('click', handleClickOutside);

  }).catch(error => {
     console.error('Error al obtener nodos importantes:', error);
  });
});
searchIcon.addEventListener("click", () => {
  const searchTerm = inputSearch.value.trim();
  if (searchTerm) {
    inputSearch.value = ''; // Limpiar el input de búsqueda
    API.buscarNodoPorTitulo(searchTerm).then(result => {
      const nodos=result.nodos;
      contenerdorListaDeNodos.innerHTML = ''; // Limpiar anterior
      if(nodos.length === 0) {
        const mensaje = document.createElement('div');
        mensaje.textContent =`No se encontraron nodos con el título "${searchTerm}"`;
        mensaje.style.color = '#555';
        mensaje.style.position = 'relative';
        mensaje.style.top = '30%';
        mensaje.style.textAlign = 'center';
        contenerdorListaDeNodos.appendChild(mensaje);
      }else{
        console.log(nodos);
        nodos.forEach(nodo => {
          const item = document.createElement('div');
          item.className = 'listNodes_item';
          item.title=nodo.titulo;

          const colorBox = document.createElement('div');
          colorBox.className = 'listNodes_item_color';
          colorBox.style.backgroundColor = nodo.color;

          const texto = document.createElement('span');
          texto.textContent = nodo.titulo;

          item.appendChild(colorBox);
          item.appendChild(texto);
          contenerdorListaDeNodos.appendChild(item);
          item.addEventListener("click", () => {
            contenerdorListaDeNodos.style.display = 'none'; // Ocultar la lista al hacer clic
            ArbolVisualController.irAnodo(nodo.id);
          });
        });
      }
      // Posicionar debajo del input de búsqueda
      const rect = inputSearch.getBoundingClientRect();
      contenerdorListaDeNodos.style.top = `${rect.bottom + window.scrollY}px`;
      contenerdorListaDeNodos.style.left = `${rect.left + window.scrollX-10}px`;
      contenerdorListaDeNodos.style.display = 'block';

      const handleClickOutside = (event) => {
        if (!contenerdorListaDeNodos.contains(event.target)) {
          contenerdorListaDeNodos.style.display = 'none';
          window.removeEventListener('click', handleClickOutside);
        }
      }
      window.addEventListener('click', handleClickOutside);

    }).catch(error => {
      console.error('Error al buscar nodos:', error);
    });
  } else {
    alert('Por favor, ingresa un término de búsqueda.');
  }
})
// Selecciona el SVG

const svg = d3.select("#main");

API.obtenerNodos().then(listaPlano => {
  console.log(listaPlano);
  const nodoRaiz = ArbolVisualController.construirArbolDesdePlano(listaPlano.nodosAgrupados);
  ArbolVisualController.inicializar(svg, nodoRaiz);
}).catch(error => {
  alert('Error al cargar los nodos: Actualiza la pagina');
})
window.addEventListener('resize', () => {
  ArbolVisualController.mostrarNodo(ArbolVisualController.nodoActual);
})
raizBoton.addEventListener("click", () => {
  const nodoRaiz=ArbolVisualController.stackPadres[0]; 
  ArbolVisualController.inicializar(svg, nodoRaiz,true);
})

