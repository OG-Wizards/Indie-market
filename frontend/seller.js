import { getToken, getRole, logout, API_BASE } from "./auth.js";

const API_URL = `${API_BASE}/products`;
const form = document.getElementById("productForm");
const statusMessage = document.getElementById("statusMessage");
const logoutBtn = document.getElementById("logoutBtn");
const sellerProducts = document.getElementById("sellerProducts");
const productIdInput = document.getElementById("productId");

logoutBtn.addEventListener("click", logout);

function setStatus(msg, color = "red") {
  statusMessage.textContent = msg;
  statusMessage.style.color = color;
}

async function fetchSellerProducts() {
  try {
    const res = await fetch(API_URL);
    const products = await res.json();
    renderProducts(products);
  } catch (err) {
    console.error(err);
    sellerProducts.innerHTML = `<p class="text-red-600">Failed to load products.</p>`;
  }
}

function renderProducts(products) {
  if (!Array.isArray(products) || products.length === 0) {
    sellerProducts.innerHTML = `<p>No products yet.</p>`;
    return;
  }

  sellerProducts.innerHTML = products
    .map(
      (p) => `
      <div class="p-4 border rounded flex items-center justify-between">
        <div>
          <p class="font-bold">${p.name}</p>
          <p class="text-gray-600">₹${p.price}</p>
        </div>
        <div class="space-x-2">
          <button class="bg-yellow-500 text-white px-3 py-1 rounded editBtn" data-id="${p._id}">Edit</button>
          <button class="bg-red-600 text-white px-3 py-1 rounded deleteBtn" data-id="${p._id}">Delete</button>
        </div>
      </div>
    `
    )
    .join("");

  document.querySelectorAll(".editBtn").forEach((btn) =>
    btn.addEventListener("click", () => loadProductForEdit(btn.dataset.id))
  );
  document.querySelectorAll(".deleteBtn").forEach((btn) =>
    btn.addEventListener("click", () => deleteProduct(btn.dataset.id))
  );
}

async function loadProductForEdit(id) {
  try {
    const res = await fetch(`${API_URL}`);
    const products = await res.json();
    const product = products.find((p) => p._id === id);
    if (!product) return;

    form.name.value = product.name;
    form.price.value = product.price;
    form.description.value = product.description;
    productIdInput.value = product._id;
    setStatus("Editing product...", "orange");
  } catch (err) {
    console.error(err);
  }
}

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Failed to delete product");
    setStatus("Product deleted!", "green");
    fetchSellerProducts();
  } catch (err) {
    console.error(err);
    setStatus("Error deleting product");
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = getToken();
  if (!token || getRole() !== "seller") {
    setStatus("❌ You must be logged in as a seller.", "red");
    return;
  }

  const fd = new FormData(form);
  const productId = productIdInput.value;
  const method = productId ? "PUT" : "POST";
  const url = productId ? `${API_URL}/${productId}` : API_URL;

  try {
    setStatus("⏳ Saving...", "#666");
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) throw new Error("Failed to save product");
    setStatus(productId ? "Product updated!" : "Product added!", "green");
    form.reset();
    productIdInput.value = "";
    fetchSellerProducts();
  } catch (err) {
    console.error(err);
    setStatus("Error: " + err.message);
  }
});

fetchSellerProducts();
