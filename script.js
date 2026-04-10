// script.js - общая логика приложения Posuda_Sona

(function() {
  // ---------- ИНИЦИАЛИЗАЦИЯ ДАННЫХ ----------
  const STORAGE_KEYS = {
    USERS: 'ps_users',
    CURRENT_USER: 'ps_current_user',
    THEME: 'ps_theme',
    ORDERS: 'ps_orders',
    CHATS: 'ps_chats',
    CART_PREFIX: 'ps_cart_'
  };

  // Товары каталога (имитация)
  const PRODUCTS = [
    { id: 1, name: 'Тарелка глубокая', price: 1290, icon: '🍽️', category: 'Тарелки' },
    { id: 2, name: 'Чашка керамическая', price: 890, icon: '☕', category: 'Чашки' },
    { id: 3, name: 'Кастрюля 3л', price: 2490, icon: '🥘', category: 'Кастрюли' },
    { id: 4, name: 'Сковорода блинная', price: 1790, icon: '🍳', category: 'Сковороды' },
    { id: 5, name: 'Бокал для вина', price: 590, icon: '🍷', category: 'Бокалы' },
    { id: 6, name: 'Набор столовых приборов', price: 1990, icon: '🍴', category: 'Приборы' },
    { id: 7, name: 'Салатник', price: 1100, icon: '🥗', category: 'Тарелки' },
    { id: 8, name: 'Чайник заварочный', price: 1590, icon: '🫖', category: 'Чашки' }
  ];

  // Инициализация localStorage (если пусто)
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CHATS)) {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify({}));
  }

  // ---------- УТИЛИТЫ ----------
  function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  }

  function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  function getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
  }

  function setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.location.href = 'index.html';
  }

  // Работа с корзиной (привязана к пользователю)
  function getCartKey(username) {
    return STORAGE_KEYS.CART_PREFIX + username;
  }

  function getCart(username) {
    if (!username) return [];
    const key = getCartKey(username);
    return JSON.parse(localStorage.getItem(key)) || [];
  }

  function saveCart(username, cart) {
    const key = getCartKey(username);
    localStorage.setItem(key, JSON.stringify(cart));
    updateCartCounter();
  }

  function addToCart(productId, username) {
    if (!username) {
      window.location.href = 'login.html?redirect=catalog.html';
      return;
    }
    const cart = getCart(username);
    const existing = cart.find(item => item.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      const product = PRODUCTS.find(p => p.id === productId);
      if (product) {
        cart.push({ ...product, quantity: 1 });
      }
    }
    saveCart(username, cart);
    alert('Товар добавлен в корзину');
  }

  function updateCartCounter() {
    const counterSpan = document.getElementById('cart-count');
    if (!counterSpan) return;
    const user = getCurrentUser();
    if (user && !user.isAdmin) {
      const cart = getCart(user.username);
      const total = cart.reduce((sum, item) => sum + item.quantity, 0);
      counterSpan.textContent = total;
      counterSpan.style.display = total > 0 ? 'inline' : 'none';
    } else {
      counterSpan.style.display = 'none';
    }
  }

  // Заказы
  function getOrders() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)) || [];
  }

  function saveOrders(orders) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  function createOrder(username, cartItems) {
    const orders = getOrders();
    const newOrder = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      username: username,
      items: cartItems,
      total: cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0),
      date: new Date().toLocaleString('ru-RU'),
      status: 'Новая'
    };
    orders.push(newOrder);
    saveOrders(orders);
    // Очищаем корзину
    saveCart(username, []);
    return newOrder;
  }

  // Чаты
  function getChats() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS)) || {};
  }

  function saveChats(chats) {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  }

  function getChatId(username) {
    return `admin_${username}`;
  }

  function getOrCreateChat(username) {
    const chats = getChats();
    const chatId = getChatId(username);
    if (!chats[chatId]) {
      chats[chatId] = [];
    }
    saveChats(chats);
    return chats[chatId];
  }

  function sendMessage(chatId, sender, text) {
    const chats = getChats();
    if (!chats[chatId]) chats[chatId] = [];
    chats[chatId].push({
      sender: sender, // 'admin' или 'user'
      text: text,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    });
    saveChats(chats);
  }

  // Тема
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    const body = document.body;
    if (savedTheme === 'dark') {
      body.classList.add('dark-theme');
      updateThemeIcon(true);
    } else {
      body.classList.remove('dark-theme');
      updateThemeIcon(false);
    }
  }

  function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-theme');
    localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
  }

  function updateThemeIcon(isDark) {
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
      icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  // Обновление UI шапки (авторизация)
  function updateHeaderAuth() {
    const userInfoDiv = document.getElementById('user-info');
    if (!userInfoDiv) return;
    const user = getCurrentUser();
    if (user && !user.isAdmin) {
      userInfoDiv.innerHTML = `
        <span id="user-greeting">Привет, ${user.username}</span>
        <button class="btn btn-outline" id="logout-btn">Выйти</button>
      `;
      document.getElementById('logout-btn')?.addEventListener('click', logout);
    } else if (user && user.isAdmin) {
      userInfoDiv.innerHTML = `
        <span id="user-greeting">Админ</span>
        <button class="btn btn-outline" id="logout-btn">Выйти</button>
      `;
      document.getElementById('logout-btn')?.addEventListener('click', logout);
    } else {
      userInfoDiv.innerHTML = `<a href="login.html" class="btn">Войти</a>`;
    }
    updateCartCounter();
  }

  // Инициализация общих элементов
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateHeaderAuth();

    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    }

    // Logout уже может быть обработан через делегирование, но на всякий случай:
    document.body.addEventListener('click', (e) => {
      if (e.target.id === 'logout-btn') {
        logout();
      }
    });
  });

  // Экспорт в глобальную область
  window.App = {
    PRODUCTS,
    getCurrentUser,
    setCurrentUser,
    logout,
    getCart,
    saveCart,
    addToCart,
    updateCartCounter,
    getOrders,
    saveOrders,
    createOrder,
    getChats,
    getOrCreateChat,
    sendMessage,
    getChatId,
    STORAGE_KEYS,
    getUsers,
    saveUsers,
    updateHeaderAuth
  };

})();
