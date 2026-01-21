// js/measurements.js
import { db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, getDoc } from "./firebase.js";

const naapForm = document.getElementById('naapForm');
const naapTableBody = document.querySelector('#naapTable tbody');
const searchInput = document.getElementById('searchInput');
let allMeasurements = [];

// Load Categories
async function loadCategoriesInSelect(selectId) {
    const selectBox = document.getElementById(selectId);
    if(!selectBox) return;
    selectBox.innerHTML = '<option value="">Select Outfit...</option>';
    const q = query(collection(db, "categories"), orderBy("name"));
    const snap = await getDocs(q);
    snap.forEach(d => selectBox.innerHTML += `<option value="${d.data().name}">${d.data().name}</option>`);
}
loadCategoriesInSelect('outfitType');
loadCategoriesInSelect('editNaapOutfit');

// 1. ADD NEW
if (naapForm) {
    naapForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = naapForm.querySelector('button');
        btn.innerText = "Saving...";
        btn.disabled = true;

        const newData = {
            name: document.getElementById('custName').value,
            mobile: document.getElementById('custMobile').value,
            outfit: document.getElementById('outfitType').value,
            data: document.getElementById('measurementsData').value,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            await addDoc(collection(db, "measurements"), newData);
            alert("Saved!");
            naapForm.reset();
            loadMeasurements();
        } catch (error) { alert("Error: " + error.message); }
        btn.innerText = "Save to Digital Book";
        btn.disabled = false;
    });
}

// 2. LOAD LIST
async function loadMeasurements() {
    naapTableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
    const q = query(collection(db, "measurements"), orderBy("updatedAt", "desc"));
    const snap = await getDocs(q);
    
    allMeasurements = [];
    snap.forEach(d => {
        let item = d.data();
        item.id = d.id;
        allMeasurements.push(item);
    });
    renderTable(allMeasurements);
}

// 3. RENDER TABLE (Sahi Formatting ke sath)
function renderTable(dataList) {
    naapTableBody.innerHTML = '';
    if (dataList.length === 0) { naapTableBody.innerHTML = '<tr><td colspan="6">No match found.</td></tr>'; return; }

    dataList.forEach(item => {
        const createdDate = new Date(item.createdAt).toLocaleDateString('en-IN');
        const updatedDate = new Date(item.updatedAt || item.createdAt).toLocaleDateString('en-IN');
        
        // "white-space: pre-wrap" se line breaks waise hi dikhenge jaise enter kiya tha
        const row = `
            <tr>
                <td><strong>${item.name}</strong><br><small style="color:#666">Saved: ${createdDate}</small></td>
                <td>${item.mobile}</td>
                <td><span class="badge" style="background:#555">${item.outfit}</span></td>
                <td><div style="white-space: pre-wrap; font-family: monospace; background: #f9f9f9; padding: 5px; border-radius: 4px;">${item.data}</div></td>
                <td><small>Last Upd: ${updatedDate}</small></td>
                <td>
                    <button class="btn btn-small" onclick="openEditNaap('${item.id}')">✏️</button>
                    <button class="btn btn-small btn-secondary" onclick="deleteMeasurement('${item.id}')">🗑️</button>
                </td>
            </tr>
        `;
        naapTableBody.innerHTML += row;
    });
}

// 4. EDIT & DELETE
window.openEditNaap = async function(id) {
    const docSnap = await getDoc(doc(db, "measurements", id));
    if(docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('editNaapId').value = id;
        document.getElementById('editNaapName').value = data.name;
        document.getElementById('editNaapOutfit').value = data.outfit;
        document.getElementById('editNaapData').value = data.data;
        document.getElementById('editNaapModal').style.display = 'block';
    }
}

window.saveEditedNaap = async function() {
    const id = document.getElementById('editNaapId').value;
    try {
        await updateDoc(doc(db, "measurements", id), {
            name: document.getElementById('editNaapName').value,
            outfit: document.getElementById('editNaapOutfit').value,
            data: document.getElementById('editNaapData').value,
            updatedAt: new Date().toISOString()
        });
        alert("Updated!");
        document.getElementById('editNaapModal').style.display = 'none';
        loadMeasurements();
    } catch(e) { alert("Error: " + e.message); }
}

window.deleteMeasurement = async function(id) {
    if(confirm("Delete?")) { await deleteDoc(doc(db, "measurements", id)); loadMeasurements(); }
}

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const txt = e.target.value.toLowerCase();
        const filtered = allMeasurements.filter(i => i.name.toLowerCase().includes(txt) || i.mobile.includes(txt));
        renderTable(filtered);
    });
}

loadMeasurements();