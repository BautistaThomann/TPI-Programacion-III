import { cerrarSesion, obtenerSesion } from "../auth.js";
import { obtenerCursos, urlInscripciones } from "../api.js";

const usuario = obtenerSesion();

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

const linkCerrar = document.getElementById("cerrarSesion");
const btnMiCuenta = document.getElementById("miCuenta");
const contCards = document.getElementById("contenedor-cards");
const inscripcionesURL = await urlInscripciones();

// links de la barra de navegacion
linkCerrar.addEventListener("click", (e) => {
    e.preventDefault();
    cerrarSesion();
});

btnMiCuenta.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "cuenta-usuario.html";
});

// cargamos los cursos
async function cargarCursos() {
    try {
        const cursos = await obtenerCursos();

        if (cursos.length === 0) {
            contCards.innerHTML = `
                <p class="no-cursos">No hay cursos cargados todavía.</p>
            `;
            return;
        }

        contCards.innerHTML = "";

        cursos.forEach(curso => {
            const card = document.createElement("div");
            card.classList.add("cards");

            card.innerHTML = `
                <h3>${curso.titulo}</h3>
                <p><span>Descripción:</span> ${curso.descripcion}</p>
                <p><span>Duración:</span> ${curso.duracion} semanas</p>
                <button class="btn-inscribirse" data-id="${curso.id}">Inscribirse</button>
            `;

            const btn = card.querySelector(".btn-inscribirse");
            btn.addEventListener("click", () => inscribirse(curso.id));

            contCards.appendChild(card);
        });

    } catch (error) {
        console.error("Error al cargar cursos:", error);
        contCards.innerHTML = `
            <p class="error-cursos">Error al obtener los cursos. Intente más tarde.</p>
        `;
    }
}
cargarCursos();

// funcion de inscripcion + restamos cupos de paso
async function inscribirse(idCurso) {

    const usuarioLogueado = obtenerSesion();

    if (!usuarioLogueado) {
        alert("Debes iniciar sesión para inscribirte.");
        return;
    }

    const idUsuario = usuarioLogueado.id;

    // obtenemos las inscripciones
    const resIns = await fetch(inscripcionesURL);
    const todas = await resIns.json();

    // validacion, 
    const yaInscripto = todas.some(i =>
        i.id_usuario == idUsuario &&
        i.id_curso == idCurso &&
        (i.estado === "pendiente" || i.estado === "aprobada")
    );

    if (yaInscripto) {
        alert("Ya estás inscripto en este curso.");
        return;
    }

    // creamos la inscripcion
    const nuevaInscripcion = {
        id_usuario: idUsuario,
        id_curso: idCurso,
        estado: "pendiente"
    };

    await fetch(inscripcionesURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaInscripcion),
    });

    alert("Has enviado tu solicitud de inscripción.");
}

