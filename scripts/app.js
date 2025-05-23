let transactions = [];

document.getElementById('form').addEventListener('submit', function(e) {
  e.preventDefault(); // prevent form reloading

  const description = document.getElementById('description').value;
  const amount = document.getElementById('amount').value;
  const date = document.getElementById('date').value;
  const typeCategory = document.getElementById('type-category').value;
  const expenseCategory = document.getElementById('expense-category').value;

  // create new array
  const newTransaction = {
    id: crypto.randomUUID(),
    description,
    amount: parseFloat(amount),
    expenseCategory,
    date,
    typeCategory,
    deleted: false
  }
  // push new array to empty array for each item added
  transactions.push(newTransaction);
  console.log('New transaction array ', transactions);

  e.target.reset();


  // create a table data for table, append it to tbody HTML element, clear table to remove duplicates and re render
  function renderTransaction() {
    const tbody = document.querySelector('#transaction-table tbody');
    tbody.innerHTML = '';
    
    transactions.forEach(transaction => {
      if (transaction.deleted) return; // skip rendering deleted items

      const row = document.createElement('tr');

      row.innerHTML = `
      <td>${transaction.description}</td>
      <td>${transaction.expenseCategory === 'Expense' ? '-' : ''}£${transaction.amount.toFixed(2)}</td>
      <td>${transaction.expenseCategory}</td>
      <td>${transaction.typeCategory}</td>
      <td><button class="delete-btn">Delete</button></td>
      `;

      const deleteTransactionBtn = row.querySelector('.delete-btn');
      deleteTransactionBtn.addEventListener('click', () => {
        console.log('delete button clicked');
        transaction.deleted = true;
        renderTransaction(newTransaction);
        calcBalance();
        calcIncome();
    });
    tbody.appendChild(row);
    });
  }
  renderTransaction(newTransaction);


    function renderIncome() {
    
      const tbody = document.querySelector('#transaction-table tbody');
      const transListTitle = document.querySelector('#transactions h3');

      transListTitle.textContent = 'Transaction Income';

      tbody.innerHTML = '';
      
      transactions.forEach(t => {
        if (t.deleted) return; // skip rendering deleted items

        if (t.expenseCategory === 'Income') {
          const row = document.createElement('tr');
        
          row.innerHTML = `
          <td>${t.description}</td>
          <td>${t.expenseCategory === 'Expense' ? '-' : ''}£${t.amount.toFixed(2)}</td>
          <td>${t.expenseCategory}</td>
          <td>${t.typeCategory}</td>
          <td><button class="delete-btn">Delete</button></td>
          `;

          const deleteTransactionBtn = row.querySelector('.delete-btn');
          deleteTransactionBtn.addEventListener('click', () => {
          console.log('delete button clicked');
          t.deleted = true;
          renderIncome();
          calcBalance();
          calcIncome();
          });
          tbody.appendChild(row);
        }     
      })
    
  }
  incomeFilter.addEventListener('click', renderIncome);


  function calcBalance() {
    const totalBalance = document.getElementById('balance');
    
    let balance = 0;
    /*
    OLD CODE: loop through array and add all amounts together and render it on screen
    transactions.forEach(t => {
    balance += t.amount;
    });
    */

    // NEW CODE: loop through array, check if income or expense then add or subtract accordingly. render results
    transactions.forEach(t => {
      if (t.deleted) return; // don't calculate deleted items
      if (t.expenseCategory === 'Income') {
        balance += t.amount;
        // const income = document.getElementById('income');
        // income.textContent = 
      } else if(t.expenseCategory === 'Expense') {
        balance -= t.amount;
      }
    });
    // if balance is smaller than 0 add minus sign else do nothing. Math.abs remove minus sign before number as i've added my own before £
    totalBalance.textContent = `${balance < 0 ? '-' : ''}£${Math.abs(balance).toFixed(2)}`;
    console.log('rendered balance of ', balance);
  }
  calcBalance();


  // calculate total income history and render it
  function calcIncome() {
  const totalIncome = document.getElementById('income');

  let income = 0;

  transactions.forEach(i => {
    if (i.deleted) return; // skip rendering deleted items
    if (i.expenseCategory === 'Income') {
      income += i.amount;
    }
  });
  totalIncome.textContent = `£${income.toFixed(2)}`;
  }
  calcIncome();


  function calcExpense() {
    const totalExpense = document.getElementById('expenses');

    let expense = 0;

    transactions.forEach(e => {
      if (e.expenseCategory === 'Expense') {
        expense -= e.amount;
      }
    })
    totalExpense.textContent = `-£${Math.abs(expense).toFixed(2)}`;
  }
  calcExpense();







})

const allFilter = document.getElementById('all-transactions-btn');
const incomeFilter = document.getElementById('income-btn');
const expensesFilter = document.getElementById('expenses-btn');















