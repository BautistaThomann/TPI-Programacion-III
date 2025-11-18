import { obtenerSesion, requerirUsuario } from "../auth.js";
requerirUsuario();

const usuario = obtenerSesion();

// le pasamos los datos de la cuenta actual
document.getElementById("msjBienvenida").textContent = usuario.nombre;
document.getElementById("datoNombre").textContent = usuario.nombre;
document.getElementById("datoEmail").textContent = usuario.email;
document.getElementById("datoRol").textContent = usuario.rol;

// el boton para cambiar contraseña
document.getElementById("btnCambiarPass").addEventListener("click", () => {
    window.location.href = "./ingreso/cambiar-contrasenia.html";
});
