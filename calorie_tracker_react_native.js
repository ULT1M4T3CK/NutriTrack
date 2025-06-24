
// CalorieTrackerApp.js - Main Application Structure
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Main Dashboard Component
const DashboardScreen = ({ navigation }) => {
  const [dailyCalories, setDailyCalories] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [macros, setMacros] = useState({
    protein: 0,
    fat: 0,
    carbs: 0
  });

  const remainingCalories = calorieGoal - dailyCalories;
  const progress = Math.min((dailyCalories / calorieGoal) * 100, 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Today's Progress</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
        </View>

        {/* Calorie Progress Circle */}
        <View style={styles.progressContainer}>
          <View style={styles.circularProgress}>
            <Text style={styles.caloriesConsumed}>{dailyCalories}</Text>
            <Text style={styles.caloriesLabel}>calories</Text>
            <Text style={styles.remainingCalories}>
              {remainingCalories > 0 ? `${remainingCalories} remaining` : 'Goal reached!'}
            </Text>
          </View>
        </View>

        {/* Macronutrient Breakdown */}
        <View style={styles.macrosContainer}>
          <Text style={styles.sectionTitle}>Macronutrients</Text>
          <View style={styles.macrosRow}>
            <MacroCard name="Protein" value={macros.protein} unit="g" color="#4CAF50" />
            <MacroCard name="Fat" value={macros.fat} unit="g" color="#FF9800" />
            <MacroCard name="Carbs" value={macros.carbs} unit="g" color="#2196F3" />
          </View>
        </View>

        {/* Quick Add Buttons */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddFood')}
          >
            <Text style={styles.actionButtonText}>+ Add Food</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ScanBarcode')}
          >
            <Text style={styles.actionButtonText}>📱 Scan Barcode</Text>
          </TouchableOpacity>
        </View>

        {/* Meal Sections */}
        <MealSection title="Breakfast" mealId="breakfast" />
        <MealSection title="After Breakfast Snack" mealId="morning_snack" />
        <MealSection title="Lunch" mealId="lunch" />
        <MealSection title="After Lunch Snack" mealId="afternoon_snack" />
        <MealSection title="Dinner" mealId="dinner" />
        <MealSection title="After Dinner Snack" mealId="evening_snack" />
      </ScrollView>
    </SafeAreaView>
  );
};

// Macro Card Component
const MacroCard = ({ name, value, unit, color }) => (
  <View style={[styles.macroCard, { borderColor: color }]}>
    <Text style={[styles.macroValue, { color }]}>{value}{unit}</Text>
    <Text style={styles.macroName}>{name}</Text>
  </View>
);

// Meal Section Component
const MealSection = ({ title, mealId }) => {
  const [foods, setFoods] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);

  return (
    <View style={styles.mealSection}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealTitle}>{title}</Text>
        <Text style={styles.mealCalories}>{totalCalories} cal</Text>
      </View>
      {foods.length === 0 ? (
        <TouchableOpacity style={styles.addFoodButton}>
          <Text style={styles.addFoodText}>+ Add food to {title.toLowerCase()}</Text>
        </TouchableOpacity>
      ) : (
        <View>
          {foods.map((food, index) => (
            <FoodItem key={index} food={food} />
          ))}
        </View>
      )}
    </View>
  );
};

// Food Item Component
const FoodItem = ({ food }) => (
  <View style={styles.foodItem}>
    <View style={styles.foodInfo}>
      <Text style={styles.foodName}>{food.name}</Text>
      <Text style={styles.foodDetails}>{food.quantity} • {food.calories} cal</Text>
    </View>
    <TouchableOpacity style={styles.editButton}>
      <Text style={styles.editButtonText}>Edit</Text>
    </TouchableOpacity>
  </View>
);

// Weight Tracking Screen
const WeightScreen = () => {
  const [weight, setWeight] = useState('');
  const [weightHistory, setWeightHistory] = useState([]);
  const [goalWeight, setGoalWeight] = useState(160);

  const addWeightEntry = async () => {
    if (!weight) return;

    const newEntry = {
      weight: parseFloat(weight),
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now()
    };

    const updated = [...weightHistory, newEntry];
    setWeightHistory(updated);

    try {
      await AsyncStorage.setItem('weightHistory', JSON.stringify(updated));
      setWeight('');
      Alert.alert('Success', 'Weight entry added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save weight entry');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Weight Tracking</Text>
        </View>

        {/* Current Weight Input */}
        <View style={styles.weightInputContainer}>
          <Text style={styles.inputLabel}>Current Weight (lbs)</Text>
          <TextInput
            style={styles.weightInput}
            value={weight}
            onChangeText={setWeight}
            placeholder="Enter weight"
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.addButton} onPress={addWeightEntry}>
            <Text style={styles.addButtonText}>Add Entry</Text>
          </TouchableOpacity>
        </View>

        {/* Goal Weight */}
        <View style={styles.goalContainer}>
          <Text style={styles.goalLabel}>Goal Weight: {goalWeight} lbs</Text>
          <TouchableOpacity style={styles.editGoalButton}>
            <Text style={styles.editGoalText}>Edit Goal</Text>
          </TouchableOpacity>
        </View>

        {/* Weight Chart Placeholder */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Weight Progress</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartText}>Weight chart will display here</Text>
          </View>
        </View>

        {/* Recent Entries */}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Recent Entries</Text>
          {weightHistory.slice(-5).reverse().map((entry, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyDate}>{entry.date}</Text>
              <Text style={styles.historyWeight}>{entry.weight} lbs</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Goals & Settings Screen
const GoalsScreen = () => {
  const [calorieGoal, setCalorieGoal] = useState('2000');
  const [proteinGoal, setProteinGoal] = useState('30');
  const [fatGoal, setFatGoal] = useState('30');
  const [carbGoal, setCarbGoal] = useState('40');

  const saveGoals = async () => {
    const goals = {
      calories: parseInt(calorieGoal),
      protein: parseInt(proteinGoal),
      fat: parseInt(fatGoal),
      carbs: parseInt(carbGoal)
    };

    try {
      await AsyncStorage.setItem('userGoals', JSON.stringify(goals));
      Alert.alert('Success', 'Goals updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save goals');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Goals & Settings</Text>
        </View>

        <View style={styles.goalsContainer}>
          <Text style={styles.sectionTitle}>Daily Targets</Text>

          <View style={styles.goalItem}>
            <Text style={styles.goalLabel}>Daily Calories</Text>
            <TextInput
              style={styles.goalInput}
              value={calorieGoal}
              onChangeText={setCalorieGoal}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.goalItem}>
            <Text style={styles.goalLabel}>Protein (%)</Text>
            <TextInput
              style={styles.goalInput}
              value={proteinGoal}
              onChangeText={setProteinGoal}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.goalItem}>
            <Text style={styles.goalLabel}>Fat (%)</Text>
            <TextInput
              style={styles.goalInput}
              value={fatGoal}
              onChangeText={setFatGoal}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.goalItem}>
            <Text style={styles.goalLabel}>Carbohydrates (%)</Text>
            <TextInput
              style={styles.goalInput}
              value={carbGoal}
              onChangeText={setCarbGoal}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={saveGoals}>
            <Text style={styles.saveButtonText}>Save Goals</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Navigation Setup
const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ tabBarLabel: 'Today' }}
        />
        <Tab.Screen 
          name="Weight" 
          component={WeightScreen}
          options={{ tabBarLabel: 'Weight' }}
        />
        <Tab.Screen 
          name="Goals" 
          component={GoalsScreen}
          options={{ tabBarLabel: 'Goals' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  progressContainer: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  circularProgress: {
    alignItems: 'center',
    padding: 20,
  },
  caloriesConsumed: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  caloriesLabel: {
    fontSize: 16,
    color: '#666',
  },
  remainingCalories: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  macrosContainer: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroCard: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    padding: 15,
    margin: 5,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  macroName: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    margin: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  mealSection: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  mealCalories: {
    fontSize: 14,
    color: '#666',
  },
  addFoodButton: {
    padding: 20,
    alignItems: 'center',
  },
  addFoodText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  foodDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  weightInputContainer: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  weightInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  goalContainer: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalLabel: {
    fontSize: 16,
    color: '#333',
  },
  editGoalButton: {
    padding: 8,
  },
  editGoalText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  chartContainer: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartText: {
    color: '#666',
    fontSize: 16,
  },
  historyContainer: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 10,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historyDate: {
    fontSize: 16,
    color: '#333',
  },
  historyWeight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  goalsContainer: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 10,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  goalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    width: 80,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default App;
