let transactions = [];

// Load existing transactions on page load
loadTransactionsFromLocalStorage();
renderTransaction();
calcBalance();
calcIncome();
calcExpense();

// Save to localStorage
function saveTransactionsToLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Load from localStorage
function loadTransactionsFromLocalStorage() {
  const stored = localStorage.getItem('transactions');
  transactions = stored ? JSON.parse(stored) : [];
}

// Handle form submission
document.getElementById('form').addEventListener('submit', function (e) {
  e.preventDefault();

  const description = document.getElementById('description').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const date = document.getElementById('date').value;
  const typeCategory = document.getElementById('type-category').value;
  const expenseCategory = document.getElementById('expense-category').value;

  const newTransaction = {
    id: crypto.randomUUID(),
    description,
    amount,
    expenseCategory,
    date,
    typeCategory,
    deleted: false
  };

  transactions.push(newTransaction);
  saveTransactionsToLocalStorage();
  renderTransaction();
  calcBalance();
  calcIncome();
  calcExpense();
  e.target.reset();
});

// Render all transactions
function renderTransaction() {
  const tbody = document.querySelector('#transaction-table tbody');
  tbody.innerHTML = '';

  const visibleTransactions = transactions.filter(t => !t.deleted);
  if (visibleTransactions.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = 'No transactions';
    cell.style.textAlign = 'center';
    row.append(cell);
    tbody.append(row);
    return;
  }

  visibleTransactions.forEach(transaction => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${transaction.description}</td>
      <td>${transaction.expenseCategory === 'Expense' ? '-' : ''}£${transaction.amount.toFixed(2)}</td>
      <td>${transaction.expenseCategory}</td>
      <td>${transaction.typeCategory}</td>
      <td><button class="delete-btn">Delete</button></td>
    `;

    const deleteBtn = row.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
      transaction.deleted = true;
      saveTransactionsToLocalStorage();
      renderTransaction();
      calcBalance();
      calcIncome();
      calcExpense();
    });

    tbody.appendChild(row);
  });
}

// Filter: All
document.getElementById('all-transactions-btn').addEventListener('click', renderTransaction);

// Filter: Income
document.getElementById('income-btn').addEventListener('click', function () {
  const tbody = document.querySelector('#transaction-table tbody');
  const transListTitle = document.querySelector('#transactions h3');
  transListTitle.textContent = 'Transaction Income';
  tbody.innerHTML = '';

  const incomes = transactions.filter(t => !t.deleted && t.expenseCategory === 'Income');
  if (incomes.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = 'No income transactions';
    cell.style.textAlign = 'center';
    row.append(cell);
    tbody.append(row);
    return;
  }

  incomes.forEach(t => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${t.description}</td>
      <td>£${t.amount.toFixed(2)}</td>
      <td>${t.expenseCategory}</td>
      <td>${t.typeCategory}</td>
      <td><button class="delete-btn">Delete</button></td>
    `;

    const deleteBtn = row.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
      t.deleted = true;
      saveTransactionsToLocalStorage();
      calcBalance();
      calcIncome();
      renderTransaction(); // Go back to full list or change to renderIncome() if preferred
    });

    tbody.appendChild(row);
  });
});

// Filter: Expenses
document.getElementById('expenses-btn').addEventListener('click', function () {
  const tbody = document.querySelector('#transaction-table tbody');
  const transListTitle = document.querySelector('#transactions h3');
  transListTitle.textContent = 'Transaction Expense';
  tbody.innerHTML = '';

  const expenses = transactions.filter(t => !t.deleted && t.expenseCategory === 'Expense');
  if (expenses.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = 'No expense transactions';
    cell.style.textAlign = 'center';
    row.append(cell);
    tbody.append(row);
    return;
  }

  expenses.forEach(t => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${t.description}</td>
      <td>-£${t.amount.toFixed(2)}</td>
      <td>${t.expenseCategory}</td>
      <td>${t.typeCategory}</td>
      <td><button class="delete-btn">Delete</button></td>
    `;

    const deleteBtn = row.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
      t.deleted = true;
      saveTransactionsToLocalStorage();
      calcBalance();
      calcExpense();
      renderTransaction(); // Or renderExpenses()
    });

    tbody.appendChild(row);
  });
});

// Calculate and render balance
function calcBalance() {
  const totalBalance = document.getElementById('balance');
  let balance = 0;

  transactions.forEach(t => {
    if (t.deleted) return;
    if (t.expenseCategory === 'Income') balance += t.amount;
    if (t.expenseCategory === 'Expense') balance -= t.amount;
  });

  totalBalance.textContent = `${balance < 0 ? '-' : ''}£${Math.abs(balance).toFixed(2)}`;
}

// Calculate total income
function calcIncome() {
  const totalIncome = document.getElementById('income');
  let income = 0;

  transactions.forEach(t => {
    if (!t.deleted && t.expenseCategory === 'Income') {
      income += t.amount;
    }
  });

  totalIncome.textContent = `£${income.toFixed(2)}`;
}

// Calculate total expenses
function calcExpense() {
  const totalExpense = document.getElementById('expenses');
  let expense = 0;

  transactions.forEach(t => {
    if (!t.deleted && t.expenseCategory === 'Expense') {
      expense += t.amount;
    }
  });

  totalExpense.textContent = `-£${expense.toFixed(2)}`;
}

// Delete all transactions (permanently)
document.getElementById('delete-all-btn').addEventListener('click', () => {
  transactions = [];
  localStorage.removeItem('transactions');
  calcBalance();
  calcExpense();
  calcIncome();
  const tbody = document.querySelector('#transaction-table tbody');
  tbody.innerHTML = '';
  renderTransaction();
})