// ============================================================
// app.js — Envío del formulario con Google Apps Script (GAS)
// ============================================================
// 👉 Sustituye la siguiente URL por la de TU WebApp de Google Apps Script
// (termina en /exec, por ejemplo: https://script.google.com/macros/s/AKfycbxxxx/exec)
const GAS_URL = "https://script.google.com/macros/s/AKfycbxNy-zxbnP6kXk18KkQ1vblOhXYcquOwxhyJH5z7kR66Ou-dKKrbOwcD4Gny38eVsRuMw/exec";
// ============================================================

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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = document.getElementById("formStatus");
    const get = (id) => document.getElementById(id);
    const nombre = get("nombre");
    const apellidos = get("apellidos");
    const dni = get("dni");
    const email = get("email");
    const descripcion = get("descripcion");

    // Reiniciar errores
    ["nombre","apellidos","dni","email","descripcion"].forEach(id => {
      const el = document.getElementById("error-" + id);
      if (el) el.textContent = "";
    });

    // Validaciones
    let ok = true;
    if (!nombre.value.trim()) { ok = false; get("error-nombre").textContent = "Introduce tu nombre."; }
    if (!apellidos.value.trim()) { ok = false; get("error-apellidos").textContent = "Introduce tus apellidos."; }
    if (!validateDNI(dni.value)) { ok = false; get("error-dni").textContent = "DNI/NIE no válido."; }
    if (!validateEmail(email.value)) { ok = false; get("error-email").textContent = "Correo no válido."; }
    if (!descripcion.value.trim()) { ok = false; get("error-descripcion").textContent = "Describe brevemente lo que necesitas."; }
    if (!ok) return;

    status.style.color = "#0a662e";
    status.textContent = "Enviando…";

    const payload = {
      nombre: nombre.value,
      apellidos: apellidos.value,
      dni: dni.value.toUpperCase(),
      email: email.value,
      descripcion: descripcion.value
    };

    try {
      const res = await fetch(GAS_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.ok === true || data.status === "ok")) {
        status.textContent = "¡Gracias! Tu mensaje ha sido enviado correctamente.";
        form.reset();
        return;
      }

      throw new Error(data?.message || "No se pudo enviar (respuesta no válida).");

    } catch (err) {
      console.error("Error al enviar:", err);
      status.style.color = "#d93025";
      status.textContent = "No se pudo enviar automáticamente. Abriendo tu cliente de correo…";

      // Fallback: abrir cliente de correo
      const subject = encodeURIComponent("Contacto web - Proyecto ICT");
      const body = encodeURIComponent(
        `Nombre: ${payload.nombre}\nApellidos: ${payload.apellidos}\nDNI: ${payload.dni}\nCorreo: ${payload.email}\n\nDescripc
