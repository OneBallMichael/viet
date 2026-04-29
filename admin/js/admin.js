const PASS = 'admin123';
const API = '../api/menu.php';
const CAT_LABELS = {zupy:'Zupy',sajgonki:'Sajgonki',kalmary:'Kalmary',kurczak:'Kurczak',wieprzowina:'Wieprzowina',wolowina:'Wołowina',kaczka:'Kaczka',udko_kurczaka:'Udko z kurczaka',krewetki:'Krewetki',makaron_chinski:'Makaron chiński',makaron_sojowy:'Makaron sojowy',makaron_ryzowy:'Makaron ryżowy',tofu:'Tofu',makaron_udon:'Makaron Udon',pad_thai:'Pad Thai',ryz_smazony:'Ryż smażony',kurczak_z_grilla:'Kurczak z grilla',pierogi:'Pierogi',ryba:'Ryba Tilapia',schab:'Schab',wegorz:'Węgorz',kurczak_w_panierce:'Kurczak w panierce',kurczak_w_ciescie:'Kurczak w cieście',boxy:'Boxy',dodatki:'Dodatki',napoje:'Napoje',nowosci:'Nowości'};
const TAG_CLASSES = {ostre:'tag-ostre',wege:'tag-wege',owoce_morza:'tag-owoce_morza',nowosc:'tag-nowosc',box:'tag-box'};
let menuData = [], searchQ = '';

// Login
document.getElementById('loginBtn').addEventListener('click', tryLogin);
document.getElementById('loginPass').addEventListener('keydown', e => { if(e.key==='Enter') tryLogin(); });
function tryLogin(){
    const p = document.getElementById('loginPass').value;
    if(p===PASS){ sessionStorage.setItem('auth','1'); showPanel(); }
    else { document.getElementById('loginError').style.display='block'; }
}
if(sessionStorage.getItem('auth')==='1') showPanel();
function showPanel(){
    document.getElementById('loginScreen').style.display='none';
    document.getElementById('adminPanel').style.display='block';
    loadMenu();
}
document.getElementById('logoutBtn').addEventListener('click', ()=>{
    sessionStorage.removeItem('auth');
    document.getElementById('adminPanel').style.display='none';
    document.getElementById('loginScreen').style.display='flex';
    document.getElementById('loginPass').value='';
});

// Load menu
async function loadMenu(){
    try{
        // Try API first, fall back to JSON file
        let res;
        try { res = await fetch(API); } catch(e) { res = await fetch('../data/menu.json'); }
        menuData = await res.json();
        renderTable();
    } catch(e){ document.getElementById('menuBody').innerHTML='<tr><td colspan="6" style="text-align:center;color:#6a6a7a">Błąd ładowania danych</td></tr>'; }
}

function renderTable(){
    const filtered = searchQ ? menuData.filter(d=>d.name.toLowerCase().includes(searchQ)) : menuData;
    document.getElementById('totalItems').textContent = menuData.length;
    document.getElementById('totalCats').textContent = new Set(menuData.map(d=>d.category)).size;
    const body = document.getElementById('menuBody');
    body.innerHTML = filtered.map(d=>{
        const tags = d.tags.map(t=>`<span class="tag ${TAG_CLASSES[t]||''}">${t}</span>`).join('');
        const price = d.prices ? Object.entries(d.prices).map(([k,v])=>`${k}: ${v}zł`).join(', ') : (d.price !== null ? d.price+' zł' : '-');
        return `<tr>
            <td>${d.id}</td><td>${d.name}</td><td>${CAT_LABELS[d.category]||d.category}</td>
            <td>${price}</td><td>${tags||'-'}</td>
            <td><div class="action-btns">
                <button class="action-btn" onclick="editItem(${d.id})" title="Edytuj"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                <button class="action-btn delete" onclick="deleteItem(${d.id})" title="Usuń"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
            </div></td></tr>`;
    }).join('');
}

document.getElementById('adminSearch').addEventListener('input', e=>{ searchQ=e.target.value.toLowerCase(); renderTable(); });

// Modal
const modal = document.getElementById('modal');
const form = document.getElementById('itemForm');
document.getElementById('addBtn').addEventListener('click', ()=>{ openModal(); });
document.getElementById('cancelBtn').addEventListener('click', ()=>{ modal.classList.remove('open'); });
modal.addEventListener('click', e=>{ if(e.target===modal) modal.classList.remove('open'); });

function openModal(item=null){
    document.getElementById('modalTitle').textContent = item ? 'Edytuj danie' : 'Dodaj danie';
    document.getElementById('itemId').value = item ? item.id : '';
    document.getElementById('itemName').value = item ? item.name : '';
    document.getElementById('itemCategory').value = item ? item.category : 'zupy';
    document.getElementById('itemPrice').value = item && item.price ? item.price : '';
    document.querySelectorAll('.checkbox-group input').forEach(cb => {
        cb.checked = item ? item.tags.includes(cb.value) : false;
    });
    modal.classList.add('open');
}

window.editItem = function(id){
    const item = menuData.find(d=>d.id===id);
    if(item) openModal(item);
};

window.deleteItem = async function(id){
    if(!confirm('Czy na pewno usunąć to danie?')) return;
    try{
        await fetch(API,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
    } catch(e){}
    // Also update locally
    menuData = menuData.filter(d=>d.id!==id);
    renderTable();
};

form.addEventListener('submit', async e=>{
    e.preventDefault();
    const id = document.getElementById('itemId').value;
    const tags = [];
    document.querySelectorAll('.checkbox-group input:checked').forEach(cb=>tags.push(cb.value));
    const data = {
        name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        price: document.getElementById('itemPrice').value ? parseFloat(document.getElementById('itemPrice').value) : null,
        prices: null,
        tags
    };
    try{
        if(id){ // edit
            data.id = parseInt(id);
            await fetch(API,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
            const idx = menuData.findIndex(d=>d.id===data.id);
            if(idx>=0) menuData[idx] = {...menuData[idx], ...data};
        } else { // add
            const res = await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
            const newItem = await res.json();
            menuData.push(newItem);
        }
    } catch(e){
        // If API unavailable, update locally only
        if(id){
            const idx = menuData.findIndex(d=>d.id===parseInt(id));
            if(idx>=0) menuData[idx] = {...menuData[idx], ...data, id:parseInt(id)};
        } else {
            const maxId = Math.max(0,...menuData.map(d=>d.id));
            menuData.push({...data, id:maxId+1});
        }
    }
    modal.classList.remove('open');
    renderTable();
});
