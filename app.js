const taskApiUrl = "https://script.google.com/macros/s/AKfycbxvLbA_UIGEdxnr0VaPny6qwsIsnT1tPJvRaSt_DdM6-P5ncwjwXKTpHrIJNkDcwwUd4A/exec";

function normalizeName(value) {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getCardName(card) {
  return normalizeName(card.querySelector('h3')?.textContent || '');
}

function deduplicateCards() {
  const menu = document.querySelector('.menu');
  if (!menu) {
    return;
  }

  const seenNames = new Set();
  const cards = Array.from(menu.querySelectorAll('.card'));

  cards.forEach((card) => {
    const name = getCardName(card);
    if (!name) {
      return;
    }

    if (seenNames.has(name)) {
      card.remove();
    } else {
      seenNames.add(name);
    }
  });
}

function readFromUrl() {
  let params = new URLSearchParams(window.location.search);
  let foodName = params.get('foodName');
  if (foodName) {
    setResults("Adding food...");
    addFoodToList(foodName);
  }
}

function setResults(text, category, add = false) {
  const resultDiv = document.querySelector('.results');
  resultDiv.classList.remove('success');
  resultDiv.classList.remove('info');
  resultDiv.classList.remove('error');
  resultDiv.classList.remove('warning');

  if (add) {
    resultDiv.innerHTML += text;
  }
  else {
    resultDiv.innerHTML = text;
  }
  resultDiv.classList.add(category);
  
}

function addFoodToList(foodName) {
  fetch(`${taskApiUrl}?action=addFoodByName&foodName=${foodName}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then((text) => {
      if(text.startsWith('Already on list')) {
        setResults(text, 'warning');
      } else {
        setResults(text, 'success');
      }
      
      deduplicateCards();
    })
    .catch((error) => {
      setResults(error, 'error');
    });
}

function handleFoodFormSubmit(event) {
  event.preventDefault();
  const input = document.getElementById('food-name');
  const foodName = input?.value?.trim();

  if (!foodName) {
    setResults('Please enter a food name.');
    return;
  }

  setResults('Adding food...');
  addFoodToList(foodName);
  input.value = '';
}

function sortCardsByFrequency(items) {
  const menu = document.querySelector('.menu');
  if (!menu) {
    return;
  }

  deduplicateCards();

  const responseOrder = new Map();
  items.forEach((item, index) => {
    if (item && item.task) {
      responseOrder.set(normalizeName(item.task), index);
    }
  });

  const cards = Array.from(menu.querySelectorAll('.card'));

  cards.sort((a, b) => {
    const nameA = normalizeName(a.querySelector('h3')?.textContent || '');
    const nameB = normalizeName(b.querySelector('h3')?.textContent || '');
    const orderA = responseOrder.get(nameA);
    const orderB = responseOrder.get(nameB);

    if (orderA !== undefined && orderB !== undefined) {
      if (orderA !== orderB) {
        return orderA - orderB;
      }
    } else if (orderA !== undefined) {
      return -1;
    } else if (orderB !== undefined) {
      return 1;
    }

    return nameA.localeCompare(nameB);
  });

  const fragment = document.createDocumentFragment();
  cards.forEach((card) => fragment.appendChild(card));
  menu.appendChild(fragment);
}

async function loadFrequencyData() {
  try {
    const response = await fetch(`${taskApiUrl}?action=getCompletedByFrequency`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      sortCardsByFrequency(data);
    }
  } catch (error) {
    console.error('Unable to load frequency data', error);
  }
}

async function updateTag() {
  try {
    const res = await fetch('/api/tag');
    const data = await res.json();
    if (data.last_tag !== "NONE") {
      document.getElementById('tag').innerText = data.last_tag;
    }
  } catch (e) {
    console.error("API error", e);
  }
}

window.onload = () => {
  setResults('Scan a tag, enter a custom food, or click an icon below to add to the list.', 'info');
  deduplicateCards();
  readFromUrl();
  loadFrequencyData();

  const foodForm = document.getElementById('food-form');
  if (foodForm) {
    foodForm.addEventListener('submit', handleFoodFormSubmit);
  }
};

// Poll the ESP32 every 500ms for fresh scans
// setInterval(updateTag, 5000);