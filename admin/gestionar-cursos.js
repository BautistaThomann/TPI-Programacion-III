import { crearCursos, obtenerCursos, obtenerInscripciones, eliminarCurso } from "../api.js";
import { obtenerSesion } from "../auth.js";

const usuario = obtenerSesion();

// si no hay sesión, redirigimos al login
if (!usuario) {
    alert("Debes iniciar sesión para acceder a esta página.");
    window.location.href = "../ingreso/inicio-sesion.html";
}

// controlamos si es admin
if (usuario.rol !== "admin") {
    alert("No tenés permisos para acceder a esta página.");
    window.location.href = "index.html"; // sino, lo mandamos al index normal
}

const form = document.getElementById("formCrearCurso");

// son todos para el preview
const previewTitulo = document.getElementById("preview-titulo");
const previewDescripcion = document.getElementById("preview-descripcion");
const previewDuracion = document.getElementById("preview-duracion");
const previewCupos = document.getElementById("preview-cupos");
const inputTitulo = document.getElementById("tituloCurso");
const inputDescripcion = document.getElementById("descripcion");
const inputDuracion = document.getElementById("duracion");
const inputCupos = document.getElementById("cupos");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("tituloCurso").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const duracion = document.getElementById("duracion").value.trim();
    const cupos = document.getElementById("cupos").value.trim();

    if (!titulo || !descripcion || !duracion || !cupos) {
        alert("Complete todos los campos.");
        return;
    }

    const nuevoCurso = {
        titulo,
        descripcion,
        duracion,
        cupos
    };

    try {
        await crearCursos(nuevoCurso);
        alert("Curso creado correctamente.");
        document.getElementById("formCrearCurso").reset();
        actualizarPreview();
        mostrarCursosSinInscripciones();

    } catch (error) {
        console.error(error);
        alert("Hubo un error al crear el curso.");
    }
});

function actualizarPreview() {
    previewTitulo.textContent = inputTitulo.value || "Título del curso.";
    previewDescripcion.textContent = inputDescripcion.value || "Descripción del curso.";
    previewDuracion.textContent = inputDuracion.value ? inputDuracion.value + " semanas" : "Duración.";
    previewCupos.textContent = inputCupos.value ? inputCupos.value + " cupos" : "Cupos disponibles.";
}

// para que cada vez q escribamos en el input se actualice la card
[inputTitulo, inputDescripcion, inputDuracion, inputCupos].forEach(input => {
    input.addEventListener("input", actualizarPreview);
});

actualizarPreview();

async function mostrarCursosSinInscripciones() {
    const contenedor = document.getElementById("cards");
    const mensaje = document.getElementById("mensaje");

    contenedor.innerHTML = "";
    mensaje.textContent = "";

    const cursos = await obtenerCursos();
    const inscripciones = await obtenerInscripciones();

    // obtenemos los cursos que si tienen inscripciones
    const cursosConInscriptos = new Set(inscripciones.map(i => i.id_curso));

    // filtrar los cursos que no estan en el set
    const cursosSinInscriptos = cursos.filter(curso => !cursosConInscriptos.has(curso.id));

    if (cursosSinInscriptos.length === 0) {
        mensaje.textContent = "No existen cursos sin postulantes.";
        return;
    }

    cursosSinInscriptos.forEach(curso => {
        const card = document.createElement("div");
        card.className = "card-eliminar";
        card.innerHTML = `
            <h3>${curso.titulo}</h3>
            <p>${curso.descripcion}</p>
            <button class="btn-eliminar" data-id="${curso.id}">Eliminar</button>
        `;

        contenedor.appendChild(card);
    });

    // accion para borrar el curso o los cursos que aparezcan sin inscripciones
    contenedor.addEventListener("click", async (e) => {
        if (!e.target.classList.contains("btn-eliminar")) return;

        const id = e.target.dataset.id;

        if (confirm("¿Seguro que querés eliminar este curso?")) {
            await eliminarCurso(id);
            mostrarCursosSinInscripciones(); // recarga la lista
        }
    });
}

// ejecutar siempre al cargar la página
mostrarCursosSinInscripciones();

