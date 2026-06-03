// Keyboard Shortcuts & Accessibility — PBT 09 (Keyboard App)
// Requirements:
// - Gallery with arrows, 1-9 jump, Space play/pause, Escape closes overlays
// - Command palette (Ctrl+K), search, Enter select, Escape close
// - Focus management + visible focus via CSS; ARIA labels on interactive elements

const images = [
  { src: "https://placehold.co/1400x900/0f766e/ffffff?text=Aurora+Lake", alt: "Aurora Lake", title: "Aurora Lake", description: "A night skyline with vibrant reflections." },
  { src: "https://placehold.co/1400x900/2563eb/ffffff?text=Metro+Night", alt: "Metro Night", title: "Metro Night", description: "Minimal landscape with cool gradients." },
  { src: "https://placehold.co/1400x900/1d4ed8/ffffff?text=Desert+Glass", alt: "Desert Glass", title: "Desert Glass", description: "A bold blue frame for focus." },
  { src: "https://placehold.co/1400x900/16a34a/ffffff?text=Forest+Line", alt: "Forest Line", title: "Forest Line", description: "Green-toned calm visual." },
  { src: "https://placehold.co/1400x900/f59e0b/ffffff?text=Coastal+Wind", alt: "Coastal Wind", title: "Coastal Wind", description: "A warm abstract scene." },
  { src: "https://placehold.co/1400x900/ef4444/ffffff?text=City+Pulse", alt: "City Pulse", title: "City Pulse", description: "A bold highlight moment." },
  { src: "https://placehold.co/1400x900/64748b/ffffff?text=Stone+Peak", alt: "Stone Peak", title: "Stone Peak", description: "Cool tones & strong contrast." },
  { src: "https://placehold.co/1400x900/8b5cf6/ffffff?text=Soft+Horizon", alt: "Soft Horizon", title: "Soft Horizon", description: "Smooth gradient calm." },
  { src: "https://placehold.co/1400x900/0f172a/ffffff?text=Night+Bloom", alt: "Night Bloom", title: "Night Bloom", description: "Dark palette with bright edges." },
];

const app = document.getElementById("app");

const state = {
  index: 0,
  playing: false,
  timer: null,
  lightboxOpen: false,
  paletteOpen: false,
  paletteQuery: "",
  paletteIndex: 0,
};

let lastFocus = null;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function setIndex(nextIndex) {
  state.index = (safeNumber(nextIndex) + images.length) % images.length;
  renderGallery();
  if (state.lightboxOpen) renderLightbox();
}

function nextImage() {
  setIndex(state.index + 1);
}

function previousImage() {
  setIndex(state.index - 1);
}

function toggleSlideshow() {
  state.playing = !state.playing;
  const playBtn = document.getElementById("playBtn");
  if (playBtn) playBtn.textContent = state.playing ? "Pause" : "Play";

  if (state.playing) {
    state.timer = window.setInterval(nextImage, 2500);
  } else {
    if (state.timer) window.clearInterval(state.timer);
    state.timer = null;
  }

  renderGallery();
}

function buildLightbox() {
  const overlay = el("div", "lightbox");
  overlay.id = "lightbox";

  const panel = el("div", "lightbox-panel");
  const top = el("div", "lightbox-top");

  const title = el("h2", null, "Image viewer");
  const closeBtn = el("button", "close-btn", "✕");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close lightbox");
  closeBtn.addEventListener("click", closeLightbox);

  top.append(title, closeBtn);

  const media = el("div", "lightbox-media");
  const img = el("img");
  img.id = "lightboxImage";
  img.alt = "Current gallery image";
  media.appendChild(img);

  panel.append(top, media);
  overlay.appendChild(panel);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeLightbox();
  });

  return overlay;
}

function openLightbox() {
  state.lightboxOpen = true;
  const overlay = document.getElementById("lightbox");
  if (overlay) overlay.classList.add("open");
  renderLightbox();
}

function closeLightbox() {
  state.lightboxOpen = false;
  const overlay = document.getElementById("lightbox");
  if (overlay) overlay.classList.remove("open");
}

function renderLightbox() {
  const img = document.getElementById("lightboxImage");
  if (!img) return;
  img.src = images[state.index].src;
  img.alt = images[state.index].alt;
}

function buildPalette() {
  const overlay = el("div", "palette");
  overlay.id = "palette";

  const panel = el("div", "palette-panel");
  const head = el("div", "palette-head");

  const title = el("h2", null, "Command palette");
  const closeBtn = el("button", "close-btn", "✕");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close command palette");
  closeBtn.addEventListener("click", closePalette);

  head.append(title, closeBtn);

  const input = el("input", "palette-input");
  input.id = "paletteInput";
  input.placeholder = "Type a command and press Enter";
  input.setAttribute("aria-label", "Command palette search");
  input.addEventListener("input", (e) => {
    state.paletteQuery = e.target.value;
    state.paletteIndex = 0;
    renderPalette();
  });
  input.addEventListener("keydown", handlePaletteKeydown);

  const list = el("ul", "command-list");
  list.id = "commandList";

  panel.append(head, input, list);
  overlay.appendChild(panel);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePalette();
  });

  return overlay;
}

const commands = [
  { name: "Next image", run: () => nextImage() },
  { name: "Previous image", run: () => previousImage() },
  { name: "Toggle slideshow", run: () => toggleSlideshow() },
  { name: "Open lightbox", run: () => openLightbox() },
  { name: "Close lightbox", run: () => closeLightbox() },
  { name: "Jump to image 1", run: () => setIndex(0) },
  { name: "Jump to image 2", run: () => setIndex(1) },
  { name: "Jump to image 3", run: () => setIndex(2) },
];

function getFilteredCommands() {
  const q = state.paletteQuery.trim().toLowerCase();
  if (!q) return commands;
  return commands.filter((c) => c.name.toLowerCase().includes(q));
}

function openPalette() {
  lastFocus = document.activeElement;
  state.paletteOpen = true;
  state.paletteQuery = "";
  state.paletteIndex = 0;

  const overlay = document.getElementById("palette");
  if (overlay) overlay.classList.add("open");

  const input = document.getElementById("paletteInput");
  if (input) {
    input.value = "";
    input.focus();
  }

  renderPalette();
}

function closePalette() {
  state.paletteOpen = false;
  const overlay = document.getElementById("palette");
  if (overlay) overlay.classList.remove("open");

  if (lastFocus && typeof lastFocus.focus === "function") {
    lastFocus.focus();
  }
}

function handlePaletteKeydown(e) {
  const items = getFilteredCommands();
  if (!items.length) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    state.paletteIndex = Math.min(state.paletteIndex + 1, items.length - 1);
    renderPalette();
    return;
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    state.paletteIndex = Math.max(state.paletteIndex - 1, 0);
    renderPalette();
    return;
  }

  if (e.key === "Enter") {
    e.preventDefault();
    const cmd = items[state.paletteIndex];
    if (cmd) {
      cmd.run();
      closePalette();
    }
    return;
  }

  if (e.key === "Escape") {
    e.preventDefault();
    closePalette();
    return;
  }
}

function renderPalette() {
  const list = document.getElementById("commandList");
  if (!list) return;

  const items = getFilteredCommands();
  list.textContent = "";

  if (!items.length) {
    const li = el("li");
    const btn = el("button", "command-item", "No matching commands");
    btn.type = "button";
    btn.disabled = true;
    li.appendChild(btn);
    list.appendChild(li);
    return;
  }

  items.forEach((cmd, idx) => {
    const li = el("li");
    const btn = el("button", "command-item" + (idx === state.paletteIndex ? " active" : ""), cmd.name);
    btn.type = "button";
    btn.addEventListener("click", () => {
      cmd.run();
      closePalette();
    });
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function renderGallery() {
  const img = document.getElementById("mainImage");
  const captionTitle = document.getElementById("galleryTitle");
  const captionDesc = document.getElementById("galleryDesc");
  const thumbs = document.getElementById("thumbs");

  if (img) {
    img.src = images[state.index].src;
    img.alt = images[state.index].alt;
  }

  if (captionTitle) captionTitle.textContent = `${state.index + 1}. ${images[state.index].title}`;
  if (captionDesc) captionDesc.textContent = images[state.index].description;

  if (!thumbs) return;

  thumbs.textContent = "";
  const fragment = document.createDocumentFragment();

  images.forEach((item, idx) => {
    const btn = el("button", "thumb" + (idx === state.index ? " active" : ""));
    btn.type = "button";
    btn.setAttribute("aria-label", `Jump to image ${idx + 1}`);
    btn.addEventListener("click", () => setIndex(idx));

    const timg = el("img");
    timg.src = item.src;
    timg.alt = item.alt;
    btn.appendChild(timg);

    fragment.appendChild(btn);
  });

  thumbs.appendChild(fragment);
}

function buildAppUI() {
  const root = el("div", "app");

  const hero = el("header", "hero");
  const eyebrow = el("p", "eyebrow", "Keyboard navigation");
  const h1 = el("h1", null, "Keyboard App");
  const lead = el(
    "p",
    null,
    "Use arrow keys, number shortcuts (1-9), Space to play/pause, and Escape to close overlays. Ctrl+K opens the command palette."
  );

  const openPaletteBtn = el("button", "command-trigger", "Ctrl+K Command Palette");
  openPaletteBtn.type = "button";
  openPaletteBtn.setAttribute("aria-label", "Open command palette");
  openPaletteBtn.addEventListener("click", openPalette);

  hero.append(eyebrow, h1, lead, openPaletteBtn);

  const layout = el("div", "layout");

  const gallery = el("section", "gallery");
  const viewer = el("div", "viewer");

  const mainBtn = el("button", "gallery-main");
  mainBtn.type = "button";
  mainBtn.setAttribute("aria-label", "Open image viewer");
  mainBtn.setAttribute("aria-haspopup", "dialog");
  mainBtn.addEventListener("click", openLightbox);

  const mainImage = el("img");
  mainImage.id = "mainImage";
  mainImage.tabIndex = 0;
  mainImage.setAttribute("aria-label", "Current gallery image");

  const caption = el("div", "gallery-caption");
  const title = el("strong");
  title.id = "galleryTitle";
  const desc = el("span");
  desc.id = "galleryDesc";
  caption.append(title, desc);

  mainBtn.append(mainImage, caption);
  viewer.appendChild(mainBtn);

  const navRow = el("div", "nav-row");

  const prevBtn = el("button", "nav-btn", "← Prev");
  prevBtn.type = "button";
  prevBtn.setAttribute("aria-label", "Previous image");
  prevBtn.addEventListener("click", previousImage);

  const playBtn = el("button", "play-btn", "Play");
  playBtn.type = "button";
  playBtn.id = "playBtn";
  playBtn.setAttribute("aria-label", "Play or pause slideshow");
  playBtn.addEventListener("click", toggleSlideshow);

  const nextBtn = el("button", "nav-btn", "Next →");
  nextBtn.type = "button";
  nextBtn.setAttribute("aria-label", "Next image");
  nextBtn.addEventListener("click", nextImage);

  navRow.append(prevBtn, playBtn, nextBtn);

  const thumbs = el("div", "thumbs");
  thumbs.id = "thumbs";

  viewer.append(navRow, thumbs);
  gallery.appendChild(viewer);

  const sidebar = el("div", "sidebar");

  const tips = el("section", "tips");
  const tipsTitle = el("h2", null, "Shortcuts");
  const tipsList = el("ul");

  [
    "Arrow Left / Right: change image",
    "Keys 1-9: jump to image number",
    "Space: play/pause slideshow",
    "Ctrl+K: open command palette",
    "Escape: close modal or palette",
  ].forEach((t) => {
    tipsList.appendChild(el("li", null, t));
  });

  tips.append(tipsTitle, tipsList);

  sidebar.append(tips);

  layout.append(gallery, sidebar);
  root.append(hero, layout);

  app.appendChild(root);

  const lightbox = buildLightbox();
  const palette = buildPalette();
  app.append(lightbox, palette);
}

function handleGlobalKeydown(e) {
  const tag = e.target && e.target.tagName ? e.target.tagName : "";
  const isTyping = tag === "INPUT" || tag === "TEXTAREA";

  // Ctrl+K opens palette
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    if (!state.paletteOpen) openPalette();
    return;
  }

  // If palette is open, do not handle gallery shortcuts
  if (state.paletteOpen) {
    if (e.key === "Escape") closePalette();
    return;
  }

  // Escape closes lightbox
  if (e.key === "Escape" && state.lightboxOpen) {
    e.preventDefault();
    closeLightbox();
    return;
  }

  if (isTyping) return;

  if (e.key === "ArrowRight") {
    e.preventDefault();
    nextImage();
    return;
  }

  if (e.key === "ArrowLeft") {
    e.preventDefault();
    previousImage();
    return;
  }

  if (e.key === " ") {
    e.preventDefault();
    toggleSlideshow();
    return;
  }

  // Jump to image 1-9
  if (/^[1-9]$/.test(e.key)) {
    const idx = Number(e.key) - 1;
    if (idx < images.length) setIndex(idx);
  }
}

// Init
buildAppUI();
renderGallery();
renderPalette();
document.addEventListener("keydown", handleGlobalKeydown);

// Allow keyboard open of the lightbox (button already focusable)
const mainBtn = document.querySelector(".gallery-main");
if (mainBtn) {
  mainBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLightbox();
    }
  });
}

