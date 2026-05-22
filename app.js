// app.js

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
  if (form) {
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

      // Validaciones
      let ok = true;
      if (!nombre.value.trim()) { ok = false; get("error-nombre").textContent = "Introduce tu nombre."; }
      if (!apellidos.value.trim()) { ok = false; get("error-apellidos").textContent = "Introduce tus apellidos."; }
      if (!validateDNI(dni.value)) { ok = false; get("error-dni").textContent = "DNI/NIE no válido."; }
      if (!validateEmail(email.value)) { ok = false; get("error-email").textContent = "Correo no válido."; }
      if (!descripcion.value.trim()) { ok = false; get("error-descripcion").textContent = "Describe brevemente lo que necesitas."; }
      if (!ok) return;

      status.style.color = "#555";
      status.textContent = "Enviando...";

      fetch("https://api.proyectoict.com/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.value.trim(),
          apellidos: apellidos.value.trim(),
          dni: dni.value.trim().toUpperCase(),
          email: email.value.trim(),
          descripcion: descripcion.value.trim()
        })
      })
      .then(r => r.json())
      .then(data => {
        if (data.status === "ok") {
          status.style.color = "#0a662e";
          status.textContent = "Mensaje enviado. Te contactaremos pronto.";
          form.reset();
        } else {
          throw new Error(data.status);
        }
      })
      .catch(() => {
        status.style.color = "#c00";
        status.textContent = "Error al enviar. Escríbenos a miguelangelribbanyeres@gmail.com";
      });
    });
  }

  // Marca el enlace activo en el menú al hacer clic
  const navLinks = document.querySelectorAll(".nav a");
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
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
