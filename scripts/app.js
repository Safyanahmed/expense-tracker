let transactions = [];
let currentFilter = 'all';
let visibleCount = 0;
let itemsPerPage = 10;

// Load existing transactions on page load
loadTransactionsFromLocalStorage();
visibleCount = 0;
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

  if (amount <= 0 || isNaN(amount)) {
    alert('Please enter a valid amount greater than 0.');
    return;
  }

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




function renderTransaction() {
  const tbody = document.querySelector('#transaction-table tbody');
  const transListTitle = document.querySelector('#transactions h3');
  tbody.innerHTML = '';

  // Filter transactions based on currentFilter
  const filtered = transactions.filter(t => {
    if (t.deleted) return false;
    if (currentFilter === 'income') return t.expenseCategory === 'Income';
    if (currentFilter === 'expense') return t.expenseCategory === 'Expense';
    return true; // 'all'
  });

  const visible = filtered.reverse().slice(0, visibleCount + itemsPerPage);

  // Title update
  if (currentFilter === 'income') {
    transListTitle.textContent = 'Transaction Income';
  } else if (currentFilter === 'expense') {
    transListTitle.textContent = 'Transaction Expense';
  } else {
    transListTitle.textContent = 'Transaction History';
  }

  // No transactions message
  if (filtered.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.textContent = 'No transactions';
    cell.style.textAlign = 'center';
    row.append(cell);
    tbody.append(row);
    document.getElementById('load-more-btn').style.display = 'none';
    return;
  }

  // Render each visible transaction
  visible.forEach(t => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td data-label="Date">${t.date}</td>
      <td data-label="Description">${t.description}</td>
      <td data-label="Income/Expense">${t.expenseCategory}</td>
      <td data-label="Amount">${t.expenseCategory === 'Expense' ? '-' : ''}£${t.amount.toFixed(2)}</td>
      <td data-label="Type"></td> 
      <td data-label="Actions"><button class="delete-btn">Delete</button></td>
    `;

    // Add category label with colors
    const categoryCell = row.querySelector('td:nth-child(5)');
    const label = document.createElement('span');
    label.classList.add('label');
    label.textContent = t.typeCategory;

    // Apply colour classes based on category
    switch (t.typeCategory) {
      case 'Food':
        label.classList.add('label-food');
        break;
      case 'Rent':
        label.classList.add('label-rent');
        break;
      case 'Salary':
        label.classList.add('label-salary');
        break;
      case 'Transport':
        label.classList.add('label-transport');
        break;
      default:
        label.classList.add('label-default');
        break;
    }

    categoryCell.appendChild(label);

    row.querySelector('.delete-btn').addEventListener('click', () => {
      t.deleted = true;
      saveTransactionsToLocalStorage();
      calcBalance();
      calcIncome();
      calcExpense();
      renderTransaction();
    });
    
    
    tbody.append(row);
    
  });
  

  // Show/hide Load More button
  visibleCount += itemsPerPage;
  const loadMoreBtn = document.getElementById('load-more-btn');
  loadMoreBtn.style.display = visibleCount >= filtered.length ? 'none' : 'block';
}

// render deleted transactions
function renderDeletedTransactions() {
  const tbody = document.querySelector('#transaction-table tbody');
  const transListTitle = document.querySelector('#transactions h3');
  tbody.innerHTML = '';

  transListTitle.textContent = 'Binned Transactions';

  const deletedTransactions = transactions.filter(t => t.deleted);

  if(deletedTransactions.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.textContent = 'No deleted transactions';
    cell.style.textAlign = 'center';
    row.append(cell);
    tbody.append(row);
    return;
  };

  deletedTransactions.forEach(transaction => {
    const row = document.createElement('tr');
    row.innerHTML= `
    <td data-label="Date">${transaction.date}</td>
    <td data-label="Description">${transaction.description}</td>
    <td data-label="Income/Expense">${transaction.expenseCategory}</td>
    <td data-label="Amount">${transaction.expenseCategory === 'Expense' ? '-' : ''}£${transaction.amount.toFixed(2)}</td>
    <td data-label="Type"></td>
    <td data-label="Actions"><button class="restore-btn">Restore</button></td>
    `;

    // Add category label with colors
  const categoryCell = row.querySelector('td:nth-child(5)');
  const label = document.createElement('span');
  label.classList.add('label');
  label.textContent = transaction.typeCategory;

  // Apply colour classes based on category
  switch (transaction.typeCategory) {
    case 'Food':
      label.classList.add('label-food');
      break;
    case 'Rent':
      label.classList.add('label-rent');
      break;
    case 'Salary':
      label.classList.add('label-salary');
      break;
    case 'Transport':
      label.classList.add('label-transport');
      break;
    default:
      label.classList.add('label-default');
      break;
  }

  categoryCell.appendChild(label);

    const restoreBtn = row.querySelector('.restore-btn')
    restoreBtn.addEventListener('click', () => {
      transaction.deleted = false;
      saveTransactionsToLocalStorage();
      renderDeletedTransactions();
      calcBalance();
      calcIncome();
      calcExpense();
    });
    tbody.append(row);
    

    
  });

}

// Load More button logic
document.getElementById('load-more-btn').addEventListener('click', () => {
  renderTransaction();
});

// Filter buttons logic
document.getElementById('all-transactions-btn').addEventListener('click', () => {
  currentFilter = 'all';
  visibleCount = 0;
  renderTransaction();
  emptyBinBtn.classList.add('hidden');
});

document.getElementById('income-btn').addEventListener('click', () => {
  currentFilter = 'income';
  visibleCount = 0;
  renderTransaction();
  emptyBinBtn.classList.add('hidden');
});

document.getElementById('expenses-btn').addEventListener('click', () => {
  currentFilter = 'expense';
  visibleCount = 0;
  renderTransaction();
  emptyBinBtn.classList.add('hidden');
});

document.getElementById('bin-btn').addEventListener('click', () => {
  renderDeletedTransactions();
  emptyBinBtn.classList.remove('hidden');
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
  
  const balanceCard = document.querySelector('.card');
  balanceCard.classList.remove('balance-card-hidden');

  if (balance < 0) {
    balanceCard.classList.add('balance-card-hidden');
  } else {
    balanceCard.classList.remove('balance-card-hidden');
  }
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

const deleteAllBtn = document.getElementById('delete-all-btn');
const modal = document.getElementById('confirm-modal');
const confirmBtn = document.getElementById('confirm-delete');
const cancelBtn = document.getElementById('cancel-delete');


deleteAllBtn.addEventListener('click', () => {
  modal.classList.remove('hidden');
})

confirmBtn.addEventListener('click', () => {
  transactions = [];
  localStorage.removeItem('transactions');
  calcBalance();
  calcExpense();
  calcIncome();
  const tbody = document.querySelector('#transaction-table tbody');
  tbody.innerHTML = '';
  renderTransaction();
  modal.classList.add('hidden');
})

cancelBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
})

// Delete binned transactions (permanently)

const emptyBinBtn = document.getElementById('empty-bin-btn');
const modalBin = document.getElementById('confirm-bin-modal');
const confirmBinDeleteBtn = document.getElementById('confirm-bin-delete');
const cancelBinBtn = document.getElementById('cancel-bin-delete');

emptyBinBtn.addEventListener('click', () => {
  modalBin.classList.remove('hidden');
})

confirmBinDeleteBtn.addEventListener('click', () => {
  transactions = transactions.filter(t => !t.deleted);

  saveTransactionsToLocalStorage();
  renderDeletedTransactions();
  calcBalance();
  calcIncome();
  calcExpense();

  modalBin.classList.add('hidden');
});


// collapse form
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('toggle-form-btn');
  const formCollapse = document.querySelector('.form-collapse');
  
  // Track the current state
  let isOpen = true; // Form starts open
  
  toggleBtn.addEventListener('click', function() {
      if (isOpen) {
          // Close the form
          formCollapse.classList.add('collapsed');
          toggleBtn.textContent = 'Add Transcaction';
          isOpen = false;
      } else {
          // Open the form
          formCollapse.classList.remove('collapsed');
          toggleBtn.textContent = 'collapse';
          isOpen = true;
      }
  });
});


