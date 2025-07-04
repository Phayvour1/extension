let extensions = [];
let removedExtensions = [];
let currentFilter = 'all';
let showingRemoved = false;

const extensionList = document.getElementById('extensionList');
const darkModeToggle = document.getElementById('darkModeToggle');
const toggleRemovedBtn = document.getElementById('toggleRemoved');

// Theme toggle
darkModeToggle.addEventListener('change', () => {
  const theme = darkModeToggle.checked ? 'dark' : 'light';
  setTheme(theme);
  localStorage.setItem('theme', theme);
});

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  darkModeToggle.checked = theme === 'dark';
}

// Load theme
const savedTheme = localStorage.getItem('theme') || 'system';
if (savedTheme === 'system') {
  document.documentElement.removeAttribute('data-theme');
} else {
  setTheme(savedTheme);
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter-btn.active')?.classList.remove('active');
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    showingRemoved = false;
    toggleRemovedBtn.textContent = "Show Removed";
    renderExtensions();
  });
});

// Toggle removed view
toggleRemovedBtn.addEventListener('click', () => {
  showingRemoved = !showingRemoved;
  toggleRemovedBtn.textContent = showingRemoved ? "Hide Removed" : "Show Removed";
  renderExtensions();
});

// Load extension data
fetch('data.json')
  .then(res => res.json())
  .then(data => {
    extensions = data;
    renderExtensions();
  });

function renderExtensions() {
  extensionList.innerHTML = '';

  if (showingRemoved) {
    if (removedExtensions.length === 0) {
      extensionList.innerHTML = '<p>No removed extensions.</p>';
      return;
    }

    removedExtensions.forEach(ext => {
      const card = document.createElement('div');
      card.className = 'extension-card';

      card.innerHTML = `
        <div class="extension-info">
          <h3>${ext.name}</h3>
          <p>${ext.description}</p>
        </div>
        <div class="extension-controls">
          <button class="restore-btn" data-id="${ext.id}">Restore</button>
        </div>
      `;

      extensionList.appendChild(card);
    });

    document.querySelectorAll('.restore-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = +e.target.dataset.id;
        const index = removedExtensions.findIndex(ext => ext.id === id);
        if (index !== -1) {
          extensions.push(removedExtensions[index]);
          removedExtensions.splice(index, 1);
          renderExtensions();
        }
      });
    });

    return;
  }

  const filtered = extensions.filter(ext => {
    if (currentFilter === 'all') return true;
    return currentFilter === 'active' ? ext.active : !ext.active;
  });

  if (filtered.length === 0) {
    extensionList.innerHTML = '<p>No extensions to show.</p>';
    return;
  }

  filtered.forEach(ext => {
    const card = document.createElement('div');
    card.className = 'extension-card';

    card.innerHTML = `
      <div class="extension-info">
        <h3>${ext.name}</h3>
        <p>${ext.description}</p>
      </div>
      <div class="extension-controls">
        <label class="switch">
          <input type="checkbox" class="toggle-switch" data-id="${ext.id}" ${ext.active ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
        <button class="remove-btn" data-id="${ext.id}">Remove</button>
      </div>
    `;

    extensionList.appendChild(card);
  });

  document.querySelectorAll('.toggle-switch').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = +e.target.dataset.id;
      const ext = extensions.find(ext => ext.id === id);
      if (ext) {
        ext.active = e.target.checked;
        renderExtensions();
      }
    });
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = +e.target.dataset.id;
      const index = extensions.findIndex(ext => ext.id === id);
      if (index !== -1) {
        removedExtensions.push(extensions[index]);
        extensions.splice(index, 1);
        renderExtensions();
      }
    });
  });
}
