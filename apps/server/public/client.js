let socket = null;
const userId = "user-123";

function addEvent(type, content) {
	const eventsDiv = document.getElementById("events");
	const noEvents = document.getElementById("no-events");
	if (noEvents) noEvents.remove();

	const eventEl = document.createElement("div");
	eventEl.className = `event ${type}`;

	const time = new Date().toLocaleTimeString();
	const contentStr =
		typeof content === "object" ? JSON.stringify(content, null, 2) : content;

	eventEl.innerHTML = `
    <time>${time}</time>
    <strong>${type.toUpperCase()}</strong>
    <div class="content">${contentStr}</div>
  `;
	eventsDiv.insertBefore(eventEl, eventsDiv.firstChild);
}

window.connect = () => {
	if (socket && socket.connected) {
		addEvent("system", "Already connected");
		return;
	}

	addEvent("system", "Attempting to connect to http://localhost:3000...");

	if (typeof io === "undefined") {
		addEvent("system", "Error: Socket.io library not loaded!");
		return;
	}

	socket = io("http://localhost:3000", {
		query: { userId },
		transports: ["websocket", "polling"],
		withCredentials: true,
	});

	socket.on("connect", () => {
		const statusEl = document.getElementById("connection-status");
		if (statusEl) {
			statusEl.className = "status connected";
			statusEl.textContent = `Status: Connected (Socket ID: ${socket.id})`;
		}
		addEvent("system", "Successfully connected to server");
	});

	socket.on("disconnect", (reason) => {
		const statusEl = document.getElementById("connection-status");
		if (statusEl) {
			statusEl.className = "status disconnected";
			statusEl.textContent = `Status: Disconnected (${reason})`;
		}
		addEvent("system", `Disconnected: ${reason}`);
	});

	socket.on("connect_error", (error) => {
		addEvent("system", `Connection Error: ${error.message}`);
	});

	socket.on("order:update", (data) => {
		addEvent("order", data);
	});

	socket.on("ticket:update", (data) => {
		addEvent("ticket", data);
	});
};

window.disconnect = () => {
	if (socket) {
		socket.disconnect();
	} else {
		addEvent("system", "No active connection to disconnect");
	}
};

// Auto-connect after 500ms
setTimeout(() => {
	if (window.connect) window.connect();
}, 500);
