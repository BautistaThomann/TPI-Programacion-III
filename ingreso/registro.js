import { crearUsuarios, obtenerUsuariosPorEmail } from "../api.js";

const form = document.getElementById("formRegistro");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = form.nombre.value.trim();
    const email = form.email.value.trim();
    const contrasenia = form.contrasenia.value.trim();

    if (!nombre || !email || !contrasenia) {
        await Swal.fire({
            icon: "warning",
            title: "Todos los campos son obligatorios.",
        });
        return;
    }

    const existentes = await obtenerUsuariosPorEmail(email);

    if (existentes.length > 0) {
        await Swal.fire({
            icon: "error",
            title: "El email ya está registrado",
            text: "Por favor, usá otro email."
        });
        return;
    }

    const datos = {
        nombre,
        email,
        contrasenia,
        rol: "user"
    };

    await crearUsuarios(datos);

    await Swal.fire({
        title: "Registro exitoso!",
        text: "Hacé click para continuar",
        icon: "success",
        confirmButtonText: "Continuar"
    });

    window.location.href = "inicio-sesion.html";
});
