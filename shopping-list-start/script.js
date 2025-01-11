const itemForm = document.getElementById('item-form');
const itemInput = document.getElementById('item-input');
const categorySelect = document.getElementById('category-select');
const filterCategory = document.getElementById('filter-category');
const itemList = document.getElementById('item-list');
const clearButton = document.getElementById('clear');
const filterInput = document.getElementById('filter');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Initialize SortableJS for Drag-and-Drop Sorting
document.addEventListener('DOMContentLoaded', () => {
  const sortable = new Sortable(itemList, {
    animation: 150, // Smooth animation during drag-and-drop
    onEnd: saveNewOrder, // Triggered when the order changes
  });
});

// Save the new order to localStorage
function saveNewOrder() {
  const updatedItems = Array.from(itemList.children).map((li) => {
    const name = li.querySelector('span').textContent.trim();
    const category = li.querySelector('.badge').textContent.trim();
    const purchased = li.classList.contains('purchased');
    return { name, category, purchased };
  });

  localStorage.setItem('items', JSON.stringify(updatedItems));
}

// Dark Mode Toggle
darkModeToggle.addEventListener('click', () => {
  const isDarkMode = document.body.classList.toggle('dark-mode');
  darkModeToggle.innerHTML = isDarkMode
    ? '<i class="fa-solid fa-sun"></i> Light Mode'
    : '<i class="fa-solid fa-moon"></i> Dark Mode';
  localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
});

function showToast(message, isError = false) {
  const toastContainer = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : ''}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  // Remove the toast after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Display Items
function displayItems() {
  const items = getItemsFromStorage();
  items.forEach(addItemToDOM);
}

function scrollToBottom() {
  itemList.scrollTop = itemList.scrollHeight; // Scroll to the bottom of the list container
}

function isDuplicate(name, category) {
  return getItemsFromStorage().some(
    (item) => item.name.toLowerCase() === name.toLowerCase() && item.category === category
  );
}

function onAddItemSubmit(e) {
  e.preventDefault();
  const newItem = itemInput.value.trim();
  const category = categorySelect.value;

  if (!newItem) {
    showToast('Please enter an item.', true); // Show error toast
    return;
  }

  if (isDuplicate(newItem, category)) {
    showToast('This item already exists!', true); // Show error toast
    return;
  }

  const item = { name: newItem, category, purchased: false };
  addItemToDOM(item);
  saveToStorage(item);
  itemInput.value = '';

  showToast('Item added successfully!'); // Show success toast
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
  showToast(`"${name}" deleted successfully!`);
}

// Event Listeners
itemForm.addEventListener('submit', onAddItemSubmit);
clearButton.addEventListener('click', () => {
  if (itemList.children.length > 0) {
    itemList.innerHTML = '';
    localStorage.removeItem('items');
    showToast('All items cleared successfully!');
  } else {
    showToast('No items to clear!', true);
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', displayItems);
