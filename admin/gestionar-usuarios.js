import { crearUsuarios, obtenerUsuariosPorEmail, eliminarUsuario, obtenerInscripciones, obtenerCursos, darDeBajaInscripcion, actualizarCurso } from "../api.js";
import { requerirAdmin } from "../auth.js";
requerirAdmin();

const formAgregar = document.getElementById("formAgregar");
const formEliminar = document.getElementById("formEliminar");
const formActualizar = document.getElementById("formActualizar");
const contCards = document.getElementById("cont-card-usuario-eliminar");
const contCards2 = document.getElementById("cont-card-usuario-actualizar");
const inputEmail = document.getElementById("emailEliminar");
const inputEmail2 = document.getElementById("emailActualizarUsuario");

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


formEliminar.addEventListener("submit", async (e) => {
    e.preventDefault();
    contCards.innerHTML = "";

    const email = inputEmail.value.trim();

    if (!email) {
        alert("Ingrese un email para buscar.");
        return;
    }

    try {
        const usuarios = await obtenerUsuariosPorEmail(email);

        if (usuarios.length === 0) {
            alert("No se encontró ningún usuario con ese email.");
            return;
        }

        const usuario = usuarios[0];

        // creamos la card
        const card = document.createElement("div");
        card.id = `card-${usuario.id}`;
        card.className = "card texto";
        card.innerHTML = `
            <p><span>Nombre:</span> ${usuario.nombre}</p>
            <p><span>Email:</span> ${usuario.email}</p>
            <p><span>Rol:</span> ${usuario.rol}</p>
            <button id="btnEliminar-${usuario.id}">Eliminar</button>
        `;
        contCards.appendChild(card);

        // agregamos el evento al boton
        const btnEliminar = document.getElementById(`btnEliminar-${usuario.id}`);
        btnEliminar.className = "boton-card";
        btnEliminar.addEventListener("click", async () => {
            try {
                const confirmar = confirm(`¿Seguro que querés eliminar al usuario ${usuario.nombre}?`);
                if (!confirmar) return;

                // traemos todas las inscripciones del usuario
                const inscripciones = await obtenerInscripciones();
                const inscripcionesUsuario = inscripciones.filter(i => i.id_usuario === usuario.id);

                // traemos todos los cursos (para devolver cupos)
                const cursos = await obtenerCursos();

                for (const insc of inscripcionesUsuario) {

                    // si su inscripcion estaba aprobada, devolvemos el cupo
                    if (insc.estado === "aprobada") {
                        const curso = cursos.find(c => c.id === insc.id_curso);
                        if (curso) {
                            curso.cupos++;                   // devolver cupo
                            await actualizarCurso(curso.id, curso);
                        }
                    }

                    // eliminamos la inscripción
                    await darDeBajaInscripcion(insc.id);
                }

                // por ultimo eliminamos al usuario
                await eliminarUsuario(usuario.id);

                alert(`Usuario ${usuario.nombre} eliminado correctamente.`);

                const cardEliminar = document.getElementById(`card-${usuario.id}`);
                cardEliminar.innerHTML = ""; // limpiamos la card
                inputEmail.value = "";

            } catch (error) {
                console.error(error);
                alert("Error al eliminar el usuario.");
            }
        });


    } catch (error) {
        console.error(error);
        alert("Error al buscar el usuario.");
    }
});

formActualizar.addEventListener("submit", async (e) => {
    e.preventDefault();
    contCards2.innerHTML = "";

    const email = inputEmail2.value.trim();

    if (!email) {
        alert("Ingrese un email para buscar.");
        return;
    }

    try {
        const usuarios = await obtenerUsuariosPorEmail(email);

        if (usuarios.length === 0) {
            alert("No se encontró ningún usuario con ese email.");
            return;
        }

        const usuario = usuarios[0];

        // creamos la card
        const card = document.createElement("div");
        card.id = `card-${usuario.id}`;
        card.className = "card texto";
        card.innerHTML = `
            <p><span>Nombre:</span> ${usuario.nombre}</p>
            <p><span>Email:</span> ${usuario.email}</p>
            <p><span>Rol:</span> ${usuario.rol}</p>
            <button id="btnCambiar-${usuario.id}">Cambiar contraseña</button>
        `;
        contCards2.appendChild(card);

        // evento del boton
        const btnCambiar = document.getElementById(`btnCambiar-${usuario.id}`);
        btnCambiar.className = "boton-card";

        btnCambiar.addEventListener("click", () => {
            // redirige
            window.location.href = `../ingreso/cambiar-contrasenia.html`;
        });

    } catch (error) {
        console.error(error);
        alert("Error al buscar el usuario.");
    }
});


