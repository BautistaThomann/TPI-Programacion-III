import { crearCursos } from "../api.js";

const btnAgregar = document.getElementById("agregar");

btnAgregar.addEventListener("click", async () => {

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
        alert("Curso creado correctamente!");
        document.getElementById("formCrearCurso").reset();

    } catch (error) {
        console.error(error);
        alert("Hubo un error al crear el curso.");
    }
});

