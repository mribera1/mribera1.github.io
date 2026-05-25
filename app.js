// app.js

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.addEventListener("DOMContentLoaded", () => {
  // === CONTACT FORM ===
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = document.getElementById("formStatus");
      const get = (id) => document.getElementById(id);
      const nombre = get("nombre");
      const apellidos = get("apellidos");
      const email = get("email");
      const descripcion = get("descripcion");

      ["nombre","apellidos","email","descripcion"].forEach(id => {
        const el = document.getElementById("error-" + id);
        if (el) el.textContent = "";
      });

      let ok = true;
      if (!nombre.value.trim()) { ok = false; get("error-nombre").textContent = "Introduce tu nombre."; }
      if (!apellidos.value.trim()) { ok = false; get("error-apellidos").textContent = "Introduce tus apellidos."; }
      if (!validateEmail(email.value)) { ok = false; get("error-email").textContent = "Correo no v\u00e1lido."; }
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
        } else { throw new Error(data.status); }
      })
      .catch(() => {
        status.style.color = "#c00";
        status.textContent = "Error al enviar. Escríbenos a miguelangelribbanyeres@gmail.com";
      });
    });
  }

  // === NAV ===
  const navLinks = document.querySelectorAll(".nav a");
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // === CHAT WIDGET ===
  const chatButton = document.getElementById("chatButton");
  if (chatButton) {
    const overlay = document.createElement("div");
    overlay.id = "ict-chat-overlay";
    overlay.innerHTML = `
      <div id="ict-chat-box">
        <div id="ict-chat-header">
          <span>Presupuesto Personalizado ICT</span>
          <button id="ict-chat-close" aria-label="Cerrar">&times;</button>
        </div>
        <div id="ict-chat-messages"></div>
        <div id="ict-chat-input-row">
          <input id="ict-chat-input" type="text" placeholder="Escribe tu mensaje..." autocomplete="off" />
          <button id="ict-chat-send">Enviar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const style = document.createElement("style");
    style.textContent = `
      #ict-chat-overlay { display:none; position:fixed; bottom:90px; right:24px; z-index:9999; width:340px; max-width:95vw; }
      #ict-chat-box { background:#fff; border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,0.18); display:flex; flex-direction:column; overflow:hidden; font-family:sans-serif; }
      #ict-chat-header { background:#1a4c8b; color:#fff; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; font-weight:600; font-size:14px; }
      #ict-chat-close { background:none; border:none; color:#fff; font-size:20px; cursor:pointer; line-height:1; }
      #ict-chat-messages { padding:12px; height:280px; overflow-y:auto; display:flex; flex-direction:column; gap:8px; background:#f7f9fc; }
      .ict-msg { max-width:85%; padding:8px 12px; border-radius:10px; font-size:13px; line-height:1.4; word-break:break-word; }
      .ict-msg.bot { background:#e8eef7; color:#222; align-self:flex-start; border-bottom-left-radius:2px; }
      .ict-msg.user { background:#1a4c8b; color:#fff; align-self:flex-end; border-bottom-right-radius:2px; }
      .ict-msg.typing { color:#888; font-style:italic; }
      #ict-chat-input-row { display:flex; border-top:1px solid #e0e0e0; }
      #ict-chat-input { flex:1; border:none; padding:10px 12px; font-size:13px; outline:none; }
      #ict-chat-send { background:#1a4c8b; color:#fff; border:none; padding:10px 16px; cursor:pointer; font-size:13px; font-weight:600; }
      #ict-chat-send:hover { background:#163d70; }
      #ict-chat-overlay.open { display:block; }
    `;
    document.head.appendChild(style);

    let sessionId = 'web_' + Math.random().toString(36).slice(2);
    let started = false;
    const msgs = document.getElementById("ict-chat-messages");
    const input = document.getElementById("ict-chat-input");

    function addMsg(text, role) {
      const div = document.createElement("div");
      div.className = "ict-msg " + role;
      div.textContent = text;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
      return div;
    }

    async function sendMessage(text) {
      if (!text.trim()) return;
      addMsg(text, "user");
      input.value = "";
      input.disabled = true;
      document.getElementById("ict-chat-send").disabled = true;
      const typing = addMsg("Escribiendo...", "bot typing");
      try {
        const res = await fetch("https://api.proyectoict.com/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, session_id: sessionId })
        });
        const data = await res.json();
        typing.remove();
        addMsg(data.reply || "No he podido responder. Int\u00e9ntalo de nuevo.", "bot");
      } catch(e) {
        typing.remove();
        addMsg("Error de conexi\u00f3n. Int\u00e9ntalo de nuevo.", "bot");
      }
      input.disabled = false;
      document.getElementById("ict-chat-send").disabled = false;
      input.focus();
    }

    chatButton.addEventListener("click", () => {
      overlay.classList.toggle("open");
      if (!started && overlay.classList.contains("open")) {
        started = true;
        sendMessage("Hola");
      }
      if (overlay.classList.contains("open")) input.focus();
    });

    document.getElementById("ict-chat-close").addEventListener("click", () => {
      overlay.classList.remove("open");
    });

    document.getElementById("ict-chat-send").addEventListener("click", () => {
      sendMessage(input.value.trim());
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage(input.value.trim());
    });
  }
});
