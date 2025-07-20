const registerButton = document.querySelector('.register-button');
const loginButton = document.querySelector('.login-button');

registerButton.addEventListener('click', () => {
    window.location.href = '/register';
});
loginButton.addEventListener('click', () => {
    window.location.href = '/login';
})
