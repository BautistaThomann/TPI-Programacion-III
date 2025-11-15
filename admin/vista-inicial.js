import { cerrarSesion } from "../auth.js";

const linkCerrar = document.getElementById("cerrarSesion");

linkCerrar.addEventListener("click", (e) => {
    e.preventDefault();
    cerrarSesion();
});