const products = [
  { id: "coxinha", name: "Coxinha", price100: 50 },
  { id: "bolinha-de-queijo", name: "Bolinha de queijo", price100: 60 },
  { id: "risole", name: "Risole", price100: 55 },
  { id: "kibe", name: "Kibe", price100: 65 }
];

const cart = Object.fromEntries(products.map(product => [product.id, 0]));

const money = value =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

function renderProducts() {
  const container = document.getElementById("order-products");

  container.innerHTML = products.map(product => `
    <div class="order-row">
      <div>
        <h3>${product.name}</h3>
        <small>R$ ${product.price100.toFixed(2).replace(".", ",")} por 100 unidades</small>
      </div>

      <div class="unit-price">
        R$ ${(product.price100 / 100).toFixed(2).replace(".", ",")} / un.
      </div>

      <div class="qty">
        <button type="button" aria-label="Diminuir ${product.name}"
          onclick="changeQuantity('${product.id}', -10)">−</button>

        <strong id="qty-${product.id}">0</strong>

        <button type="button" aria-label="Aumentar ${product.name}"
          onclick="changeQuantity('${product.id}', 10)">+</button>
      </div>
    </div>
  `).join("");
}

function changeQuantity(id, amount) {
  cart[id] = Math.max(0, cart[id] + amount);

  document.getElementById(`qty-${id}`).textContent = cart[id];

  updateSummary();
}

function getTotalUnits() {
  return products.reduce((total, product) => {
    return total + cart[product.id];
  }, 0);
}

function getTotalPrice() {
  return products.reduce((total, product) => {
    return total + (cart[product.id] / 100) * product.price100;
  }, 0);
}

function updateSummary() {
  const totalUnits = getTotalUnits();
  const totalPrice = getTotalPrice();

  document.getElementById("summary-count").textContent = `${totalUnits} un.`;
  document.getElementById("summary-total").textContent = money(totalPrice);

  const selected = products.filter(product => cart[product.id] > 0);
  const summaryItems = document.getElementById("summary-items");

  if (selected.length === 0) {
    summaryItems.innerHTML =
      '<p class="empty">Escolha os sabores e as quantidades para começar.</p>';
  } else {
    summaryItems.innerHTML = selected.map(product => {
      const linePrice = (cart[product.id] / 100) * product.price100;

      return `
        <div class="summary-line">
          <span>${cart[product.id]} ${product.name}</span>
          <strong>${money(linePrice)}</strong>
        </div>
      `;
    }).join("");
  }

  const valid = totalUnits >= 50;
  const button = document.getElementById("whatsapp-button");
  const minimumMessage = document.getElementById("minimum-message");

  button.disabled = !valid;

  minimumMessage.textContent = valid
    ? "Estimativa sujeita à confirmação da Sandra."
    : `Adicione mais ${50 - totalUnits} unidades para liberar o pedido.`;
}

function sendWhatsApp() {
  const totalUnits = getTotalUnits();

  if (totalUnits < 50) return;

  const totalPrice = getTotalPrice();

  const items = products
    .filter(product => cart[product.id] > 0)
    .map(product => {
      const price = (cart[product.id] / 100) * product.price100;

      return `• ${cart[product.id]} ${product.name} — ${money(price)}`;
    })
    .join("\n");

  const message = `Olá, Sandra! 😊

Gostaria de fazer um orçamento:

${items}

Total estimado: ${money(totalPrice)}

Gostaria de confirmar a disponibilidade e combinar a entrega/retirada.`;

  const phone = "5521997392456";

  window.open(
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener"
  );
}

document
  .getElementById("whatsapp-button")
  .addEventListener("click", sendWhatsApp);

renderProducts();
updateSummary();
