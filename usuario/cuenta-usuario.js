import { obtenerSesion } from "../auth.js";

const usuario = obtenerSesion();

// si no hay sesión, redirigimos al login
if (!usuario) {
    alert("Debes iniciar sesión para acceder a esta página.");
    window.location.href = "../ingreso/inicio-sesion.html";
}

// controlamos si es usu
if (usuario.rol !== "user") {
    alert("No tenés permisos para acceder a esta página.");
    window.location.href = "index.html"; // sino, lo mandamos al index normal
}

// le pasamos los datos de la cuenta actual
document.getElementById("msjBienvenida").textContent = usuario.nombre;
document.getElementById("datoNombre").textContent = usuario.nombre;
document.getElementById("datoEmail").textContent = usuario.email;
document.getElementById("datoRol").textContent = usuario.rol;

// el boton para cambiar contraseña
document.getElementById("btnCambiarPass").addEventListener("click", () => {
    window.location.href = "./ingreso/cambiar-contrasenia.html";
});
