const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

window.onload = () => {
    const savedChat = localStorage.getItem("chatHistory");
    
    // Limpia automáticamente los errores pasados para renovar la interfaz
    if (savedChat && (savedChat.includes("Quota exceeded") || savedChat.includes("Error") || savedChat.includes("No se pudo conectar"))) {
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
    // Endpoint compatible con HTTPS para GitHub Pages
    const url = `https://text.pollinations.ai/${encodeURIComponent(userMessage)}?model=openai`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "text/plain"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Status: ${response.status}`);
        }

        const replyText = await response.text();
        return replyText || "No se recibió respuesta del modelo.";

    } catch (error) {
        console.error("Fetch Error:", error);
        return "Error al conectar con la IA desde GitHub Pages. Revisa tu conexión.";
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
