//Запускает весь проект полностью на одном сервере.
import express from "express";
import { db, saveDatabase } from "./database.js";

const app = express();
//Создаем сервер
const PORT = 3000;
//Указываем порт
app.use(express.json());
//Настраиваем JSON-формат
app.use(express.static("public"));
//Указываем название папки в которой находится frontend часть приложения
app.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}`);
});
//Запускаем сервер
