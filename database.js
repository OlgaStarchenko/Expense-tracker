import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";
import { log } from "console";

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

db.run(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
  `);
//Создаем таблицу категории если еще не существует, id автоматически генерируется и увеличивается

db.run(`
  CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL 
    CHECK ( type IN ( 'income', 'expense' ) ),
  category_id INTEGER,
  date TEXT NOT NULL,
  FOREIGN KEY ( category_id ) 
    REFERENCES categories ( id )
  );
  `);
//Создаем таблицу  транзакции если не существует, id автоматически генерируется и увеличивается
//id всегда PRIMARY KEY , ограничиваем type набором значений,
// FOREIGN KEY ( category_id )
//REFERENCES categories ( id ) - связываем ключ category_id с ключем id из таблицы categories

const categoriesResult = db.exec(`
    SELECT COUNT ( * ) AS count
    FROM categories; 
    `);
//Достаем количество элементов внутри таблицы categories, результат записываем в ключ count

const categoriesCount = categoriesResult[0].values[0][0];
//Добираемся до численного значения

if (categoriesCount === 0) {
  db.run(`
    INSERT INTO categories ( name )
    VALUES ( 'Продукты' ), ( 'Транспорт' ), 
    ( 'Развлечения' ), ( 'Зарплата' ), ( 'Другое' );
    `);
}
//Устанавливаем условие если таблица не заполнена то мы ее заполняем категориями

function saveDatabase() {
  const data = db.export();
  //экспортируем базу данных
  const buffer = Buffer.from(data);
  //получаем ее обновленное содержимое
  fs.writeFileSync(databasePath, buffer);
  //записываем обновление в существующий файл бд
}
//функция для сохранения изменений в базу данных

saveDatabase();
//Сохранили все изменения в базе данных
export { db, saveDatabase };
//Экспортируем переменную базы данных и функцию обновление в существующий файл бд

// npm init - инициализация
// npm install express sql.js - установка пакетов
// node database.js - запускаем файл database.js в среде Node.js, то есть не в браузере.
