// Calorie Tracker Application JavaScript

// Sample fallback foods (for offline use)
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

// Cached food search results
let foodSearchCache = new Map();

const mealCategories = [
    { id: "breakfast", name: "Breakfast", order: 1 },
    { id: "morning_snack", name: "After Breakfast Snack", order: 2 },
    { id: "lunch", name: "Lunch", order: 3 },
    { id: "afternoon_snack", name: "After Lunch Snack", order: 4 },
    { id: "dinner", name: "Dinner", order: 5 },
    { id: "evening_snack", name: "After Dinner Snack", order: 6 }
];

const sampleWeightData = [
    { date: "2024-01-01", weight: 97.0, week: 1 },  // Starting weight
    { date: "2024-01-08", weight: 96.3, week: 2 },  // -0.7 kg
    { date: "2024-01-15", weight: 95.8, week: 3 },  // -0.5 kg
    { date: "2024-01-22", weight: 95.1, week: 4 },  // -0.7 kg
    { date: "2024-01-29", weight: 94.5, week: 5 },  // -0.6 kg
    { date: "2024-02-05", weight: 93.8, week: 6 },  // -0.7 kg
    { date: "2024-02-12", weight: 93.2, week: 7 },  // -0.6 kg
    { date: "2024-02-19", weight: 92.4, week: 8 },  // -0.8 kg
    { date: "2024-02-26", weight: 91.8, week: 9 },  // -0.6 kg
    { date: "2024-03-05", weight: 91.1, week: 10 }, // -0.7 kg
    { date: "2024-03-12", weight: 90.4, week: 11 }, // -0.7 kg
    { date: "2024-03-19", weight: 89.8, week: 12 }  // -0.6 kg, still progressing toward 85kg goal
];

// Application state
let appState = {
    goals: {
        calorieTarget: 2000,
        proteinPercent: 30,
        fatPercent: 30,
        carbPercent: 40,
        weightGoal: 85 // Default goal in kg
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
    
    // Initialize analytics
    initializeAnalytics();
    
    // Initialize weight tracker
    initializeWeightTracker();
    
    // Initialize goals
    initializeGoals();
    
    // Populate food select dropdown
    populateFoodSelect();
    
    // Initialize export date inputs
    initializeExportDates();
    
    // Start auto-save
    startAutoSave();
    
    console.log('App initialized successfully');
}

function loadAppData() {
    try {
        // Load data from localStorage
        const savedData = localStorage.getItem('nutritrack-data');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            
            // Merge saved data with current state
            if (parsedData.goals) {
                appState.goals = { ...appState.goals, ...parsedData.goals };
            }
            if (parsedData.dailyEntries) {
                appState.dailyEntries = parsedData.dailyEntries;
            }
            if (parsedData.weightEntries) {
                appState.weightEntries = parsedData.weightEntries;
            }
            
            console.log('App data loaded from localStorage');
        }
    } catch (error) {
        console.error('Error loading app data:', error);
        showUserMessage('Failed to load saved data. Starting fresh.', 'warning');
    }
    
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
    
    // Food search input
    const foodSearch = document.getElementById('food-search');
    if (foodSearch) {
        foodSearch.addEventListener('input', handleFoodSearchInput);
        foodSearch.addEventListener('focus', () => {
            if (foodSearch.value.trim()) {
                handleFoodSearchInput();
            }
        });
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
    
    // Barcode scanner button
    const startScannerBtn = document.getElementById('start-scanner-btn');
    if (startScannerBtn) {
        startScannerBtn.addEventListener('click', startBarcodeScanner);
    }
    
    // Analytics tabs
    const analyticsTabs = document.querySelectorAll('.analytics-tab');
    analyticsTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Update active tab
            analyticsTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update analytics data
            updateAnalytics(this.dataset.period);
        });
    });
    
    // AI Meal Generation button
    const generateMealBtn = document.getElementById('generate-meal-btn');
    if (generateMealBtn) {
        generateMealBtn.addEventListener('click', generateMealSuggestions);
    }
    
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
    
    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        const searchResults = document.getElementById('food-search-results');
        const searchInput = document.getElementById('food-search');
        
        if (searchResults && searchInput && 
            !searchResults.contains(e.target) && 
            !searchInput.contains(e.target)) {
            searchResults.classList.remove('visible');
        }
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
    
    // Update analytics
    updateAnalytics(document.querySelector('.analytics-tab.active')?.dataset.period || 'week');
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
    try {
    const canvas = document.getElementById('calorieProgressChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
    // Clear previous chart
    if (window.calorieChart) {
        window.calorieChart.destroy();
    }
    
        const goal = appState.goals.calorieTarget || 2000;
        const remaining = Math.max(0, goal - Math.max(0, consumed || 0));
    
    window.calorieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                    data: [consumed || 0, remaining],
                backgroundColor: ['#4CAF50', '#E8F5E8'],
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
    } catch (error) {
        console.error('Error updating calorie progress chart:', error);
    }
}

function updateMacroChart(protein, fat, carbs) {
    try {
    const canvas = document.getElementById('macroChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
    // Clear previous chart
    if (window.macroChart) {
        window.macroChart.destroy();
    }
    
    // Convert to calories for better visualization
        const proteinCals = Math.max(0, (protein || 0) * 4);
        const fatCals = Math.max(0, (fat || 0) * 9);
        const carbsCals = Math.max(0, (carbs || 0) * 4);
    
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
                backgroundColor: ['#4CAF50', '#FF9800', '#2196F3'],
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
    } catch (error) {
        console.error('Error updating macro chart:', error);
    }
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
    // Stop barcode scanner if running
    if (barcodeScanner) {
        stopBarcodeScanner();
    }
    
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
        populateFoodForm(selectedFood);
    }
}

function handleFoodSearchInput(e) {
    const query = e ? e.target.value : document.getElementById('food-search').value;
    const resultsContainer = document.getElementById('food-search-results');
    
    if (!query || query.trim().length < 2) {
        resultsContainer.classList.remove('visible');
        return;
    }
    
    // Show loading state with spinner
    resultsContainer.innerHTML = `
        <div class="food-search-loading">
            <div class="loading-spinner"></div>
            <span>Searching for "${query.trim()}"...</span>
        </div>
    `;
    resultsContainer.classList.add('visible');
    
    // Perform debounced search
    debouncedFoodSearch(query.trim(), (results) => {
        displayFoodSearchResults(results);
    });
}

function displayFoodSearchResults(foods) {
    const resultsContainer = document.getElementById('food-search-results');
    
    if (!foods || foods.length === 0) {
        resultsContainer.innerHTML = '<div class="food-search-no-results">No foods found. Try a different search term.</div>';
        return;
    }
    
    const html = foods.slice(0, 8).map(food => `
        <div class="food-search-item" onclick="selectFoodFromSearch(${JSON.stringify(food).replace(/"/g, '&quot;')})">
            <div class="food-search-item-name">${food.name}</div>
            <div class="food-search-item-details">
                ${food.calories} cal, ${food.protein}g protein, ${food.fat}g fat, ${food.carbs}g carbs
                ${food.source === 'api' ? ' • Online' : ' • Local'}
            </div>
        </div>
    `).join('');
    
    resultsContainer.innerHTML = html;
}

function selectFoodFromSearch(food) {
    populateFoodForm(food);
    
    // Clear search and hide results
    document.getElementById('food-search').value = '';
    document.getElementById('food-search-results').classList.remove('visible');
}

function populateFoodForm(food) {
    document.getElementById('food-name').value = food.name;
    document.getElementById('food-calories').value = food.calories;
    document.getElementById('food-protein').value = food.protein;
    document.getElementById('food-fat').value = food.fat;
    document.getElementById('food-carbs').value = food.carbs;
}

function handleFoodSubmit(e) {
    e.preventDefault();
    console.log('Food form submitted');
    
    const submitBtn = document.getElementById('save-food-btn');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.classList.add('btn--loading');
    submitBtn.disabled = true;
    
    try {
        // Validate and sanitize inputs
        const name = sanitizeInput(document.getElementById('food-name').value);
        const quantity = validateNumber(document.getElementById('food-quantity').value, 'Quantity', 0.001, 1000);
        const calories = validateNumber(document.getElementById('food-calories').value, 'Calories', 0, 10000);
        const protein = validateNumber(document.getElementById('food-protein').value, 'Protein', 0, 1000);
        const fat = validateNumber(document.getElementById('food-fat').value, 'Fat', 0, 1000);
        const carbs = validateNumber(document.getElementById('food-carbs').value, 'Carbs', 0, 1000);
        
        // Validate food name
        if (!name || name.length < 1) {
            throw new Error('Food name is required');
        }
        if (name.length > 100) {
            throw new Error('Food name must be less than 100 characters');
        }
    
    const foodEntry = {
            name: name,
            quantity: quantity,
            calories: calories,
            protein: protein,
            fat: fat,
            carbs: carbs
    };
    
    const mealCategory = document.getElementById('food-meal-category').value || 'breakfast';
    const editId = document.getElementById('edit-food-id').value;
        
        // Validate meal category
        const validCategories = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack'];
        if (!validCategories.includes(mealCategory)) {
            throw new Error('Invalid meal category');
        }
    
    // Initialize today's entries if not exists
    if (!appState.dailyEntries[appState.currentDate]) {
        appState.dailyEntries[appState.currentDate] = {};
    }
    if (!appState.dailyEntries[appState.currentDate][mealCategory]) {
        appState.dailyEntries[appState.currentDate][mealCategory] = [];
    }
    
    if (editId !== '') {
        // Edit existing entry
            const editIndex = parseInt(editId);
            if (isNaN(editIndex) || editIndex < 0 || editIndex >= appState.dailyEntries[appState.currentDate][mealCategory].length) {
                throw new Error('Invalid food entry to edit');
            }
            appState.dailyEntries[appState.currentDate][mealCategory][editIndex] = foodEntry;
            showUserMessage('Food entry updated successfully', 'success');
    } else {
        // Add new entry
        appState.dailyEntries[appState.currentDate][mealCategory].push(foodEntry);
            showUserMessage('Food entry added successfully', 'success');
    }
    
    console.log('Food entry saved:', foodEntry);
    updateDashboard();
    closeFoodModal();
    saveAppData();
        
    } catch (error) {
        console.error('Error saving food entry:', error);
        showUserMessage(error.message, 'error');
    } finally {
        // Reset button state
        submitBtn.classList.remove('btn--loading');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
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
        if (latestWeightElement) latestWeightElement.textContent = `${latest.weight} kg`;
        
        const remaining = latest.weight - appState.goals.weightGoal;
        if (weightToGoalElement) weightToGoalElement.textContent = Math.abs(remaining).toFixed(1);
    }
    
    if (goalWeightElement) goalWeightElement.textContent = `${appState.goals.weightGoal} kg`;
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
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.3,
                fill: true
            }, {
                label: 'Goal',
                data: goalLine,
                borderColor: '#F44336',
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
            <span class="weight-entry-value">${entry.weight} kg</span>
        </div>
    `).join('');
}

function handleWeightSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.classList.add('btn--loading');
    submitBtn.disabled = true;
    
    try {
        const weightValue = document.getElementById('current-weight').value;
        const dateValue = document.getElementById('weight-date').value;
        
        // Validate inputs (reasonable weight range in kg)
        const weight = validateNumber(weightValue, 'Weight', 20, 300);
        
        if (!dateValue) {
            throw new Error('Please enter a date');
        }
        
        if (!validateDate(dateValue)) {
            throw new Error('Please enter a valid date');
        }
        
        // Check if date is not in the future
        const entryDate = new Date(dateValue);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Allow today
        
        if (entryDate > today) {
            throw new Error('Weight entry date cannot be in the future');
        }
        
        // Check for duplicate dates
        const existingEntry = appState.weightEntries.find(entry => entry.date === dateValue);
        if (existingEntry) {
            throw new Error('A weight entry for this date already exists. Please edit the existing entry or choose a different date.');
    }
    
    const newEntry = {
            date: dateValue,
        weight: weight,
        week: appState.weightEntries.length + 1
    };
    
    appState.weightEntries.push(newEntry);
        
        // Sort entries by date
        appState.weightEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    updateLatestWeight();
    updateWeightChart();
    updateWeightEntries();
    
    // Reset form
    document.getElementById('weight-form').reset();
    document.getElementById('weight-date').value = appState.currentDate;
    
    saveAppData();
        showUserMessage('Weight logged successfully!', 'success');
        
    } catch (error) {
        console.error('Error saving weight entry:', error);
        showUserMessage(error.message, 'error');
    } finally {
        // Reset button state
        submitBtn.classList.remove('btn--loading');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
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
    
    try {
        const calorieTargetValue = document.getElementById('calorie-target').value;
        const proteinPercentValue = document.getElementById('protein-percent-goal').value;
        const fatPercentValue = document.getElementById('fat-percent-goal').value;
        const carbsPercentValue = document.getElementById('carbs-percent-goal').value;
        const weightGoalValue = document.getElementById('weight-goal').value;
        
        // Validate inputs
        const calorieTarget = validateNumber(calorieTargetValue, 'Calorie target', 1000, 5000);
        const proteinPercent = validateNumber(proteinPercentValue, 'Protein percentage', 10, 60);
        const fatPercent = validateNumber(fatPercentValue, 'Fat percentage', 10, 60);
        const carbsPercent = validateNumber(carbsPercentValue, 'Carbs percentage', 10, 60);
        const weightGoal = validateNumber(weightGoalValue, 'Weight goal', 30, 200);
        
        // Check if percentages add up to 100
        const totalPercent = proteinPercent + fatPercent + carbsPercent;
        if (Math.abs(totalPercent - 100) > 0.1) {
            throw new Error(`Macronutrient percentages must add up to 100%. Current total: ${totalPercent}%`);
    }
    
    appState.goals = {
            calorieTarget: Math.round(calorieTarget),
            proteinPercent: Math.round(proteinPercent),
            fatPercent: Math.round(fatPercent),
            carbPercent: Math.round(carbsPercent),
            weightGoal: Math.round(weightGoal * 10) / 10 // Round to 1 decimal place
    };
    
    updateDashboard();
    updateLatestWeight();
    updateWeightChart();
    saveAppData();
    
        showUserMessage('Goals saved successfully!', 'success');
        
    } catch (error) {
        console.error('Error saving goals:', error);
        showUserMessage(error.message, 'error');
    }
}

function exportData() {
    const exportBtn = document.getElementById('export-data-btn');
    const originalText = exportBtn.textContent;
    
    // Show loading state
    exportBtn.classList.add('btn--loading');
    exportBtn.disabled = true;
    
    try {
        // Get selected format and date range
        const format = document.querySelector('input[name="export-format"]:checked').value;
        const startDate = document.getElementById('export-start-date').value;
        const endDate = document.getElementById('export-end-date').value;
        
        switch (format) {
            case 'json':
                exportJSON(startDate, endDate);
                break;
            case 'csv':
                exportCSV(startDate, endDate);
                break;
            case 'pdf':
                exportPDF(startDate, endDate);
                break;
            default:
                throw new Error('Invalid export format');
        }
        
        showUserMessage('Data exported successfully!', 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        showUserMessage('Export failed: ' + error.message, 'error');
    } finally {
        // Reset button state
        exportBtn.classList.remove('btn--loading');
        exportBtn.disabled = false;
        exportBtn.textContent = originalText;
    }
}

function exportJSON(startDate, endDate) {
    let data = {
        goals: appState.goals,
        dailyEntries: appState.dailyEntries,
        weightEntries: appState.weightEntries,
        exportDate: new Date().toISOString(),
        exportFormat: 'json'
    };
    
    // Filter by date range if specified
    if (startDate && endDate) {
        const filteredEntries = {};
        Object.keys(appState.dailyEntries).forEach(date => {
            if (date >= startDate && date <= endDate) {
                filteredEntries[date] = appState.dailyEntries[date];
            }
        });
        
        const filteredWeightEntries = appState.weightEntries.filter(entry => 
            entry.date >= startDate && entry.date <= endDate
        );
        
        data = {
            ...data,
            dailyEntries: filteredEntries,
            weightEntries: filteredWeightEntries,
            dateRange: { startDate, endDate }
        };
    }
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    downloadFile(dataBlob, `nutritrack-backup-${new Date().toISOString().split('T')[0]}.json`);
}

function exportCSV(startDate, endDate) {
    const csvData = [];
    csvData.push(['Date', 'Calories', 'Protein (g)', 'Fat (g)', 'Carbs (g)', 'Meal', 'Food Item', 'Quantity']);
    
    // Get date range
    const dates = Object.keys(appState.dailyEntries).sort();
    const filteredDates = dates.filter(date => {
        if (!startDate || !endDate) return true;
        return date >= startDate && date <= endDate;
    });
    
    filteredDates.forEach(date => {
        const dayEntries = appState.dailyEntries[date];
        let dayHasData = false;
        
        Object.keys(dayEntries).forEach(mealId => {
            const mealEntries = dayEntries[mealId];
            if (mealEntries && mealEntries.length > 0) {
                mealEntries.forEach(entry => {
                    const mealName = mealCategories.find(m => m.id === mealId)?.name || mealId;
                    csvData.push([
                        date,
                        Math.round((entry.calories || 0) * (entry.quantity || 1)),
                        Math.round((entry.protein || 0) * (entry.quantity || 1) * 10) / 10,
                        Math.round((entry.fat || 0) * (entry.quantity || 1) * 10) / 10,
                        Math.round((entry.carbs || 0) * (entry.quantity || 1) * 10) / 10,
                        mealName,
                        entry.name,
                        entry.quantity || 1
                    ]);
                    dayHasData = true;
                });
            }
        });
        
        // If no entries for the day, add a blank row
        if (!dayHasData) {
            csvData.push([date, 0, 0, 0, 0, '', 'No entries', '']);
        }
    });
    
    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    downloadFile(dataBlob, `nutritrack-nutrition-${new Date().toISOString().split('T')[0]}.csv`);
}

function exportPDF(startDate, endDate) {
    // For PDF export, we'll create a simple HTML report that can be printed to PDF
    const analytics = calculateAnalytics(startDate && endDate ? 'custom' : 'month');
    
    const reportHTML = generatePDFReport(analytics, startDate, endDate);
    
    // Create a new window with the report
    const newWindow = window.open('', '_blank');
    newWindow.document.write(reportHTML);
    newWindow.document.close();
    
    // Automatically trigger print dialog
    setTimeout(() => {
        newWindow.print();
    }, 1000);
}

function generatePDFReport(analytics, startDate, endDate) {
    const reportDate = new Date().toLocaleDateString();
    const dateRange = startDate && endDate ? `${startDate} to ${endDate}` : 'All Time';
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>NutriTrack Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1FB8CD; padding-bottom: 20px; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
                .stat-card { padding: 20px; border: 1px solid #ddd; border-radius: 8px; text-align: center; }
                .stat-value { font-size: 24px; font-weight: bold; color: #1FB8CD; }
                .insights { margin: 30px 0; }
                .insight { padding: 10px; margin: 10px 0; background: #f5f5f5; border-radius: 5px; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>NutriTrack Nutrition Report</h1>
                <p>Generated on ${reportDate}</p>
                <p>Period: ${dateRange}</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${analytics.avgCalories}</div>
                    <div>Average Daily Calories</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${analytics.daysWithData}</div>
                    <div>Days Logged</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${analytics.goalAdherence}%</div>
                    <div>Goal Adherence</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${analytics.avgProtein}g</div>
                    <div>Average Daily Protein</div>
                </div>
            </div>
            
            <div class="insights">
                <h2>Insights & Recommendations</h2>
                ${analytics.insights.map(insight => `
                    <div class="insight">
                        ${insight.icon} ${insight.text}
                    </div>
                `).join('')}
            </div>
            
            <div style="margin-top: 40px; font-size: 12px; color: #666; text-align: center;">
                Report generated by NutriTrack - Your Personal Nutrition Tracker
            </div>
        </body>
        </html>
    `;
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function initializeExportDates() {
    const startDateInput = document.getElementById('export-start-date');
    const endDateInput = document.getElementById('export-end-date');
    
    if (startDateInput && endDateInput) {
        // Set default to last 30 days
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        startDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
        endDateInput.value = today.toISOString().split('T')[0];
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
            weightGoal: 85
        };
        
        updateDashboard();
        initializeWeightTracker();
        initializeGoals();
        saveAppData();
        
        alert('All data has been cleared!');
    }
}

function saveAppData() {
    try {
        const dataToSave = {
            goals: appState.goals,
            dailyEntries: appState.dailyEntries,
            weightEntries: appState.weightEntries,
            lastSaved: new Date().toISOString()
        };
        
        // Check if localStorage is available
        if (typeof(Storage) === "undefined") {
            throw new Error('localStorage is not supported by this browser');
        }
        
        const jsonData = JSON.stringify(dataToSave);
        
        // Check if we have enough storage space
        try {
            localStorage.setItem('nutritrack-data', jsonData);
        } catch (quotaError) {
            if (quotaError.name === 'QuotaExceededError') {
                throw new Error('Storage quota exceeded. Please clear some browser data.');
            }
            throw quotaError;
        }
        
        console.log('App data saved to localStorage');
        console.log('Data size:', (jsonData.length / 1024).toFixed(2), 'KB');
        
        // Show brief success indicator (less intrusive for auto-save)
        showUserMessage('💾 Auto-saved', 'success', 1500);
    } catch (error) {
        console.error('Error saving app data:', error);
        showUserMessage(`Save failed: ${error.message}`, 'error');
    }
}

// Input validation utilities
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

function validateNumber(value, fieldName, min = 0, max = Number.MAX_SAFE_INTEGER) {
    const num = parseFloat(value);
    if (isNaN(num)) {
        throw new Error(`${fieldName} must be a valid number`);
    }
    if (num < min) {
        throw new Error(`${fieldName} must be at least ${min}`);
    }
    if (num > max) {
        throw new Error(`${fieldName} must be no more than ${max}`);
    }
    return num;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// User notification system
function showUserMessage(message, type = 'info', duration = 5000) {
    // Remove existing messages
    const existingMessage = document.querySelector('.user-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `user-message user-message--${type}`;
    messageEl.textContent = message;
    
    // Add to DOM
    document.body.appendChild(messageEl);
    
    // Auto-remove after duration
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.remove();
        }
    }, duration);
}

// Auto-save data periodically
function startAutoSave() {
    setInterval(() => {
        if (Object.keys(appState.dailyEntries).length > 0 || appState.weightEntries.length > 0) {
            saveAppData();
        }
    }, 30000); // Save every 30 seconds
}

// Food API integration
async function searchFood(query) {
    const cacheKey = query.toLowerCase().trim();
    
    // Check cache first
    if (foodSearchCache.has(cacheKey)) {
        return foodSearchCache.get(cacheKey);
    }
    
    try {
        // Using CalorieNinjas API as it doesn't require API key for demo
        const response = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'X-Api-Key': 'demo_key' // In production, this would be a real API key
            }
        });
        
        if (!response.ok) {
            throw new Error('Food search service unavailable');
        }
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const foods = data.items.map(item => ({
                name: item.name || query,
                calories: Math.round(item.calories || 0),
                protein: Math.round((item.protein_g || 0) * 10) / 10,
                fat: Math.round((item.fat_total_g || 0) * 10) / 10,
                carbs: Math.round((item.carbohydrates_total_g || 0) * 10) / 10,
                serving_size: item.serving_size_g || 100,
                source: 'api'
            }));
            
            // Cache the results
            foodSearchCache.set(cacheKey, foods);
            
            return foods;
        } else {
            // Return empty array if no results
            return [];
        }
        
    } catch (error) {
        console.error('Food search error:', error);
        
        // Fallback to local search
        return searchLocalFoods(query);
    }
}

function searchLocalFoods(query) {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
        return sampleFoods;
    }
    
    return sampleFoods.filter(food => 
        food.name.toLowerCase().includes(searchTerm)
    );
}

// Debounced search function
let searchTimeout;
function debouncedFoodSearch(query, callback) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        try {
            const results = await searchFood(query);
            callback(results);
        } catch (error) {
            console.error('Search error:', error);
            callback([]);
        }
    }, 300);
}

// Barcode scanning functionality
let barcodeScanner = null;

function startBarcodeScanner() {
    const scannerContainer = document.getElementById('barcode-scanner');
    const startBtn = document.getElementById('start-scanner-btn');
    const errorDiv = document.getElementById('scanner-error');
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showScannerError('Camera not supported in this browser');
        return;
    }
    
    startBtn.textContent = 'Starting...';
    startBtn.disabled = true;
    errorDiv.style.display = 'none';
    
    try {
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: scannerContainer,
                constraints: {
                    width: 640,
                    height: 480,
                    facingMode: "environment"
                }
            },
            decoder: {
                readers: [
                    "code_128_reader",
                    "ean_reader",
                    "ean_8_reader",
                    "code_39_reader",
                    "code_39_vin_reader",
                    "codabar_reader",
                    "upc_reader",
                    "upc_e_reader"
                ]
            },
            locator: {
                halfSample: true,
                patchSize: "medium"
            }
        }, function(err) {
            if (err) {
                console.error('Barcode scanner initialization error:', err);
                showScannerError('Failed to initialize camera');
                return;
            }
            
            Quagga.start();
            startBtn.textContent = 'Stop Scanner';
            startBtn.disabled = false;
            startBtn.onclick = stopBarcodeScanner;
            
            showUserMessage('Barcode scanner started', 'success', 3000);
        });
        
        Quagga.onDetected(function(result) {
            const barcode = result.codeResult.code;
            console.log('Barcode detected:', barcode);
            
            stopBarcodeScanner();
            lookupFoodByBarcode(barcode);
        });
        
    } catch (error) {
        console.error('Barcode scanner error:', error);
        showScannerError('Failed to start camera');
    }
}

function stopBarcodeScanner() {
    if (Quagga) {
        Quagga.stop();
    }
    
    const startBtn = document.getElementById('start-scanner-btn');
    startBtn.textContent = 'Start Scanner';
    startBtn.disabled = false;
    startBtn.onclick = startBarcodeScanner;
}

function showScannerError(message) {
    const errorDiv = document.getElementById('scanner-error');
    const startBtn = document.getElementById('start-scanner-btn');
    
    errorDiv.querySelector('p').textContent = message;
    errorDiv.style.display = 'block';
    
    startBtn.textContent = 'Start Scanner';
    startBtn.disabled = false;
    
    showUserMessage(message, 'error');
}

async function lookupFoodByBarcode(barcode) {
    try {
        showUserMessage('Looking up barcode...', 'info', 2000);
        
        // First try to search using the barcode as a query
        const searchResults = await searchFood(`barcode:${barcode}`);
        
        if (searchResults && searchResults.length > 0) {
            populateFoodForm(searchResults[0]);
            closeModals();
            openFoodModal();
            showUserMessage('Food found by barcode!', 'success');
        } else {
            // Fallback to manual entry with barcode info
            closeModals();
            openFoodModal();
            document.getElementById('food-name').value = `Product ${barcode}`;
            showUserMessage('Barcode scanned. Please enter nutrition info manually.', 'warning');
        }
        
    } catch (error) {
        console.error('Barcode lookup error:', error);
        showUserMessage('Failed to lookup barcode. Please enter manually.', 'error');
        closeModals();
        openFoodModal();
    }
}

// Analytics functionality
function initializeAnalytics() {
    updateAnalytics('week');
}

function updateAnalytics(period = 'week') {
    const analytics = calculateAnalytics(period);
    updateAnalyticsDisplay(analytics);
}

function calculateAnalytics(period) {
    const now = new Date();
    const periodDays = period === 'week' ? 7 : 30;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - periodDays);
    
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    let daysWithData = 0;
    let daysOnTarget = 0;
    
    const dailyData = [];
    
    // Analyze each day in the period
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dayEntries = appState.dailyEntries[dateStr];
        
        if (dayEntries) {
            let dayCalories = 0;
            let dayProtein = 0;
            let dayFat = 0;
            let dayCarbs = 0;
            
            Object.values(dayEntries).forEach(mealEntries => {
                if (Array.isArray(mealEntries)) {
                    mealEntries.forEach(entry => {
                        const quantity = entry.quantity || 1;
                        dayCalories += (entry.calories || 0) * quantity;
                        dayProtein += (entry.protein || 0) * quantity;
                        dayFat += (entry.fat || 0) * quantity;
                        dayCarbs += (entry.carbs || 0) * quantity;
                    });
                }
            });
            
            if (dayCalories > 0) {
                totalCalories += dayCalories;
                totalProtein += dayProtein;
                totalFat += dayFat;
                totalCarbs += dayCarbs;
                daysWithData++;
                
                // Check if within 200 calories of goal
                if (Math.abs(dayCalories - appState.goals.calorieTarget) <= 200) {
                    daysOnTarget++;
                }
                
                dailyData.push({
                    date: dateStr,
                    calories: dayCalories,
                    protein: dayProtein,
                    fat: dayFat,
                    carbs: dayCarbs
                });
            }
        }
    }
    
    const avgCalories = daysWithData > 0 ? Math.round(totalCalories / daysWithData) : 0;
    const avgProtein = daysWithData > 0 ? Math.round(totalProtein / daysWithData) : 0;
    const avgFat = daysWithData > 0 ? Math.round(totalFat / daysWithData) : 0;
    const avgCarbs = daysWithData > 0 ? Math.round(totalCarbs / daysWithData) : 0;
    const goalAdherence = daysWithData > 0 ? Math.round((daysOnTarget / daysWithData) * 100) : 0;
    
    return {
        period,
        periodDays,
        daysWithData,
        avgCalories,
        avgProtein,
        avgFat,
        avgCarbs,
        goalAdherence,
        dailyData,
        insights: generateInsights({
            avgCalories,
            avgProtein,
            avgFat,
            avgCarbs,
            goalAdherence,
            daysWithData,
            goal: appState.goals.calorieTarget
        })
    };
}

function generateInsights(data) {
    const insights = [];
    const { avgCalories, avgProtein, avgFat, avgCarbs, goalAdherence, daysWithData, goal } = data;
    
    // Calorie insights
    if (avgCalories > goal * 1.1) {
        insights.push({
            type: 'warning',
            icon: '⚠️',
            text: `You're averaging ${avgCalories - goal} calories above your daily goal`
        });
    } else if (avgCalories < goal * 0.9) {
        insights.push({
            type: 'warning',
            icon: '⚠️',
            text: `You're averaging ${goal - avgCalories} calories below your daily goal`
        });
    } else {
        insights.push({
            type: 'positive',
            icon: '✅',
            text: 'Your calorie intake is well-balanced with your goals'
        });
    }
    
    // Goal adherence insights
    if (goalAdherence >= 80) {
        insights.push({
            type: 'positive',
            icon: '🎯',
            text: `Excellent goal adherence! You're hitting your targets ${goalAdherence}% of the time`
        });
    } else if (goalAdherence >= 60) {
        insights.push({
            type: 'info',
            icon: '📊',
            text: `Good progress with ${goalAdherence}% goal adherence. Small adjustments can help`
        });
    } else {
        insights.push({
            type: 'warning',
            icon: '📈',
            text: `${goalAdherence}% goal adherence. Consider planning meals to stay on track`
        });
    }
    
    // Protein insights
    const proteinTarget = (goal * appState.goals.proteinPercent / 100) / 4;
    if (avgProtein < proteinTarget * 0.8) {
        insights.push({
            type: 'info',
            icon: '🥩',
            text: 'Consider adding more protein-rich foods to your meals'
        });
    }
    
    // Consistency insights
    if (daysWithData < 3) {
        insights.push({
            type: 'info',
            icon: '📝',
            text: 'Try logging meals more consistently for better insights'
        });
    } else if (daysWithData >= 5) {
        insights.push({
            type: 'positive',
            icon: '🌟',
            text: 'Great job maintaining consistent food logging!'
        });
    }
    
    return insights;
}

function updateAnalyticsDisplay(analytics) {
    const { avgCalories, daysWithData, goalAdherence, insights } = analytics;
    
    // Update stats
    document.getElementById('avg-calories').textContent = avgCalories;
    document.getElementById('days-logged').textContent = daysWithData;
    document.getElementById('goal-adherence').textContent = `${goalAdherence}%`;
    
    // Update insights
    const insightsContainer = document.getElementById('nutrition-insights');
    if (insights.length === 0) {
        insightsContainer.innerHTML = '<div class="analytics-no-data">Log more meals to see personalized insights</div>';
    } else {
        insightsContainer.innerHTML = insights.map(insight => `
            <div class="insight-item">
                <span class="insight-icon ${insight.type}">${insight.icon}</span>
                <span class="insight-text">${insight.text}</span>
            </div>
        `).join('');
    }
}

// Enhanced Ingredient Recognition Database
const ingredientDatabase = {
    // Proteins with aliases and variations
    proteins: {
        'chicken': ['chicken', 'chicken breast', 'chicken thigh', 'chicken drumstick', 'poultry'],
        'beef': ['beef', 'ground beef', 'steak', 'beef roast', 'hamburger', 'mince'],
        'pork': ['pork', 'pork chop', 'bacon', 'ham', 'sausage'],
        'fish': ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'mackerel', 'sardines'],
        'seafood': ['shrimp', 'prawns', 'crab', 'lobster', 'scallops', 'mussels'],
        'eggs': ['egg', 'eggs', 'egg whites', 'whole eggs'],
        'legumes': ['beans', 'black beans', 'kidney beans', 'chickpeas', 'lentils', 'peas', 'split peas'],
        'tofu': ['tofu', 'tempeh', 'seitan', 'soy protein'],
        'nuts': ['almonds', 'walnuts', 'peanuts', 'cashews', 'pecans', 'pistachios', 'nuts']
    },
    vegetables: {
        'onion': ['onion', 'onions', 'yellow onion', 'white onion', 'red onion', 'scallions', 'green onions'],
        'garlic': ['garlic', 'garlic cloves', 'minced garlic', 'garlic powder'],
        'tomato': ['tomato', 'tomatoes', 'cherry tomatoes', 'roma tomatoes', 'canned tomatoes'],
        'pepper': ['bell pepper', 'peppers', 'red pepper', 'green pepper', 'yellow pepper'],
        'broccoli': ['broccoli', 'broccoli florets', 'frozen broccoli'],
        'spinach': ['spinach', 'baby spinach', 'frozen spinach', 'fresh spinach'],
        'carrot': ['carrot', 'carrots', 'baby carrots', 'shredded carrots'],
        'mushroom': ['mushrooms', 'button mushrooms', 'shiitake', 'portobello', 'cremini'],
        'zucchini': ['zucchini', 'courgette', 'summer squash'],
        'potato': ['potato', 'potatoes', 'sweet potato', 'russet potato', 'red potato'],
        'lettuce': ['lettuce', 'romaine', 'iceberg lettuce', 'mixed greens', 'salad greens']
    },
    grains: {
        'rice': ['rice', 'white rice', 'brown rice', 'jasmine rice', 'basmati rice', 'wild rice'],
        'pasta': ['pasta', 'spaghetti', 'penne', 'linguine', 'macaroni', 'noodles'],
        'bread': ['bread', 'whole wheat bread', 'white bread', 'sourdough', 'baguette'],
        'quinoa': ['quinoa', 'tri-color quinoa', 'red quinoa'],
        'oats': ['oats', 'rolled oats', 'steel cut oats', 'oatmeal'],
        'flour': ['flour', 'all-purpose flour', 'wheat flour', 'whole wheat flour']
    },
    dairy: {
        'cheese': ['cheese', 'cheddar', 'mozzarella', 'parmesan', 'feta', 'goat cheese', 'cream cheese'],
        'milk': ['milk', 'whole milk', 'skim milk', '2% milk', 'almond milk', 'soy milk'],
        'butter': ['butter', 'unsalted butter', 'salted butter', 'margarine'],
        'yogurt': ['yogurt', 'greek yogurt', 'plain yogurt', 'vanilla yogurt'],
        'cream': ['cream', 'heavy cream', 'whipping cream', 'sour cream']
    },
    oils: {
        'olive_oil': ['olive oil', 'extra virgin olive oil', 'light olive oil'],
        'vegetable_oil': ['vegetable oil', 'canola oil', 'sunflower oil', 'safflower oil'],
        'coconut_oil': ['coconut oil', 'virgin coconut oil'],
        'sesame_oil': ['sesame oil', 'toasted sesame oil'],
        'avocado_oil': ['avocado oil']
    },
    seasonings: {
        'salt': ['salt', 'sea salt', 'kosher salt', 'table salt'],
        'pepper': ['pepper', 'black pepper', 'white pepper', 'ground pepper'],
        'herbs': ['basil', 'oregano', 'thyme', 'rosemary', 'parsley', 'cilantro', 'dill'],
        'spices': ['paprika', 'cumin', 'chili powder', 'garlic powder', 'onion powder', 'turmeric'],
        'sauces': ['soy sauce', 'hot sauce', 'worcestershire', 'vinegar', 'lemon juice', 'lime juice']
    }
};

// Dynamic Recipe Generation Templates
const recipeTemplates = {
    stirfry: {
        name: "Stir-Fry",
        requiredTypes: ['proteins', 'vegetables'],
        optionalTypes: ['oils', 'seasonings'],
        instructions: [
            "Heat oil in a large pan or wok over medium-high heat",
            "Add protein and cook until almost done (chicken: 5-6 min, tofu: 3-4 min)",
            "Add harder vegetables first (carrots, broccoli) and cook 2-3 minutes",
            "Add softer vegetables (peppers, mushrooms) and cook 1-2 minutes",
            "Season with salt, pepper, and any available sauces",
            "Stir everything together and cook for 1 more minute",
            "Serve immediately while hot"
        ],
        cookingTime: "12-15 minutes",
        cuisine: "asian"
    },
    salad: {
        name: "Fresh Salad",
        requiredTypes: ['vegetables'],
        optionalTypes: ['proteins', 'dairy', 'oils', 'seasonings'],
        instructions: [
            "Wash and chop all fresh vegetables into bite-sized pieces",
            "If using protein, cook it first (grill chicken, hard-boil eggs, etc.)",
            "Combine all vegetables in a large bowl",
            "Add cooked protein if available",
            "Drizzle with oil and season with salt and pepper",
            "Add cheese if available",
            "Toss everything together gently",
            "Let flavors combine for 5 minutes before serving"
        ],
        cookingTime: "10-15 minutes",
        cuisine: "healthy"
    },
    pasta: {
        name: "Pasta Dish",
        requiredTypes: ['grains'],
        optionalTypes: ['proteins', 'vegetables', 'dairy', 'oils', 'seasonings'],
        instructions: [
            "Bring a large pot of salted water to boil",
            "Add pasta and cook according to package directions",
            "While pasta cooks, heat oil in a large pan",
            "Cook protein if using (chicken, ground beef, etc.) until done",
            "Add vegetables to the pan and sauté until tender",
            "Drain pasta, reserving 1/2 cup pasta water",
            "Add pasta to the pan with vegetables and protein",
            "Add cheese if available, toss with pasta water if needed",
            "Season with salt, pepper, and herbs",
            "Serve hot with extra cheese if desired"
        ],
        cookingTime: "15-20 minutes",
        cuisine: "italian"
    },
    scramble: {
        name: "Scrambled Eggs",
        requiredTypes: ['proteins'],
        optionalTypes: ['vegetables', 'dairy', 'oils', 'seasonings'],
        instructions: [
            "Crack eggs into a bowl and whisk with a splash of milk if available",
            "Heat oil or butter in a non-stick pan over medium-low heat",
            "Sauté any vegetables until slightly softened",
            "Pour in eggs and let sit for 30 seconds",
            "Gently stir with a spatula, pushing eggs from edges to center",
            "Continue stirring occasionally until eggs are just set",
            "Add cheese in the last 30 seconds if available",
            "Season with salt and pepper",
            "Remove from heat while still slightly creamy"
        ],
        cookingTime: "8-10 minutes",
        cuisine: "american"
    },
    soup: {
        name: "Simple Soup",
        requiredTypes: ['vegetables'],
        optionalTypes: ['proteins', 'grains', 'oils', 'seasonings'],
        instructions: [
            "Heat oil in a large pot over medium heat",
            "Sauté onions and garlic until fragrant (if available)",
            "Add harder vegetables first (carrots, potatoes) and cook 5 minutes",
            "Add 4-6 cups water or broth",
            "Bring to a boil, then reduce heat and simmer",
            "Add softer vegetables and any grains (rice, pasta)",
            "Cook until vegetables are tender (15-20 minutes)",
            "Add cooked protein in the last 5 minutes if using",
            "Season with salt, pepper, and herbs",
            "Adjust seasoning and serve hot"
        ],
        cookingTime: "25-30 minutes",
        cuisine: "comfort"
    },
    bowl: {
        name: "Nourish Bowl",
        requiredTypes: ['grains', 'vegetables'],
        optionalTypes: ['proteins', 'oils', 'seasonings'],
        instructions: [
            "Cook grains according to package directions (rice, quinoa, etc.)",
            "Prepare vegetables: steam, roast, or sauté until tender",
            "Cook protein if using (grill, bake, or pan-fry)",
            "Arrange cooked grains in bowls as the base",
            "Top with cooked vegetables in sections",
            "Add sliced or cubed protein",
            "Drizzle with oil or any available sauce",
            "Season with salt, pepper, and herbs",
            "Serve warm or at room temperature"
        ],
        cookingTime: "20-25 minutes",
        cuisine: "healthy"
    }
};

async function generateMealSuggestions() {
    const generateBtn = document.getElementById('generate-meal-btn');
    const originalText = generateBtn.textContent;
    const resultsContainer = document.getElementById('ai-suggestions-results');
    const suggestionsContainer = document.getElementById('meal-suggestions-list');
    
    try {
        // Show loading state
        generateBtn.classList.add('btn--loading');
        generateBtn.disabled = true;
        
        // Get user inputs
        const ingredients = document.getElementById('available-ingredients').value.trim();
        const mealType = document.getElementById('meal-type-preference').value;
        const cuisine = document.getElementById('cuisine-preference').value;
        
        if (!ingredients) {
            throw new Error('Please enter some ingredients first!');
        }
        
        // Show loading
        resultsContainer.style.display = 'block';
        suggestionsContainer.innerHTML = '<div class="ai-loading"><div class="loading-spinner loading-spinner--large"></div><p>AI is analyzing your ingredients and generating meal ideas...</p></div>';
        
        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate suggestions
        const suggestions = analyzeIngredientsAndGenerateMeals(ingredients, mealType, cuisine);
        
        if (suggestions.length === 0) {
            suggestionsContainer.innerHTML = '<div class="ai-error">No suitable meals found with those ingredients. Try adding more common ingredients like proteins, vegetables, or grains.</div>';
            return;
        }
        
        // Display suggestions
        displayMealSuggestions(suggestions);
        
        showUserMessage(`Generated ${suggestions.length} meal suggestions!`, 'success');
        
    } catch (error) {
        console.error('Error generating meal suggestions:', error);
        showUserMessage(error.message, 'error');
        suggestionsContainer.innerHTML = `<div class="ai-error">${error.message}</div>`;
    } finally {
        // Reset button state
        generateBtn.classList.remove('btn--loading');
        generateBtn.disabled = false;
        generateBtn.textContent = originalText;
    }
}

function analyzeIngredientsAndGenerateMeals(ingredientsText, mealType, cuisine) {
    const userIngredients = parseIngredients(ingredientsText);
    const recognizedIngredients = recognizeIngredients(userIngredients);
    
    if (recognizedIngredients.length === 0) {
        return [];
    }
    
    const suggestions = [];
    
    // Generate dynamic recipes based on available ingredients
    Object.entries(recipeTemplates).forEach(([templateKey, template]) => {
        const recipe = generateRecipeFromTemplate(template, recognizedIngredients, mealType, cuisine);
        if (recipe) {
            suggestions.push(recipe);
        }
    });
    
    // Sort by ingredient count and meal type match
    suggestions.sort((a, b) => {
        const aScore = a.ingredients.length + (a.mealTypeMatch ? 10 : 0);
        const bScore = b.ingredients.length + (b.mealTypeMatch ? 10 : 0);
        return bScore - aScore;
    });
    
    // Return top 3 suggestions
    return suggestions.slice(0, 3);
}

function parseIngredients(ingredientsText) {
    return ingredientsText
        .toLowerCase()
        .split(',')
        .map(ingredient => ingredient.trim())
        .filter(ingredient => ingredient.length > 0);
}

function recognizeIngredients(userIngredients) {
    const recognized = [];
    
    userIngredients.forEach(userIngredient => {
        // Check each category and ingredient type
        Object.entries(ingredientDatabase).forEach(([category, types]) => {
            Object.entries(types).forEach(([ingredientKey, aliases]) => {
                // Check if user ingredient matches any alias
                const match = aliases.some(alias => 
                    userIngredient.includes(alias.toLowerCase()) || 
                    alias.toLowerCase().includes(userIngredient)
                );
                
                if (match) {
                    // Don't add duplicates
                    if (!recognized.some(r => r.key === ingredientKey)) {
                        recognized.push({
                            key: ingredientKey,
                            category: category,
                            displayName: userIngredient,
                            standardName: aliases[0] // Use the first alias as standard name
                        });
                    }
                }
            });
        });
    });
    
    return recognized;
}

function generateRecipeFromTemplate(template, availableIngredients, mealType, cuisine) {
    // Check if we have required ingredient types
    const hasRequired = template.requiredTypes.every(requiredType => 
        availableIngredients.some(ingredient => ingredient.category === requiredType)
    );
    
    if (!hasRequired) {
        return null;
    }
    
    // Filter ingredients that match template requirements
    const usableIngredients = availableIngredients.filter(ingredient => 
        template.requiredTypes.includes(ingredient.category) || 
        template.optionalTypes.includes(ingredient.category)
    );
    
    if (usableIngredients.length < 2) {
        return null; // Need at least 2 ingredients for a meal
    }
    
    // Generate specific recipe name based on ingredients
    const recipeName = generateRecipeName(template.name, usableIngredients);
    
    // Calculate nutrition based on ingredients
    const nutrition = calculateNutritionForIngredients(usableIngredients);
    
    // Determine meal type compatibility
    const mealTypeMatch = mealType === 'any' || 
                         (mealType === 'breakfast' && template.name.includes('Scrambled')) ||
                         (mealType === 'lunch' && (template.name.includes('Salad') || template.name.includes('Bowl'))) ||
                         (mealType === 'dinner' && (template.name.includes('Stir-Fry') || template.name.includes('Pasta') || template.name.includes('Soup')));
    
    return {
        name: recipeName,
        type: mealType !== 'any' ? mealType : determineMealType(template.name),
        cuisine: template.cuisine,
        description: generateDescription(template.name, usableIngredients),
        cookingTime: template.cookingTime,
        instructions: template.instructions,
        ingredients: usableIngredients,
        calories: nutrition.calories,
        protein: nutrition.protein,
        fat: nutrition.fat,
        carbs: nutrition.carbs,
        mealTypeMatch: mealTypeMatch
    };
}

function generateRecipeName(baseName, ingredients) {
    const mainIngredients = ingredients.slice(0, 2); // Use first 2 ingredients
    const ingredientNames = mainIngredients.map(ing => 
        ing.displayName.charAt(0).toUpperCase() + ing.displayName.slice(1)
    );
    
    if (baseName.includes('Stir-Fry')) {
        return `${ingredientNames.join(' & ')} Stir-Fry`;
    } else if (baseName.includes('Salad')) {
        return `${ingredientNames.join(' & ')} Salad`;
    } else if (baseName.includes('Pasta')) {
        return `${ingredientNames.join(' & ')} Pasta`;
    } else if (baseName.includes('Scrambled')) {
        return `${ingredientNames.join(' & ')} Scramble`;
    } else if (baseName.includes('Soup')) {
        return `${ingredientNames.join(' & ')} Soup`;
    } else if (baseName.includes('Bowl')) {
        return `${ingredientNames.join(' & ')} Bowl`;
    }
    
    return `${ingredientNames.join(' & ')} ${baseName}`;
}

function generateDescription(baseName, ingredients) {
    const ingredientList = ingredients.map(ing => ing.displayName).join(', ');
    
    const descriptions = {
        'Stir-Fry': `A quick and flavorful stir-fry featuring ${ingredientList}, cooked to perfection with aromatic seasonings.`,
        'Fresh Salad': `A fresh and healthy salad combining ${ingredientList} for a nutritious and satisfying meal.`,
        'Pasta Dish': `Delicious pasta dish with ${ingredientList}, creating a comforting and hearty meal.`,
        'Scrambled Eggs': `Fluffy scrambled eggs prepared with ${ingredientList} for a protein-rich and satisfying meal.`,
        'Simple Soup': `A warming and nourishing soup made with ${ingredientList}, perfect for any time of day.`,
        'Nourish Bowl': `A balanced and nutritious bowl featuring ${ingredientList}, providing sustained energy and satisfaction.`
    };
    
    return descriptions[baseName] || `A delicious dish made with ${ingredientList}.`;
}

function determineMealType(baseName) {
    if (baseName.includes('Scrambled')) return 'breakfast';
    if (baseName.includes('Salad') || baseName.includes('Bowl')) return 'lunch';
    return 'dinner';
}

function calculateNutritionForIngredients(ingredients) {
    // Simplified nutrition calculation based on ingredient categories
    const nutritionMap = {
        proteins: { calories: 150, protein: 25, fat: 5, carbs: 0 },
        vegetables: { calories: 25, protein: 2, fat: 0, carbs: 5 },
        grains: { calories: 200, protein: 6, fat: 1, carbs: 45 },
        dairy: { calories: 100, protein: 8, fat: 6, carbs: 8 },
        oils: { calories: 120, protein: 0, fat: 14, carbs: 0 },
        seasonings: { calories: 5, protein: 0, fat: 0, carbs: 1 }
    };
    
    let totalNutrition = { calories: 0, protein: 0, fat: 0, carbs: 0 };
    
    ingredients.forEach(ingredient => {
        const categoryNutrition = nutritionMap[ingredient.category] || { calories: 50, protein: 2, fat: 1, carbs: 8 };
        totalNutrition.calories += categoryNutrition.calories;
        totalNutrition.protein += categoryNutrition.protein;
        totalNutrition.fat += categoryNutrition.fat;
        totalNutrition.carbs += categoryNutrition.carbs;
    });
    
    return {
        calories: Math.round(totalNutrition.calories),
        protein: Math.round(totalNutrition.protein),
        fat: Math.round(totalNutrition.fat),
        carbs: Math.round(totalNutrition.carbs)
    };
}



function displayMealSuggestions(suggestions) {
    const container = document.getElementById('meal-suggestions-list');
    
    const html = suggestions.map(suggestion => `
        <div class="meal-suggestion-card">
            <div class="meal-suggestion-header">
                <h3 class="meal-suggestion-title">${suggestion.name}</h3>
                <span class="meal-suggestion-type">${suggestion.type}</span>
            </div>
            
            <p class="meal-suggestion-description">${suggestion.description}</p>
            
            <div class="meal-nutrition-info">
                <div class="nutrition-stat">
                    <span class="nutrition-stat-value">${suggestion.calories}</span>
                    <span class="nutrition-stat-label">Calories</span>
                </div>
                <div class="nutrition-stat">
                    <span class="nutrition-stat-value">${suggestion.protein}g</span>
                    <span class="nutrition-stat-label">Protein</span>
                </div>
                <div class="nutrition-stat">
                    <span class="nutrition-stat-value">${suggestion.fat}g</span>
                    <span class="nutrition-stat-label">Fat</span>
                </div>
                <div class="nutrition-stat">
                    <span class="nutrition-stat-value">${suggestion.carbs}g</span>
                    <span class="nutrition-stat-label">Carbs</span>
                </div>
            </div>
            
            <div class="meal-ingredients">
                <h5>Your Ingredients Used</h5>
                <div class="ingredients-list">
                    ${suggestion.ingredients.map(ing => `<span class="ingredient-tag">${ing.displayName}</span>`).join('')}
                </div>
                <small style="color: var(--color-text-secondary); margin-top: 8px; display: block;">
                    ⏱️ Cooking Time: ${suggestion.cookingTime}
                </small>
            </div>
            
            <div class="meal-recipe-preview">
                <h5>Quick Recipe</h5>
                <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.4;">
                    ${suggestion.instructions.slice(0, 3).map(step => `<li>${step}</li>`).join('')}
                    ${suggestion.instructions.length > 3 ? '<li><em>...see full recipe for remaining steps</em></li>' : ''}
                </ol>
            </div>
            
            <div class="meal-actions">
                <button class="btn btn--secondary" onclick="addMealToLog('${suggestion.name}', ${suggestion.calories}, ${suggestion.protein}, ${suggestion.fat}, ${suggestion.carbs})">
                    Add to Food Log
                </button>
                <button class="btn btn--primary" onclick="viewMealDetails('${encodeURIComponent(JSON.stringify(suggestion))}')">
                    Full Recipe
                </button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

function addMealToLog(name, calories, protein, fat, carbs) {
    // Pre-fill the food entry form with the suggested meal
    document.getElementById('food-name').value = name;
    document.getElementById('food-calories').value = calories;
    document.getElementById('food-protein').value = protein;
    document.getElementById('food-fat').value = fat;
    document.getElementById('food-carbs').value = carbs;
    document.getElementById('food-quantity').value = 1;
    
    // Open the food modal
    openFoodModal();
    
    showUserMessage('Meal added to food entry form!', 'success');
}

function viewMealDetails(encodedSuggestion) {
    try {
        const suggestion = JSON.parse(decodeURIComponent(encodedSuggestion));
        
        // Create a modal-like display for the full recipe
        const recipeModal = document.createElement('div');
        recipeModal.className = 'modal';
        recipeModal.style.display = 'block';
        
        const ingredientsList = suggestion.ingredients.map(ing => 
            `• ${ing.displayName} (${ing.standardName})`
        ).join('\n');
        
        const instructionsList = suggestion.instructions.map((step, index) => 
            `${index + 1}. ${step}`
        ).join('\n');
        
        recipeModal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2>${suggestion.name}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 20px;">
                        <p><strong>Description:</strong> ${suggestion.description}</p>
                        <p><strong>Cooking Time:</strong> ${suggestion.cookingTime}</p>
                        <p><strong>Cuisine Style:</strong> ${suggestion.cuisine}</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h4>Nutrition Information (per serving)</h4>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 10px 0;">
                            <div style="text-align: center; padding: 10px; background: var(--color-secondary); border-radius: 8px;">
                                <div style="font-size: 18px; font-weight: bold; color: var(--color-primary);">${suggestion.calories}</div>
                                <div style="font-size: 12px; color: var(--color-text-secondary);">CALORIES</div>
                            </div>
                            <div style="text-align: center; padding: 10px; background: var(--color-secondary); border-radius: 8px;">
                                <div style="font-size: 18px; font-weight: bold; color: var(--color-primary);">${suggestion.protein}g</div>
                                <div style="font-size: 12px; color: var(--color-text-secondary);">PROTEIN</div>
                            </div>
                            <div style="text-align: center; padding: 10px; background: var(--color-secondary); border-radius: 8px;">
                                <div style="font-size: 18px; font-weight: bold; color: var(--color-primary);">${suggestion.fat}g</div>
                                <div style="font-size: 12px; color: var(--color-text-secondary);">FAT</div>
                            </div>
                            <div style="text-align: center; padding: 10px; background: var(--color-secondary); border-radius: 8px;">
                                <div style="font-size: 18px; font-weight: bold; color: var(--color-primary);">${suggestion.carbs}g</div>
                                <div style="font-size: 12px; color: var(--color-text-secondary);">CARBS</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h4>Ingredients You're Using</h4>
                        <div style="background: var(--color-secondary); padding: 15px; border-radius: 8px;">
                            ${suggestion.ingredients.map(ing => `
                                <div style="margin: 5px 0; display: flex; align-items: center;">
                                    <span style="background: var(--color-primary); color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 10px;">${ing.category}</span>
                                    <span>${ing.displayName}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h4>Cooking Instructions</h4>
                        <ol style="padding-left: 20px; line-height: 1.6;">
                            ${suggestion.instructions.map(step => `<li style="margin: 8px 0;">${step}</li>`).join('')}
                        </ol>
                    </div>
                    
                    <div class="modal-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                        <button class="btn btn--secondary" onclick="this.closest('.modal').remove()">Close</button>
                        <button class="btn btn--primary" onclick="addMealToLog('${suggestion.name}', ${suggestion.calories}, ${suggestion.protein}, ${suggestion.fat}, ${suggestion.carbs}); this.closest('.modal').remove();">
                            Add to Food Log
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(recipeModal);
        
        // Close modal when clicking outside
        recipeModal.addEventListener('click', function(e) {
            if (e.target === recipeModal) {
                recipeModal.remove();
            }
        });
        
    } catch (error) {
        console.error('Error displaying meal details:', error);
        showUserMessage('Failed to display recipe details', 'error');
    }
}

// Make functions available globally for onclick handlers
window.openFoodModal = openFoodModal;
window.editFood = editFood;
window.deleteFood = deleteFood;
window.selectFoodFromSearch = selectFoodFromSearch;
window.addMealToLog = addMealToLog;
window.viewMealDetails = viewMealDetails;