// --- BASE DE DADOS DOS PRODUTOS ---
const products = [
  { id: 1, name: "Jantinha Completa", category: "jantinhas", price: 25.00, desc: "Arroz, feijão tropeiro, vinagrete, mandioca e 1 espetinho à escolha.", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80", highlight: true },
  { id: 2, name: "Espetinho de Picanha", category: "espetinhos", price: 14.00, desc: "Carne macia e suculenta grelhada na brasa.", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80", highlight: true },
  { id: 3, name: "Espetinho de Frango c/ Bacon", category: "espetinhos", price: 12.00, desc: "Peito de frango temperado enrolado em fatias de bacon crocante.", image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=400&q=80", highlight: false },
  { id: 4, name: "Espetinho de Queijo Coalho", category: "espetinhos", price: 10.00, desc: "Queijo coalho tostado na brasa com melaço opcional.", image: "https://images.unsplash.com/photo-1532636875304-0c89119d9b4d?auto=format&fit=crop&w=400&q=80", highlight: false },
  { id: 5, name: "Porção de Batata Frita c/ Queijo & Bacon", category: "porcoes", price: 32.00, desc: "500g de batata crocante, cheddar cremoso e bacon em cubos.", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80", highlight: true },
  { id: 6, name: "Porção de Linguiça Artesanal", category: "porcoes", price: 38.00, desc: "Acompanha farofa, vinagrete e pão de alho.", image: "https://images.unsplash.com/photo-1528607929212-2636ec44253e?auto=format&fit=crop&w=400&q=80", highlight: false },
  { id: 7, name: "Cerveja Heineken Long Neck", category: "bebidas", price: 10.00, desc: "330ml - Trincando de gelada.", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=400&q=80", highlight: true },
  { id: 8, name: "Refrigerante Lata", category: "bebidas", price: 6.00, desc: "350ml (Coca-Cola, Guaraná, Fanta).", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80", highlight: false },
  { id: 9, name: "Pudim de Leite Condensado", category: "sobremesas", price: 8.00, desc: "Fatia generosa com calda de caramelo caseira.", image: "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&w=400&q=80", highlight: false }
];

// --- ESTADO DA APLICAÇÃO ---
let cart = [];
let orders = JSON.parse(localStorage.getItem('julius_orders')) || [];
let currentCategory = 'all';

// Canal de comunicação entre janelas/separadores
const orderChannel = new BroadcastChannel('julius_orders_channel');

orderChannel.onmessage = (event) => {
  if (event.data.type === 'NEW_ORDER' || event.data.type === 'UPDATE_ORDERS') {
    orders = JSON.parse(localStorage.getItem('julius_orders')) || [];
    renderKanban();
    if (event.data.type === 'NEW_ORDER' && document.getElementById('col-novo')) {
      playNotificationSound();
    }
  }
};

// --- NAVEGAÇÃO SPA (Apenas no index.html) ---
function navigate(sectionId) {
  const secInicio = document.getElementById('sec-inicio');
  const secCardapio = document.getElementById('sec-cardapio');
  if (!secInicio || !secCardapio) return;

  secInicio.classList.add('hidden');
  secCardapio.classList.add('hidden');

  const navInicio = document.getElementById('nav-inicio');
  const navCardapio = document.getElementById('nav-cardapio');

  if (navInicio) navInicio.className = "hover:text-red-400 transition text-gray-300";
  if (navCardapio) navCardapio.className = "hover:text-red-400 transition text-gray-300";

  document.getElementById(`sec-${sectionId}`)?.classList.remove('hidden');
  document.getElementById(`nav-${sectionId}`)?.setAttribute('class', "hover:text-red-400 transition text-red-500 font-bold");

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- INICIALIZAÇÃO AUTOMÁTICA ---
document.addEventListener('DOMContentLoaded', () => {
  renderHighlights();
  renderProducts();
  renderKanban();
});

// --- RENDERIZAÇÃO DE PRODUTOS ---
function renderHighlights() {
  const container = document.getElementById('highlights-grid');
  if (!container) return;
  const filtered = products.filter(p => p.highlight);
  container.innerHTML = filtered.map(p => createProductCardHTML(p)).join('');
}

function renderProducts() {
  const container = document.getElementById('products-grid');
  if (!container) return;
  const searchVal = document.getElementById('search-input')?.value.toLowerCase() || '';

  const filtered = products.filter(p => {
    const matchesCategory = currentCategory === 'all' || p.category === currentCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchVal) || p.desc.toLowerCase().includes(searchVal);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<p class="col-span-full text-center text-gray-500 py-12">Nenhum item encontrado.</p>`;
    return;
  }

  container.innerHTML = filtered.map(p => createProductCardHTML(p)).join('');
}

function createProductCardHTML(product) {
  return `
    <div class="bg-brand-card rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition flex flex-col justify-between">
      <img src="${product.image}" alt="${product.name}" class="h-40 w-full object-cover">
      <div class="p-4 flex-grow flex flex-col justify-between space-y-3">
        <div>
          <h3 class="font-bold text-white text-base">${product.name}</h3>
          <p class="text-xs text-gray-400 mt-1 line-clamp-2">${product.desc}</p>
        </div>
        <div class="flex items-center justify-between pt-2">
          <span class="text-amber-400 font-bold text-lg">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
          <button onclick="addToCart(${product.id})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition">
            <i class="fa-solid fa-plus"></i>
            <span>Adicionar</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function setCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
  if (window.event && window.event.target) {
    window.event.target.classList.add('active');
  }
  renderProducts();
}

function filterProducts() {
  renderProducts();
}

// --- COMANDA / CARRINHO ---
function toggleCart() {
  const modal = document.getElementById('cart-modal');
  if (modal) modal.classList.toggle('hidden');
}

function addToCart(productId) {
  const item = products.find(p => p.id === productId);
  const existing = cart.find(c => c.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }

  updateCartUI();
}

function changeQty(productId, delta) {
  const item = cart.find(c => c.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(c => c.id !== productId);
  }

  updateCartUI();
}

function updateCartUI() {
  const cartItems = document.getElementById('cart-items');
  const badge = document.getElementById('cart-badge');
  const totalEl = document.getElementById('cart-total');

  if (!cartItems || !badge || !totalEl) return;

  const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  if (totalCount > 0) {
    badge.innerText = totalCount;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  totalEl.innerText = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;

  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="text-gray-500 text-sm text-center py-8">Sua comanda está vazia.</p>`;
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="flex items-center justify-between bg-brand-bg p-3 rounded-lg border border-gray-800">
      <div class="flex-grow">
        <h4 class="text-xs font-bold text-white">${item.name}</h4>
        <span class="text-xs text-amber-400 font-semibold">R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}</span>
      </div>
      <div class="flex items-center space-x-2">
        <button onclick="changeQty(${item.id}, -1)" class="w-6 h-6 bg-gray-800 hover:bg-gray-700 text-white rounded flex items-center justify-center text-xs font-bold">-</button>
        <span class="text-xs font-bold text-white w-4 text-center">${item.qty}</span>
        <button onclick="changeQty(${item.id}, 1)" class="w-6 h-6 bg-gray-800 hover:bg-gray-700 text-white rounded flex items-center justify-center text-xs font-bold">+</button>
      </div>
    </div>
  `).join('');
}

// --- ENVIAR PEDIDOS ---
// CONFIGURAÇÃO DO WHATSAPP DA LOJA
// Insira o número com Código do País (55 para Brasil) + DDD + Número (apenas números)
const PHONE_NUMBER = "5527999999999"; 

// 1. IDENTIFICAR NÚMERO DA MESA PELA URL AUTOMATICAMENTE
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mesaParam = urlParams.get('mesa') || urlParams.get('m');

  if (mesaParam) {
    const tableInput = document.getElementById('customer-table');
    if (tableInput) {
      tableInput.value = `Mesa ${mesaParam}`;
    }
  }
});

// 2. FUNÇÃO DE ENVIAR PEDIDO COM CAMPOS SEPARADOS
function sendToKitchen() {
  if (cart.length === 0) {
    alert("Adicione pelo menos um item à comanda!");
    return;
  }

  const name = document.getElementById('customer-name')?.value.trim() || 'Cliente';
  const table = document.getElementById('customer-table')?.value.trim() || 'Balcão / Não informada';
  const notes = document.getElementById('order-notes')?.value.trim() || '';

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const itemsList = cart.map(item => {
    const subtotal = (item.price * item.qty).toFixed(2).replace('.', ',');
    return `• ${item.qty}x ${item.name} - R$ ${subtotal}`;
  }).join('\n');

  // Mensagem formatada para o WhatsApp
  let text = `🔥 *NOVO PEDIDO - JULIU'S CHURRASQUINHO*\n\n`;
  text += `👤 *Cliente:* ${name}\n`;
  text += `📍 *Mesa / Local:* ${table}\n`;
  text += `-----------------------------------\n`;
  text += `📋 *ITENS DO PEDIDO:*\n${itemsList}\n`;
  text += `-----------------------------------\n`;
  
  if (notes) {
    text += `📝 *Observações:* ${notes}\n`;
    text += `-----------------------------------\n`;
  }

  text += `💰 *TOTAL:* R$ ${total.toFixed(2).replace('.', ',')}\n\n`;
  text += `Aguardando confirmação do pedido!`;

  const whatsappUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`;

  // Limpeza
  cart = [];
  updateCartUI();
  toggleCart();

  if (document.getElementById('customer-name')) document.getElementById('customer-name').value = '';
  if (document.getElementById('order-notes')) document.getElementById('order-notes').value = '';

  window.open(whatsappUrl, '_blank');
}



// --- GESTÃO DA COZINHA (KANBAN) ---
function saveOrders() {
  localStorage.setItem('julius_orders', JSON.stringify(orders));
  renderKanban();
}

function renderKanban() {
  const colNovo = document.getElementById('col-novo');
  const colPreparo = document.getElementById('col-preparo');
  const colPronto = document.getElementById('col-pronto');
  const colConcluido = document.getElementById('col-concluido');

  if (!colNovo) return; // Não executa se não estiver na página cozinha.html

  const novos = orders.filter(o => o.status === 'novo');
  const preparo = orders.filter(o => o.status === 'preparo');
  const pronto = orders.filter(o => o.status === 'pronto');
  const concluido = orders.filter(o => o.status === 'concluido');

  document.getElementById('count-novo').innerText = novos.length;
  document.getElementById('count-preparo').innerText = preparo.length;
  document.getElementById('count-pronto').innerText = pronto.length;
  document.getElementById('count-concluido').innerText = concluido.length;

  colNovo.innerHTML = novos.map(o => createKanbanCardHTML(o)).join('');
  colPreparo.innerHTML = preparo.map(o => createKanbanCardHTML(o)).join('');
  colPronto.innerHTML = pronto.map(o => createKanbanCardHTML(o)).join('');
  colConcluido.innerHTML = concluido.map(o => createKanbanCardHTML(o)).join('');
}

function createKanbanCardHTML(order) {
  const itemsList = order.items.map(i => `<li class="flex justify-between"><span>${i.qty}x ${i.name}</span> <span class="text-gray-400">R$ ${(i.price * i.qty).toFixed(2)}</span></li>`).join('');

  let actionButtons = '';
  if (order.status === 'novo') {
    actionButtons = `<button onclick="updateOrderStatus(${order.id}, 'preparo')" class="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 rounded transition">Iniciar Preparo</button>`;
  } else if (order.status === 'preparo') {
    actionButtons = `<button onclick="updateOrderStatus(${order.id}, 'pronto')" class="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-1.5 rounded transition">Marcar Pronto</button>`;
  } else if (order.status === 'pronto') {
    actionButtons = `<button onclick="updateOrderStatus(${order.id}, 'concluido')" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 rounded transition">Concluir Pedido</button>`;
  }

  return `
    <div class="bg-brand-card p-3 rounded-lg border border-gray-800 space-y-2 text-xs shadow-md">
      <div class="flex justify-between items-center border-b border-gray-800 pb-1.5">
        <span class="font-bold text-amber-400 text-sm">${order.customer}</span>
        <span class="text-gray-500 text-[10px]">${order.timestamp}</span>
      </div>
      <ul class="space-y-1 text-gray-300">
        ${itemsList}
      </ul>
      ${order.notes ? `<p class="bg-brand-bg p-1.5 rounded border border-gray-800 text-amber-300/90 italic text-[11px]">Obs: ${order.notes}</p>` : ''}
      <div class="flex justify-between items-center font-bold text-white pt-1">
        <span>Total:</span>
        <span>R$ ${order.total.toFixed(2).replace('.', ',')}</span>
      </div>
      <div class="pt-1">
        ${actionButtons}
      </div>
    </div>
  `;
}

function updateOrderStatus(orderId, newStatus) {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    saveOrders();
    orderChannel.postMessage({ type: 'UPDATE_ORDERS' });
  }
}

function clearCompletedOrders() {
  orders = orders.filter(o => o.status !== 'concluido');
  saveOrders();
  orderChannel.postMessage({ type: 'UPDATE_ORDERS' });
}

// --- ALERTA SONORO ---
function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) {
    console.log("Aguardando interação para reproduzir som.");
  }
}