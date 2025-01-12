// Existing Elements
const itemForm = document.getElementById('item-form');
const itemInput = document.getElementById('item-input');
const categorySelect = document.getElementById('category-select');
const filterCategory = document.getElementById('filter-category');
const itemList = document.getElementById('item-list');
const clearButton = document.getElementById('clear');
const filterInput = document.getElementById('filter');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// New Elements for Budget Tracking
const budgetInput = document.getElementById('budget-input');
const totalBudgetElem = document.getElementById('total-budget');
const totalSpentElem = document.getElementById('total-spent');
const remainingBudgetElem = document.getElementById('remaining-budget');
const taxRateInput = document.getElementById('tax-rate');

// Variables
let budget = 0;
let items = [];

// Initialize SortableJS for Drag-and-Drop Sorting
document.addEventListener('DOMContentLoaded', () => {
  const sortable = new Sortable(itemList, {
    animation: 150,
    onEnd: saveNewOrder,
  });

  displayItems();
  updateBudgetDisplay();
});

// Save the new order to localStorage
function saveNewOrder() {
  const updatedItems = Array.from(itemList.children).map((li) => {
    const name = li.querySelector('span').textContent.trim();
    const category = li.querySelector('.badge').textContent.trim();
    const price = parseFloat(li.querySelector('.price').textContent.replace('$', '')) || 0;
    const purchased = li.classList.contains('purchased');
    return { name, category, price, purchased };
  });

  localStorage.setItem('items', JSON.stringify(updatedItems));
  calculateTotalSpent();
}

// Dark Mode Toggle
darkModeToggle.addEventListener('click', () => {
  const isDarkMode = document.body.classList.toggle('dark-mode');
  darkModeToggle.innerHTML = isDarkMode
    ? '<i class="fa-solid fa-sun"></i> Light Mode'
    : '<i class="fa-solid fa-moon"></i> Dark Mode';
  localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
});

// Show Toast Message
function showToast(message, isError = false) {
  const toastContainer = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : ''}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Display Items
function displayItems() {
  items = getItemsFromStorage();
  items.forEach(addItemToDOM);
  calculateTotalSpent();
}

function isDuplicate(name, category) {
  return items.some((item) => item.name.toLowerCase() === name.toLowerCase() && item.category === category);
}

function onAddItemSubmit(e) {
  e.preventDefault();
  const newItem = itemInput.value.trim();
  const category = categorySelect.value;
  const price = parseFloat(document.getElementById('price-input').value) || 0;

  if (!newItem || price <= 0) {
    showToast('Please enter a valid item and price.', true);
    return;
  }

  // Check for duplicates
  if (isDuplicate(newItem, category)) {
    showToast('This item already exists!', true);
    return;
  }

  // Create the item object
  const item = { name: newItem, category, price, purchased: false };

  // Add the item to the global items array
  items.push(item);

  // Save the item in localStorage
  localStorage.setItem('items', JSON.stringify(items));

  // Add the item to the DOM
  addItemToDOM(item);

  // Clear the input fields
  itemInput.value = '';
  document.getElementById('price-input').value = '';

  // Provide feedback to the user
  showToast('Item added successfully!');

  // Update the budget display
  calculateTotalSpent();

  // Scroll to the newly added item
  scrollToBottom();
}

// Add to DOM
function addItemToDOM(item) {
  const li = document.createElement('li');
  li.innerHTML = `
    <span>${item.name}</span>
    <span class="badge">${item.category}</span>
    <span class="price">$${item.price.toFixed(2)}</span>
    <button class="delete"><i class="fa-solid fa-trash"></i></button>
  `;

  const deleteButton = li.querySelector('.delete');
  deleteButton.addEventListener('click', () => removeItem(li, item.name));
  itemList.appendChild(li);
}

function updateBudgetDisplay() {
  const spent = items.reduce((sum, item) => sum + item.price, 0); // Calculate total spent
  const taxRate = parseFloat(taxRateInput.value) / 100 || 0; // Get tax rate as a decimal
  const tax = spent * taxRate; // Calculate tax on total spent
  const totalSpent = spent + tax; // Include tax in the total spent
  const remaining = budget - totalSpent; // Calculate remaining budget

  // Update the DOM with accurate values
  totalBudgetElem.textContent = `$${budget.toFixed(2)}`;
  totalSpentElem.textContent = `$${totalSpent.toFixed(2)}`;
  remainingBudgetElem.textContent = `$${remaining.toFixed(2)}`;
}

// Remove Item
function removeItem(li, name) {
  items = items.filter((item) => item.name !== name);
  li.remove();
  localStorage.setItem('items', JSON.stringify(items));
  calculateTotalSpent();
  showToast(`"${name}" deleted successfully!`);
}

// Calculate Total Spent
function calculateTotalSpent() {
  updateBudgetDisplay();
}

// Storage Functions
function getItemsFromStorage() {
  return JSON.parse(localStorage.getItem('items')) || [];
}

function saveToStorage(item) {
  items.push(item);
  localStorage.setItem('items', JSON.stringify(items));
  calculateTotalSpent();
}

// Event Listeners
itemForm.addEventListener('submit', onAddItemSubmit);

budgetInput.addEventListener('input', () => {
  budget = parseFloat(budgetInput.value) || 0;
  updateBudgetDisplay();
});

clearButton.addEventListener('click', () => {
  if (itemList.children.length > 0) {
    items = [];
    itemList.innerHTML = '';
    localStorage.removeItem('items');
    showToast('All items cleared successfully!');
    calculateTotalSpent();
  } else {
    showToast('No items to clear!', true);
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', displayItems);
