const urlBase1 = "https://690b50b06ad3beba00f46279.mockapi.io/api";
const urlBase2 = "https://690b52436ad3beba00f4697e.mockapi.io/api/";

const usuarios = `${urlBase1}/usuarios`;
const cursos = `${urlBase1}/cursos`;
const inscripciones = `${urlBase2}/inscripciones`;

// usuarios
export async function obtenerUsuarios() {
    const res = await fetch(usuarios);
    return res.json();
}

export async function crearUsuarios(data) {
    const res = await fetch(usuarios, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });
    return res.json();
}

export async function obtenerUsuariosPorEmail(email) {
    const res = await fetch(`${usuarios}?email=${email}`);
    return res.json();
}

export async function actualizarUsuario(id, datosActualizados) {
    const res = await fetch(`${usuarios}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosActualizados)
    });

    return res.json();
}

// eliminar un usuario
export async function eliminarUsuario(id) {
    try {
        const res = await fetch(`${usuarios}/${id}`, {
            method: "DELETE"
        });
        return res.json();
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        throw error;
    }
}

// cursos
export async function obtenerCursos() {
    const res = await fetch(cursos);
    return res.json();
}

export async function crearCursos(data) {
    const res = await fetch(cursos, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });
    return res.json();
}

// inscripciones
export async function crearInscripciones(data) {
    const res = await fetch(inscripciones, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });
    return res.json();
}

// creamos un admin inicial que luego pueda crear mas usuarios segun su rol (pueden ser usuarios normales o mas admins)
export async function crearAdminInicial() {
    try {
        const res = await fetch(usuarios);
        const listaUsuarios = await res.json();

        // revisamos existencia del admin principal
        const existeAdmin = listaUsuarios.some(u => u.rol === "admin");

        // si ya hay, no hacemos nada
        if (existeAdmin) {
            return; // ya existe un admin, no hacemos nada
        }

        // creamos el admin
        const admin = {
            nombre: "Bautista",
            email: "bauti@admin.com",
            contrasenia: "pc777",
            rol: "admin"
        };

        const respuesta = await fetch(usuarios, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(admin)
        });

        const data = await respuesta.json();
        console.log("Admin creado:", data);

    } catch (error) {
        console.error("Error al crear admin inicial:", error);
    }
}

