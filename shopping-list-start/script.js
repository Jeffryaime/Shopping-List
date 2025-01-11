const itemForm = document.getElementById('item-form');
const itemInput = document.getElementById('item-input');
const itemList = document.getElementById('item-list');
const clearButton = document.getElementById('clear');
const filterInput = document.getElementById('filter');

function displayItems() {
  const items = getItemsFromStorage();
  items.forEach((item) => addItemToDOM(item));
  updateUI();
}

function onAddItemSubmit(e) {
  e.preventDefault();

  const newItem = itemInput.value.trim();
  if (newItem === '') {
    showToast('Please enter an item.', 'error');
    return;
  }

  if (isDuplicate(newItem)) {
    showToast('This item already exists!', 'error');
    return;
  }

  addItemToDOM(newItem);
  saveToStorage(newItem);
  showToast('Item added successfully!');
  itemInput.value = '';
  updateUI();
}

function addItemToDOM(item) {
  const li = document.createElement('li');
  li.textContent = item;

  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
  deleteButton.addEventListener('click', () => removeItem(li, item));

  li.appendChild(deleteButton);
  itemList.appendChild(li);
}

function removeItem(element, item) {
  element.remove();
  removeFromStorage(item);
  showToast('Item removed successfully!');
  updateUI();
}

function clearItems() {
  itemList.innerHTML = '';
  localStorage.removeItem('items');
  showToast('All items cleared!', 'error');
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

function removeFromStorage(item) {
  const items = getItemsFromStorage().filter((i) => i !== item);
  localStorage.setItem('items', JSON.stringify(items));
}

function isDuplicate(item) {
  return getItemsFromStorage().includes(item);
}

function updateUI() {
  clearButton.style.display = itemList.children.length ? 'block' : 'none';
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2000);
}

itemForm.addEventListener('submit', onAddItemSubmit);
clearButton.addEventListener('click', clearItems);
filterInput.addEventListener('input', filterItems);
document.addEventListener('DOMContentLoaded', displayItems);
