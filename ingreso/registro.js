import { crearUsuarios } from "../api.js";

const form = document.getElementById("formRegistro");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const datos = {
        nombre: form.nombre.value,
        email: form.email.value,
        contrasenia: form.contrasenia.value,
        rol: "user"
    };

    await crearUsuarios(datos);

    alert("Usuario registrado correctamente.");
    window.location.href = "inicio-sesion.html";
});
