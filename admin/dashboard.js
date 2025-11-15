import { obtenerSesion } from "../auth.js";

const admin = obtenerSesion();

const btnGestionarUsuarios = document.getElementById("gestionar-usuarios");
const btnGestionarCursos = document.getElementById("gestionar-cursos");

btnGestionarUsuarios.addEventListener("click", () => {
    window.location.href = "gestionar-usuarios.html";
});

btnGestionarCursos.addEventListener("click", () => {
    window.location.href = "gestionar-cursos.html";
});

document.getElementById("mensaje-h1").textContent = `Hola, ${admin.nombre}`;
document.getElementById("mensaje-p").innerHTML = `<span>Rol:</span> ${admin.rol} - <span>Email:</span> ${admin.email}` ;