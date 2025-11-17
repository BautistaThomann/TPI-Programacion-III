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
    window.location.href = "index.html"; // sino, lo mandamos al index normal
}

const btnGestionarUsuarios = document.getElementById("gestionar-usuarios");
const btnGestionarCursos = document.getElementById("gestionar-cursos");
const contCards = document.getElementById("cont-cards");
const contenedorInscripciones = document.getElementById("cont-inscripciones");

const admin = obtenerSesion();
document.getElementById("mensaje-h1").textContent = `Hola, ${admin.nombre}`;
document.getElementById("mensaje-p").innerHTML = `<span>Rol:</span> ${admin.rol} - <span>Email:</span> ${admin.email}`;

btnGestionarUsuarios.addEventListener("click", () => {
    window.location.href = "gestionar-usuarios.html";
});

btnGestionarCursos.addEventListener("click", () => {
    window.location.href = "gestionar-cursos.html";
});

async function cargarCursos() {
    try {
        const cursos = await obtenerCursos();

        // si no hay cursos
        if (cursos.length === 0) {
            contCards.innerHTML = `
                <p class="no-cursos">No hay cursos cargados todavía.</p>
            `;
            return;
        }

        // si hay cursos, generamos las cards
        contCards.innerHTML = "";

        cursos.forEach(curso => {
            const card = document.createElement("div");
            card.classList.add("card-curso");

            card.innerHTML = `
                <h3>${curso.titulo}</h3>
                <p><span>Descripción:</span> ${curso.descripcion}</p>
                <p><span>Duración:</span> ${curso.duracion} semanas</p>
                <p><span>Cupos:</span> ${curso.cupos}</p>
                <p><span>Id:</span> ${curso.id}</p>
            `;
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


cargarInscripcionesGestion();

async function cargarInscripcionesGestion() {
    contenedorInscripciones.innerHTML = "<p>Cargando inscripciones...</p>";

    const [inscripciones, usuarios, cursos] = await Promise.all([
        obtenerInscripciones(),
        obtenerUsuarios(),
        obtenerCursos()
    ]);

    if (inscripciones.length === 0) {
        contenedorInscripciones.innerHTML = "<p>No hay inscripciones.</p>";
        return;
    }

    contenedorInscripciones.innerHTML = ""; // limpio

    inscripciones.forEach(inscripcion => {
        const usuario = usuarios.find(u => u.id === inscripcion.id_usuario);
        const curso = cursos.find(c => c.id === inscripcion.id_curso);

        crearCardInscripcion(inscripcion, usuario, curso);
    });
}


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

    btnAprobar.addEventListener("click", async () => {
        // evitamos doble click
        btnAprobar.disabled = true;
        btnRechazar.disabled = true;

        try {
            // traemos curso por id
            const cursos = await obtenerCursos();
            const cursoActual = cursos.find(c => c.id == curso.id);

            if (!cursoActual) {
                alert("No se encontró el curso asociado.");
                return;
            }

            if (cursoActual.cupos <= 0) {
                alert("No quedan cupos disponibles para este curso.");
                return;
            }

            // actualizar inscripción a aprobada
            await actualizarInscripcion(inscripcion.id, { estado: "aprobada" });

            // restar 1 cupo y actualizar curso
            const nuevosCupos = cursoActual.cupos - 1;
            await actualizarCurso(cursoActual.id, { ...cursoActual, cupos: nuevosCupos });

            alert("Inscripción aprobada y cupo de curso actualizado.");
            cargarInscripcionesGestion();
            crearOGraficoInscripciones();
        } catch (error) {
            console.error(error);
            alert("Error al aprobar la inscripción.");
        } finally {
            btnAprobar.disabled = false;
            btnRechazar.disabled = false;
        }
    });

    // si rechazamos:
    btnRechazar.addEventListener("click", async () => {
        btnAprobar.disabled = true;
        btnRechazar.disabled = true;

        try {
            // traeemos el curso
            const cursos = await obtenerCursos();
            const cursoActual = cursos.find(c => c.id == curso.id);

            // si la inscripción ya estaba aprobada, devolvemos cupo
            if (inscripcion.estado === "aprobada" && cursoActual) {
                const nuevosCupos = Number(cursoActual.cupos) + 1;
                await actualizarCurso(cursoActual.id, { ...cursoActual, cupos: nuevosCupos });
            }

            // la ponemos como rechazada
            await actualizarInscripcion(inscripcion.id, { estado: "rechazada" });

            alert("Inscripción rechazada.");
            cargarInscripcionesGestion();
            cargarCursos(); // recargamos para que se actualicen en la otra section del dashboard
            crearOGraficoInscripciones();
        } catch (error) {
            console.error(error);
            alert("Error al rechazar la inscripción.");
        } finally {
            btnAprobar.disabled = false;
            btnRechazar.disabled = false;
        }
    });
}

// grafico de inscripciones

async function obtenerConteoEstados() {
    const inscripciones = await obtenerInscripciones();

    const estados = {
        pendiente: 0,
        aprobada: 0,
        rechazada: 0,
        cancelada: 0,
    };

    inscripciones.forEach(ins => {
        if (estados[ins.estado] !== undefined) {
            estados[ins.estado]++;
        }
    });

    return estados;
}


// variable global para guardar el chart
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
        // si ya existe, actualizamos los datos
        graficoInscripciones.data.datasets[0].data = data;
        graficoInscripciones.update();
    } else {
        // si no existe, lo creamos
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
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                    x: { ticks: { font: { size: 12, weight: 'bold' } } }
                },
                plugins: {
                    legend: { labels: { font: { size: 12, weight: 'bold' } } }
                }
            }
        });
    }
}

crearOGraficoInscripciones();
