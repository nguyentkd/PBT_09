// Product Catalog — Render products, search, filter, sort, modal, cart badge, dark mode
(function(){
  const products = [
    { id:1, name: "iPhone 16", price: 25990000, category: "phone", image: "https://placehold.co/300x200?text=iPhone+16", rating:4.5, inStock:true },
    { id:2, name: "Pixel 9", price: 19990000, category: "phone", image: "https://placehold.co/300x200?text=Pixel+9", rating:4.2, inStock:true },
    { id:3, name: "Galaxy Z", price: 23990000, category: "phone", image: "https://placehold.co/300x200?text=Galaxy+Z", rating:4.1, inStock:false },
    { id:4, name: "MacBook Pro", price: 52990000, category: "laptop", image: "https://placehold.co/300x200?text=MacBook+Pro", rating:4.8, inStock:true },
    { id:5, name: "Dell XPS", price: 39990000, category: "laptop", image: "https://placehold.co/300x200?text=Dell+XPS", rating:4.4, inStock:true },
    { id:6, name: "Sony Headphones", price: 2990000, category: "audio", image: "https://placehold.co/300x200?text=Sony+Headphones", rating:4.6, inStock:true },
    { id:7, name: "Bose Speaker", price: 3990000, category: "audio", image: "https://placehold.co/300x200?text=Bose+Speaker", rating:4.7, inStock:false },
    { id:8, name: "Leather Wallet", price: 490000, category: "accessory", image: "https://placehold.co/300x200?text=Wallet", rating:4.0, inStock:true },
    { id:9, name: "Smart Watch", price: 3590000, category: "accessory", image: "https://placehold.co/300x200?text=Smart+Watch", rating:4.3, inStock:true },
    { id:10, name: "USB-C Hub", price: 390000, category: "accessory", image: "https://placehold.co/300x200?text=USB-C+Hub", rating:3.9, inStock:true },
    { id:11, name: "Gaming Mouse", price: 890000, category: "accessory", image: "https://placehold.co/300x200?text=Gaming+Mouse", rating:4.2, inStock:true },
    { id:12, name: "4K Monitor", price: 7990000, category: "laptop", image: "https://placehold.co/300x200?text=4K+Monitor", rating:4.5, inStock:true }
  ];

  const state = {
    query: "",
    category: "all",
    sort: "none",
    cartCount: 0
  };

  const app = document.getElementById('app');

  function el(tag, cls, text){
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function formatPrice(v){
    return v.toLocaleString('vi-VN') + '₫';
  }

  function buildUI(){
    const header = el('header','hero');
    const h1 = el('h1',null,'Product Catalog');
    const controls = el('div','controls');

    const search = el('input','search-box');
    search.type = 'search';
    search.placeholder = 'Search products...';
    search.addEventListener('input', e=>{ state.query = e.target.value.trim().toLowerCase(); renderProducts(); });

    const categoryWrap = el('div','categories');
    ['all','phone','laptop','audio','accessory'].forEach(cat=>{
      const btn = el('button', `category-btn ${cat==='all'? 'active':''}`, cat=== 'all'? 'All': cat.charAt(0).toUpperCase()+cat.slice(1));
      btn.type='button';
      btn.dataset.cat = cat;
      btn.addEventListener('click', ()=>{ state.category = cat; document.querySelectorAll('.cat-btn').forEach(b=>b.classList.toggle('active', b===btn)); renderProducts(); });
      categoryWrap.appendChild(btn);
    });

    const sort = el('select','sort-select');
    sort.innerHTML = '\n      <option value="none">Sort</option>\n      <option value="price-asc">Price ↑</option>\n      <option value="price-desc">Price ↓</option>\n      <option value="name-asc">Name A-Z</option>\n      <option value="rating-desc">Top rated</option>\n    '.trim();
    sort.addEventListener('change', e=>{ state.sort = e.target.value; renderProducts(); });

    const right = el('div','hero-actions');
    const darkToggle = el('button','icon-btn','Dark'); darkToggle.type='button';
    darkToggle.addEventListener('click', ()=>{ document.body.classList.toggle('dark-mode'); darkToggle.textContent = document.body.classList.contains('dark-mode')? 'Light':'Dark'; });

    const cart = el('div','header-badge');
    const cartBtn = el('button','icon-btn','🛒'); cartBtn.type='button';
    const badge = el('span',null,'0'); badge.id = 'cartBadge';
    cart.appendChild(cartBtn);
    cart.appendChild(badge);

    right.appendChild(darkToggle);
    right.appendChild(cart);

    controls.append(search, categoryWrap, sort, right);
    header.append(h1, controls);

    const grid = el('div','grid'); grid.id = 'productsGrid';
    const modal = buildModal(); modal.id = 'pcModal';

    const pageWrap = el('div','page');
    pageWrap.appendChild(header);
    pageWrap.appendChild(grid);
    app.append(pageWrap, modal);
  }

  function buildModal(){
    const overlay = el('div','modal');
    overlay.classList.remove('open');
    const panel = el('div','modal-panel');
    const media = el('div','modal-media');
    const img = el('img',null);
    media.appendChild(img);
    const body = el('div','modal-body');
    const close = el('button','modal-close','✕'); close.type='button';
    close.addEventListener('click', ()=>{ overlay.classList.remove('open'); });
    const title = el('h2',null);
    const price = el('p','price');
    const desc = el('p','details');
    const btn = el('button','modal-add','Add to cart'); btn.type='button';
    btn.addEventListener('click', ()=>{ state.cartCount++; updateCart(); });
    body.append(title, price, desc, btn);
    panel.append(media, body);
    panel.insertBefore(close, panel.firstChild);
    overlay.appendChild(panel);
    return overlay;
  }

  function openModalFor(product){
    const overlay = document.querySelector('.modal');
    overlay.classList.add('open');
    overlay.querySelector('.modal-media img').src = product.image;
    overlay.querySelector('.modal-body h2').textContent = product.name;
    overlay.querySelector('.modal-body .price').textContent = formatPrice(product.price);
    overlay.querySelector('.modal-body .details').textContent = `Category: ${product.category} • Rating: ${product.rating}`;
  }

  function updateCart(){
    const badge = document.getElementById('cartBadge');
    badge.textContent = String(state.cartCount);
    badge.style.display = state.cartCount ? 'inline-block' : 'none';
  }

  function renderProducts(){
    const grid = document.getElementById('productsGrid');
    grid.textContent = '';
    let list = products.slice();
    if (state.category !== 'all') list = list.filter(p=>p.category===state.category);
    if (state.query) list = list.filter(p=> p.name.toLowerCase().includes(state.query) || String(p.price).includes(state.query));

    switch(state.sort){
      case 'price-asc': list.sort((a,b)=>a.price-b.price); break;
      case 'price-desc': list.sort((a,b)=>b.price-a.price); break;
      case 'name-asc': list.sort((a,b)=>a.name.localeCompare(b.name)); break;
      case 'rating-desc': list.sort((a,b)=>b.rating-a.rating); break;
    }

    const frag = document.createDocumentFragment();
    list.forEach(p=>{
      const card = el('div','product-card');
      const img = el('img',null); img.src = p.image; img.alt = p.name;
      const name = el('h3','product-title',p.name);
      const pri = el('p','price',formatPrice(p.price));
      const add = el('button','card-btn','Thêm giỏ'); add.type='button';
      add.addEventListener('click', (e)=>{ e.stopPropagation(); state.cartCount++; updateCart(); });
      card.append(img,name,pri,add);
      card.addEventListener('click', ()=>{ openModalFor(p); });
      frag.appendChild(card);
    });

    grid.appendChild(frag);
    updateCart();
  }

  buildUI();
  renderProducts();
})();
