class Stack {
  constructor() {
    this.items = []; // Usamos un arreglo para almacenar los elementos
  }

  // Agrega un elemento al tope de la pila
  push(element) {
    this.items.push(element);
  }

  // Elimina y retorna el elemento del tope
  pop() {
    if (this.isEmpty()) {
      throw new Error("La pila está vacía");
    }
    return this.items.pop();
  }

  // Retorna el elemento del tope sin eliminarlo
  peek() {
    if (this.isEmpty()) {
      throw new Error("La pila está vacía");
    }
    return this.items[this.items.length - 1];
  }

  // Verifica si la pila está vacía
  isEmpty() {
    return this.items.length === 0;
  }

  // Retorna el tamaño de la pila
  size() {
    return this.items.length;
  }

  // Vacía la pila
  clear() {
    this.items = [];
  }
}