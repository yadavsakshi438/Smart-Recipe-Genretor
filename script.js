// === Globals ===
let ingredients = [];
let recipes = [];

// === DOM Elements ===
const input = document.getElementById("ingredient-input");
const addBtn = document.getElementById("add-btn");
const searchBtn = document.getElementById("search-btn");
const chipsContainer = document.getElementById("chips");
const resultsContainer = document.getElementById("results");
const countEl = document.getElementById("count");
const loader = document.getElementById("loader");
const empty = document.getElementById("empty");

// === Load recipes.json on page load ===
fetch("recipes.json")
  .then((res) => res.json())
  .then((data) => {
    recipes = data;
  })
  .catch((err) => console.error("Error loading recipes:", err));

// === Add ingredient chip ===
function addIngredient(value) {
  const ing = value.trim().toLowerCase();
  if (!ing || ingredients.includes(ing)) return;

  ingredients.push(ing);
  renderChips();
  input.value = "";
}

// === Remove chip ===
function removeIngredient(ing) {
  ingredients = ingredients.filter((i) => i !== ing);
  renderChips();
}

// === Render chips ===
function renderChips() {
  chipsContainer.innerHTML = "";
  ingredients.forEach((ing) => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.innerHTML = `${ing} <span class="close-btn">&times;</span>`;
    chip.querySelector(".close-btn").onclick = () => removeIngredient(ing);
    chipsContainer.appendChild(chip);
  });
}

// === Search Recipes ===
function searchRecipes() {
  if (ingredients.length === 0) {
    resultsContainer.innerHTML = "";
    countEl.textContent = "";
    empty.style.display = "block";
    return;
  }

  loader.style.display = "block";
  empty.style.display = "none";
  resultsContainer.innerHTML = "";
  countEl.textContent = "";

  // Simulate loading delay
  setTimeout(() => {
    loader.style.display = "none";

    const filtered = recipes.filter((r) =>
      ingredients.every((ing) =>
        r.ingredients.join(" ").toLowerCase().includes(ing)
      )
    );

    if (filtered.length === 0) {
      empty.textContent = "No recipes found for given ingredients.";
      empty.style.display = "block";
    } else {
      empty.style.display = "none";
      countEl.textContent = `${filtered.length} recipe(s) found`;
      renderResults(filtered);
    }
  }, 500);
}

// === Render recipe cards ===
function renderResults(list) {
  resultsContainer.innerHTML = "";
  list.forEach((r) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${r.name}</h3>
      <p><strong>Ingredients:</strong> ${r.ingredients.join(", ")}</p>
      <p><strong>Steps:</strong> ${r.instructions}</p>
    `;

    resultsContainer.appendChild(card);
  });
}
document.addEventListener("DOMContentLoaded", () => {
  const ingredientListEl = document.getElementById("ingredient-list");
  const searchBtn = document.getElementById("search-btn");
  const resultsEl = document.getElementById("recipe-results");

  let recipes = [];
  let allIngredients = new Set();

  // Load recipes.json
  fetch("recipes.json")
    .then((res) => res.json())
    .then((data) => {
      recipes = data;
      // Collect all unique ingredients
      data.forEach((r) =>
        r.ingredients.forEach((i) => allIngredients.add(i.toLowerCase()))
      );
      renderIngredientOptions();
    });

  // Render checkboxes
  function renderIngredientOptions() {
    ingredientListEl.innerHTML = "";
    [...allIngredients].sort().forEach((ingredient) => {
      const label = document.createElement("label");
      label.classList.add("ingredient-option");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = ingredient;

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(" " + ingredient));
      ingredientListEl.appendChild(label);
    });
  }

  // Search recipes
  searchBtn.addEventListener("click", () => {
    const selected = [
      ...document.querySelectorAll("#ingredient-list input:checked"),
    ].map((cb) => cb.value);
    if (selected.length === 0) {
      resultsEl.innerHTML = "<p>Please select at least one ingredient!</p>";
      return;
    }

    const matches = recipes.filter((recipe) =>
      selected.every((sel) =>
        recipe.ingredients.map((i) => i.toLowerCase()).includes(sel)
      )
    );

    displayResults(matches);
  });

  // Display recipes
  function displayResults(list) {
    resultsEl.innerHTML = "";
    if (list.length === 0) {
      resultsEl.innerHTML =
        "<p>No recipes found with selected ingredients.</p>";
      return;
    }

    list.forEach((recipe) => {
      const card = document.createElement("div");
      card.classList.add("recipe-card");

      card.innerHTML = `
        <h3>${recipe.name}</h3>
        <p><strong>Ingredients:</strong> ${recipe.ingredients.join(", ")}</p>
        <p><strong>Instructions:</strong></p>
        <ol>${recipe.instructions
          .map((step) => `<li>${step}</li>`)
          .join("")}</ol>
      `;
      resultsEl.appendChild(card);
    });
  }
  // Load Teachable Machine model
  const URL = "https://teachablemachine.withgoogle.com/models/YOUR_MODEL_URL/";
  let model;

  async function loadModel() {
    model = await tmImage.load(URL + "model.json", URL + "metadata.json");
    console.log("Model loaded");
  }

  loadModel();

  document
    .getElementById("image-upload")
    .addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        const prediction = await model.predict(img);
        const best = prediction.sort(
          (a, b) => b.probability - a.probability
        )[0];

        document.getElementById("image-result").innerText = `Detected: ${
          best.className
        } (${(best.probability * 100).toFixed(1)}%)`;

        // Add ingredient automatically
        selectedIngredients.push(best.className.toLowerCase());
        updateChips();
      };
    });
});

// === Event Listeners ===
addBtn.addEventListener("click", () => addIngredient(input.value));
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addIngredient(input.value);
});
searchBtn.addEventListener("click", searchRecipes);
