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

//Универсальная функция для преобразования SQL-ответа в массив с объектами.
function query(sql, params = {}) {
  //метод prepare() подготавливает sql-запрос к выполнению
  const statement = db.prepare(sql);

  //метод bind() передает параметры в sql-запрос
  statement.bind(params);

  const rows = [];

  //Метод step() выполняет шаг sql-запроса и переходит к следующей доступной строке результата
  while (statement.step()) {
    //метод getAsObject() получает строку таблицы в виде объекта
    rows.push(statement.getAsObject());
  }

  //метод free() освобождает ресурсы которые sql выделила для подготовленного запроса
  statement.free();
  return rows;
}

// app.get("/api/categories", (req, res) => {
//   const result = db.exec(`SELECT * from categories ORDER BY name;`);
//   if (result.length === 0) {
//     return res.json([]);
//   }

//   const columns = result[0].columns;
//   const values = result[0].values;

//   const categories = values.map((row) => {
//     const category = {};
//     columns.forEach((column, index) => {
//       category[column] = row[index];
//     });
//     return category;
//   });

//   res.json(categories);
// });

//описываем get-запрос на получение всех категорий
app.get("/api/categories", (req, res) => {
  const categories = query(`SELECT * FROM categories ORDER BY name;`);

  res.json(categories);
});

//описываем get-запрос на получение транзакций
app.get("/api/transactions", (req, res) => {
  const transactions = query(`SELECT transactions.id,
    transactions.title,
    transactions.amount,
    transactions.type,
    transactions.date,
    categories.id AS category_id,
    categories.name AS category_name
    FROM transactions
    LEFT JOIN categories
    ON transactions.category_id = categories.id
    ORDER BY transactions.date DESC, transactions.id DESC;`);

  res.json(transactions);
});

//описываем post-запрос на добавление транзакции
app.post("/api/transactions", (req, res) => {
  const { title, amount, type, date, categoryId } = req.body;

  if (!title || !amount || !type || !date || !categoryId) {
    return res.status(400).json({
      error: "Заполните все поля",
    });
  }

  if (type !== "income" && type !== "expense") {
    return res.status(400).json({
      error: "Неверный тип операции",
    });
  }

  db.run(
    `INSERT INTO transactions (title, amount, type, date, category_id)
    VALUES ($title, $amount, $type, $date, $categoryId);`,
    {
      $title: title,
      $amount: Number(amount),
      $type: type,
      $date: date,
      $categoryId: Number(categoryId),
    },
  );

  saveDatabase();

  res.status(201).json({
    message: "Операция добавлена",
  });
});

//описываем delete-запрос на удаление транзакций
app.delete("/api/transactions/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!id) {
    return res.status(400).json({
      error: "Некорректный id",
    });
  }

  db.run(`DELETE FROM transactions WHERE id = $id;`, {
    $id: id,
  });

  saveDatabase();

  res.status(201).json({
    message: "Операция удалена",
  });
});

//описываем get-запрос на получение общей суммы доходов, расходов и баланса
app.get("/api/stats", (req, res) => {
  const result = query(`SELECT COALESCE(
    SUM(
    CASE WHEN type='income' 
    THEN amount
    ELSE 0
    END),
    0
    ) AS income,
     COALESCE(
    SUM(
    CASE WHEN type='expense' 
    THEN amount
    ELSE 0
    END),
    0
    ) AS expense FROM transactions;`);

  const income = Number(result[0].income);

  const expense = Number(result[0].expense);

  res.json({
    income,
    expense,
    balance: income - expense,
  });
});

//Запускаем сервер, всегда в самом низу документа, после всех настроек
app.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}`);
});
