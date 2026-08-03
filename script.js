const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

window.onload = () => {
    const savedChat = localStorage.getItem("chatHistory");
    
    // Limpia errores viejos si existían en el almacenamiento
    if (savedChat && (savedChat.includes("Quota exceeded") || savedChat.includes("is not found") || savedChat.includes("no está respondiendo") || savedChat.includes("Error de conexión"))) {
        localStorage.removeItem("chatHistory");
    } else if (savedChat) {
        chatBox.innerHTML = savedChat;
    }
    
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addMessage(message, classNme) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", classNme);
    msgDiv.textContent = message;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() {
    const typingDiv = document.createElement("div");
    typingDiv.classList.add("message", "bot-message");
    typingDiv.textContent = "AI is typing...";
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typingDiv;
}

async function getBotReplay(userMessage) {
    // Intento 1: Servidor Pollinations
    try {
        const prompt = encodeURIComponent(userMessage);
        const urlPrimary = `https://text.pollinations.ai/${prompt}?system=Eres+un+asistente+virtual+amigable+y+conciso.`;
        
        const response = await fetch(urlPrimary);
        if (response.ok) {
            const replyText = await response.text();
            if (replyText && replyText.trim() !== "") {
                return replyText;
            }
        }
    } catch (e) {
        console.warn("Servidor principal no disponible, intentando respaldo...", e);
    }

    // Intento 2: Servidor de respaldo en caso de que el primero falle
    try {
        const urlBackup = "https://backend.buildt.ai/api/generate"; // Endpoint de respaldo ligero público
        const responseBackup = await fetch(urlBackup, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: userMessage })
        });

        if (responseBackup.ok) {
            const data = await responseBackup.json();
            return data.response || data.text || "Respuesta recibida correctamente.";
        }
    } catch (e) {
        console.error("Error en servidor de respaldo:", e);
    }

    // Si ambos fallan o hay un problema momentáneo de red local
    return "No se pudo conectar con el servidor en este momento. Intenta de nuevo en unos segundos.";
}

sendBtn.onclick = async () => {
    const message = userInput.value.trim();
    if (message === "") return;

    addMessage(message, "user-message");
    userInput.value = "";

    const typingDiv = showTyping();

    const botReplay = await getBotReplay(message);
    typingDiv.remove();

    addMessage(botReplay, "bot-message");

    localStorage.setItem("chatHistory", chatBox.innerHTML);
}

userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendBtn.click();
});
