import { cerrarSesion, obtenerSesion } from "../auth.js";
import { obtenerCursos } from "../api.js";

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

const linkCerrar = document.getElementById("cerrarSesion");
const contCards = document.getElementById("contenedor-cards");

linkCerrar.addEventListener("click", (e) => {
    e.preventDefault();
    cerrarSesion();
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
            card.classList.add("cards");

            card.innerHTML = `
                <h3>${curso.titulo}</h3>
                <p><span>Descripción:</span> ${curso.descripcion}</p>
                <p><span>Duración:</span> ${curso.duracion} semanas</p>
                <p><span>Cupos:</span> ${curso.cupos}</p>
                <p><span>Id:</span> ${curso.id}</p>
                <a href="dashboard.html" id="ver-mas">Ver más</a>

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



