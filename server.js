// Express Setup
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import {Server} from 'socket.io';(http);
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server);

// BodyParser
const urlencodedParser = express.urlencoded({ extended: true });
app.use(urlencodedParser);
app.use(express.json());

// Routes
import routes from "./routes/index.js";

// HBS Setup
import {engine} from "express-handlebars";

app.engine(
  "hbs",
  engine({
    extname: "hbs",
    defaultLayout: "main",
    layoutsDir: __dirname + "/views/layouts/",
    partialsDir: __dirname + "/views/partials/",
  })
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));


// Use Routes
app.use("/", routes);

// io.on sets connection event listener on
io.on('connection', (socket) => {
  console.log('a user connected')
  // io.emit('history', history)

  socket.on('message', (message) => {
      // while (history.length > historySize) {
    //   history.shift()
    // }
    // history.push(message)
    
    io.emit('message', message)
  })
  
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

server.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});
