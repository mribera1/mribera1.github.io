// app.js — 0-config (mailto) — funciona en local sin servidores externos
function nifLetter(num) {
  const letters = "TRWAGMYFPDXBNJZSQVHLCKE";
  return letters[num % 23];
}

function validateDNI(value) {
  const v = value.trim().toUpperCase();
  const match = v.match(/^([XYZ]?)(\d{7,8})([A-Z])$/);
  if (!match) return false;
  let number = match[2];
  const pref = match[1];
  if (pref) {
    const map = { X: "0", Y: "1", Z: "2" };
    number = map[pref] + number;
  }
  const letter = match[3];
  return nifLetter(parseInt(number, 10)) === letter;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const status = document.getElementById("formStatus");
    const get = (id) => document.getElementById(id);

    const nombre = get("nombre");
    const apellidos = get("apellidos");
    const dni = get("dni");
    const email = get("email");
    const descripcion = get("descripcion");

    // Limpia errores
    ["nombre","apellidos","dni","email","descripcion"].forEach(id => {
      const el = document.getElementById("error-" + id);
      if (el) el.textContent = "";
    });

    // Validaciones básicas
    let ok = true;
    if (!nombre.value.trim()) { ok = false; get("error-nombre").textContent = "Introduce tu nombre."; }
    if (!apellidos.value.trim()) { ok = false; get("error-apellidos").textContent = "Introduce tus apellidos."; }
    if (!validateDNI(dni.value)) { ok = false; get("error-dni").textContent = "DNI/NIE no válido."; }
    if (!validateEmail(email.value)) { ok = false; get("error-email").textContent = "Correo no válido."; }
    if (!descripcion.value.trim()) { ok = false; get("error-descripcion").textContent = "Describe brevemente lo que necesitas."; }
    if (!ok) return;

    status.style.color = "#0a662e";
    status.textContent = "Abriendo tu cliente de correo…";

    const subject = encodeURIComponent("Contacto web - Proyecto ICT");
    const body = encodeURIComponent(
      `Nombre: ${nombre.value}\nApellidos: ${apellidos.value}\nDNI: ${dni.value.toUpperCase()}\nCorreo: ${email.value}\n\nDescripción:\n${descripcion.value}`
    );

    // Abre el cliente de correo configurado en el sistema
    window.location.href = `mailto:miguelangelribbanyeres@gmail.com?subject=${subject}&body=${body}`;
  });
});

// Botón flotante de chat IA
document.addEventListener("DOMContentLoaded", () => {
  const chatButton = document.getElementById("chatButton");
  if (chatButton) {
    chatButton.addEventListener("click", () => {
      window.open("https://agenteopenaichatkit.vercel.app/", "_blank");
    });
  }
});
