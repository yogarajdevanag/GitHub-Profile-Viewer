// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    // Get references to the form, expense list, and total amount
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const totalAmountElement = document.getElementById('total-expenses-amount');
    const emptyStateMessage = document.getElementById('empty-state');

    // --- Event Listeners ---
    expenseForm.addEventListener('submit', addExpense);
    expenseList.addEventListener('click', handleListClick);

    // --- Initial Load ---
    loadInitialData();

    // --- Main Functions ---

    /**
     * Handles the form submission to add a new expense.
     * @param {Event} e - The form submission event.
     */
    function addExpense(e) {
        e.preventDefault();

        const amountInput = document.getElementById('amount');
        const descriptionInput = document.getElementById('description');
        const categoryInput = document.getElementById('category');

        const expense = {
            id: Date.now(),
            amount: parseFloat(amountInput.value),
            description: descriptionInput.value.trim(),
            category: categoryInput.value
        };
        
        if (!expense.description) {
            alert('Please enter a description.');
            return;
        }

        displayExpense(expense);
        saveExpenseToLocalStorage(expense);
        updateTotal();
        checkEmptyState();

        expenseForm.reset();
        document.getElementById('category').value = ""; // Reset select to default
    }

    /**
     * Handles clicks on the expense list for deleting or editing items.
     * @param {Event} e - The click event.
     */
    function handleListClick(e) {
        const target = e.target;
        const li = target.closest('.list-group-item');
        if (!li || li.id === 'empty-state') return;

        const expenseId = li.dataset.id;

        if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) {
            deleteExpense(expenseId, li);
        }

        if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
            editExpense(expenseId, li);
        }
    }

    /**
     * Creates and appends a new expense item to the list in the UI.
     * @param {object} expense - The expense object to display.
     */
    function displayExpense(expense) {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.dataset.id = expense.id;

        li.innerHTML = `
            <div>
                <strong class="d-block">${expense.description}</strong>
                <small class="text-muted">${expense.category} • $${expense.amount.toFixed(2)}</small>
            </div>
            <div>
                <button class="btn btn-outline-secondary btn-sm edit-btn" title="Edit">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm delete-btn ms-1" title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        expenseList.appendChild(li);
    }
    
    /**
     * Deletes an expense from the UI and local storage.
     * @param {string} id - The ID of the expense to delete.
     * @param {HTMLElement} liElement - The list item element to remove from the UI.
     */
    function deleteExpense(id, liElement) {
        liElement.remove();
        removeExpenseFromLocalStorage(id);
        updateTotal();
        checkEmptyState();
    }
    
    /**
     * Prepares an expense for editing by populating the form.
     * @param {string} id - The ID of the expense to edit.
     * @param {HTMLElement} liElement - The list item element of the expense.
     */
    function editExpense(id, liElement) {
        const expenses = getExpensesFromLocalStorage();
        const expenseToEdit = expenses.find(expense => expense.id == id);
        if (!expenseToEdit) return;

        document.getElementById('amount').value = expenseToEdit.amount;
        document.getElementById('description').value = expenseToEdit.description;
        document.getElementById('category').value = expenseToEdit.category;

        deleteExpense(id, liElement); // Remove the old entry
    }

    /**
     * Updates the total expense amount displayed in the UI.
     */
    function updateTotal() {
        const expenses = getExpensesFromLocalStorage();
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        totalAmountElement.textContent = `$${total.toFixed(2)}`;
    }

    /**
     * Shows or hides the 'empty state' message based on whether there are expenses.
     */
    function checkEmptyState() {
        if (getExpensesFromLocalStorage().length === 0) {
            emptyStateMessage.style.display = 'block';
        } else {
            emptyStateMessage.style.display = 'none';
        }
    }
    
    /**
     * Loads initial data from local storage and displays it.
     */
    function loadInitialData() {
        const expenses = getExpensesFromLocalStorage();
        expenses.forEach(expense => displayExpense(expense));
        updateTotal();
        checkEmptyState();
    }

    // --- Local Storage Functions ---

    function getExpensesFromLocalStorage() {
        return JSON.parse(localStorage.getItem('expenses')) || [];
    }

    function saveExpenseToLocalStorage(expense) {
        const expenses = getExpensesFromLocalStorage();
        expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }

    function removeExpenseFromLocalStorage(id) {
        let expenses = getExpensesFromLocalStorage();
        expenses = expenses.filter(expense => expense.id != id);
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }
});