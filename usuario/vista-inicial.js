import { cerrarSesion } from "../auth.js";

const linkCerrar = document.getElementById("cerrarSesion");
const btnMiCuenta = document.getElementById("miCuenta");

linkCerrar.addEventListener("click", (e) => {
    e.preventDefault();
    cerrarSesion();
});

btnMiCuenta.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "cuenta-usuario.html"; 
});
