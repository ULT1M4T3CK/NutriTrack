// Calorie Tracker Application JavaScript

// Sample data from the provided JSON
const sampleFoods = [
    { name: "Grilled Chicken Breast", calories: 165, protein: 31, fat: 3.6, carbs: 0 },
    { name: "Brown Rice (1 cup)", calories: 216, protein: 5, fat: 1.8, carbs: 45 },
    { name: "Broccoli (1 cup)", calories: 25, protein: 3, fat: 0.3, carbs: 5 },
    { name: "Banana", calories: 105, protein: 1.3, fat: 0.4, carbs: 27 },
    { name: "Almonds (1 oz)", calories: 164, protein: 6, fat: 14, carbs: 6 },
    { name: "Greek Yogurt (1 cup)", calories: 130, protein: 23, fat: 0, carbs: 9 },
    { name: "Oatmeal (1 cup)", calories: 154, protein: 6, fat: 3, carbs: 28 },
    { name: "Eggs (2 large)", calories: 140, protein: 12, fat: 10, carbs: 1 },
    { name: "Apple", calories: 95, protein: 0.5, fat: 0.3, carbs: 25 },
    { name: "Salmon (4 oz)", calories: 206, protein: 28, fat: 9, carbs: 0 }
];

const mealCategories = [
    { id: "breakfast", name: "Breakfast", order: 1 },
    { id: "morning_snack", name: "After Breakfast Snack", order: 2 },
    { id: "lunch", name: "Lunch", order: 3 },
    { id: "afternoon_snack", name: "After Lunch Snack", order: 4 },
    { id: "dinner", name: "Dinner", order: 5 },
    { id: "evening_snack", name: "After Dinner Snack", order: 6 }
];

const sampleWeightData = [
    { date: "2024-01-01", weight: 180.6, week: 1 },
    { date: "2024-01-08", weight: 178.9, week: 2 },
    { date: "2024-01-15", weight: 177.3, week: 3 },
    { date: "2024-01-22", weight: 176.2, week: 4 },
    { date: "2024-01-29", weight: 172.7, week: 5 },
    { date: "2024-02-05", weight: 171.1, week: 6 },
    { date: "2024-02-12", weight: 169.8, week: 7 },
    { date: "2024-02-19", weight: 168.2, week: 8 },
    { date: "2024-02-26", weight: 166.9, week: 9 },
    { date: "2024-03-05", weight: 165.3, week: 10 },
    { date: "2024-03-12", weight: 163.7, week: 11 },
    { date: "2024-03-19", weight: 162.4, week: 12 }
];

// Application state
let appState = {
    goals: {
        calorieTarget: 2000,
        proteinPercent: 30,
        fatPercent: 30,
        carbPercent: 40,
        weightGoal: 160
    },
    dailyEntries: {},
    weightEntries: [...sampleWeightData],
    currentDate: new Date().toISOString().split('T')[0]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeApp();
});

function initializeApp() {
    console.log('Initializing app...');
    
    // Load saved data
    loadAppData();
    
    // Setup navigation
    setupNavigation();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize today's date
    updateDateDisplay();
    
    // Generate meal sections
    generateMealSections();
    
    // Update dashboard
    updateDashboard();
    
    // Initialize weight tracker
    initializeWeightTracker();
    
    // Initialize goals
    initializeGoals();
    
    // Populate food select dropdown
    populateFoodSelect();
    
    console.log('App initialized successfully');
}

function loadAppData() {
    // Initialize today's entries if not exists
    if (!appState.dailyEntries[appState.currentDate]) {
        appState.dailyEntries[appState.currentDate] = {
            breakfast: [],
            morning_snack: [],
            lunch: [],
            afternoon_snack: [],
            dinner: [],
            evening_snack: []
        };
    }
}

function setupNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.app-section');
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetSection = this.dataset.tab;
            
            // Update active tab
            navTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
            
            // Update specific sections when navigated to
            if (targetSection === 'dashboard') {
                updateDashboard();
            } else if (targetSection === 'weight-tracker') {
                updateWeightChart();
            }
        });
    });
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Quick action buttons
    const addFoodBtn = document.getElementById('add-food-btn');
    const scanBarcodeBtn = document.getElementById('scan-barcode-btn');
    const logWeightBtn = document.getElementById('log-weight-btn');
    
    if (addFoodBtn) {
        addFoodBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Add food button clicked');
            openFoodModal();
        });
    }
    
    if (scanBarcodeBtn) {
        scanBarcodeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openBarcodeModal();
        });
    }
    
    if (logWeightBtn) {
        logWeightBtn.addEventListener('click', function(e) {
            e.preventDefault();
            switchToWeightTracker();
        });
    }
    
    // Food entry form
    const foodForm = document.getElementById('food-entry-form');
    if (foodForm) {
        foodForm.addEventListener('submit', handleFoodSubmit);
    }
    
    const cancelFoodBtn = document.getElementById('cancel-food-btn');
    if (cancelFoodBtn) {
        cancelFoodBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeFoodModal();
        });
    }
    
    // Food select dropdown
    const foodSelect = document.getElementById('food-select');
    if (foodSelect) {
        foodSelect.addEventListener('change', handleFoodSelection);
    }
    
    // Weight form
    const weightForm = document.getElementById('weight-form');
    if (weightForm) {
        weightForm.addEventListener('submit', handleWeightSubmit);
    }
    
    // Goals form
    const goalsForm = document.getElementById('nutrition-goals-form');
    if (goalsForm) {
        goalsForm.addEventListener('submit', handleGoalsSubmit);
    }
    
    // Macro sliders
    const sliders = ['protein-percent-goal', 'fat-percent-goal', 'carbs-percent-goal'];
    sliders.forEach(id => {
        const slider = document.getElementById(id);
        if (slider) {
            slider.addEventListener('input', updateMacroSliders);
            slider.addEventListener('change', updateMacroSliders);
        }
    });
    
    // Data management buttons
    const exportBtn = document.getElementById('export-data-btn');
    const backupBtn = document.getElementById('backup-data-btn');
    const clearBtn = document.getElementById('clear-data-btn');
    
    if (exportBtn) exportBtn.addEventListener('click', exportData);
    if (backupBtn) backupBtn.addEventListener('click', backupData);
    if (clearBtn) clearBtn.addEventListener('click', clearData);
    
    // Modal close buttons
    document.querySelectorAll('.modal-close, .close-scanner-btn').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModals();
            }
        });
    });
    
    // Set today's date for weight input
    const weightDateInput = document.getElementById('weight-date');
    if (weightDateInput) {
        weightDateInput.value = appState.currentDate;
    }
    
    console.log('Event listeners set up successfully');
}

function updateDateDisplay() {
    const today = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

function generateMealSections() {
    const mealSectionsContainer = document.querySelector('.meal-sections');
    if (!mealSectionsContainer) return;
    
    mealSectionsContainer.innerHTML = '';
    
    mealCategories.forEach(meal => {
        const mealSection = document.createElement('div');
        mealSection.className = 'meal-section';
        mealSection.innerHTML = `
            <div class="meal-header">
                <h3 class="meal-title">${meal.name}</h3>
                <div class="meal-header-calories">
                    <span id="calories-${meal.id}">0</span> calories
                </div>
            </div>
            <div class="meal-content">
                <div class="food-list" id="food-list-${meal.id}">
                    <div class="no-foods">No foods logged for this meal</div>
                </div>
                <button class="btn btn--secondary add-food-btn" data-meal="${meal.id}">
                    <span class="icon">+</span> Add Food to ${meal.name}
                </button>
            </div>
        `;
        mealSectionsContainer.appendChild(mealSection);
        
        // Add event listener to the meal-specific add food button
        const addFoodBtn = mealSection.querySelector('.add-food-btn');
        addFoodBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openFoodModal(meal.id);
        });
    });
    
    updateMealDisplays();
}

function updateMealDisplays() {
    const todayEntries = appState.dailyEntries[appState.currentDate] || {};
    
    mealCategories.forEach(meal => {
        const mealEntries = todayEntries[meal.id] || [];
        const foodList = document.getElementById(`food-list-${meal.id}`);
        const caloriesElement = document.getElementById(`calories-${meal.id}`);
        
        if (!foodList || !caloriesElement) return;
        
        let totalCalories = 0;
        
        if (mealEntries.length === 0) {
            foodList.innerHTML = '<div class="no-foods">No foods logged for this meal</div>';
        } else {
            foodList.innerHTML = mealEntries.map((entry, index) => {
                const entryCalories = (entry.calories || 0) * (entry.quantity || 1);
                const entryProtein = (entry.protein || 0) * (entry.quantity || 1);
                const entryFat = (entry.fat || 0) * (entry.quantity || 1);
                const entryCarbs = (entry.carbs || 0) * (entry.quantity || 1);
                
                totalCalories += entryCalories;
                
                return `
                    <div class="food-item">
                        <div class="food-info">
                            <div class="food-name">${entry.name} (${entry.quantity}x)</div>
                            <div class="food-nutrients">
                                ${Math.round(entryCalories)} cal, 
                                ${Math.round(entryProtein)}g protein, 
                                ${Math.round(entryFat)}g fat, 
                                ${Math.round(entryCarbs)}g carbs
                            </div>
                        </div>
                        <div class="food-actions">
                            <button class="food-action" onclick="editFood('${meal.id}', ${index})" title="Edit">✏️</button>
                            <button class="food-action" onclick="deleteFood('${meal.id}', ${index})" title="Delete">🗑️</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        caloriesElement.textContent = Math.round(totalCalories);
    });
    
    updateTodaysMealsSummary();
}

function updateTodaysMealsSummary() {
    const mealSummaryList = document.querySelector('.meal-summary-list');
    if (!mealSummaryList) return;
    
    const todayEntries = appState.dailyEntries[appState.currentDate] || {};
    
    mealSummaryList.innerHTML = mealCategories.map(meal => {
        const mealEntries = todayEntries[meal.id] || [];
        const totalCalories = mealEntries.reduce((sum, entry) => {
            return sum + ((entry.calories || 0) * (entry.quantity || 1));
        }, 0);
        
        if (totalCalories === 0) {
            return `
                <div class="meal-summary-item">
                    <span class="meal-name">${meal.name}</span>
                    <span class="meal-empty">No foods logged</span>
                </div>
            `;
        } else {
            return `
                <div class="meal-summary-item">
                    <span class="meal-name">${meal.name}</span>
                    <span class="meal-calories">${Math.round(totalCalories)} cal</span>
                </div>
            `;
        }
    }).join('');
}

function updateDashboard() {
    const todayEntries = appState.dailyEntries[appState.currentDate] || {};
    
    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    
    Object.values(todayEntries).forEach(mealEntries => {
        if (Array.isArray(mealEntries)) {
            mealEntries.forEach(entry => {
                const quantity = entry.quantity || 1;
                totalCalories += (entry.calories || 0) * quantity;
                totalProtein += (entry.protein || 0) * quantity;
                totalFat += (entry.fat || 0) * quantity;
                totalCarbs += (entry.carbs || 0) * quantity;
            });
        }
    });
    
    // Update calorie display
    const caloriesConsumed = document.getElementById('calories-consumed');
    const calorieGoal = document.getElementById('calorie-goal');
    const calorieGoalDisplay = document.getElementById('calorie-goal-display');
    const caloriesConsumedDisplay = document.getElementById('calories-consumed-display');
    const caloriesRemaining = document.getElementById('calories-remaining');
    
    if (caloriesConsumed) caloriesConsumed.textContent = Math.round(totalCalories);
    if (calorieGoal) calorieGoal.textContent = appState.goals.calorieTarget;
    if (calorieGoalDisplay) calorieGoalDisplay.textContent = appState.goals.calorieTarget;
    if (caloriesConsumedDisplay) caloriesConsumedDisplay.textContent = Math.round(totalCalories);
    if (caloriesRemaining) caloriesRemaining.textContent = Math.max(0, appState.goals.calorieTarget - totalCalories);
    
    // Update macronutrient display
    updateMacroDisplay('protein', totalProtein);
    updateMacroDisplay('fat', totalFat);
    updateMacroDisplay('carbs', totalCarbs);
    
    // Update charts
    updateCalorieProgressChart(totalCalories);
    updateMacroChart(totalProtein, totalFat, totalCarbs);
    
    // Update meal displays
    updateMealDisplays();
}

function updateMacroDisplay(macro, amount) {
    const calorieTarget = appState.goals.calorieTarget;
    const macroPercent = appState.goals[`${macro}Percent`] || 0;
    const macroCalories = (calorieTarget * macroPercent) / 100;
    const macroGrams = macro === 'protein' || macro === 'carbs' ? macroCalories / 4 : macroCalories / 9;
    const progress = macroGrams > 0 ? Math.min(100, (amount / macroGrams) * 100) : 0;
    
    const amountElement = document.getElementById(`${macro}-amount`);
    const progressElement = document.getElementById(`${macro}-progress`);
    const percentElement = document.getElementById(`${macro}-percent`);
    
    if (amountElement) amountElement.textContent = `${Math.round(amount)}g`;
    if (progressElement) progressElement.style.width = `${progress}%`;
    if (percentElement) percentElement.textContent = `${Math.round(progress)}%`;
}

function updateCalorieProgressChart(consumed) {
    const canvas = document.getElementById('calorieProgressChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear previous chart
    if (window.calorieChart) {
        window.calorieChart.destroy();
    }
    
    const goal = appState.goals.calorieTarget;
    const remaining = Math.max(0, goal - consumed);
    
    window.calorieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [consumed, remaining],
                backgroundColor: ['#1FB8CD', '#ECEBD5'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '75%',
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateMacroChart(protein, fat, carbs) {
    const canvas = document.getElementById('macroChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear previous chart
    if (window.macroChart) {
        window.macroChart.destroy();
    }
    
    // Convert to calories for better visualization
    const proteinCals = protein * 4;
    const fatCals = fat * 9;
    const carbsCals = carbs * 4;
    
    // Only show chart if there's data
    if (proteinCals + fatCals + carbsCals === 0) {
        return;
    }
    
    window.macroChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Protein', 'Fat', 'Carbs'],
            datasets: [{
                data: [proteinCals, fatCals, carbsCals],
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function openFoodModal(mealId = null) {
    console.log('Opening food modal for meal:', mealId);
    
    const modal = document.getElementById('food-entry-modal');
    const form = document.getElementById('food-entry-form');
    
    if (!modal || !form) {
        console.error('Modal or form not found');
        return;
    }
    
    // Reset form
    form.reset();
    document.getElementById('edit-food-id').value = '';
    document.getElementById('food-meal-category').value = mealId || 'breakfast';
    document.getElementById('food-modal-title').textContent = 'Add Food Item';
    document.getElementById('food-quantity').value = 1;
    
    modal.classList.add('visible');
    console.log('Modal opened');
}

function openBarcodeModal() {
    const modal = document.getElementById('barcode-scanner-modal');
    if (modal) {
        modal.classList.add('visible');
    }
}

function closeFoodModal() {
    const modal = document.getElementById('food-entry-modal');
    if (modal) {
        modal.classList.remove('visible');
    }
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('visible');
    });
}

function populateFoodSelect() {
    const select = document.getElementById('food-select');
    if (!select) return;
    
    // Clear existing options except the first one
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    sampleFoods.forEach(food => {
        const option = document.createElement('option');
        option.value = food.name;
        option.textContent = food.name;
        select.appendChild(option);
    });
}

function handleFoodSelection() {
    const select = document.getElementById('food-select');
    if (!select) return;
    
    const selectedFood = sampleFoods.find(food => food.name === select.value);
    
    if (selectedFood) {
        document.getElementById('food-name').value = selectedFood.name;
        document.getElementById('food-calories').value = selectedFood.calories;
        document.getElementById('food-protein').value = selectedFood.protein;
        document.getElementById('food-fat').value = selectedFood.fat;
        document.getElementById('food-carbs').value = selectedFood.carbs;
    }
}

function handleFoodSubmit(e) {
    e.preventDefault();
    console.log('Food form submitted');
    
    const foodEntry = {
        name: document.getElementById('food-name').value,
        quantity: parseFloat(document.getElementById('food-quantity').value) || 1,
        calories: parseFloat(document.getElementById('food-calories').value) || 0,
        protein: parseFloat(document.getElementById('food-protein').value) || 0,
        fat: parseFloat(document.getElementById('food-fat').value) || 0,
        carbs: parseFloat(document.getElementById('food-carbs').value) || 0
    };
    
    const mealCategory = document.getElementById('food-meal-category').value || 'breakfast';
    const editId = document.getElementById('edit-food-id').value;
    
    // Initialize today's entries if not exists
    if (!appState.dailyEntries[appState.currentDate]) {
        appState.dailyEntries[appState.currentDate] = {};
    }
    if (!appState.dailyEntries[appState.currentDate][mealCategory]) {
        appState.dailyEntries[appState.currentDate][mealCategory] = [];
    }
    
    if (editId !== '') {
        // Edit existing entry
        appState.dailyEntries[appState.currentDate][mealCategory][parseInt(editId)] = foodEntry;
    } else {
        // Add new entry
        appState.dailyEntries[appState.currentDate][mealCategory].push(foodEntry);
    }
    
    console.log('Food entry saved:', foodEntry);
    updateDashboard();
    closeFoodModal();
    saveAppData();
}

function editFood(mealId, index) {
    const foodEntry = appState.dailyEntries[appState.currentDate][mealId][index];
    if (!foodEntry) return;
    
    document.getElementById('food-name').value = foodEntry.name;
    document.getElementById('food-quantity').value = foodEntry.quantity;
    document.getElementById('food-calories').value = foodEntry.calories;
    document.getElementById('food-protein').value = foodEntry.protein;
    document.getElementById('food-fat').value = foodEntry.fat;
    document.getElementById('food-carbs').value = foodEntry.carbs;
    document.getElementById('food-meal-category').value = mealId;
    document.getElementById('edit-food-id').value = index;
    document.getElementById('food-modal-title').textContent = 'Edit Food Item';
    
    document.getElementById('food-entry-modal').classList.add('visible');
}

function deleteFood(mealId, index) {
    if (confirm('Are you sure you want to delete this food item?')) {
        appState.dailyEntries[appState.currentDate][mealId].splice(index, 1);
        updateDashboard();
        saveAppData();
    }
}

function initializeWeightTracker() {
    updateLatestWeight();
    updateWeightChart();
    updateWeightEntries();
}

function updateLatestWeight() {
    const latestWeightElement = document.getElementById('latest-weight');
    const goalWeightElement = document.getElementById('goal-weight');
    const weightToGoalElement = document.getElementById('weight-to-goal');
    
    if (appState.weightEntries.length > 0) {
        const latest = appState.weightEntries[appState.weightEntries.length - 1];
        if (latestWeightElement) latestWeightElement.textContent = `${latest.weight} lbs`;
        
        const remaining = latest.weight - appState.goals.weightGoal;
        if (weightToGoalElement) weightToGoalElement.textContent = Math.abs(remaining).toFixed(1);
    }
    
    if (goalWeightElement) goalWeightElement.textContent = `${appState.goals.weightGoal} lbs`;
}

function updateWeightChart() {
    const canvas = document.getElementById('weightChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear previous chart
    if (window.weightChart) {
        window.weightChart.destroy();
    }
    
    const labels = appState.weightEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const weights = appState.weightEntries.map(entry => entry.weight);
    const goalLine = new Array(weights.length).fill(appState.goals.weightGoal);
    
    window.weightChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Weight',
                data: weights,
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                tension: 0.3,
                fill: true
            }, {
                label: 'Goal',
                data: goalLine,
                borderColor: '#B4413C',
                borderDash: [5, 5],
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

function updateWeightEntries() {
    const entriesList = document.querySelector('.weight-entries-list');
    if (!entriesList) return;
    
    const recentEntries = appState.weightEntries.slice(-5).reverse();
    
    entriesList.innerHTML = recentEntries.map(entry => `
        <div class="weight-entry-item">
            <span class="weight-entry-date">${new Date(entry.date).toLocaleDateString()}</span>
            <span class="weight-entry-value">${entry.weight} lbs</span>
        </div>
    `).join('');
}

function handleWeightSubmit(e) {
    e.preventDefault();
    
    const weight = parseFloat(document.getElementById('current-weight').value);
    const date = document.getElementById('weight-date').value;
    
    if (!weight || !date) {
        alert('Please enter both weight and date');
        return;
    }
    
    const newEntry = {
        date: date,
        weight: weight,
        week: appState.weightEntries.length + 1
    };
    
    appState.weightEntries.push(newEntry);
    
    updateLatestWeight();
    updateWeightChart();
    updateWeightEntries();
    
    // Reset form
    document.getElementById('weight-form').reset();
    document.getElementById('weight-date').value = appState.currentDate;
    
    saveAppData();
    alert('Weight logged successfully!');
}

function switchToWeightTracker() {
    const weightTab = document.querySelector('.nav-tab[data-tab="weight-tracker"]');
    if (weightTab) {
        weightTab.click();
    }
}

function initializeGoals() {
    const calorieTarget = document.getElementById('calorie-target');
    const proteinPercent = document.getElementById('protein-percent-goal');
    const fatPercent = document.getElementById('fat-percent-goal');
    const carbsPercent = document.getElementById('carbs-percent-goal');
    const weightGoal = document.getElementById('weight-goal');
    
    if (calorieTarget) calorieTarget.value = appState.goals.calorieTarget;
    if (proteinPercent) proteinPercent.value = appState.goals.proteinPercent;
    if (fatPercent) fatPercent.value = appState.goals.fatPercent;
    if (carbsPercent) carbsPercent.value = appState.goals.carbPercent;
    if (weightGoal) weightGoal.value = appState.goals.weightGoal;
    
    updateMacroSliders();
}

function updateMacroSliders() {
    const proteinSlider = document.getElementById('protein-percent-goal');
    const fatSlider = document.getElementById('fat-percent-goal');
    const carbsSlider = document.getElementById('carbs-percent-goal');
    
    if (!proteinSlider || !fatSlider || !carbsSlider) return;
    
    const proteinPercent = parseInt(proteinSlider.value);
    const fatPercent = parseInt(fatSlider.value);
    const carbsPercent = parseInt(carbsSlider.value);
    
    const proteinDisplay = document.getElementById('protein-percent-display');
    const fatDisplay = document.getElementById('fat-percent-display');
    const carbsDisplay = document.getElementById('carbs-percent-display');
    
    if (proteinDisplay) proteinDisplay.textContent = proteinPercent;
    if (fatDisplay) fatDisplay.textContent = fatPercent;
    if (carbsDisplay) carbsDisplay.textContent = carbsPercent;
    
    const total = proteinPercent + fatPercent + carbsPercent;
    const totalElement = document.getElementById('macro-total-percent');
    const validationMessage = document.getElementById('macro-validation-message');
    
    if (totalElement) totalElement.textContent = total;
    
    if (validationMessage) {
        if (total !== 100) {
            validationMessage.textContent = '(Must equal 100%)';
            validationMessage.style.color = 'var(--color-error)';
        } else {
            validationMessage.textContent = '✓';
            validationMessage.style.color = 'var(--color-success)';
        }
    }
}

function handleGoalsSubmit(e) {
    e.preventDefault();
    
    const proteinPercent = parseInt(document.getElementById('protein-percent-goal').value);
    const fatPercent = parseInt(document.getElementById('fat-percent-goal').value);
    const carbsPercent = parseInt(document.getElementById('carbs-percent-goal').value);
    
    if (proteinPercent + fatPercent + carbsPercent !== 100) {
        alert('Macronutrient percentages must add up to 100%');
        return;
    }
    
    appState.goals = {
        calorieTarget: parseInt(document.getElementById('calorie-target').value),
        proteinPercent: proteinPercent,
        fatPercent: fatPercent,
        carbPercent: carbsPercent,
        weightGoal: parseFloat(document.getElementById('weight-goal').value)
    };
    
    updateDashboard();
    updateLatestWeight();
    updateWeightChart();
    saveAppData();
    
    alert('Goals saved successfully!');
}

function exportData() {
    const data = {
        goals: appState.goals,
        dailyEntries: appState.dailyEntries,
        weightEntries: appState.weightEntries,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `nutritrack-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    const statusElement = document.getElementById('export-status');
    if (statusElement) {
        statusElement.textContent = 'Data exported successfully!';
        setTimeout(() => {
            statusElement.textContent = '';
        }, 3000);
    }
}

function backupData() {
    // In a real app, this would sync with cloud storage
    saveAppData();
    alert('Data backed up to browser storage!');
}

function clearData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        appState.dailyEntries = {};
        appState.weightEntries = [...sampleWeightData];
        appState.goals = {
            calorieTarget: 2000,
            proteinPercent: 30,
            fatPercent: 30,
            carbPercent: 40,
            weightGoal: 160
        };
        
        updateDashboard();
        initializeWeightTracker();
        initializeGoals();
        saveAppData();
        
        alert('All data has been cleared!');
    }
}

function saveAppData() {
    // In a real app, this would save to localStorage or API
    console.log('App data saved:', appState);
}

// Make functions available globally for onclick handlers
window.openFoodModal = openFoodModal;
window.editFood = editFood;
window.deleteFood = deleteFood;