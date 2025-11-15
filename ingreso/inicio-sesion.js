import { obtenerUsuariosPorEmail } from "../api.js";
import { guardarSesion } from "../auth.js";

const form = document.getElementById("formLogin");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const contrasenia = form.contrasenia.value.trim();

    if (!email || !contrasenia) {
        alert("Complete todos los campos.");
        return;
    }

    const usuarios = await obtenerUsuariosPorEmail(email);

    if (usuarios.length === 0) {
        alert("No existe un usuario con ese email.");
        return;
    }

    const usuario = usuarios[0];

    if (usuario.contrasenia !== contrasenia) {
        alert("Contraseña incorrecta.");
        return;
    }

    guardarSesion(usuario);

    if (usuario.rol === "admin") {
        window.location.href = "../admin/vista-inicial.html";
    } else {
        window.location.href = "../usuario/vista-inicial.html";
    }
});
