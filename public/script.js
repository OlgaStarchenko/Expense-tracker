const btnAdd = document.querySelector(".btn__add");
const modal = document.querySelector(".modal");
const nameOper = document.querySelector("#name__of__operation");
const amountOper = document.querySelector("#transaction__amount");
const typeOper = document.querySelector("#operation__type");
const categoryOper = document.querySelector("#category__modal");
const dateOper = document.querySelector("#date__of__operation");
const btnAddTranzaction = document.querySelector("#add__tranzaction");
const btnCancelTranzaction = document.querySelector("#cancel__tranzaction");

const operationsList = [];
const openModal = () => {
  modal.classList.add("modal__open");
};

const closeModal = () => {
  modal.classList.remove("modal__open");
};

const addOperation = () => {
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
  addOperationToList(values);
  console.log(operationsList);
};

const getCategories = async () => {
  const response = await fetch("/api/categories");
  const data = await response.json();

  console.log(data);

  categoryOper.innerHTML = null;

  data.forEach((element) => {
    const option = document.createElement("option");
    option.value = element.id;
    option.innerHTML = element.name;
    categoryOper.append(option);
  });
};

const clearModalFields = () => {
  nameOper.value = "";
  amountOper.value = "";
  typeOper.value = "income";
  dateOper.value = "";
  categoryOper.value = 5;
};

const addOperationToList = (values) => {
  operationsList.push(values);
};

getCategories();

btnAdd.onclick = openModal;

btnCancelTranzaction.onclick = closeModal;

btnAddTranzaction.addEventListener("click", () => {
  addOperation();
  clearModalFields();
  closeModal();
});
