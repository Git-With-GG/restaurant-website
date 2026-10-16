// ===== Grill HQ: shared script (nav, cart, forms) =====

// CHANGE THIS to your real WhatsApp number: country code, no + or spaces
const WHATSAPP_NUMBER = "2348000000000";

// ---------- Cart helpers (cart is saved in the browser with localStorage) ----------
function getCart() {
  try { return JSON.parse(localStorage.getItem("grillhq-cart")) || []; }
  catch (e) { return []; }
}
function saveCart(cart) {
  localStorage.setItem("grillhq-cart", JSON.stringify(cart));
  updateCartCount();
}
function formatNaira(amount) {
  return "₦" + amount.toLocaleString("en-NG");
}
function updateCartCount() {
  const total = getCart().reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = total;
}
function addToCart(name, price) {
  const cart = getCart();
  const existing = cart.find((item) => item.name === name);
  if (existing) existing.qty += 1;
  else cart.push({ name: name, price: price, qty: 1 });
  saveCart(cart);
  showToast(name + " added to cart");
}

// ---------- Small pop-up message ----------
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

// ---------- Cart page ----------
function renderCart() {
  const box = document.getElementById("cart-items");
  if (!box) return; // not on the cart page

  const cart = getCart();
  const totalBox = document.getElementById("cart-summary");

  if (cart.length === 0) {
    box.innerHTML = '<p class="empty">Your cart is empty. <a href="menu.html" style="color:var(--yellow);text-decoration:underline">Browse the menu</a> to add something.</p>';
    totalBox.hidden = true;
    return;
  }

  totalBox.hidden = false;
  box.innerHTML = cart.map((item, i) => `
    <div class="cart-row">
      <strong>${item.name}</strong>
      <div class="qty">
        <button data-action="minus" data-index="${i}" aria-label="Reduce ${item.name}">-</button>
        <span>${item.qty}</span>
        <button data-action="plus" data-index="${i}" aria-label="Add one more ${item.name}">+</button>
      </div>
      <span class="price">${formatNaira(item.price * item.qty)}</span>
      <button class="remove" data-action="remove" data-index="${i}">Remove</button>
    </div>
  `).join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById("cart-total").textContent = formatNaira(total);

  // Build the WhatsApp order message
  const lines = cart.map((item) => `${item.qty} x ${item.name} (${formatNaira(item.price * item.qty)})`);
  const message = "Hello Grill HQ, I would like to order:\n" + lines.join("\n") + "\nTotal: " + formatNaira(total);
  document.getElementById("order-btn").href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
}

// ---------- Run when the page loads ----------
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();

  // Mobile menu button
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
  }

  // Highlight the link for the page you are on
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    if (a.getAttribute("href") === current) a.setAttribute("aria-current", "page");
  });

  // Every button with class "add-btn" adds its item to the cart
  document.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.name, Number(btn.dataset.price)));
  });

  // Cart page buttons (plus, minus, remove)
  const cartBox = document.getElementById("cart-items");
  if (cartBox) {
    cartBox.addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      if (!action) return;
      const cart = getCart();
      const i = Number(e.target.dataset.index);
      if (action === "plus") cart[i].qty += 1;
      if (action === "minus") cart[i].qty -= 1;
      if (action === "remove" || cart[i].qty < 1) cart.splice(i, 1);
      saveCart(cart);
      renderCart();
    });
    const clear = document.getElementById("clear-btn");
    if (clear) clear.addEventListener("click", () => { saveCart([]); renderCart(); });
    renderCart();
  }

  // Contact form sends the message to WhatsApp
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.elements["name"].value;
      const message = form.elements["message"].value;
      const text = "Hello Grill HQ, my name is " + name + ". " + message;
      window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text), "_blank");
    });
  }
});