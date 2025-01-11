const itemForm = document.getElementById('item-form');
const itemInput = document.getElementById('item-input');
const itemList = document.getElementById('item-list');
const clearButton = document.getElementById('clear');
const filterInput = document.getElementById('filter');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Check if dark mode was previously enabled
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
}

darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');

  // Save the user's preference
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'enabled');
  } else {
    localStorage.setItem('darkMode', 'disabled');
  }
});

function displayItems() {
  const items = getItemsFromStorage();
  items.forEach((item) => addItemToDOM(item));
  updateUI();
}

function onAddItemSubmit(e) {
  e.preventDefault();

  const newItem = itemInput.value.trim();
  if (newItem === '') {
    alert('Please enter an item.');
    return;
  }

  if (isDuplicate(newItem)) {
    alert('This item already exists!');
    return;
  }

  addItemToDOM({ name: newItem, purchased: false });
  saveToStorage({ name: newItem, purchased: false });
  itemInput.value = '';
  updateUI();
}

function addItemToDOM(item) {
  const li = document.createElement('li');
  li.textContent = item.name;
  if (item.purchased) li.classList.add('purchased');

  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
  deleteButton.addEventListener('click', () => removeItem(li, item.name));

  li.appendChild(deleteButton);
  itemList.appendChild(li);
}

function togglePurchased(e) {
  if (e.target.tagName === 'LI') {
    const itemName = e.target.textContent;
    e.target.classList.toggle('purchased');
    togglePurchasedInStorage(itemName);
  }
}

function togglePurchasedInStorage(itemName) {
  const items = getItemsFromStorage();
  const updatedItems = items.map((item) =>
    item.name === itemName ? { ...item, purchased: !item.purchased } : item
  );
  localStorage.setItem('items', JSON.stringify(updatedItems));
}

function removeItem(element, itemName) {
  element.remove();
  removeFromStorage(itemName);
  updateUI();
}

function removeFromStorage(itemName) {
  const items = getItemsFromStorage().filter((item) => item.name !== itemName);
  localStorage.setItem('items', JSON.stringify(items));
}

function clearItems() {
  itemList.innerHTML = '';
  localStorage.removeItem('items');
  updateUI();
}

function filterItems(e) {
  const search = e.target.value.toLowerCase();
  Array.from(itemList.children).forEach((item) => {
    const match = item.textContent.toLowerCase().includes(search);
    item.style.display = match ? 'flex' : 'none';
  });
}

function getItemsFromStorage() {
  return JSON.parse(localStorage.getItem('items')) || [];
}

function saveToStorage(item) {
  const items = getItemsFromStorage();
  items.push(item);
  localStorage.setItem('items', JSON.stringify(items));
}

function saveNewOrder() {
  const updatedItems = Array.from(itemList.children).map((li) => ({
    name: li.firstChild.textContent,
    purchased: li.classList.contains('purchased'),
  }));

  localStorage.setItem('items', JSON.stringify(updatedItems));
}

function isDuplicate(itemName) {
  return getItemsFromStorage().some((item) => item.name === itemName);
}

function updateUI() {
  clearButton.style.display = itemList.children.length ? 'block' : 'none';
}

itemForm.addEventListener('submit', onAddItemSubmit);
itemList.addEventListener('click', togglePurchased);
clearButton.addEventListener('click', clearItems);
filterInput.addEventListener('input', filterItems);
document.addEventListener('DOMContentLoaded', () => {
  displayItems();

  // Initialize SortableJS
  const sortable = new Sortable(itemList, {
    animation: 150, // Smooth animation
    onEnd: saveNewOrder, // Save new order to localStorage
  });
});
