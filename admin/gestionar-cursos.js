import { crearCursos } from "../api.js";

const btnAgregar = document.getElementById("agregar");
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