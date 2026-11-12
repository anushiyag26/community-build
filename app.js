// Main application entry point & state.
import { fetchData, postData } from "./api.js";
import { initValidation, validateForm } from "./validation.js";
import { saveLocal, loadLocal, removeLocal } from "./storage.js";

const PAGE_SIZE = 9;

const state = {
  posts: [],
  query: "",
  visible: PAGE_SIZE,
  theme: "light",
  history: [],
};

const $ = (sel) => document.querySelector(sel);

/* ---------- Theme ---------- */
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  const dark = theme === "dark";
  $("#theme-toggle").setAttribute("aria-pressed", String(dark));
  $("#theme-icon").textContent = dark ? "☀️" : "🌙";
}

export function toggleTheme() {
  const next = state.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  saveLocal("theme", next);
}

/* ---------- Cards (XSS-safe: only textContent / text nodes) ---------- */
function createCard(post) {
  const card = document.createElement("article");
  card.className = "card";

  const title = document.createElement("h3");
  title.appendChild(document.createTextNode(post.title));

  const body = document.createElement("p");
  body.appendChild(document.createTextNode(post.body));

  const meta = document.createElement("p");
  meta.className = "meta";
  meta.appendChild(document.createTextNode(`Member #${post.userId} · Post #${post.id}`));

  card.append(title, body, meta);
  return card;
}

export function renderCards() {
  const container = $("#cards");
  const status = $("#posts-status");
  const q = state.query.trim().toLowerCase();

  const filtered = state.posts.filter(
    (p) => p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q)
  );
  const shown = filtered.slice(0, state.visible);

  container.replaceChildren(...shown.map(createCard));
  status.textContent = filtered.length
    ? `Showing ${shown.length} of ${filtered.length} posts`
    : "No posts match your search.";
  $("#load-more").hidden = shown.length >= filtered.length;
}

async function loadPosts() {
  const status = $("#posts-status");
  status.textContent = "Loading posts…";
  status.classList.remove("fail");
  const { data, error } = await fetchData("/posts?_limit=30");
  if (error) {
    status.textContent = error;
    status.classList.add("fail");
    return;
  }
  state.posts = data;
  renderCards();
}

/* ---------- Message history ---------- */
function renderHistory() {
  const list = $("#history");
  if (!state.history.length) {
    const li = document.createElement("li");
    li.appendChild(document.createTextNode("No messages yet."));
    list.replaceChildren(li);
    return;
  }
  const items = state.history.map((m) => {
    const li = document.createElement("li");
    const time = document.createElement("time");
    time.dateTime = m.date;
    time.textContent = new Date(m.date).toLocaleString();
    const strong = document.createElement("strong");
    strong.textContent = m.name;
    const p = document.createElement("p");
    p.textContent = m.message;
    li.append(time, strong, p);
    return li;
  });
  list.replaceChildren(...items);
}

async function handleSubmit(e) {
  e.preventDefault();
  if (!validateForm(e)) return;

  const form = e.target;
  const status = $("#form-status");
  const payload = Object.fromEntries(new FormData(form));
  status.className = "status";
  status.textContent = "Sending…";

  const { error } = await postData("/posts", payload);
  if (error) {
    status.classList.add("fail");
    status.textContent = error;
    return;
  }

  state.history.unshift({
    name: payload.name.trim(),
    message: payload.message.trim(),
    date: new Date().toISOString(),
  });
  saveLocal("history", state.history);
  renderHistory();

  form.reset();
  form.querySelectorAll(".field").forEach((f) => f.classList.remove("valid", "invalid"));
  status.classList.add("ok");
  status.textContent = "Thanks for joining! Your message was sent.";
}

/* ---------- Init ---------- */
export function initApp() {
  // Restore saved state (fall back to OS preference for theme)
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(loadLocal("theme", prefersDark ? "dark" : "light"));
  state.history = loadLocal("history", []);
  renderHistory();

  $("#year").textContent = new Date().getFullYear();

  // Events
  $("#theme-toggle").addEventListener("click", toggleTheme);

  const menuBtn = $("#menu-toggle");
  const nav = $("#primary-nav");
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      nav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });

  $("#search").addEventListener("input", (e) => {
    state.query = e.target.value;
    state.visible = PAGE_SIZE;
    renderCards();
  });
  $("#load-more").addEventListener("click", () => {
    state.visible += PAGE_SIZE;
    renderCards();
  });

  const form = $("#join-form");
  initValidation(form);
  form.addEventListener("submit", handleSubmit);

  $("#clear-history").addEventListener("click", () => {
    state.history = [];
    removeLocal("history");
    renderHistory();
  });

  loadPosts();
}

document.addEventListener("DOMContentLoaded", initApp);
