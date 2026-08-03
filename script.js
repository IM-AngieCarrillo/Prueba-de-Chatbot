import { apiKey } from "./config.js";

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

window.onload = () => {
    const savedChat = localStorage.getItem("chatHistory");
    
    // Limpia errores pasados guardados en la memoria
    if (savedChat && (savedChat.includes("Error") || savedChat.includes("Quota") || savedChat.includes("No se pudo"))) {
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
    // Endpoint oficial con soporte CORS completo para HTTPS en GitHub Pages
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: userMessage }]
                    }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("API Error Details:", data);
            return data?.error?.message || "Ocurrió un error en la respuesta de la API.";
        }

        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No se recibió respuesta.";

    } catch (error) {
        console.error("Fetch Error:", error);
        return "Error de red al conectar con el servidor.";
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
