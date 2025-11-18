import { obtenerSesion } from "../auth.js";
import { obtenerCursos, obtenerUsuarios, obtenerInscripciones, actualizarInscripcion, actualizarCurso } from "../api.js";

const usuario = obtenerSesion();

// si no hay sesión, redirigimos al login
if (!usuario) {
    alert("Debes iniciar sesión para acceder a esta página.");
    window.location.href = "../ingreso/inicio-sesion.html";
}

// controlamos si es admin
if (usuario.rol !== "admin") {
    alert("No tenés permisos para acceder a esta página.");
    window.location.href = "index.html";
}

const btnGestionarUsuarios = document.getElementById("gestionar-usuarios");
const btnGestionarCursos = document.getElementById("gestionar-cursos");
const contCards = document.getElementById("cont-cards");
const contenedorInscripciones = document.getElementById("cont-inscripciones");

document.getElementById("mensaje-h1").textContent = `Hola, ${usuario.nombre}`;
document.getElementById("mensaje-p").innerHTML = `<span>Rol:</span> ${usuario.rol} - <span>Email:</span> ${usuario.email}`;

// redirecciones
btnGestionarUsuarios.addEventListener("click", () => window.location.href = "gestionar-usuarios.html");
btnGestionarCursos.addEventListener("click", () => window.location.href = "gestionar-cursos.html");


// carga de cursos
async function cargarCursos() {
    try {
        const cursos = await obtenerCursos();

        if (cursos.length === 0) {
            contCards.innerHTML = `<p class="no-cursos">No hay cursos cargados todavía.</p>`;
            return;
        }

        contCards.innerHTML = "";
        cursos.forEach(curso => {
            const card = document.createElement("div");
            card.classList.add("card-curso");
            card.innerHTML = `
                <h3>${curso.titulo}</h3>
                <p><span>Descripción:</span> ${curso.descripcion}</p>
                <p><span>Duración:</span> ${curso.duracion} semanas</p>
                <p><span>Cupos:</span> ${curso.cupos}</p>
                <p><span>ID:</span> ${curso.id}</p>
            `;
            contCards.appendChild(card);
        });

    } catch (error) {
        console.error("Error al cargar cursos:", error);
        contCards.innerHTML = `<p class="error-cursos">Error al obtener los cursos.</p>`;
    }
}
cargarCursos();


document.getElementById("filtro-inscripciones").addEventListener("change", () => {
    cargarInscripcionesGestion();
});


// carga de inscripciones
async function cargarInscripcionesGestion() {
    contenedorInscripciones.innerHTML = "<p>Cargando inscripciones...</p>";

    const [inscripciones, usuarios, cursos] = await Promise.all([
        obtenerInscripciones(),
        obtenerUsuarios(),
        obtenerCursos()
    ]);

    let filtro = document.getElementById("filtro-inscripciones").value;

    let inscripcionesFiltradas = inscripciones;

    if (filtro !== "todas") {
        inscripcionesFiltradas = inscripciones.filter(i => i.estado === filtro);
    }

    if (inscripcionesFiltradas.length === 0) {
        contenedorInscripciones.innerHTML = "<p>No hay inscripciones con ese estado.</p>";
        return;
    }

    contenedorInscripciones.innerHTML = "";

    inscripcionesFiltradas.forEach(inscripcion => {
        const usuario = usuarios.find(u => u.id === inscripcion.id_usuario);
        const curso = cursos.find(c => c.id === inscripcion.id_curso);

        crearCardInscripcion(inscripcion, usuario, curso);
    });
}



// creamos la card de inscripcion mediante dom
function crearCardInscripcion(inscripcion, usuario, curso) {
    const card = document.createElement("div");
    card.classList.add("inscripcion");

    card.innerHTML = `
        <h3>Inscripción</h3>
        <p><span>Usuario:</span> ${usuario?.nombre ?? "Desconocido"}</p>
        <p><span>Email:</span> ${usuario?.email ?? "Desconocido"}</p>
        <p><span>Curso:</span> ${curso?.titulo ?? "Desconocido"}</p>
        <p><span>Cupos disponibles:</span> ${curso.cupos}</p>
        <p><span>Estado actual:</span> ${inscripcion.estado}</p>

        <div class="acciones">
            <button class="btn-aprobar">Aprobar</button>
            <button class="btn-rechazar">Rechazar</button>
        </div>
    `;

    contenedorInscripciones.appendChild(card);

    const btnAprobar = card.querySelector(".btn-aprobar");
    const btnRechazar = card.querySelector(".btn-rechazar");

    // aprobamos la inscripcion, con validaciones
    btnAprobar.addEventListener("click", async () => {

        try {
            if (inscripcion.estado === "aprobada") {
                alert("Esta inscripción ya está aprobada.");
                btnAprobar.disabled = true;
                return;
            }

            const cursos = await obtenerCursos();
            const cursoActual = cursos.find(c => c.id == curso.id);

            if (!cursoActual) {
                alert("No se encontró el curso asociado.");
                return;
            }

            if (cursoActual.cupos <= 0) {
                alert("No quedan cupos disponibles.");
                return;
            }

            await actualizarInscripcion(inscripcion.id, { estado: "aprobada" });

            // restar cupo si antes no estaba aprobada
            const nuevosCupos = cursoActual.cupos - 1;
            await actualizarCurso(cursoActual.id, { ...cursoActual, cupos: nuevosCupos });

            alert("Inscripción aprobada.");

            await cargarCursos();
            await cargarInscripcionesGestion();
            await crearOGraficoInscripciones();

        } catch (err) {
            console.error(err);
            alert("Error al aprobar inscripción.");
        }
    });


    // la rechazamos, con validaciones tmb
    btnRechazar.addEventListener("click", async () => {
        try {
            if (inscripcion.estado === "rechazada") {
                alert("Esta inscripción ya está rechazada.");
                btnRechazar.disabled = true;
                return;
            }

            const cursos = await obtenerCursos();
            const cursoActual = cursos.find(c => c.id == curso.id);

            // devolver cupo si estaba aprobada
            if (inscripcion.estado === "aprobada" && cursoActual) {
                const nuevosCupos = Number(cursoActual.cupos) + 1;
                await actualizarCurso(cursoActual.id, { ...cursoActual, cupos: nuevosCupos });
            }

            await actualizarInscripcion(inscripcion.id, { estado: "rechazada" });

            alert("Inscripción rechazada.");

            await cargarCursos();
            await cargarInscripcionesGestion();
            await crearOGraficoInscripciones();

        } catch (error) {
            console.error(error);
            alert("Error al rechazar inscripción.");
        }
    });
}


// grafico
async function obtenerConteoEstados() {
    const inscripciones = await obtenerInscripciones();
    const estados = { pendiente: 0, aprobada: 0, rechazada: 0, cancelada: 0 };

    inscripciones.forEach(ins => {
        if (estados[ins.estado] !== undefined) estados[ins.estado]++;
    });

    return estados;
}

let graficoInscripciones;

async function crearOGraficoInscripciones() {
    const estados = await obtenerConteoEstados();
    const ctx = document.getElementById("graficoInscripciones");

    const data = [
        estados.pendiente,
        estados.aprobada,
        estados.rechazada,
        estados.cancelada
    ];

    if (graficoInscripciones) {
        graficoInscripciones.data.datasets[0].data = data;
        graficoInscripciones.update();
        return;
    }

    graficoInscripciones = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Pendiente", "Aprobada", "Rechazada", "Cancelada"],
            datasets: [{
                label: "Cantidad de inscripciones",
                data: data,
                backgroundColor: [
                    "rgba(255, 206, 86, 0.6)",
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(201, 203, 207, 0.6)"
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true },
                x: { ticks: { font: { size: 12, weight: 'bold' } } }
            },
            plugins: {
                legend: {
                    labels: { font: { size: 12, weight: 'bold' } }
                }
            }
        }
    });
}

crearOGraficoInscripciones();
cargarInscripcionesGestion();
