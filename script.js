const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

window.onload = () => {
    const savedChat = localStorage.getItem("chatHistory");
    
    // Limpia errores antiguos que hayan quedado guardados en el historial
    if (savedChat && (savedChat.includes("Quota exceeded") || savedChat.includes("is not found") || savedChat.includes("Error al conectar"))) {
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
    // Usamos encodeURIComponent para convertir los espacios y caracteres del mensaje
    const prompt = encodeURIComponent(userMessage);
    const url = `https://text.pollinations.ai/${prompt}?system=Eres+un+asistente+virtual+amigable+y+conciso.`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return "El servidor de la IA no está respondiendo en este momento.";
        }

        const replyText = await response.text();
        return replyText || "No pude obtener una respuesta.";

    } catch (error) {
        console.error("Fetch Error:", error);
        return "Error de conexión con el servidor.";
    }
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
