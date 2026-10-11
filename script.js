const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const themeToggle = document.getElementById("themeToggle");
const beautyForm = document.getElementById("beautyForm");
const result = document.getElementById("result");
const savePaletteBtn = document.getElementById("savePaletteBtn");
const sharePaletteBtn = document.getElementById("sharePaletteBtn");
const favoriteList = document.getElementById("favoriteList");
const lookPreview = document.getElementById("lookPreview");

const FAVORITES_KEY = "glowGraceFavorites";
const THEME_KEY = "glowGraceTheme";

const toneNames = {
  fair: "Fair",
  "light-medium": "Light to medium",
  medium: "Medium",
  deep: "Deep"
};

const toneColors = {
  fair: "#f2d1bd",
  "light-medium": "#d7a17e",
  medium: "#b67a58",
  deep: "#7c4b38"
};

const undertoneAdvice = {
  warm: {
    lipstick: "Peach, coral, warm nude and terracotta",
    blush: "Peach, apricot and warm rose",
    eyes: "Bronze, copper, warm brown and gold",
    foundation: "Test warm or golden undertones along your jawline."
  },
  cool: {
    lipstick: "Berry, mauve, rose and blue-red",
    blush: "Cool pink, rose and berry",
    eyes: "Plum, taupe, rosy pink and silver",
    foundation: "Test cool or rosy undertones along your jawline."
  },
  neutral: {
    lipstick: "Rose, pink-brown, neutral nude and berry",
    blush: "Soft rose, peach-pink and muted mauve",
    eyes: "Taupe, champagne, brown and rose",
    foundation: "Test neutral undertones along your jawline."
  }
};

const occasions = {
  everyday: "Try light coverage, a little blush, mascara and tinted lip balm.",
  party: "Try more defined eyes, layered blush and a lipstick you love.",
  traditional: "Try gold or bronze eyeshadow, kajal and rose or berry lipstick."
};

let currentPalette = null;

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-mode", isDark);
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  localStorage.setItem(THEME_KEY, theme);
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    applyTheme(savedTheme);
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

menuBtn.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  });
});

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark-mode");
  applyTheme(isDark ? "light" : "dark");
});

function getAdvice(undertone) {
  if (undertone === "unsure") {
    return {
      lipstick: "Explore rose, peach and neutral nude shades.",
      blush: "Try soft rose and peach-pink.",
      eyes: "Try taupe, champagne and soft brown.",
      foundation: "Compare warm, cool and neutral samples in natural light."
    };
  }

  return undertoneAdvice[undertone];
}

function buildPaletteFromForm() {
  const tone = document.getElementById("skinTone").value;
  const undertone = document.getElementById("undertone").value;
  const occasion = document.getElementById("occasion").value;

  if (!tone || !undertone) {
    return null;
  }

  const advice = getAdvice(undertone);

  return {
    tone,
    undertone,
    occasion,
    skinToneText: toneNames[tone],
    undertoneText: undertone === "unsure" ? "Not sure yet" : undertone.charAt(0).toUpperCase() + undertone.slice(1),
    lookText: occasions[occasion] || "Try a polished look that suits your mood.",
    lipstick: advice.lipstick,
    blush: advice.blush,
    eyes: advice.eyes,
    foundation: advice.foundation,
    previewColor: toneColors[tone]
  };
}

function renderResult(palette) {
  result.innerHTML = `
    <h3>Your Beauty Palette ✨</h3>
    <p><strong>Skin tone:</strong> ${palette.skinToneText}</p>
    <p><strong>Undertone:</strong> ${palette.undertoneText}</p>
    <p><strong>Lipstick:</strong> ${palette.lipstick}</p>
    <p><strong>Blush:</strong> ${palette.blush}</p>
    <p><strong>Eyeshadow:</strong> ${palette.eyes}</p>
    <p><strong>Foundation tip:</strong> ${palette.foundation}</p>
    <p><strong>Your look:</strong> ${palette.lookText}</p>
  `;

  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function applyPreview(palette) {
  const beforeFace = document.querySelector(".preview-face-before");
  const afterFace = document.querySelector(".preview-face-after");

  const tone = palette.previewColor || "#f2d1bd";
  beforeFace.style.setProperty("--skin-tone", "#f6d7c4");
  afterFace.style.setProperty("--skin-tone", tone);
  beforeFace.style.background = "linear-gradient(180deg, #f7d9c8, #d7ac8d)";
  afterFace.style.background = `linear-gradient(180deg, ${tone}, #d0a984)`;

  const accentColors = {
    warm: "#d78a5d",
    cool: "#b9638b",
    neutral: "#d8b26c",
    unsure: "#d78a5d"
  };

  const accent = accentColors[palette.undertone] || "#d78a5d";
  afterFace.style.boxShadow = `inset 0 0 0 2px rgba(122, 76, 65, 0.06), 0 8px 20px rgba(0,0,0,0.06), 0 0 0 6px ${accent}33`;
  afterFace.style.filter = "saturate(1.1)";
}

function savePaletteToURL(palette) {
  const params = new URLSearchParams();
  params.set("tone", palette.tone);
  params.set("undertone", palette.undertone);
  params.set("occasion", palette.occasion || "everyday");

  const url = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", url);
}

function loadPaletteFromURL() {
  const params = new URLSearchParams(window.location.search);
  const tone = params.get("tone");
  const undertone = params.get("undertone");
  const occasion = params.get("occasion");

  if (!tone || !undertone) return;

  const toneSelect = document.getElementById("skinTone");
  const undertoneSelect = document.getElementById("undertone");
  const occasionSelect = document.getElementById("occasion");

  if (toneSelect && Array.from(toneSelect.options).some(option => option.value === tone)) {
    toneSelect.value = tone;
  }

  if (undertoneSelect && Array.from(undertoneSelect.options).some(option => option.value === undertone)) {
    undertoneSelect.value = undertone;
  }

  if (occasionSelect && Array.from(occasionSelect.options).some(option => option.value === occasion)) {
    occasionSelect.value = occasion;
  }

  const palette = buildPaletteFromForm();
  if (palette) {
    currentPalette = palette;
    applyPreview(palette);
    renderResult(palette);
  }
}

function readFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
}

function writeFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function renderFavorites() {
  const favorites = readFavorites();
  favoriteList.innerHTML = "";

  if (!favorites.length) {
    favoriteList.innerHTML = "<li class=\"favorite-item\"><span class=\"favorite-meta\">No favourites saved yet.</span></li>";
    return;
  }

  favorites.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "favorite-item";

    const meta = document.createElement("div");
    meta.className = "favorite-meta";
    meta.innerHTML = `
      <strong>${item.skinToneText}</strong>
      <span>${item.undertoneText} · ${item.occasion || "Everyday"}</span>
      <span>${item.lipstick}</span>
    `;

    const useBtn = document.createElement("button");
    useBtn.type = "button";
    useBtn.textContent = "Use";
    useBtn.addEventListener("click", () => {
      currentPalette = item;
      applyPreview(item);
      renderResult(item);
      savePaletteToURL(item);
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      const updated = readFavorites();
      updated.splice(index, 1);
      writeFavorites(updated);
      renderFavorites();
    });

    const actions = document.createElement("div");
    actions.className = "favorite-actions";
    actions.appendChild(useBtn);
    actions.appendChild(removeBtn);

    li.appendChild(meta);
    li.appendChild(actions);
    favoriteList.appendChild(li);
  });
}

beautyForm.addEventListener("submit", event => {
  event.preventDefault();

  const palette = buildPaletteFromForm();

  if (!palette) {
    result.hidden = false;
    result.textContent = "Please select your skin tone and undertone.";
    return;
  }

  currentPalette = palette;
  applyPreview(palette);
  renderResult(palette);
  savePaletteToURL(palette);
});

savePaletteBtn.addEventListener("click", () => {
  if (!currentPalette) {
    result.hidden = false;
    result.textContent = "Generate a palette first, then save it as a favourite.";
    return;
  }

  const favorites = readFavorites();
  const alreadyExists = favorites.some(item => {
    return item.tone === currentPalette.tone &&
           item.undertone === currentPalette.undertone &&
           item.occasion === currentPalette.occasion;
  });

  if (alreadyExists) {
    result.hidden = false;
    result.innerHTML = "<h3>Already saved ✨</h3><p>This palette is already in your favourites.</p>";
    return;
  }

  favorites.unshift(currentPalette);
  writeFavorites(favorites);
  renderFavorites();

  result.hidden = false;
  result.innerHTML = "<h3>Saved to favourites 💖</h3><p>Your palette has been added to your saved looks.</p>";
});

sharePaletteBtn.addEventListener("click", async () => {
  if (!currentPalette) {
    result.hidden = false;
    result.textContent = "Generate a palette first, then share it.";
    return;
  }

  const shareUrl = `${window.location.origin}${window.location.pathname}?tone=${currentPalette.tone}&undertone=${currentPalette.undertone}&occasion=${currentPalette.occasion || "everyday"}`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: "Glow & Grace Makeup Palette",
        text: `My Glow & Grace palette: ${currentPalette.skinToneText} skin, ${currentPalette.undertoneText} undertone.`,
        url: shareUrl
      });
      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      result.hidden = false;
      result.innerHTML = "<h3>Link copied! 🔗</h3><p>Your palette link has been copied to the clipboard.</p>";
      return;
    }

    window.prompt("Copy this palette link:", shareUrl);
  } catch (error) {
    result.hidden = false;
    result.innerHTML = "<h3>Share cancelled</h3><p>You can still copy the palette link manually.</p>";
  }
});

initTheme();
renderFavorites();
loadPaletteFromURL();

if (lookPreview) {
  lookPreview.style.setProperty("--skin-tone", "#f2d1bd");
}

