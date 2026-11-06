const $ = (selector, root = document) => root.querySelector(selector);
const menuBtn = $("#menuBtn");
const navLinks = $("#navLinks");
const themeToggle = $("#themeToggle");
const beautyForm = $("#beautyForm");
const result = $("#result");
const palettePreview = $("#palettePreview");
const favoriteList = $("#favoriteList");
const cartDrawer = $("#cartDrawer");
const cartList = $("#cartList");
const cartCount = $("#cartCount");
const cartTotal = $("#cartTotal");
const overlay = $("#overlay");
const infoDialog = $("#infoDialog");

const KEYS = { favorites: "glowGraceFavorites", cart: "glowGraceCart", theme: "glowGraceTheme" };
const toneNames = { fair: "Fair", "light-medium": "Light to medium", medium: "Medium", deep: "Deep" };
const swatchColors = { warm: ["#d98262", "#e9ad6c", "#a85e3d"], cool: ["#bd6788", "#9a7693", "#794b65"], neutral: ["#c88c78", "#b59a79", "#896b75"], unsure: ["#d89b83", "#c2a184", "#9b7180"] };
const advice = {
  warm: { lipstick: "Peach, coral, warm nude and terracotta", blush: "Peach, apricot and warm rose", eyes: "Bronze, copper, warm brown and gold", foundation: "Test warm or golden undertones along your jawline." },
  cool: { lipstick: "Berry, mauve, rose and blue-red", blush: "Cool pink, rose and berry", eyes: "Plum, taupe, rosy pink and silver", foundation: "Test cool or rosy undertones along your jawline." },
  neutral: { lipstick: "Rose, pink-brown, neutral nude and berry", blush: "Soft rose, peach-pink and muted mauve", eyes: "Taupe, champagne, brown and rose", foundation: "Test neutral undertones along your jawline." },
  unsure: { lipstick: "Explore rose, peach and neutral nude shades", blush: "Try soft rose and peach-pink", eyes: "Try taupe, champagne and soft brown", foundation: "Compare warm, cool and neutral samples in natural light." }
};
const occasions = {
  everyday: "Try light coverage, a little blush, mascara and tinted lip balm.",
  party: "Try more defined eyes, layered blush and a lipstick you love.",
  traditional: "Try gold or bronze eyeshadow, kajal and rose or berry lipstick."
};
const products = [
  { id: "lip-tint", name: "Everyday Lip Tint", price: 12.5, description: "A soft, buildable tint for an easy everyday look.", image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=650&q=80" },
  { id: "blush", name: "Petal Blush", price: 16, description: "A blendable blush with a natural-looking finish.", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=650&q=80" },
  { id: "brush-set", name: "Soft Touch Brush Set", price: 24, description: "A sample brush set for your daily beauty routine.", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=650&q=80" }
];
let currentPalette = null;

function readStorage(key, fallback) {
  try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
  catch { return fallback; }
}
function writeStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { showMessage("Your browser could not save this. Check available storage space."); return false; }
}
function showMessage(message, title = "Glow & Grace") {
  result.replaceChildren();
  const heading = document.createElement("h3"); heading.textContent = title;
  const paragraph = document.createElement("p"); paragraph.textContent = message;
  result.append(heading, paragraph); result.hidden = false;
}
function setTheme(theme) {
  document.body.classList.toggle("dark-mode", theme === "dark");
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  try { localStorage.setItem(KEYS.theme, theme); } catch { /* Theme still works for this visit. */ }
}
function initTheme() {
  let theme;
  try { theme = localStorage.getItem(KEYS.theme); } catch { theme = null; }
  if (!theme) theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  setTheme(theme);
}
function buildPalette() {
  const tone = $("#skinTone").value;
  const undertone = $("#undertone").value;
  const occasion = $("#occasion").value;
  if (!tone || !undertone) return null;
  return { tone, undertone, occasion, skinToneText: toneNames[tone], undertoneText: undertone === "unsure" ? "Not sure yet" : undertone[0].toUpperCase() + undertone.slice(1), lipstick: advice[undertone].lipstick, blush: advice[undertone].blush, eyes: advice[undertone].eyes, foundation: advice[undertone].foundation, look: occasions[occasion] };
}
function renderPalette(palette) {
  const heading = document.createElement("h3"); heading.textContent = "Your Beauty Palette ✨";
  const rows = [ ["Skin tone", palette.skinToneText], ["Undertone", palette.undertoneText], ["Lipstick", palette.lipstick], ["Blush", palette.blush], ["Eyeshadow", palette.eyes], ["Foundation tip", palette.foundation], ["Your look", palette.look] ];
  result.replaceChildren(heading);
  rows.forEach(([label, text]) => { const p = document.createElement("p"); const strong = document.createElement("strong"); strong.textContent = `${label}: `; p.append(strong, document.createTextNode(text)); result.append(p); });
  result.hidden = false;
  renderSwatches(palette.undertone);
}
function renderSwatches(undertone) {
  palettePreview.replaceChildren();
  const names = ["Lip", "Blush", "Eyes"];
  (swatchColors[undertone] || swatchColors.unsure).forEach((color, index) => {
    const item = document.createElement("div"); item.className = "swatch";
    const chip = document.createElement("span"); chip.className = "swatch-color"; chip.style.backgroundColor = color; chip.setAttribute("aria-label", `${names[index]} shade ${color}`);
    const label = document.createElement("span"); label.textContent = names[index];
    item.append(chip, label); palettePreview.append(item);
  });
  palettePreview.hidden = false;
}
function renderProducts() {
  const grid = $("#productGrid");
  products.forEach(product => {
    const article = document.createElement("article"); article.className = "product-card";
    const image = document.createElement("img"); image.src = product.image; image.alt = product.name; image.loading = "lazy";
    const body = document.createElement("div"); body.className = "product-body";
    const title = document.createElement("h3"); title.textContent = product.name;
    const description = document.createElement("p"); description.textContent = product.description;
    const price = document.createElement("span"); price.className = "product-price"; price.textContent = `$${product.price.toFixed(2)} (sample price)`;
    const button = document.createElement("button"); button.type = "button"; button.className = "btn"; button.textContent = "Add to cart"; button.addEventListener("click", () => addProduct(product.id));
    body.append(title, description, price, button); article.append(image, body); grid.append(article);
  });
}
function readFavorites() { const value = readStorage(KEYS.favorites, []); return Array.isArray(value) ? value : []; }
function saveFavorite() {
  if (!currentPalette) return showMessage("Create a palette before saving a favourite.");
  const favorites = readFavorites();
  if (favorites.some(item => item.tone === currentPalette.tone && item.undertone === currentPalette.undertone && item.occasion === currentPalette.occasion)) return showMessage("This palette is already saved.");
  favorites.unshift(currentPalette); writeStorage(KEYS.favorites, favorites); renderFavorites(); showMessage("Your palette was saved in this browser.", "Saved 💖");
}
function renderFavorites() {
  favoriteList.replaceChildren();
  const favorites = readFavorites();
  if (!favorites.length) { const empty = document.createElement("li"); empty.className = "favorite-item"; empty.textContent = "No favourites saved yet."; favoriteList.append(empty); return; }
  favorites.forEach((item, index) => {
    const li = document.createElement("li"); li.className = "favorite-item";
    const meta = document.createElement("div"); meta.className = "favorite-meta";
    const title = document.createElement("strong"); title.textContent = `${item.skinToneText || toneNames[item.tone] || "Palette"} · ${item.undertoneText || item.undertone}`;
    const details = document.createElement("p"); details.textContent = item.lipstick || "Saved makeup palette"; meta.append(title, details);
    const actions = document.createElement("div"); actions.className = "favorite-actions";
    const use = document.createElement("button"); use.type = "button"; use.textContent = "Use"; use.addEventListener("click", () => { $("#skinTone").value = item.tone; $("#undertone").value = item.undertone; $("#occasion").value = item.occasion; currentPalette = item; renderPalette(item); });
    const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "Remove"; remove.addEventListener("click", () => { const updated = readFavorites(); updated.splice(index, 1); writeStorage(KEYS.favorites, updated); renderFavorites(); });
    actions.append(use, remove); li.append(meta, actions); favoriteList.append(li);
  });
}
function paletteShareUrl(palette) {
  const url = new URL(window.location.href); url.search = "";
  url.searchParams.set("tone", palette.tone); url.searchParams.set("undertone", palette.undertone); url.searchParams.set("occasion", palette.occasion);
  return url.href;
}
async function sharePalette() {
  if (!currentPalette) return showMessage("Create a palette before sharing it.");
  const url = paletteShareUrl(currentPalette);
  try {
    if (navigator.share) await navigator.share({ title: "My Glow & Grace palette", text: `Palette for ${currentPalette.skinToneText} skin and ${currentPalette.undertoneText} undertone.`, url });
    else { await navigator.clipboard.writeText(url); showMessage("Share link copied to clipboard.", "Ready to share 🔗"); }
  } catch (error) { if (error.name !== "AbortError") showMessage("Unable to share automatically. You can copy the page URL from your browser."); }
}
function downloadFile(filename, contents, type) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a"); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function downloadPalette() {
  if (!currentPalette) return showMessage("Create a palette before downloading.");
  downloadFile("glow-grace-palette.json", JSON.stringify(currentPalette, null, 2), "application/json");
}
function readCart() { const value = readStorage(KEYS.cart, []); return Array.isArray(value) ? value : []; }
function saveCart(cart) { writeStorage(KEYS.cart, cart); renderCart(); }
function addProduct(id) {
  const product = products.find(item => item.id === id); if (!product) return;
  const cart = readCart(); const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity += 1; else cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
  saveCart(cart); showMessage(`${product.name} was added to your cart.`, "Added to cart 🛍️");
}
function renderCart() {
  const cart = readCart(); cartList.replaceChildren(); cartCount.textContent = String(cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0));
  if (!cart.length) { const empty = document.createElement("li"); empty.className = "cart-item"; empty.textContent = "Your cart is empty."; cartList.append(empty); }
  cart.forEach((item, index) => {
    const li = document.createElement("li"); li.className = "cart-item";
    const text = document.createElement("span"); text.textContent = `${item.name} × ${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`;
    const remove = document.createElement("button"); remove.className = "remove-item"; remove.type = "button"; remove.textContent = "Remove"; remove.addEventListener("click", () => { const updated = readCart(); updated.splice(index, 1); saveCart(updated); });
    li.append(text, remove); cartList.append(li);
  });
  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  cartTotal.textContent = `Total: $${total.toFixed(2)} (sample only)`;
}
function setCartOpen(open) {
  cartDrawer.classList.toggle("open", open); cartDrawer.setAttribute("aria-hidden", String(!open)); overlay.hidden = !open;
  if (open) $("#closeCartBtn").focus(); else $("#cartBtn").focus();
}
function cartAsCSV(cart) {
  const quote = value => `"${String(value).replaceAll('"', '""')}"`;
  return [ ["Name", "Unit price", "Quantity", "Line total"], ...cart.map(item => [item.name, Number(item.price).toFixed(2), item.quantity, (item.price * item.quantity).toFixed(2)]) ].map(row => row.map(quote).join(",")).join("\n");
}
function downloadCart(format) {
  const cart = readCart(); if (!cart.length) return showMessage("Your cart is empty.");
  if (format === "json") return downloadFile("glow-grace-cart.json", JSON.stringify(cart, null, 2), "application/json");
  if (format === "csv") return downloadFile("glow-grace-cart.csv", cartAsCSV(cart), "text/csv;charset=utf-8");
  if (!window.jspdf?.jsPDF) return showMessage("PDF export is unavailable. Try JSON or CSV instead.");
  const doc = new window.jspdf.jsPDF(); let y = 20; doc.setFontSize(18); doc.text("Glow & Grace — Cart", 14, y); y += 12; doc.setFontSize(11);
  cart.forEach(item => { const lines = doc.splitTextToSize(`${item.name} × ${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`, 175); if (y + lines.length * 7 > 280) { doc.addPage(); y = 20; } doc.text(lines, 14, y); y += lines.length * 7 + 3; });
  doc.save("glow-grace-cart.pdf");
}
function loadPaletteFromUrl() {
  const params = new URLSearchParams(location.search); const tone = params.get("tone"); const undertone = params.get("undertone"); const occasion = params.get("occasion");
  if (!tone || !undertone || !toneNames[tone] || !advice[undertone] || !occasions[occasion]) return;
  $("#skinTone").value = tone; $("#undertone").value = undertone; $("#occasion").value = occasion;
  currentPalette = buildPalette(); renderPalette(currentPalette);
}

menuBtn.addEventListener("click", () => { const open = navLinks.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", String(open)); });
navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => { navLinks.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }));
themeToggle.addEventListener("click", () => setTheme(document.body.classList.contains("dark-mode") ? "light" : "dark"));
beautyForm.addEventListener("submit", event => { event.preventDefault(); currentPalette = buildPalette(); if (!currentPalette) return showMessage("Please select your skin tone and undertone."); renderPalette(currentPalette); });
$("#savePaletteBtn").addEventListener("click", saveFavorite);
$("#sharePaletteBtn").addEventListener("click", sharePalette);
$("#downloadPaletteBtn").addEventListener("click", downloadPalette);
$("#cartBtn").addEventListener("click", () => setCartOpen(true));
$("#closeCartBtn").addEventListener("click", () => setCartOpen(false));
overlay.addEventListener("click", () => setCartOpen(false));
$("#downloadCartJson").addEventListener("click", () => downloadCart("json"));
$("#downloadCartCsv").addEventListener("click", () => downloadCart("csv"));
$("#downloadCartPdf").addEventListener("click", () => downloadCart("pdf"));
$("#subscribeBtn").addEventListener("click", () => infoDialog.showModal());
$("#closeInfoDialog").addEventListener("click", () => infoDialog.close());
infoDialog.addEventListener("click", event => { if (event.target === infoDialog) infoDialog.close(); });

document.addEventListener("keydown", event => { if (event.key === "Escape" && cartDrawer.classList.contains("open")) setCartOpen(false); });
initTheme(); renderProducts(); renderFavorites(); renderCart(); loadPaletteFromUrl();
