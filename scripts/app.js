let transactions = [];
let currentFilter = 'all';
let currentView = 'transactions';
let visibleCount = 0;
let itemsPerPage = 10;

// Load existing transactions on page load
loadTransactionsFromLocalStorage();
visibleCount = 0;
renderTransaction();
calcBalance();
calcIncome();
calcExpense();

// limit type catagory to 15 characters 
const typeInput = document.getElementById('type-category');
const typeHelp = document.getElementById('type-help');

typeInput.addEventListener('input', () => {
  let value = typeInput.value;

  const maxLength = 15;
  if (value.length > maxLength) {
    value = value.substring(0, maxLength);
    typeHelp.classList.remove('hidden');
    typeHelp.textContent = 'Character limit of 15 reached.';
    typeInput.classList.add('max-reached');
  } else {
    typeHelp.classList.add('hidden');
    typeInput.classList.remove('max-reached');
  }

  typeInput.value = value;
});

// limit description to 15 characters 
const descriptionInput = document.getElementById('description');
const descriptionHelp = document.getElementById('description-help');


descriptionInput.addEventListener('input', () => {
  let value = descriptionInput.value;

  const maxLength = 25;
  if (value.length > maxLength) {
    value = value.substring(0, maxLength);
    descriptionHelp.classList.remove('hidden');
    descriptionHelp.textContent = 'Character limit of 25 reached.';
    descriptionInput.classList.add('max-reached');
  } else {
    descriptionHelp.classList.add('hidden');
    descriptionInput.classList.remove('max-reached');
  }

  descriptionInput.value = value;
});


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
  typeHelp.classList.add('hidden');
  typeInput.classList.remove('max-reached');

});

// change date format to en-GB
function formatDate(dateStr) {
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString('en-GB', options);
}


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
    transListTitle.textContent = 'Transaction Expenses';
  } else {
    transListTitle.textContent = 'Transaction History';
  }

  // No transactions message
  if (filtered.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.textContent = 'No transactions';
    cell.classList.add('empty-message-cell');
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
      <td data-label="Date">${formatDate(t.date)}</td>
      <td data-label="Item Description">${t.description}</td>
      <td data-label="Income/Expense">${t.expenseCategory}</td>
      <td data-label="Amount">${t.expenseCategory === 'Expense' ? '-' : ''}£${t.amount.toFixed(2)}</td>
      <td data-label="Type"></td> 
      <td data-label="Actions"><button class="delete-btn">Delete</button></td>
    `;

    const categoryCell = row.querySelector('td:nth-child(5)');
    const label = document.createElement('span'); 

    // Clear existing labels (if any)
    categoryCell.innerHTML = '';

    let formattedCategory = (t.typeCategory || '').trim().toLowerCase();
    formattedCategory = formattedCategory.charAt(0).toUpperCase() + formattedCategory.slice(1);

    label.classList.add('label');

    switch (formattedCategory) {
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

    label.textContent = formattedCategory;
    categoryCell.appendChild(label); 

    row.querySelector('.delete-btn').addEventListener('click', () => {
      t.deleted = true;
      t.deletedAt = new Date().toISOString();
      visibleCount = 0;
      saveTransactionsToLocalStorage();
      calcBalance();
      calcIncome();
      calcExpense();
      renderTransaction();
      showToast('Transaction deleted', 'delete');
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

  // filter by deleted and sort by time deleted at, if these are the same - then sort by date they were created
  const deletedTransactions = transactions
  .filter(t => t.deleted)
  .sort((a, b) => {
    const dateA = new Date(b.deletedAt) - new Date(a.deletedAt);
    if (dateA !== 0) return dateA;
    return new Date(b.date) - new Date(a.date); // fallback sort by transaction date
  });

  const deletedvisible = deletedTransactions.slice(0, visibleCount + itemsPerPage);

  // no deleted transactions message
  if(deletedvisible.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.textContent = 'No deleted transactions';
    cell.classList.add('empty-message-cell');
    cell.style.textAlign = 'center';
    row.append(cell);
    tbody.append(row);
    document.getElementById('load-more-btn').style.display = 'none';
    return;
  };

  deletedvisible.forEach(transaction => {
    const row = document.createElement('tr');
    row.innerHTML= `
    <td data-label="Date">${formatDate(transaction.date)}</td>
    <td data-label="Description">${transaction.description}</td>
    <td data-label="Income/Expense">${transaction.expenseCategory}</td>
    <td data-label="Amount">${transaction.expenseCategory === 'Expense' ? '-' : ''}£${transaction.amount.toFixed(2)}</td>
    <td data-label="Type"></td>
    <td data-label="Actions"><button class="restore-btn">Restore</button></td>
    `;

    // Add category label with colors
    const categoryCell = row.querySelector('td:nth-child(5)');
    const label = document.createElement('span'); 

    // Clear existing labels (if any)
    categoryCell.innerHTML = '';

    let formattedCategory = (transaction.typeCategory || '').trim().toLowerCase();
    formattedCategory = formattedCategory.charAt(0).toUpperCase() + formattedCategory.slice(1);

    label.classList.add('label');

    switch (formattedCategory) {
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

    label.textContent = formattedCategory;
    categoryCell.appendChild(label); 


    const restoreBtn = row.querySelector('.restore-btn')
    restoreBtn.addEventListener('click', () => {
      transaction.deleted = false;
      delete transaction.deletedAt;
      visibleCount = 0;
      saveTransactionsToLocalStorage();
      renderDeletedTransactions();
      calcBalance();
      calcIncome();
      calcExpense();
      showToast('Transaction restored', 'restore');
    });
    
    tbody.append(row);
    
  });
  // Show/hide Load More button
  visibleCount += itemsPerPage;
  const loadMoreBtn = document.getElementById('load-more-btn');
  loadMoreBtn.style.display = visibleCount >= deletedTransactions.length ? 'none' : 'block';

}

// Load More button logic
const loadMoreBtn = document.getElementById('load-more-btn');

loadMoreBtn.addEventListener('click', () => {
  if (currentView === 'transactions') {
    renderTransaction();
    console.log('im doing render transactions');
  } else if (currentView === 'bin') {
    renderDeletedTransactions();
    console.log('im doing render deleted transactions');
  }
})

// Filter buttons logic
document.getElementById('all-transactions-btn').addEventListener('click', () => {
  currentFilter = 'all';
  currentView = 'transactions';
  visibleCount = 0;
  renderTransaction();
  emptyBinBtn.classList.add('hidden');
  const isOpen = sidebar.classList.toggle('open');
  toggleBtn.setAttribute('aria-expanded', isOpen);
  document.querySelector('.title-container').scrollIntoView({ behavior: 'smooth' });

});

document.getElementById('income-btn').addEventListener('click', () => {
  currentFilter = 'income';
  currentView = 'transactions';
  visibleCount = 0;
  renderTransaction();
  emptyBinBtn.classList.add('hidden');
  const isOpen = sidebar.classList.toggle('open');
  toggleBtn.setAttribute('aria-expanded', isOpen);
  document.querySelector('.title-container').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('expenses-btn').addEventListener('click', () => {
  currentFilter = 'expense';
  currentView = 'transactions';
  visibleCount = 0;
  renderTransaction();
  emptyBinBtn.classList.add('hidden');
  const isOpen = sidebar.classList.toggle('open');
  toggleBtn.setAttribute('aria-expanded', isOpen);
  document.querySelector('.title-container').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('bin-btn').addEventListener('click', () => {
  currentView = 'bin';
  console.log('i am now the bin')
  visibleCount = 0;
  renderDeletedTransactions();
  emptyBinBtn.classList.remove('hidden');
  const isOpen = sidebar.classList.toggle('open');
  toggleBtn.setAttribute('aria-expanded', isOpen);
  document.querySelector('.title-container').scrollIntoView({ behavior: 'smooth' });
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
  const isOpen = sidebar.classList.toggle('open');
  toggleBtn.setAttribute('aria-expanded', isOpen);
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

cancelBinBtn.addEventListener('click', () => {
  modalBin.classList.add('hidden');
})


// collapse form
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('toggle-form-btn');
  const formCollapse = document.querySelector('.form-collapse');
  const titleContainer = document.querySelector('.transaction-title-container');
  
  // Track the current state
  let isOpen = true; // Form starts open
  
  toggleBtn.addEventListener('click', function() {
      if (isOpen) {
          // Close the form
          formCollapse.classList.add('collapsed');
          titleContainer.classList.add('collapsed');
          toggleBtn.textContent = 'Add transcaction';
          isOpen = false;
      } else {
          // Open the form
          formCollapse.classList.remove('collapsed');
          titleContainer.classList.remove('collapsed');
          toggleBtn.textContent = 'Collapse';
          isOpen = true;
      }
  });
});

// mobile sidebar collapsable menu
const toggleBtn = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');

document.addEventListener('DOMContentLoaded', () => {
  toggleBtn.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
  });
});



const filterButtons = document.querySelectorAll('#filters button');

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Remove active from all
    filterButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active to the clicked one
    button.classList.add('active');
    
    // Optional: set currentFilter or trigger rendering here
    // currentFilter = button.id;
  });
});

window.addEventListener('DOMContentLoaded', () => {
  const allBtn = document.getElementById('all-transactions-btn');
  allBtn.classList.add('active');
});


let toastTimeout;
let deleteCount = 0;
let restoreCount = 0;
let isDeleting = false;
let isRestoring = false;

function showToast(message, type = 'delete') {
  const toast = document.getElementById('toast');

  // Reset if switching type
  if ((type === 'delete' && isRestoring) || (type === 'restore' && isDeleting)) {
    deleteCount = 0;
    restoreCount = 0;
  }

  // Track type
  isDeleting = type === 'delete';
  isRestoring = type === 'restore';

  // Increment count
  if (type === 'delete') deleteCount++;
  else restoreCount++;

  // Set message
  const count = type === 'delete' ? deleteCount : restoreCount;
  toast.textContent = count > 1
    ? `${count} transactions ${type}d`
    : `Transaction ${type}d`;

  // Show toast
  toast.classList.remove('hidden');
  toast.classList.add('show');

  // Reset timer
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hidden');
    deleteCount = 0;
    restoreCount = 0;
    isDeleting = false;
    isRestoring = false;
  }, 2000);
}