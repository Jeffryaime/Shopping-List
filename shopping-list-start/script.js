// Existing Elements
const itemForm = document.getElementById('item-form');
const itemInput = document.getElementById('item-input');
const categorySelect = document.getElementById('category-select');
const filterCategory = document.getElementById('filter-category');
const itemList = document.getElementById('item-list');
const clearButton = document.getElementById('clear');
const filterInput = document.getElementById('filter');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Budget Tracking Elements
const budgetInput = document.getElementById('budget-input');
const totalBudgetElem = document.getElementById('total-budget');
const totalSpentElem = document.getElementById('total-spent');
const remainingBudgetElem = document.getElementById('remaining-budget');
const taxRateInput = document.getElementById('tax-rate');

// Variables
let budget = 0;
let items = [];

// Initialize Drag-and-Drop Sorting
document.addEventListener('DOMContentLoaded', () => {
  const sortable = new Sortable(itemList, {
    animation: 150,
    onEnd: saveNewOrder,
  });

  displayItems();
  updateBudgetDisplay();
});

// Save New Order
function saveNewOrder() {
  items = Array.from(itemList.children).map((li) => {
    const name = li.querySelector('.item-name').textContent.trim();
    const category = li.querySelector('.item-category').textContent.trim();
    const price = parseFloat(li.querySelector('.item-price').textContent.replace('$', '')) || 0;
    return { name, category, price };
  });

  localStorage.setItem('items', JSON.stringify(items));
  calculateTotalSpent();
}

// Dark Mode Toggle
darkModeToggle.addEventListener('click', () => {
  const isDarkMode = document.body.classList.toggle('dark');
  darkModeToggle.innerHTML = isDarkMode
    ? '<i class="fa-solid fa-sun"></i> Light Mode'
    : '<i class="fa-solid fa-moon"></i> Dark Mode';
  localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
});

// Display Items
function displayItems() {
  itemList.innerHTML = ''; // Clear the list to prevent duplication
  items = getItemsFromStorage(); // Retrieve items from storage
  items.forEach(addItemToDOM); // Add items to the DOM
  calculateTotalSpent(); // Update budget calculations
}

// Check for Duplicate Items
function isDuplicate(name, category) {
  return items.some(
    (item) => item.name.toLowerCase() === name.toLowerCase() && item.category === category
  );
}

// Add New Item
function onAddItemSubmit(e) {
  e.preventDefault();
  const name = itemInput.value.trim();
  const category = categorySelect.value;
  const price = parseFloat(document.getElementById('price-input').value) || 0;

  if (!name || price <= 0) {
    showToast('Please enter a valid item and price.', true);
    return;
  }

  if (isDuplicate(name, category)) {
    showToast('This item already exists!', true);
    return;
  }


  const item = { name, category, price, purchased: false };
  items.push(item); // Add item to the array
  saveToStorage(); // Save to localStorage
  addItemToDOM(item); // Add to the DOM
  itemInput.value = '';
  document.getElementById('price-input').value = '';
  showToast('Item added successfully!');
  calculateTotalSpent();
}

// Add Item to DOM
function addItemToDOM(item) {
  const li = document.createElement('li');
  li.className =
    `flex justify-between items-center p-3 bg-gray-50 rounded shadow-sm border border-gray-200 ${
      item.purchased ? 'line-through text-gray-400' : ''
    }`;

  li.innerHTML = `
    <span class="item-name">${item.name}</span>
    <span class="item-category text-xs bg-gray-200 px-2 py-1 rounded">${item.category}</span>
    <span class="item-price font-bold">$${item.price.toFixed(2)}</span>
    <div class="flex gap-2">
      <button class="toggle-purchase text-gray-500 hover:text-gray-600">
        <i class="fa-solid fa-check"></i>
      </button>
      <button class="edit text-green-500 hover:text-green-600">
        <i class="fa-solid fa-pencil"></i>
      </button>
      <button class="delete text-red-500 hover:text-red-600">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `;

  const toggleButton = li.querySelector('.toggle-purchase');
  const deleteButton = li.querySelector('.delete');
  const editButton = li.querySelector('.edit');

  // Function to handle both click and touch events
  const addTouchSupport = (element, callback) => {
    element.addEventListener('click', callback);
    element.addEventListener('touchstart', (e) => {
      e.preventDefault(); // Prevent duplicate triggers on touch devices
      callback();
    });
  };

  // Attach events to buttons with touch support
  addTouchSupport(toggleButton, () => togglePurchaseStatus(item, li));
  addTouchSupport(deleteButton, () => removeItem(li, item.name));
  addTouchSupport(editButton, () => editItem(item, li));

  itemList.appendChild(li);
}

function togglePurchaseStatus(item, li) {
  item.purchased = !item.purchased; // Toggle the purchased status
  saveToStorage(); // Save updated items to localStorage

  // Update the list item styling
  if (item.purchased) {
    li.classList.add('line-through', 'text-gray-400');
  } else {
    li.classList.remove('line-through', 'text-gray-400');
  }
}

function editItem(item, li) {
  // Populate the form fields with the item's current values
  itemInput.value = item.name;
  categorySelect.value = item.category;
  document.getElementById('price-input').value = item.price;

  // Remove the item from the list so it can be updated
  items = items.filter((i) => i.name !== item.name);
  li.remove();

  // Update local storage
  saveToStorage();
  calculateTotalSpent();

  showToast(`Editing "${item.name}". Make changes and click the "+" button to save.`);
}

// Update Budget Display
function updateBudgetDisplay() {
  const spent = items.reduce((sum, item) => sum + item.price, 0);
  const taxRate = parseFloat(taxRateInput.value) / 100 || 0;
  const tax = spent * taxRate;
  const totalSpent = spent + tax;
  const remaining = budget - totalSpent;

  totalBudgetElem.textContent = `$${budget.toFixed(2)}`;
  totalSpentElem.textContent = `$${totalSpent.toFixed(2)}`;
  remainingBudgetElem.textContent = `$${remaining.toFixed(2)}`;
}

// Remove Item
function removeItem(li, name) {
  items = items.filter((item) => item.name !== name);
  li.remove();
  saveNewOrder();
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

function saveToStorage() {
  localStorage.setItem('items', JSON.stringify(items));
}

// Show Toast Message
function showToast(message, isError = false) {
  const toastContainer = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `fixed top-5 right-5 bg-${
    isError ? 'red-500' : 'green-500'
  } text-white px-4 py-2 rounded shadow-md`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
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

// Initialize App
document.addEventListener('DOMContentLoaded', displayItems);
