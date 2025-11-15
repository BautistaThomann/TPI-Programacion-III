const btnGestionarUsuarios = document.getElementById("gestionar-usuarios");
const btnGestionarCursos = document.getElementById("gestionar-cursos");

btnGestionarUsuarios.addEventListener("click", () => {
    window.location.href = "gestionar-usuarios.html";
});

btnGestionarCursos.addEventListener("click", () => {
    window.location.href = "gestionar-cursos.html";
});
