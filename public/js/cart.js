let cart = [];

// Initialize & Sanitize Cart on Load
const savedCart = localStorage.getItem('cart');
if (savedCart) {
    try {
        const parsedCart = JSON.parse(savedCart);
        // Filter out any corrupted items (invalid price, name, etc)
        cart = parsedCart.filter(item =>
            item &&
            item.name &&
            typeof item.price === 'number' &&
            !isNaN(item.price) &&
            item.quantity > 0
        );

        // If items were removed during sanitation, update storage immediately
        if (cart.length !== parsedCart.length) {
            saveCart();
            console.warn("Cleaned up corrupted cart items");
        }

    } catch (e) {
        console.error("Error parsing saved cart, clearing...", e);
        cart = [];
        localStorage.removeItem('cart');
    }
}

// Helper to save cart state
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(name, price, image) {
    // Ensure price is a number
    const numericPrice = parseFloat(price);

    if (isNaN(numericPrice)) {
        console.error("Invalid price for item:", name);
        return;
    }

    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name, price: numericPrice, image, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    showToast(`${name} added to cart!`);
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    saveCart();
    updateCartUI();
}

function updateQuantity(name, change) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(name);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    if (!cartCount || !cartItemsContainer || !cartTotal) return;

    // Update Badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalItems;

    // Update Modal List
    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        // Double check for NaN before display
        let itemTotal = item.price * item.quantity;
        if (isNaN(itemTotal)) itemTotal = 0;

        total += itemTotal;

        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item-row';
        itemEl.innerHTML = `
            <div class="cart-item-info">
                <img src="${item.image}" alt="${item.name}" class="cart-thumb" onerror="this.src='https://via.placeholder.com/50'">
                <span>${item.name}</span>
            </div>
            <div class="cart-item-controls">
                <button onclick="updateQuantity('${item.name}', -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity('${item.name}', 1)">+</button>
            </div>
            <span>₹${itemTotal}</span>
        `;
        cartItemsContainer.appendChild(itemEl);
    });

    cartTotal.innerText = total;
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// Checkout (Place Order)
function placeOrder() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    // Save cart to localStorage so checkout page can access it
    saveCart();

    // Redirect to checkout page
    window.location.href = 'checkout.html';
}

// Run UI update on load to reflect current state
document.addEventListener('DOMContentLoaded', updateCartUI);
