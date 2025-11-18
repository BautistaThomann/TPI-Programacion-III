// guardar sesion
export function guardarSesion(usuario) {
    localStorage.setItem("sesion", JSON.stringify(usuario));
}

// obtener sesion actual
export function obtenerSesion() {
    return JSON.parse(localStorage.getItem("sesion"));
}

// cerrar sesion
export function cerrarSesion() {
    localStorage.removeItem("sesion");
    window.location.href = "../ingreso/inicio-sesion.html";
}

// exigir que haya sesion iniciada
export function requerirLogin() {
    const usuario = obtenerSesion();
    if (!usuario) {
        alert("Debes iniciar sesión para acceder a esta página.");
        window.location.href = "../ingreso/inicio-sesion.html";
    }
}

// permitir solo admin
export function requerirAdmin() {
    const usuario = obtenerSesion();
    if (!usuario || usuario.rol !== "admin") {
        alert("No tenés permisos para acceder a esta página.");
        window.location.href = "../index.html";
    }
}

// permitir solo user
export function requerirUsuario() {
    const usuario = obtenerSesion();
    if (!usuario || usuario.rol !== "user") {
        alert("No tenés permisos para acceder a esta página.");
        window.location.href = "../index.html"; // sino, lo mandamos al index normal
    }
}
