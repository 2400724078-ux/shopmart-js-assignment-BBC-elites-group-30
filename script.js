// =============================================
// SHOPMART - Main JavaScript File
// Uses: DOM Manipulation, localStorage, Arrays,
//       Objects, Events, try...catch
// =============================================

// -----------------------------------------------
// PRODUCT DATA - Array of product objects
// -----------------------------------------------
const products = [
  { id: 1,  name: "MacBook Pro",      price: 1299, category: "Electronics", emoji: "💻" },
  { id: 2,  name: "iPhone 15",        price: 799,  category: "Electronics", emoji: "📱" },
  { id: 3,  name: "Sony Headphones",  price: 199,  category: "Electronics", emoji: "🎧" },
  { id: 4,  name: "Running Shoes",    price: 89,   category: "Fashion",     emoji: "👟" },
  { id: 5,  name: "Leather Jacket",   price: 149,  category: "Fashion",     emoji: "🧥" },
  { id: 6,  name: "Sunglasses",       price: 59,   category: "Fashion",     emoji: "🕶️" },
  { id: 7,  name: "JavaScript Book",  price: 35,   category: "Books",       emoji: "📘" },
  { id: 8,  name: "Clean Code",       price: 40,   category: "Books",       emoji: "📗" },
  { id: 9,  name: "Coffee Maker",     price: 79,   category: "Home",        emoji: "☕" },
  { id: 10, name: "Desk Lamp",        price: 45,   category: "Home",        emoji: "🪔" },
  { id: 11, name: "Yoga Mat",         price: 30,   category: "Sports",      emoji: "🧘" },
  { id: 12, name: "Water Bottle",     price: 25,   category: "Sports",      emoji: "🍶" },
];

// -----------------------------------------------
// CART FUNCTIONS - Read & Write to localStorage
// -----------------------------------------------

/**
 * getCart - Retrieves cart from localStorage
 * Uses try...catch to handle corrupted data errors
 */
function getCart() {
  try {
    const data = localStorage.getItem("shopmart_cart");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    // Handle error if localStorage data is corrupted
    console.error("Error reading cart from localStorage:", error.message);
    return [];
  }
}

/**
 * saveCart - Saves cart array to localStorage
 * Uses try...catch to handle storage errors
 */
function saveCart(cart) {
  try {
    localStorage.setItem("shopmart_cart", JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error.message);
  }
}

/**
 * addToCart - Adds a product to the cart
 * Uses DOM events and JavaScript arrays
 * @param {number} productId - The ID of the product to add
 */
function addToCart(productId) {
  try {
    // Find the product in the products array using its ID
    const product = products.find(p => p.id === productId);

    // Throw error if product doesn't exist
    if (!product) throw new Error("Product not found.");

    // Get current cart from localStorage
    const cart = getCart();

    // Check if product already exists in cart
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
      // If it already exists, just increase the quantity
      existingItem.quantity += 1;
    } else {
      // Otherwise, add it as a new item with quantity 1
      cart.push({ ...product, quantity: 1 });
    }

    // Save updated cart back to localStorage
    saveCart(cart);

    // Update cart counter in the navbar
    updateCartCount();

    // Show a toast notification to the user
    showToast(`${product.emoji} ${product.name} added to cart!`);

  } catch (error) {
    console.error("Error adding to cart:", error.message);
  }
}

/**
 * updateCartCount - Updates the cart count badge in the navbar
 * Uses DOM manipulation: getElementById, innerHTML
 */
function updateCartCount() {
  // Use querySelector to find the cart count element
  const cartCountEl = document.querySelector("#cart-count");
  if (!cartCountEl) return; // Exit if element doesn't exist on this page

  const cart = getCart();

  // Calculate total number of items (sum of all quantities)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Update the innerHTML of the cart count element
  cartCountEl.innerHTML = `Cart (${totalItems})`;
}

// -----------------------------------------------
// PRODUCT DISPLAY - DOM Manipulation
// -----------------------------------------------

/**
 * renderProducts - Creates and displays product cards dynamically
 * Uses: createElement(), appendChild(), addEventListener(), innerHTML
 * @param {Array} list - Array of product objects to display
 */
function renderProducts(list) {
  // Use getElementById to get the products container
  const container = document.getElementById("products-container");
  if (!container) return;

  // Clear existing content using innerHTML
  container.innerHTML = "";

  // Show message if no products match the filter/search
  if (list.length === 0) {
    const msg = document.createElement("p");
    msg.className = "no-products";
    msg.innerHTML = "😕 No products found. Try a different search.";
    container.appendChild(msg);
    return;
  }

  // Loop through each product and create a card using DOM methods
  list.forEach((product, index) => {

    // createElement - create the card div
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.animationDelay = `${index * 0.07}s`; // Staggered animation

    // Set card content using innerHTML
    card.innerHTML = `
      <div class="product-img">${product.emoji}</div>
      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">$${product.price.toLocaleString()}</p>
        <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
      </div>
    `;

    // appendChild - add card to the container
    container.appendChild(card);

    // addEventListener - attach click event to the "Add to Cart" button
    const btn = card.querySelector(".add-to-cart-btn");
    btn.addEventListener("click", () => {
      addToCart(product.id);
    });
  });
}

// -----------------------------------------------
// SEARCH & FILTER - DOM Filtering
// -----------------------------------------------

let currentCategory = "All"; // Track active category filter

/**
 * applyFilters - Applies both search and category filters
 * Uses JavaScript array methods: filter(), toLowerCase(), includes()
 */
function applyFilters() {
  // Get search term from the input using querySelector
  const searchInput = document.querySelector("#search-input");
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";

  // Filter products based on category and search term
  const filtered = products.filter(product => {
    const matchesCategory = currentCategory === "All" || product.category === currentCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  // Re-render the products with filtered list
  renderProducts(filtered);
}

/**
 * initFilters - Sets up search and category filter event listeners
 * Uses addEventListener for search input and filter buttons
 */
function initFilters() {
  // Search bar - addEventListener for 'input' event (fires on every keystroke)
  const searchInput = document.querySelector("#search-input");
  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  // Filter buttons - addEventListener for 'click' event
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Remove 'active' class from all buttons
      filterButtons.forEach(b => b.classList.remove("active"));

      // Add 'active' class to clicked button
      btn.classList.add("active");

      // Update current category and re-apply filters
      currentCategory = btn.dataset.category;
      applyFilters();
    });
  });
}

// -----------------------------------------------
// TOAST NOTIFICATION
// -----------------------------------------------

/**
 * showToast - Displays a temporary notification message
 * Uses DOM manipulation to show/hide a toast element
 * @param {string} message - Message to display
 */
function showToast(message) {
  // Use getElementById to get the toast element
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;

  // Add 'show' class to make it visible (CSS handles animation)
  toast.classList.add("show");

  // Remove after 2.5 seconds using setTimeout
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// -----------------------------------------------
// CART PAGE FUNCTIONS
// -----------------------------------------------

/**
 * renderCart - Displays all cart items on cart.html
 * Uses DOM manipulation to build cart UI dynamically
 */
function renderCart() {
  const container = document.getElementById("cart-items-container");
  const summaryContainer = document.getElementById("cart-summary");
  if (!container) return;

  const cart = getCart();

  // Show empty state if cart has no items
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <a href="index.html">Start Shopping</a>
      </div>
    `;
    if (summaryContainer) summaryContainer.style.display = "none";
    return;
  }

  // Show summary section
  if (summaryContainer) summaryContainer.style.display = "block";

  // Clear container and rebuild using DOM
  container.innerHTML = "";

  // Loop through each cart item and create a cart item element
  cart.forEach(item => {
    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";
    itemEl.setAttribute("data-id", item.id); // Set data attribute using setAttribute

    itemEl.innerHTML = `
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-category">${item.category}</p>
        <p class="cart-item-price">$${item.price} each</p>
      </div>
      <div class="qty-controls">
        <button class="qty-btn decrease-btn" data-id="${item.id}">−</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="qty-btn increase-btn" data-id="${item.id}">+</button>
      </div>
      <div class="cart-item-total">$${(item.price * item.quantity).toLocaleString()}</div>
      <button class="remove-btn" data-id="${item.id}" title="Remove">✕</button>
    `;

    // Append each cart item to the container using appendChild
    container.appendChild(itemEl);

    // addEventListener - increase quantity button
    itemEl.querySelector(".increase-btn").addEventListener("click", () => {
      changeQuantity(item.id, 1);
    });

    // addEventListener - decrease quantity button
    itemEl.querySelector(".decrease-btn").addEventListener("click", () => {
      changeQuantity(item.id, -1);
    });

    // addEventListener - remove button
    itemEl.querySelector(".remove-btn").addEventListener("click", () => {
      removeFromCart(item.id);
    });
  });

  // Update the cart summary totals
  updateCartSummary(cart);
}

/**
 * changeQuantity - Increases or decreases item quantity
 * @param {number} productId - Product ID
 * @param {number} change - +1 or -1
 */
function changeQuantity(productId, change) {
  try {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);

    if (!item) throw new Error("Item not found in cart.");

    // Validate: quantity must not go below 1
    if (item.quantity + change < 1) {
      throw new Error("Invalid quantity. Minimum is 1.");
    }

    // Update the quantity
    item.quantity += change;

    // Save updated cart and re-render
    saveCart(cart);
    renderCart();
    updateCartCount();

  } catch (error) {
    console.error("Quantity error:", error.message);
  }
}

/**
 * removeFromCart - Removes an item from the cart
 * Uses array filter() to create a new cart without the removed item
 * @param {number} productId - Product ID to remove
 */
function removeFromCart(productId) {
  try {
    let cart = getCart();

    // Filter out the item with the matching ID
    cart = cart.filter(item => item.id !== productId);

    // Save updated cart to localStorage
    saveCart(cart);

    // Re-render the cart and update count
    renderCart();
    updateCartCount();

  } catch (error) {
    console.error("Error removing item:", error.message);
  }
}

/**
 * updateCartSummary - Updates subtotal, shipping, and total
 * @param {Array} cart - Current cart array
 */
function updateCartSummary(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;

  // Use getElementById to update summary elements
  const subtotalEl = document.getElementById("summary-subtotal");
  const shippingEl = document.getElementById("summary-shipping");
  const totalEl = document.getElementById("summary-total");

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString()}`;
  if (shippingEl) shippingEl.textContent = `$${shipping}`;
  if (totalEl) totalEl.textContent = `$${total.toLocaleString()}`;
}

// -----------------------------------------------
// CHECKOUT PAGE FUNCTIONS
// -----------------------------------------------

/**
 * renderOrderSummary - Shows order summary on checkout page
 * Uses DOM manipulation to build order list
 */
function renderOrderSummary() {
  const container = document.getElementById("order-items");
  const totalEl = document.getElementById("order-total-amount");
  if (!container) return;

  const cart = getCart();

  // Clear and rebuild order items using DOM
  container.innerHTML = "";

  let subtotal = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    // createElement to build each order item row
    const row = document.createElement("div");
    row.className = "order-item";
    row.innerHTML = `
      <span>${item.emoji} ${item.name} × ${item.quantity}</span>
      <span>$${itemTotal.toLocaleString()}</span>
    `;
    container.appendChild(row); // appendChild to add to DOM
  });

  const total = subtotal + 10;
  if (totalEl) totalEl.textContent = `$${total.toLocaleString()}`;
}

/**
 * validateCheckoutForm - Validates all form fields using try...catch
 * Checks: required fields, email format, phone format
 * @returns {boolean} - true if valid, false if not
 */
function validateCheckoutForm() {
  try {
    const cart = getCart();

    // Error: empty cart during checkout
    if (cart.length === 0) {
      throw new Error("Your cart is empty. Add products before checking out.");
    }

    // Get form field values using getElementById
    const name     = document.getElementById("checkout-name").value.trim();
    const email    = document.getElementById("checkout-email").value.trim();
    const phone    = document.getElementById("checkout-phone").value.trim();
    const address  = document.getElementById("checkout-address").value.trim();

    let isValid = true;

    // Helper function to show/hide error messages
    function showError(fieldId, msgId, condition, message) {
      const field = document.getElementById(fieldId);
      const msg   = document.getElementById(msgId);

      if (condition) {
        field.classList.add("error");
        msg.textContent = message;
        msg.classList.add("show");
        isValid = false;
      } else {
        field.classList.remove("error");
        msg.classList.remove("show");
      }
    }

    // Validate: Name must not be empty
    showError("checkout-name", "name-error", name === "", "Full name is required.");

    // Validate: Email must match a valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    showError("checkout-email", "email-error", !emailRegex.test(email), "Please enter a valid email address.");

    // Validate: Phone must be at least 10 digits
    const phoneRegex = /^\+?[\d\s\-]{10,}$/;
    showError("checkout-phone", "phone-error", !phoneRegex.test(phone), "Please enter a valid phone number.");

    // Validate: Address must not be empty
    showError("checkout-address", "address-error", address === "", "Delivery address is required.");

    return isValid;

  } catch (error) {
    // Handle error (e.g. empty cart)
    alert("⚠️ " + error.message);
    console.error("Checkout error:", error.message);
    return false;
  }
}

/**
 * initCheckoutForm - Sets up form submission with validation
 * Uses addEventListener for the form submit event
 */
function initCheckoutForm() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  // addEventListener - listen for form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent default form submission

    // Run validation
    const isValid = validateCheckoutForm();

    if (isValid) {
      // Clear cart after successful checkout
      saveCart([]);
      updateCartCount();

      // Show success modal using DOM manipulation
      const modal = document.getElementById("success-modal");
      if (modal) {
        modal.classList.add("show");
      }
    }
  });
}

// -----------------------------------------------
// PAGE INITIALIZATION - Detect current page and init
// -----------------------------------------------

/**
 * init - Runs on page load, initializes the correct page
 * Uses document.querySelector to detect which page we're on
 */
function init() {
  // Always update cart count on every page
  updateCartCount();

  // Check which page we're on using getElementById
  if (document.getElementById("products-container")) {
    // We are on index.html (Home Page)
    renderProducts(products);
    initFilters();
  }

  if (document.getElementById("cart-items-container")) {
    // We are on cart.html (Cart Page)
    renderCart();
  }

  if (document.getElementById("checkout-form")) {
    // We are on checkout.html (Checkout Page)
    renderOrderSummary();
    initCheckoutForm();
  }
}

// Run init when the DOM is fully loaded
// addEventListener for 'DOMContentLoaded' event
document.addEventListener("DOMContentLoaded", init);
