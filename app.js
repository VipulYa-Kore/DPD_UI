const API_BASE = "https://demodpd.kore.ai/";
const ENDPOINTS = [
    "sbaccounts",
    "sbpayees",
    "sbscheduledpayments",
    "sbtransactions",
    "sbcustomers",
    "sblimits",
    "solutionaccounts"
];
const CUSTOM_ORDER = {
    sbaccounts: ["customerId","nameOnAccount","accountName","accountNickname","accountNumber","accountType","status"],
    sbtransactions: ["customerId","nameOnAccount","transactionId","accountNumber"],
    sblimits: ["customerId","nameOnAccount","accountNickname","accountName","accountType","accountNumber"],
    sbpayees: ["CustomerId","nameOnAccount","Name","PayeeID","Nickname","AccountNumber"],
    sbscheduledpayments: ["CustomerId","Type","nameOnAccount","Amount","SourceAccountNumber","TargetAccountNumber"],
    sbcustomers: ["customerId","userId","name","location","email","phone"],
    solutionaccounts: ["id","username","newPassword"]
};

const nav = document.getElementById('nav');
const errorDiv = document.getElementById('error');
const loaderDiv = document.getElementById('loader');
const headerRow = document.getElementById('headerRow');
const filterRow = document.getElementById('filterRow');
const dataBody = document.getElementById('dataBody');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');

let currentEndpoint = ENDPOINTS[0];
let dataRows = [];
let orderedFields = [];
let filters = {};

function renderNav() {
    nav.innerHTML = '';
    ENDPOINTS.forEach(ep => {
        const li = document.createElement('li');
        li.textContent = ep;
        li.setAttribute('role', 'tab');
        li.tabIndex = 0;
        if (ep === currentEndpoint) li.classList.add('active');
        li.onclick = () => {
            if (currentEndpoint === ep) return;
            currentEndpoint = ep;
            filters = {};
            setActiveNav();
            fetchAndRender();
        };
        li.onkeydown = (e) => {
            if(e.key==='Enter' || e.key===' ') li.click();
        };
        nav.appendChild(li);
    });
}

function setActiveNav() {
    for(let li of nav.children) li.classList.remove('active');
    const i = ENDPOINTS.indexOf(currentEndpoint);
    if(i>=0) nav.children[i].classList.add('active');
}

async function fetchAndRender() {
    hideError();
    loaderDiv.style.display = 'block';
    clearTable();
    try {
        const resp = await fetch(API_BASE + currentEndpoint);
        if (!resp.ok) throw new Error(`Failed to fetch '${currentEndpoint}'`);
        const res = await resp.json();
        dataRows = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);

        if (!dataRows.length) {
            dataBody.innerHTML = '<tr><td colspan="100%">No data available</td></tr>';
            loaderDiv.style.display = 'none';
            return;
        }

        // ====== CHANGE START ======
        // Collect all keys from the dataset
        const allKeysSet = new Set();
        dataRows.forEach(r => Object.keys(r).forEach(k => allKeysSet.add(k)));
        const allKeys = [...allKeysSet];

        if (CUSTOM_ORDER[currentEndpoint]) {
            orderedFields = [
                ...CUSTOM_ORDER[currentEndpoint],
                ...allKeys.filter(k => !CUSTOM_ORDER[currentEndpoint].includes(k))
            ];
        } else {
            orderedFields = allKeys;
        }
        // ====== CHANGE END ======

        renderTableHeader();
        renderTableBody();
    } catch (err) {
        showError(err.message);
    } finally {
        loaderDiv.style.display = 'none';
    }
}

function renderTableHeader() {
    headerRow.innerHTML = '';
    filterRow.innerHTML = '';
    orderedFields.forEach(field => {
        const th = document.createElement('th');
        th.textContent = field;
        headerRow.appendChild(th);

        const filterTh = document.createElement('th');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'filter-input';
        input.value = filters[field] || '';
        input.oninput = () => {
            filters[field] = input.value;
            renderTableBody();
        };
        filterTh.appendChild(input);
        filterRow.appendChild(filterTh);
    });
}

function renderTableBody() {
    dataBody.innerHTML = '';
    const filteredRows = dataRows.filter(row => {
        return Object.entries(filters).every(([key, value]) => {
            if (!value) return true;
            const cell = row[key] !== undefined ? String(row[key]) : '';
            return cell.toLowerCase().includes(value.toLowerCase());
        });
    });

    filteredRows.forEach(row => {
        const tr = document.createElement('tr');
        orderedFields.forEach(field => {
            const td = document.createElement('td');
            td.textContent = row[field] !== undefined ? row[field] : '';
            tr.appendChild(td);
        });
        dataBody.appendChild(tr);
    });
}

function clearTable() {
    headerRow.innerHTML = '';
    filterRow.innerHTML = '';
    dataBody.innerHTML = '';
}

function showError(message) {
    errorDiv.style.display = 'block';
    errorDiv.textContent = message;
}

function hideError() {
    errorDiv.style.display = 'none';
}

clearFiltersBtn.onclick = () => {
    filters = {};
    renderTableBody();
};

renderNav();
fetchAndRender();


// old code 
// const API_BASE = "https://demodpd.kore.ai/";
// const ENDPOINTS = ["sbaccounts","sbpayees","sbscheduledpayments","sbtransactions","sbcustomers","sblimits","solutionaccounts"];
// const CUSTOM_ORDER = {
// sbaccounts:      ["customerId","nameOnAccount","accountName","accountNickname","accountNumber","accountType","status"],
// sbtransactions:  ["customerId","nameOnAccount","transactionId","accountNumber"],
// sblimits:        ["customerId","nameOnAccount","accountNickname","accountName","accountType","accountNumber"],
// sbpayees:        ["CustomerId","nameOnAccount","Name","PayeeID","Nickname","AccountNumber"],
// sbscheduledpayments: ["CustomerId","Type","nameOnAccount","Amount","SourceAccountNumber","TargetAccountNumber"],
// sbcustomers:     ["customerId","userId","name","location","email","phone"],
// solutionaccounts: ["id","username","newPassword"]
// };

// const nav = document.getElementById('nav');
// const errorDiv = document.getElementById('error');
// const loaderDiv = document.getElementById('loader');
// const headerRow = document.getElementById('headerRow');
// const filterRow = document.getElementById('filterRow');
// const dataBody = document.getElementById('dataBody');
// const clearFiltersBtn = document.getElementById('clearFiltersBtn');

// let currentEndpoint = ENDPOINTS[0];
// let dataRows = [];
// let orderedFields = [];
// let filters = {};

// function renderNav() {
// nav.innerHTML = '';
// ENDPOINTS.forEach(ep => {
//     const li = document.createElement('li');
//     li.textContent = ep;
//     li.setAttribute('role', 'tab');
//     li.tabIndex = 0;
//     if (ep === currentEndpoint) li.classList.add('active');
//     li.onclick = () => {
//     if (currentEndpoint === ep) return;
//     currentEndpoint = ep;
//     filters = {};
//     setActiveNav();
//     fetchAndRender();
//     };
//     li.onkeydown = (e) => { if(e.key==='Enter' || e.key===' ') li.click(); };
//     nav.appendChild(li);
// });
// }

// function setActiveNav() {
// for(let li of nav.children) li.classList.remove('active');
// const i = ENDPOINTS.indexOf(currentEndpoint);
// if(i>=0) nav.children[i].classList.add('active');
// }

// async function fetchAndRender() {
// hideError();
// loaderDiv.style.display = 'block';
// clearTable();
// try {
//     const resp = await fetch(API_BASE + currentEndpoint);
//     if (!resp.ok) throw new Error(`Failed to fetch '${currentEndpoint}'`);
//     const res = await resp.json();
//     dataRows = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
//     if (!dataRows.length) {
//     dataBody.innerHTML = '<tr><td colspan="100%">No data available.</td></tr>';
//     loaderDiv.style.display = 'none';
//     return;
//     }
//     orderedFields = getOrderedFields(dataRows[0]);
//     renderHeadersAndFilters();
//     renderRows();
//     filters = {};
// } catch (e) {
//     showError(e.message);
// } finally {
//     loaderDiv.style.display = 'none';
// }
// }

// function clearTable() {
// headerRow.innerHTML = '';
// filterRow.innerHTML = '';
// dataBody.innerHTML = '';
// }

// function getOrderedFields(row) {
// const fields = Object.keys(row);
// const customOrder = CUSTOM_ORDER[currentEndpoint] || [];
// const ordered = [];
// customOrder.forEach(f => {
//     if(fields.includes(f)) ordered.push(f);
// });
// fields.forEach(f => {
//     if(!ordered.includes(f)) ordered.push(f);
// });
// return ordered;
// }

// function niceValue(val) {
// if(val==null) return '';
// if(typeof val === 'object') {
//     try {
//     const s = JSON.stringify(val, null, 2);
//     return s.length > 150 ? s.slice(0,150) + '...' : s;
//     } catch { return '[Object]'; }
// }
// if(typeof val === 'string' && val.length > 150) return val.slice(0,150) + '...';
// return val;
// }

// function escapeHtml(text) {
// return ('' + text).replace(/[&<>"']/g, c =>
//     ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;',"'":'&#39;'}[c]));
// }
// function escapeJs(text) {
// return text.replace(/'/g, "\\'");
// }

// function renderHeadersAndFilters() {
// headerRow.innerHTML = '';
// filterRow.innerHTML = '';
// orderedFields.forEach((field,i) => {
//     // Header cell
//     const th = document.createElement('th');
//     th.textContent = field;
//     if(i === 0){
//     th.style.position = 'sticky';
//     th.style.left = '0';
//     th.style.zIndex = '20';
//     th.style.backgroundColor = '#e8f6ff';
//     th.style.boxShadow = '4px 2px 9px -2px #b5dfef77';
//     }
//     headerRow.appendChild(th);
//     // Filter cell
//     const filterTh = document.createElement('th');
//     if(i === 0){
//     filterTh.style.position = 'sticky';
//     filterTh.style.left = '0';
//     filterTh.style.zIndex = '15';
//     filterTh.style.backgroundColor = '#eafaff';
//     }
//     const input = document.createElement('input');
//     input.type = 'text';
//     input.className = 'filter-input';
//     input.value = filters[field] || '';
//     input.placeholder = 'Filter...';
//     input.setAttribute('aria-label', 'Filter '+field);
//     input.oninput = (ev) => {
//     filters[field] = ev.target.value.trim().toLowerCase();
//     applyFilters();
//     };
//     filterTh.appendChild(input);
//     filterRow.appendChild(filterTh);
// });
// }

// function renderRows() {
// dataBody.innerHTML = '';
// dataRows.forEach((row,i)=>{
//     const tr = document.createElement('tr');
//     tr.dataset.row = i;
//     orderedFields.forEach((field,j)=>{
//     const td = document.createElement('td');
//     td.textContent = niceValue(row[field]);
//     if(j === 0){
//         td.style.position = 'sticky';
//         td.style.left = '0';
//         td.style.backgroundColor = '#e0f4fa';
//         td.style.fontWeight = '600';
//         td.style.zIndex = '8';
//         td.style.boxShadow = '2px 0 10px -3px #1976d222';
//         td.style.minWidth = '160px';
//     }
//     if(typeof row[field]==='object' || (typeof row[field]==='string' && row[field].length > 25)){
//         td.title = typeof row[field]==='object' ? JSON.stringify(row[field],null,2) : row[field];
//     }
//     td.ondblclick = () => editCell(td, field, i);
//     tr.appendChild(td);
//     });
//     dataBody.appendChild(tr);
// });
// applyFilters();
// }

// function applyFilters(){
// const trs = dataBody.rows;
// for(let i=0; i<trs.length; i++){
//     const row = dataRows[i];
//     let visible = true;
//     for(const [field,val] of Object.entries(filters)){
//     if(!val) continue;
//     let cellVal = row[field];
//     if(cellVal == null){
//         visible = false;
//         break;
//     }
//     if(typeof cellVal === 'object'){
//         try { cellVal = JSON.stringify(cellVal); } catch { visible = false; break; }
//     }
//     if(!String(cellVal).toLowerCase().includes(val)){
//         visible = false;
//         break;
//     }
//     }
//     trs[i].style.display = visible ? '' : 'none';
// }
// }

// function editCell(td, field, idx){
// if(td.classList.contains('editing')) return;
// const row = dataRows[idx];
// const idField = getIdField(row);
// if(field === idField) return;
// let rawVal = row[field];
// let valToEdit;
// if(typeof rawVal === 'object' && rawVal !== null){
//     try{ valToEdit = JSON.stringify(rawVal,null,2); }
//     catch{ valToEdit = String(rawVal); }
// } else{
//     valToEdit = (rawVal == null) ? '' : String(rawVal);
// }
// td.classList.add('editing');
// td.innerHTML = `
//     <textarea spellcheck="false">${escapeHtml(valToEdit)}</textarea>
//     <button class="save-btn">Save</button>
// `;
// const textarea = td.querySelector('textarea');
// const saveBtn = td.querySelector('button');
// textarea.focus();
// textarea.select();
// textarea.addEventListener('keydown', e => {
//     if(e.key === 'Escape'){
//     td.textContent = niceValue(rawVal);
//     td.classList.remove('editing');
//     }
//     if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); saveBtn.click(); }
// });
// saveBtn.onclick = () => saveEdit(td, field, idx, textarea.value);
// }

// async function saveEdit(td, field, idx, newValStr){
// const row = dataRows[idx];
// const idField = getIdField(row);
// const idVal = row[idField];
// let valToSave = newValStr;
// try { valToSave = JSON.parse(newValStr); } catch {}
// const oldValStr = (() => { try { return JSON.stringify(row[field]); } catch { return String(row[field]); } })();
// const newValSerialized = (() => { try { return JSON.stringify(valToSave); } catch { return String(valToSave);} })();
// if(oldValStr === newValSerialized){
//     td.textContent = niceValue(row[field]);
//     td.classList.remove('editing');
//     return;
// }
// if(typeof row[field] === 'number' && typeof valToSave !== 'number'){
//     const asNum = Number(newValStr);
//     if(!isNaN(asNum)) valToSave = asNum;
// }
// const payload = {[field]: valToSave, "$skipEvents": true};
// try {
//     hideError();
//     td.querySelector('.save-btn').disabled = true;
//     td.querySelector('.save-btn').textContent = 'Saving...';
//     const resp = await fetch(API_BASE + currentEndpoint + '/' + encodeURIComponent(idVal), {
//     method: 'PUT',
//     headers: {
//         'Accept': 'application/json',
//         'Accept-Language': 'en-US,en;q=0.9',
//         'Connection': 'keep-alive',
//         'Content-Type': 'application/json',
//         'Origin': 'https://demodpd.kore.ai'
//     },
//     body: JSON.stringify(payload)
//     });
//     if(!resp.ok){
//     const errText = await resp.text();
//     throw new Error(`Failed to update '${field}': ${resp.status} ${resp.statusText} - ${errText}`);
//     }
//     dataRows[idx][field] = valToSave;
//     td.textContent = niceValue(valToSave);
//     td.classList.remove('editing');
//     applyFilters();
// }catch(e){
//     showError(e.message);
//     td.textContent = niceValue(row[field]);
//     td.classList.remove('editing');
// }
// }

// clearFiltersBtn.onclick = () => {
// filters = {};
// Array.from(filterRow.querySelectorAll('input.filter-input')).forEach(input => input.value = '');
// applyFilters();
// };

// function getIdField(row){
// // typical id keys or fallback to first property
// const possibleIds = ['id', '_id'];
// for(let id of possibleIds){
//     if(row[id]) return id;
// }
// return Object.keys(row)[0];
// }

// function showError(msg){
// errorDiv.style.display = 'block';
// errorDiv.textContent = msg;
// }
// function hideError(){
// errorDiv.style.display = 'none';
// errorDiv.textContent = '';
// }

// renderNav();
// fetchAndRender();

