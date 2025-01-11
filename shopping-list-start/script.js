const itemForm = document.getElementById('item-form');
const itemInput = document.getElementById('item-input');
const categorySelect = document.getElementById('category-select');
const filterCategory = document.getElementById('filter-category');
const itemList = document.getElementById('item-list');
const clearButton = document.getElementById('clear');
const filterInput = document.getElementById('filter');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Dark Mode Toggle
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
  darkModeToggle.innerHTML = '<i class="fa-solid fa-sun"></i> Light Mode';
} else {
  darkModeToggle.innerHTML = '<i class="fa-solid fa-moon"></i> Dark Mode';
}

darkModeToggle.addEventListener('click', () => {
  const isDarkMode = document.body.classList.toggle('dark-mode');
  darkModeToggle.innerHTML = isDarkMode
    ? '<i class="fa-solid fa-sun"></i> Light Mode'
    : '<i class="fa-solid fa-moon"></i> Dark Mode';
  localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
});

// Display Items
function displayItems() {
  const items = getItemsFromStorage();
  items.forEach(addItemToDOM);
}

function scrollToBottom() {
  itemList.scrollTop = itemList.scrollHeight; // Scroll to the bottom of the list container
}

// Add Item
function onAddItemSubmit(e) {
  e.preventDefault();
  const newItem = itemInput.value.trim();
  const category = categorySelect.value;

  if (!newItem) {
    alert('Please enter an item.');
    return;
  }

  // if (isDuplicate(newItem)) {
  //   alert('This item already exists!');
  //   return;
  // }

  const item = { name: newItem, category, purchased: false };
  addItemToDOM(item);
  saveToStorage(item);
  itemInput.value = '';
  // updateUI();
  scrollToBottom();
}

// Add to DOM
function addItemToDOM(item) {
  const li = document.createElement('li');
  const nameSpan = document.createElement('span');
  nameSpan.textContent = item.name;
  li.appendChild(nameSpan);

  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = item.category;
  li.appendChild(badge);

  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
  deleteButton.addEventListener('click', () => removeItem(li, item.name));
  li.appendChild(deleteButton);

  if (item.purchased) li.classList.add('purchased');
  itemList.appendChild(li);
}

// Toggle Purchased
itemList.addEventListener('click', (e) => {
  if (e.target.tagName === 'SPAN') {
    const li = e.target.closest('li');
    const itemName = li.firstChild.textContent;
    li.classList.toggle('purchased');
    togglePurchasedInStorage(itemName);
  }
});

// Filter by Category
filterCategory.addEventListener('change', () => {
  const category = filterCategory.value;
  Array.from(itemList.children).forEach((item) => {
    const badge = item.querySelector('.badge').textContent;
    item.style.display =
      category === 'All' || badge === category ? 'flex' : 'none';
  });
});

// Filter Items
filterInput.addEventListener('input', (e) => {
  const search = e.target.value.toLowerCase();
  Array.from(itemList.children).forEach((item) => {
    const name = item.firstChild.textContent.toLowerCase();
    item.style.display = name.includes(search) ? 'flex' : 'none';
  });
});

// Storage Functions
function getItemsFromStorage() {
  return JSON.parse(localStorage.getItem('items')) || [];
}

function saveToStorage(item) {
  const items = getItemsFromStorage();
  items.push(item);
  localStorage.setItem('items', JSON.stringify(items));
}

function togglePurchasedInStorage(name) {
  const items = getItemsFromStorage().map((item) =>
    item.name === name ? { ...item, purchased: !item.purchased } : item
  );
  localStorage.setItem('items', JSON.stringify(items));
}

function removeItem(li, name) {
  li.remove();
  const items = getItemsFromStorage().filter((item) => item.name !== name);
  localStorage.setItem('items', JSON.stringify(items));
}

// Event Listeners
itemForm.addEventListener('submit', onAddItemSubmit);
clearButton.addEventListener('click', () => {
  itemList.innerHTML = '';
  localStorage.removeItem('items');
});

// Initialize
document.addEventListener('DOMContentLoaded', displayItems);
