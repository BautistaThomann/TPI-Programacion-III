import { obtenerUsuariosPorEmail } from "../api.js";
import { guardarSesion } from "../auth.js";

const form = document.getElementById("formLogin");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const contrasenia = form.contrasenia.value.trim();

    if (!email || !contrasenia) {
        Swal.fire({
            icon: "question",
            title: "Se deben completar todos los campos.",
        });
        return;
    }

    const usuarios = await obtenerUsuariosPorEmail(email);

    if (usuarios.length === 0) {
        Swal.fire({
            icon: "error",
            title: "No existe un usuario con ese email.",
        });
        return;
    }

    const usuario = usuarios[0];

    if (usuario.contrasenia !== contrasenia) {
        Swal.fire({
            icon: "error",
            title: "Contraseña incorrecta.",
        });
        return;
    }

    guardarSesion(usuario);

    if (usuario.rol === "admin") {
        await Swal.fire({
            icon: "success",
            title: "Logeo exitoso.",
        });
        window.location.href = "../admin/vista-inicial.html";
    } else {
        await Swal.fire({
            icon: "success",
            title: "Logeo exitoso.",
        });
        window.location.href = "../usuario/vista-inicial.html";
    }
});
