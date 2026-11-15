const btnAdd = document.querySelector(".btn__add");
const modal = document.querySelector(".modal");
const nameOper = document.querySelector("#name__of__operation");
const amountOper = document.querySelector("#transaction__amount");
const typeOper = document.querySelector("#operation__type");
const categoryOper = document.querySelector("#category__modal");
const dateOper = document.querySelector("#date__of__operation");
const btnAddTranzaction = document.querySelector("#add__tranzaction");
const btnCancelTranzaction = document.querySelector("#cancel__tranzaction");
const transactionsList = document.querySelector("#transaction__list");
const template = document.querySelector("#transaction-template");
const balance = document.querySelector(".balance__indicator");
const income = document.querySelector(".income__indicator");
const expenditure = document.querySelector(".expenditure__indicator");

function CustomError(message) {
  this.message = message;
}

const openModal = () => {
  modal.classList.add("modal__open");
};

const closeModal = () => {
  modal.classList.remove("modal__open");
};

const addOperation = async () => {
  if (
    !nameOper.value.trim() ||
    !amountOper.value ||
    !typeOper.value ||
    !dateOper.value ||
    !categoryOper.value
  ) {
    alert("Заполните все поля");
    return;
  }

  const values = {
    title: nameOper.value,
    amount: Number(amountOper.value),
    type: typeOper.value,
    date: dateOper.value,
    categoryId: Number(categoryOper.value),
  };

  console.log(values);
  try {
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      throw new CustomError("Ошибка при добавлении транзакции");
    }
    const result = await response.json();
    clearModalFields();
    getTransactions();
    console.log(result);
  } catch (error) {
    console.log(error.message);
  } finally {
    closeModal();
  }
};

const getCategories = async () => {
  try {
    const response = await fetch("/api/categories");

    if (!response.ok) {
      throw new CustomError("Ошибка получения категорий.");
    }
    const data = await response.json();

    console.log(data);

    categoryOper.innerHTML = null;

    data.forEach((element) => {
      const option = document.createElement("option");
      option.value = element.id;
      option.innerHTML = element.name;
      categoryOper.append(option);
    });
  } catch (error) {
    console.log(error.message);
  }
};

const clearModalFields = () => {
  nameOper.value = "";
  amountOper.value = "";
  typeOper.value = "income";
  dateOper.value = "";
  categoryOper.value = 5;
};

async function deleteOperation(id) {
  try {
    const response = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new CustomError("Ошибка удаления транзакции.");
    }
    const data = await response.json();
    getTransactions();
    console.log(data);
  } catch (error) {
    console.log(error.message);
  }
}

async function getTransactions() {
  try {
    const response = await fetch("/api/transactions");

    if (!response.ok) {
      throw new CustomError("Ошибка получения транзакций.");
    }

    const data = await response.json();

    getStats();

    transactionsList.innerHTML = null;

    data.forEach((trans) => {
      const templateCopy = template.content.cloneNode(true);
      const copyTitle = templateCopy.querySelector(".title");
      const copyAmount = templateCopy.querySelector(".amount");
      const copyDate = templateCopy.querySelector(".date");
      const copyType = templateCopy.querySelector(".type");
      const copyCategory = templateCopy.querySelector(".category");
      const copyBtn = templateCopy.querySelector(".btn__table");
      copyBtn.addEventListener("click", () => {
        if (confirm("Вы действительно хотите удалить транзакцию?")) {
          deleteOperation(trans.id);
        }
      });

      copyTitle.innerHTML = trans.title;
      copyAmount.innerHTML = trans.amount;
      copyDate.innerHTML = trans.date;
      copyType.innerHTML = trans.type === "expense" ? "Расход" : "Доход";
      copyCategory.innerHTML = trans.category_name;

      transactionsList.append(templateCopy);
    });
  } catch (error) {
    console.log(error.message);
  }
}

async function getStats() {
  try {
    const response = await fetch("/api/stats");

    if (!response.ok) {
      throw new CustomError("Ошибка получения статистики.");
    }

    const data = await response.json();
    console.log(data);

    balance.innerHTML = data.balance;
    income.innerHTML = data.income;
    expenditure.innerHTML = data.expense;
  } catch (error) {
    console.log(error.message);
  }
}

getCategories();
getTransactions();

btnAdd.onclick = openModal;

btnCancelTranzaction.onclick = closeModal;

btnAddTranzaction.addEventListener("click", () => {
  addOperation();
});
