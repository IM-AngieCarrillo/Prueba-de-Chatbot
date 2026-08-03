import { apiKey } from "./config.js";

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

window.onload = () => {
    // Si la pantalla se quedó atorada con un mensaje de error anterior, esto la limpia:
    const savedChat = localStorage.getItem("chatHistory");
    if (savedChat && savedChat.includes("is no longer available") || savedChat && savedChat.includes("is not found")) {
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
    // Endpoint oficial actualizado con gemini-2.0-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("API Error:", data);
            return data?.error?.message || "Error al obtener respuesta de la API.";
        }

        return (
            data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude obtener una respuesta."
        );
    } catch (error) {
        console.error("Fetch Error:", error);
        return "Error de conexión con la API.";
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
