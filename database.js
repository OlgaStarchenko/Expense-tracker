import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";

const SQL = await initSqlJs();
//загружает sqlite
const dataDirectory = path.resolve("data");
//ищем папку data, внутри которой база данных

const databasePath = path.join(dataDirectory, "database.sqlite");
//ищем сам файл базы данных

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory);
}
//если нет папки data, то мы создаем папку data

let db;
// создаем переменную для базы данных

if (fs.existsSync(databasePath)) {
  const fileBuffer = fs.readFileSync(databasePath);
  //получаем и читаем файл базы данных

  db = new SQL.Database(fileBuffer);
  //загружаем существующую базу данных
} else {
  db = new SQL.Database();
  //иначе создаем пустую базу данных
}

function saveDatabase() {
  const data = db.export();
  //экспортируем базу данных
  const buffer = Buffer.from(data);
  //получаем ее обновленное содержимое
  fs.writeFileSync(databasePath, buffer);
  //записываем обновление в существующий файл бд
}
//функция для сохранения изменений в базу данных

export { db, saveDatabase };
//Экспортируем переменную базы данных и функцию обновление в существующий файл бд

// npm init - инициализация
// npm install express sql.js - установка пакетов
// node database.js - запускаем файл database.js в среде Node.js, то есть не в браузере.
