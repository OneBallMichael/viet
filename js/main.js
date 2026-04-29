document.addEventListener('DOMContentLoaded', () => {
    let menuData = [];
    const CATEGORY_LABELS = {
        zupy:'Zupy', sajgonki:'Sajgonki', kalmary:'Kalmary', kurczak:'Kurczak',
        wieprzowina:'Wieprzowina', wolowina:'Wołowina', kaczka:'Kaczka',
        udko_kurczaka:'Udko z kurczaka', krewetki:'Krewetki',
        makaron_chinski:'Makaron chiński', makaron_sojowy:'Makaron sojowy',
        makaron_ryzowy:'Makaron ryżowy', tofu:'Tofu', makaron_udon:'Makaron Udon',
        pad_thai:'Pad Thai', ryz_smazony:'Ryż smażony', kurczak_z_grilla:'Kurczak z grilla',
        pierogi:'Pierogi', ryba:'Ryba Tilapia', schab:'Schab', wegorz:'Węgorz',
        kurczak_w_panierce:'Kurczak w panierce', kurczak_w_ciescie:'Kurczak w cieście',
        boxy:'Boxy', dodatki:'Dodatki', napoje:'Napoje', nowosci:'Nowości'
    };
    const TAG_LABELS = {ostre:'Ostre',wege:'Wege',owoce_morza:'Owoce morza',nowosc:'Nowość',box:'Box'};
    let activeTag = 'all';
    let activeCategory = 'all';
    let searchQuery = '';

    // --- NAVBAR ---
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const overlay = document.getElementById('mobileOverlay');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        document.getElementById('scrollTop').classList.toggle('visible', window.scrollY > 500);
    });
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
        overlay.classList.toggle('open');
    });
    overlay.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
        overlay.classList.remove('open');
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
        overlay.classList.remove('open');
    }));
    document.getElementById('scrollTop').addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

    // --- SCROLL ANIMATIONS ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }});
    }, {threshold:0.1});
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // --- HIGHLIGHT CURRENT DAY ---
    const days = document.querySelectorAll('.hours-table tr');
    const today = new Date().getDay();
    const dayIndex = today === 0 ? 6 : today - 1;
    if(days[dayIndex]) days[dayIndex].classList.add('today');

    // --- REVIEWS ---
    const reviews = [
        {name:'Anna K.',stars:5,date:'2 tygodnie temu',text:'Najlepsza kuchnia wietnamska w okolicy! PHO jest absolutnie rewelacyjne, smakuje jak w Hanoi. Obsługa bardzo miła i szybka.'},
        {name:'Marek W.',stars:5,date:'miesiąc temu',text:'Regularnie zamawiam kurczaka z warzywami — porcje ogromne, ceny bardzo przystępne. Polecam sajgonki na start!'},
        {name:'Piotr M.',stars:4,date:'3 tygodnie temu',text:'Świetne jedzenie, duże porcje. Kaczka 5 smaków to absolutny hit. Jedyne co bym zmienił to trochę więcej miejsc siedzących.'},
        {name:'Katarzyna L.',stars:5,date:'tydzień temu',text:'Odkrycie roku! Pad Thai z krewetkami i zupa PHO to moje ulubione. Zawsze świeże składniki i fantastyczny smak.'},
        {name:'Tomasz B.',stars:4,date:'2 miesiące temu',text:'Bardzo dobre jedzenie azjatyckie. Makaron chiński smażony z wołowiną — rewelacja. Szybka dostawa pod drzwi.'},
        {name:'Joanna S.',stars:5,date:'miesiąc temu',text:'Fantastyczne miejsce! Tofu z warzywami idealne dla wegetarian. Miła atmosfera i przystępne ceny. Polecam!'},
        {name:'Robert N.',stars:5,date:'3 tygodnie temu',text:'Jemy tu z rodziną co tydzień. Dzieci uwielbiają pierogi po chińsku, a ja kaczkę z grzybami Mun. Absolutny TOP!'},
        {name:'Magdalena D.',stars:4,date:'2 tygodnie temu',text:'Dobre jedzenie, szybka obsługa. Krewetki w panierce z sezamem to must-try! Polecam na wynos, porcje jak na miejscu.'}
    ];
    const starSvg = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg>';
    const emptyStarSvg = '<svg class="empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg>';
    const googleSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>';

    function renderReviews() {
        const track = document.getElementById('reviewsTrack');
        const allReviews = [...reviews, ...reviews]; // duplicate for infinite scroll
        track.innerHTML = allReviews.map(r => {
            const stars = Array(5).fill(0).map((_,i) => i < r.stars ? starSvg : emptyStarSvg).join('');
            return `<div class="review-card">
                <div class="review-header">
                    <div class="review-avatar">${r.name.charAt(0)}</div>
                    <div class="review-meta"><h4>${r.name}</h4><span class="date">${r.date}</span></div>
                </div>
                <div class="review-stars">${stars}</div>
                <p>${r.text}</p>
                <div class="review-source">${googleSvg} Google Maps</div>
            </div>`;
        }).join('');
    }
    renderReviews();

    // --- LOAD MENU ---
    fetch('data/menu.json')
        .then(r => r.json())
        .then(data => { menuData = data; initMenu(); })
        .catch(() => { document.getElementById('menuGrid').innerHTML = '<p class="no-results">Nie udało się załadować menu.</p>'; });

    function initMenu() {
        renderCategoryTabs();
        renderFeatured();
        renderMenu();
        document.getElementById('menuSearch').addEventListener('input', e => { searchQuery = e.target.value.toLowerCase(); renderMenu(); });
        document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTag = btn.dataset.tag;
            renderMenu();
        }));
    }

    function renderCategoryTabs() {
        const cats = [...new Set(menuData.map(d => d.category))];
        const container = document.getElementById('categoryTabs');
        container.innerHTML = `<button class="cat-tab active" data-cat="all">Wszystkie</button>` +
            cats.map(c => `<button class="cat-tab" data-cat="${c}">${CATEGORY_LABELS[c]||c}</button>`).join('');
        container.querySelectorAll('.cat-tab').forEach(tab => tab.addEventListener('click', () => {
            container.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeCategory = tab.dataset.cat;
            renderMenu();
        }));
    }

    function renderFeatured() {
        const featured = [
            menuData.find(d => d.id === 1),  // PHO
            menuData.find(d => d.id === 44), // Kaczka 5 smaków
            menuData.find(d => d.id === 99), // Pad Thai
            menuData.find(d => d.id === 57), // Krewetki
        ].filter(Boolean);
        const grid = document.getElementById('featuredGrid');
        grid.innerHTML = featured.map(d => {
            const priceText = d.price ? `${d.price} zł` : Object.entries(d.prices).map(([k,v])=>`${v} zł`).join(' / ');
            return `<div class="featured-card fade-in">
                <span class="badge">Polecane</span>
                <div class="featured-card-body">
                    <h3>${d.name}</h3>
                    <p class="cat">${CATEGORY_LABELS[d.category]||d.category}</p>
                    <span class="price">${priceText}</span>
                </div>
            </div>`;
        }).join('');
        grid.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    }

    const INITIAL_SHOW = 12;
    let menuExpanded = false;

    function renderMenu() {
        let filtered = menuData;
        if(activeTag !== 'all') filtered = filtered.filter(d => d.tags.includes(activeTag));
        if(activeCategory !== 'all') filtered = filtered.filter(d => d.category === activeCategory);
        if(searchQuery) filtered = filtered.filter(d => d.name.toLowerCase().includes(searchQuery));
        const grid = document.getElementById('menuGrid');
        const toggleWrap = document.getElementById('menuToggleWrap');
        const toggleBtn = document.getElementById('menuToggleBtn');
        if(!filtered.length) {
            grid.innerHTML = `<div class="no-results" style="grid-column:1/-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <p>Nie znaleziono dań pasujących do filtrów</p></div>`;
            document.getElementById('menuCount').textContent = '';
            toggleWrap.style.display = 'none';
            return;
        }
        const isFiltering = activeTag !== 'all' || activeCategory !== 'all' || searchQuery;
        const showAll = menuExpanded || isFiltering;
        const visible = showAll ? filtered : filtered.slice(0, INITIAL_SHOW);
        const hasMore = filtered.length > INITIAL_SHOW;

        grid.innerHTML = visible.map(d => {
            const visibleTags = d.tags.filter(t => t !== 'nowosc');
            const tags = visibleTags.map(t => `<span class="menu-tag ${t}"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>${TAG_LABELS[t]||t}</span>`).join('');
            let priceHtml;
            if(d.prices) {
                priceHtml = `<div class="menu-item-prices">${Object.entries(d.prices).map(([k,v])=>`<div class="price-line">${k}: <strong>${v} zł</strong></div>`).join('')}</div>`;
            } else {
                priceHtml = `<span class="menu-item-price">${d.price} zł</span>`;
            }
            return `<div class="menu-item">
                <div class="menu-item-info"><h4>${d.name}</h4>${tags?'<div class="menu-item-tags">'+tags+'</div>':''}</div>
                ${priceHtml}
            </div>`;
        }).join('');

        if(hasMore && !isFiltering) {
            toggleWrap.style.display = 'block';
            if(menuExpanded) {
                toggleBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg> Zwiń menu';
                toggleBtn.classList.add('expanded');
            } else {
                toggleBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg> Wyświetl wszystko (' + (filtered.length - INITIAL_SHOW) + ' więcej)';
                toggleBtn.classList.remove('expanded');
            }
        } else {
            toggleWrap.style.display = 'none';
        }

        document.getElementById('menuCount').textContent = `Pokazuję ${visible.length} z ${filtered.length} dań`;
    }

    // Toggle menu expand/collapse
    document.getElementById('menuToggleBtn').addEventListener('click', () => {
        menuExpanded = !menuExpanded;
        renderMenu();
        if(!menuExpanded) {
            document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
        }
    });

    // --- CONTACT FORM ---
    document.getElementById('contactForm').addEventListener('submit', e => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.textContent = 'Wysłano!';
        btn.style.background = '#66bb6a';
        setTimeout(() => { btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>Wyślij wiadomość'; btn.style.background=''; e.target.reset(); }, 2000);
    });
});
