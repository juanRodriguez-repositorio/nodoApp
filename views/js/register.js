const form = document.querySelector('.form');
const inputName = document.getElementById('username');
const inputPassword = document.getElementById('password');
const message = document.querySelector('.message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = inputName.value.trim();
    const password = inputPassword.value.trim();

    if (!username || !password) {
      message.textContent = 'Por favor completa todos los campos.';
      message.style.color = 'red';
      return;
    }else if (password.length < 6) {
      message.textContent = 'La contraseña debe tener al menos 6 caracteres.';
      message.style.color = 'red';
      inputPassword.value = '';
      inputName.value = '';
      return;
    }else if (username.length < 4 ) {
      message.textContent = 'El nombre de usuario debe tener al menos 4 caracteres.';
      message.style.color = 'red';
      return;
    }else{
        message.textContent = 'cargando...';
        message.style.color = '#333';
    }

    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })
      .then(res => {
        return res.json();
      })
      .then(data => {
        message.textContent = data.message;
        if(data.success) {
          message.style.color = 'green';
        }else {
          message.style.color = 'red';
        }
        inputName.value = '';
        inputPassword.value = '';
      });

    } catch (error) {
      console.error('Error al registrar:', error);
      message.textContent = 'Error en el servidor, intenta mas tarde.';
      message.style.color = 'red';
    }
});