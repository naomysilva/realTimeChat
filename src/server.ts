import express, { Application } from "express";
import http from "http";
import { Server } from "socket.io";

class App {
    private app: Application;
    private http: http.Server;
    private io: Server;
    private users: Map<string, string>; 
    private age: Map<string, string>;

    constructor() {
        this.app = express();
        this.http = http.createServer(this.app);
        this.io = new Server(this.http);
        this.users = new Map(); 
        this.listenSocket();
        this.setupRoutes();
    }

    listenServer() {
        this.http.listen(3000, () => console.log("Server is running"));
    }

    listenSocket() {
        this.io.on("connection", (socket) => {
            console.log("User connected: ", socket.id);

            // Evento para definir o nome do usuário
            socket.on("set_username", (username, age) => {
                this.users.set(socket.id,username);
                console.log(`${username} ${age} entrou no chat.`);
                this.io.emit("user_joined",  username, age); // Notifica todos os usuários
            });

           

            socket.on("message", (msg) => {
                const username = this.users.get(socket.id) || "Anônimo";
                this.io.emit("message", { username, msg });
            });

            socket.on("disconnect", () => {
                const username = this.users.get(socket.id) || "Anônimo";
                this.users.delete(socket.id);
                console.log(`${username} saiu do chat.`);
                this.io.emit("user_left", username);
            });
        });
    }

    setupRoutes() {
        this.app.get("/", (req, res) => {
            res.sendFile(__dirname + "/index.html");
        });
    }
}

const app = new App();
app.listenServer();
