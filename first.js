
let budget = 0;
let expenses = 0;
let expenseList = [];

function setBudget() {
    const budgetInput = document.getElementById('budgetInput');
    budget = parseFloat(budgetInput.value);

    if (isNaN(budget) || budget <= 0) {
        alert("Please enter a valid budget amount.");
        return;
    }

    document.getElementById('totalBudget').textContent = budget.toFixed(2);
    // budgetInput.value = '';
    updateCircularProgress();
}

function addExpense() {
    const descriptionInput = document.getElementById('expenseDesc');
    const amountInput = document.getElementById('expenseAmount');

    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (!description || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid expense description and amount.");
        return;
    }

    expenses += amount;
    expenseList.push({ description, amount });
    document.getElementById('totalExpenses').textContent = expenses.toFixed(2);

    const listItem = document.createElement('li');
    listItem.innerHTML = `
        ${description} - ${amount.toFixed(2)}
        <button class="delete-btn" onclick="removeExpense(this, ${amount})">🗑</button>
    `;
    document.getElementById('expenseList').appendChild(listItem);

    descriptionInput.value = '';
    amountInput.value = '';

    updateCircularProgress();
}

function removeExpense(button, amount) {
    const li = button.parentElement;
    li.remove();
    expenses -= amount;
    document.getElementById('totalExpenses').textContent = expenses.toFixed(2);
    updateCircularProgress();
}

function updateCircularProgress() {
    const circle = document.querySelector('.progress-bar');
    const progressValue = document.querySelector('.progress-value');

    if (budget === 0) {
        circle.style.strokeDashoffset = 314;
        progressValue.textContent = "0%";
        return;
    }

    const percentage = Math.min((expenses / budget) * 100, 100);
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    circle.style.strokeDashoffset = offset;
    progressValue.textContent = `${Math.round((expenses / budget) * 100)}%`;

    if (expenses > budget) {
        progressValue.style.color = 'red';
    } else {
        progressValue.style.color = 'white';
    }
}

// Initialize with 0% progress
updateCircularProgress();