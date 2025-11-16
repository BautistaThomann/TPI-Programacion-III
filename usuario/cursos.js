import { obtenerSesion } from "../auth.js";
import { obtenerInscripciones, actualizarInscripcion, actualizarCurso, urlCursos, urlInscripciones} from "../api.js";

const usuario = obtenerSesion();
const contenedor = document.getElementById("cont-cards");
const cursos = await urlCursos(); 

// si no hay sesión, redirigimos al login
if (!usuario) {
    alert("Debes iniciar sesión para acceder a esta página.");
    window.location.href = "../ingreso/inicio-sesion.html";
}

// controlamos si es usu
if (usuario.rol !== "user") {
    alert("No tenés permisos para acceder a esta página.");
    window.location.href = "index.html"; // sino, lo mandamos al index normal
}

document.getElementById("msjBienvenida").textContent = "Bienvenido/a";

async function cargarInscripciones() {
    const inscripciones = await obtenerInscripciones();
    const inscripcionesUsuario = inscripciones.filter(i => i.id_usuario == usuario.id);

    if (inscripcionesUsuario.length === 0) {
        contenedor.innerHTML = "<p>No tienes inscripciones todavía.</p>";
        return;
    }

    for (const inscripcion of inscripcionesUsuario) {
        await crearCardInscripcion(inscripcion);
    }
}
cargarInscripciones();

async function crearCardInscripcion(inscripcion) {

    const curso = await fetch(`${cursos}/${inscripcion.id_curso}`).then(r => r.json());

    const card = document.createElement("div");
    card.classList.add("card-inscripcion");
    card.innerHTML = `
        <h3>${curso.titulo}</h3>
        <p><span>Descripción:</span> ${curso.descripcion}</p>
        <p><span>Duración:</span> ${curso.duracion} semanas</p>
        <p><span>Estado:</span> ${inscripcion.estado}</p>
        <button class="btn-cancelar" data-id="${inscripcion.id}">Cancelar inscripción</button>
    `;
    contenedor.appendChild(card);
    card.querySelector(".btn-cancelar").addEventListener("click", () => {
        cancelarInscripcion(inscripcion.id, inscripcion.id_curso);
    });
}

async function cancelarInscripcion(idInscripcion, idCurso) {
    const confirmar = confirm("¿Seguro que quieres cancelar tu inscripción?");
    if (!confirmar) return;

    try {
        const url = await urlInscripciones();

        // traemos la inscripcion completa
        const inscripcion = await fetch(`${url}/${idInscripcion}`).then(r => r.json());

        // si está rechazada, no permitimos cancelar cancelar
        if (inscripcion.estado === "rechazada") {
            alert(`No puedes cancelar esta inscripción porque su estado es: ${inscripcion.estado}.`);
            return;
        }

        // traer curso
        const curso = await fetch(`${cursos}/${idCurso}`).then(r => r.json());

        // si estaba aprobada, devolver cupo
        if (inscripcion.estado === "aprobada") {
            const cursoActualizado = {
                ...curso,
                cupos: Number(curso.cupos) + 1
            };

            await actualizarCurso(idCurso, cursoActualizado);
        }

        // actualizar inscripción a cancelada (no la borramos)
        await actualizarInscripcion(idInscripcion, { ...inscripcion, estado: "cancelada" });

        alert("Inscripción cancelada correctamente.");
        
        location.reload();

    } catch (error) {
        console.error(error);
        alert("Error al cancelar la inscripción.");
    }
}




