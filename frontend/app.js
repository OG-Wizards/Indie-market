const API_URL = "/api/products";

function isLoggedIn() {
  return !!localStorage.getItem("token");
}
function getRole() {
  return localStorage.getItem("role");
}
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("name");
  window.location.href = "home.html";
}

function setupNav() {
  const signupLink = document.getElementById("signupLink");
  const loginLink = document.getElementById("loginLink");
  const sellerLink = document.getElementById("sellerLink");
  const sellerCta = document.getElementById("sellerCta");
  const logoutBtn = document.getElementById("logoutBtn");

  if (isLoggedIn()) {
    signupLink.style.display = "none";
    loginLink.style.display = "none";
    logoutBtn.classList.remove("hidden");

    if (getRole() !== "seller") {
      sellerLink.style.display = "none";
      if (sellerCta) sellerCta.style.display = "none";
    }
  } else {
    logoutBtn.classList.add("hidden");
    sellerLink.style.display = "none";
    if (sellerCta) sellerCta.style.display = "inline-block";
  }

  logoutBtn?.addEventListener("click", logout);
}

async function renderProducts() {
  const container = document.getElementById("productsContainer");
  if (!container) return;

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch products");
    const products = await res.json();

    if (!Array.isArray(products) || products.length === 0) {
      container.innerHTML = `<p class="col-span-full text-gray-600">No products available.</p>`;
      return;
    }

    container.innerHTML = products
      .map(
        (p) => `
      <div class="bg-white p-4 shadow rounded-xl hover:shadow-lg transition">
        <img class="h-40 w-full object-cover rounded mb-3"
             src="${
               p.image
                 ? `http://localhost:5000${p.image}`
                 : "https://via.placeholder.com/400x300?text=No+Image"
             }" alt="${p.name}">
        <h2 class="text-lg font-bold">${p.name}</h2>
        <p class="text-gray-600 text-sm">${p.description || ""}</p>
        <p class="text-green-600 font-semibold mt-2">₹${p.price}</p>
      </div>
    `
      )
      .join("");
  } catch (err) {
    console.error("Failed to load products:", err);
    container.innerHTML = `<p class="col-span-full text-red-600">Error loading products.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  setupNav();
  await renderProducts();
});
