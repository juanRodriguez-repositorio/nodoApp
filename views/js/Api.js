export class API{
    static async obtenerNodos(){
        try {
            const response = await fetch('/nodos', {
            method: 'GET',
            credentials: 'include'  // ⬅️ Esto permite enviar cookies
        });
            if (!response.ok) {
                throw new Error('Error al obtener los nodos');
            }
            return await response.json();
        } catch (error) {
            console.error('Error en obtenerNodos:', error);
            throw error;
        }
    }
    static async crearNodo(nodo,padre) {
        try {
        const response = await fetch('/nodos', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            credentials: 'include', // ✅ para enviar la cookie
            body: JSON.stringify({ ...nodo, padre_id:padre.id }) // ⬅️ se envía el nodo con su padre
        });
        if (!response.ok) {
            throw new Error('Error al crear nodo');
        }
        return await response.json(); // ⬅️ se espera que el backend devuelva el nodo creado con su id
        } catch (error) {
            console.error('Error en crearNodo:', error);
            throw error;
        }
    }
    static async subirArchivo(formData,id) {
        try {
            const response = await fetch(`/adjuntar?id=${id}`, {
                method: 'POST',
                body: formData, // ⬅️ Enviar el FormData y el nodoId
                credentials: 'include'  // ⬅️ Esto permite enviar cookies
            });
            if (!response.ok) {
                throw new Error('Error al subir el archivo');
            }
            return await response.json();
        } catch (error) {
            console.error('Error en subirArchivo:', error);
            throw error;
        }
    }
    static async eliminarArchivo(nodoId,nombreArchivo) {
        try {
            const response = await fetch(`/adjuntos/${nodoId}/${nombreArchivo}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al eliminar archivo');
        }

        return await response.json();
        } catch (error) {
            console.error('Error en eliminarArchivo:', error);
            throw error;
        }
    }
    static async actualizarNodo(nodo) {
        try {
            const response = await fetch(`/nodos/${nodo.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // si necesitas enviar cookies/session
                body: JSON.stringify({
                    titulo: nodo.titulo,
                    descripcion: nodo.descripcion,
                    color: nodo.color || '#4fc3f7',
                    importante: nodo.importante,// ⬅️ enviar el estado de importante
                    colorTexto:nodo.colorTexto // ⬅️ enviar el color de texto
                })
            });

            if (!response.ok) {
                throw new Error('Error al actualizar nodo');
            }
            return await response.json();
        } catch (error) {
            console.error('Error en actualizarNodo:', error);
            throw error;
        }
    }
    static async eliminarNodo(nodoId) {
        try {
            const response = await fetch(`/nodos/${nodoId}`, {
                method: 'DELETE',
                credentials: 'include' // si necesitas enviar cookies/session
            });

            if (!response.ok) {
                throw new Error('Error al eliminar nodo');
            }
            return await response.json();
        } catch (error) {
            console.error('Error en eliminarNodo:', error);
            throw error;
        }
    }
    static async obtenerNombreUsuario() {
        try {
            const response = await fetch('/username', {
                method: 'GET',
                credentials: 'include' // para enviar cookies
            });
            if (!response.ok) {
                throw new Error('Error al obtener el nombre de usuario');
            }
            return await response.json();
        } catch (error) {
            console.error('Error en obtenerNombreUsuario:', error);
            throw error;
        }
    }
    static async cerrarSesion() {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                credentials: 'include' // para enviar cookies
            });
            if (!response.ok) {
                throw new Error('Error al cerrar sesión');
            }
            return await response.json();
        } catch (error) {
            console.error('Error en cerrarSesion:', error);
            throw error;
        }
    }
    static async obtenerNodosRelevantes() {
        try {
            const response = await fetch('/relevantNodes', {
                method: 'GET',
                credentials: 'include' // para enviar cookies
            });
            if (!response.ok) {
                throw new Error('Error al obtener nodos relevantes');
            }
            return await response.json();
        } catch (error) {
            console.error('Error en obtenerNodosRelevantes:', error);
            throw error;
        }
    }
    static async buscarNodoPorTitulo(titulo) {
            try {
                const response = await fetch(`/searchNode?titulo=${encodeURIComponent(titulo)}`, {
                    method: 'GET',
                    credentials: 'include' // para enviar cookies
                });
                if (!response.ok) {
                    throw new Error('Error al buscar nodo por título');
                }
                return await response.json();
            } catch (error) {
                console.error('Error en buscarNodoPorTitulo:', error);
                throw error;
            }
    }

}