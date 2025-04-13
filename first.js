let budget = 0;
let expenses = 0;
let expenseList = [];

let categoryTotals = {
    Food: 0,
    Transport: 0,
    Shopping: 0,
    Bills: 0,
    Other: 0
};

function saveToLocal() {
    localStorage.setItem("budget", JSON.stringify(budget));
    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("expenseList", JSON.stringify(expenseList));
    localStorage.setItem("categoryTotals", JSON.stringify(categoryTotals));
}

function loadFromLocal() {
    const storedBudget = JSON.parse(localStorage.getItem("budget"));
    const storedExpenses = JSON.parse(localStorage.getItem("expenses"));
    const storedList = JSON.parse(localStorage.getItem("expenseList"));
    const storedCategories = JSON.parse(localStorage.getItem("categoryTotals"));

    if (storedBudget) budget = storedBudget;
    if (storedExpenses) expenses = storedExpenses;
    if (storedList) expenseList = storedList;
    if (storedCategories) categoryTotals = storedCategories;

    document.getElementById('totalBudget').textContent = budget.toFixed(2);
    document.getElementById('totalExpenses').textContent = expenses.toFixed(2);
    updateRemainingBudget();
    updateCircularProgress();
    updatePieChart();
    updateMonthlySummary();
    renderExpenses();
}

function setBudget() {
    const budgetInput = document.getElementById('budgetInput');
    budget = parseFloat(budgetInput.value);

    if (isNaN(budget) || budget <= 0) {
        alert("Please enter a valid budget amount.");
        return;
    }

    document.getElementById('totalBudget').textContent = budget.toFixed(2);
    updateCircularProgress();
    updateRemainingBudget();
    saveToLocal();
  
}

function addExpense() {
    const descriptionInput = document.getElementById('expenseDesc');
    const amountInput = document.getElementById('expenseAmount');
    const categoryInput = document.getElementById('expenseCategory');
    const dateInput = document.getElementById('expenseDate');
    const receiptInput = document.getElementById('receiptUpload');

    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;
    const receipt = receiptInput.files[0];

    if (!description || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid expense description and amount.");
        return;
    }

    expenses += amount;
    expenseList.push({ description, amount, category, date });
    categoryTotals[category] += amount;

    document.getElementById('totalExpenses').textContent = expenses.toFixed(2);

    renderExpenses();

    descriptionInput.value = '';
    amountInput.value = '';
    dateInput.value = '';
    receiptInput.value = '';

    updateCircularProgress();
    updateRemainingBudget();
    updatePieChart();
    updateMonthlySummary();
    checkBudgetOveruse();
    saveToLocal();
    
}

function removeExpense(button, amount, category, index) {
    expenses -= amount;
    categoryTotals[category] -= amount;

    expenseList.splice(index, 1);

    document.getElementById('totalExpenses').textContent = expenses.toFixed(2);
    updateCircularProgress();
    updateRemainingBudget();
    updatePieChart();
    updateMonthlySummary();
    checkBudgetOveruse();
    saveToLocal();
    renderExpenses();
}

function editExpense(index) {
    const exp = expenseList[index];
    document.getElementById('expenseDesc').value = exp.description;
    document.getElementById('expenseAmount').value = exp.amount;
    document.getElementById('expenseCategory').value = exp.category;
    document.getElementById('expenseDate').value = exp.date;

    removeExpense(null, exp.amount, exp.category, index);
}

function renderExpenses() {
    const list = document.getElementById('expenseList');
    list.innerHTML = '';
    const icons = {
        Food: "🍕",
        Transport: "🚌",
        Shopping: "🛒",
        Bills: "💡",
        Other: "🔖"
    };

    expenseList.forEach((exp, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${icons[exp.category]} <strong>${exp.description}</strong> (${exp.category}) - ₹${exp.amount.toFixed(2)} - ${exp.date || 'No Date'}
            <button class="edit-btn" style="font-size: 0.7rem; margin-left: 8px;" onclick="editExpense(${index})">✏️</button>
            <button class="delete-btn" onclick="removeExpense(this, ${exp.amount}, '${exp.category}', ${index})">🗑</button>
        `;
        list.appendChild(li);
    });
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

    progressValue.style.color = expenses > budget ? 'red' : 'white';
}

function checkBudgetOveruse() {
    const alertBox = document.getElementById('budgetAlert');
    if (expenses > budget) {
        alertBox.textContent = "🚨 You've exceeded your budget!";
    } else {
        alertBox.textContent = "";
    }
}

function updateRemainingBudget() {
    const remaining = Math.max(budget - expenses, 0);
    document.getElementById('remainingBudget').textContent = remaining.toFixed(2);
}

function updatePieChart() {
    pieChart.data.datasets[0].data = Object.values(categoryTotals);
    pieChart.update();
}

function updateMonthlySummary() {
    const summaryContainer = document.getElementById('monthlySummary');
    summaryContainer.innerHTML = '';

    const monthlyTotals = {};
    expenseList.forEach(({ amount, date }) => {
        if (!date) return;
        const month = date.slice(0, 7); // YYYY-MM
        if (!monthlyTotals[month]) monthlyTotals[month] = 0;
        monthlyTotals[month] += amount;
    });

    for (const month in monthlyTotals) {
        const div = document.createElement('div');
        div.innerHTML = `<strong>${month}:</strong> ₹${monthlyTotals[month].toFixed(2)}`;
        summaryContainer.appendChild(div);
    }
}




function exportToCSV() {
    if (expenseList.length === 0) {
        alert("No expenses to export.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Description,Amount,Category,Date\n";

    expenseList.forEach(exp => {
        const row = `${exp.description},${exp.amount},${exp.category},${exp.date}`;
        csvContent += row + "\n";
    });



    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    link.setAttribute("download", `expenses_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function clearAllData() {
    if (confirm("Are you sure you want to clear all data?")) {
        budget = 0;
        expenses = 0;
        expenseList = [];
        for (let cat in categoryTotals) categoryTotals[cat] = 0;

        localStorage.clear();
        loadFromLocal();
    }
}

// Setup pie chart
const ctx = document.getElementById('categoryChart').getContext('2d');
let pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: Object.keys(categoryTotals),
        datasets: [{
            data: Object.values(categoryTotals),
            backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6']
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                labels: { color: 'white' }
            }
        }
    }
});

// Load data initially
loadFromLocal();
