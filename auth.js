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
        window.location.href = "../ingreso/inicio-sesion.html";
    }
}

// permitir solo admin
export function requerirAdmin() {
    const usuario = obtenerSesion();
    if (!usuario || usuario.role !== "admin") {
        window.location.href = "../ingreso/inicio-sesion.html";
    }
}

// permitir solo user
export function requerirUsuario() {
    const usuario = obtenerSesion();
    if (!usuario || usuario.role !== "user") {
        window.location.href = "../ingreso/inicio-sesion.html";
    }
}
