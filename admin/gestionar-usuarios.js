import { crearUsuarios, obtenerUsuariosPorEmail, eliminarUsuario } from "../api.js";

const formAgregar = document.getElementById("formAgregar");
const formEliminar = document.getElementById("formEliminar");

formAgregar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = formAgregar.querySelector('#nombreAgregar').value.trim();
    const email = formAgregar.querySelector('#emailAgregar').value.trim();
    const contrasenia = formAgregar.querySelector('#contraseniaAgregar').value.trim();
    const rolRadio = formAgregar.querySelector('input[name="rol"]:checked');
    const rol = rolRadio ? rolRadio.value : "";

    if (!nombre || !email || !contrasenia || !rol) {
        alert("Complete todos los campos y seleccione un rol.");
        return;
    }

    const nuevoUsuario = { nombre, email, contrasenia, rol };

    try {
        const data = await crearUsuarios(nuevoUsuario);
        console.log("Usuario creado:", data);
        alert("Usuario creado correctamente.");
        formAgregar.reset();
    } catch (error) {
        console.error(error);
        alert("Error al agregar el usuario.");
    }
});

//FALTA HACER Q SE MUESTRE UNA CARD CON LOS DATOS
formEliminar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = formEliminar.querySelector("#emailEliminar").value.trim();

    if (!email) {
        alert("Ingrese un email para eliminar.");
        return;
    }

    try {
        const usuarios = await obtenerUsuariosPorEmail(email);

        if (usuarios.length === 0) {
            alert("No se encontró ningún usuario con ese email.");
            return;
        }

        const usuario = usuarios[0]; 

        await eliminarUsuario(usuario.id);

        alert(`Usuario: ${usuario.nombre} con email: ${usuario.email} y rol: ${usuario.rol} eliminado correctamente.`);
        formEliminar.reset();

    } catch (error) {
        console.error(error);
        alert("Error al eliminar el usuario.");
    }
});


