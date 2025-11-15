import { obtenerUsuariosPorEmail, actualizarUsuario } from "../api.js";
import { obtenerSesion, guardarSesion } from "../auth.js";

const form = document.getElementById("formCambiarPass");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const nuevaPass = form.contrasenia.value.trim();
    const confirmarPass = form.contraseniaConfirmada.value.trim();

    // para que se necesiten completar todos los campos
    if (!email || !nuevaPass || !confirmarPass) {
        alert("Complete todos los campos.");
        return;
    }

    if (nuevaPass !== confirmarPass) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    // buscamos al usu
    const usuarios = await obtenerUsuariosPorEmail(email);

    if (usuarios.length === 0) {
        alert("No existe un usuario con ese email.");
        return;
    }

    const usuario = usuarios[0];

    const datosActualizados = {
        ...usuario,
        contrasenia: nuevaPass      // reemplazamos la contraseña
    };

    await actualizarUsuario(usuario.id, datosActualizados);

    alert("Contraseña cambiada correctamente.");
    
    // actualizar la sesión actual si es el mismo usuario
    const sesionActual = obtenerSesion();
    if (sesionActual && sesionActual.email === usuario.email) {
        guardarSesion({ ...sesionActual, contrasenia: nuevaPass });
    }

    // redirigir según rol real
    if (usuario.rol === "admin") {
        window.location.href = "../admin/vista-inicial.html";
    } else {
        window.location.href = "../usuario/vista-inicial.html";
    }
});