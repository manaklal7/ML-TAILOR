// js/orders-admin.js
import { db, collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, orderBy, getDoc } from "./firebase.js";

const createOrderForm = document.getElementById('createOrderForm');
const ordersTableBody = document.querySelector('#ordersTable tbody');
const outfitSelect = document.getElementById('outfitType');

// --- 1. LOAD CATEGORIES (Dynamic) ---
async function loadCategoriesInSelect(selectElementId) {
    const selectBox = document.getElementById(selectElementId);
    if (!selectBox) return;

    // Pehle options clear karo (sivaye pehle ke)
    selectBox.innerHTML = '<option value="">Select Outfit...</option>';

    try {
        const q = query(collection(db, "categories"), orderBy("name"));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
            selectBox.innerHTML += `<option value="${doc.data().name}">${doc.data().name}</option>`;
        });
    } catch (e) { console.error(e); }
}
// Load on startup
loadCategoriesInSelect('outfitType');
loadCategoriesInSelect('editOutfit'); // Modal wala select

// --- 2. CREATE NEW ORDER ---
if (createOrderForm) {
    createOrderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = createOrderForm.querySelector('button');
        btn.innerText = "Saving...";
        btn.disabled = true;

        const orderId = "ORD-" + Math.floor(10000 + Math.random() * 90000);
        
        const newOrder = {
            orderId: orderId,
            customerName: document.getElementById('customerName').value,
            mobile: document.getElementById('customerMobile').value,
            outfitType: document.getElementById('outfitType').value,
            notes: document.getElementById('orderNotes').value,
            status: "Pending",
            createdAt: new Date().toISOString()
        };

        try {
            await addDoc(collection(db, "orders"), newOrder);
            alert(`Order Created! ID: ${orderId}`);
            createOrderForm.reset();
            loadOrders();
        } catch (error) { alert("Error: " + error.message); }
        btn.innerText = "Generate Order ID & Save";
        btn.disabled = false;
    });
}

// --- 3. LOAD ORDERS ---
async function loadOrders() {
    ordersTableBody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        ordersTableBody.innerHTML = '';

        if (querySnapshot.empty) {
            ordersTableBody.innerHTML = '<tr><td colspan="6">No orders found.</td></tr>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const order = docSnap.data();
            const docId = docSnap.id;
            const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN');

            const statusOptions = `
                <select class="status-select" onchange="updateOrderStatus('${docId}', this.value)" style="background: ${getStatusColor(order.status)}; color: white;">
                    <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Cutting Started" ${order.status === 'Cutting Started' ? 'selected' : ''}>✂️ Cutting</option>
                    <option value="Stitching" ${order.status === 'Stitching' ? 'selected' : ''}>🧵 Stitching</option>
                    <option value="Ready for Trial" ${order.status === 'Ready for Trial' ? 'selected' : ''}>👗 Ready</option>
                    <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>✅ Completed</option>
                </select>
            `;

            const row = `
                <tr>
                    <td><strong>${order.orderId}</strong></td>
                    <td>${dateStr}</td>
                    <td>${order.customerName}<br><small>${order.mobile}</small></td>
                    <td>${order.outfitType}</td>
                    <td>${statusOptions}</td>
                    <td>
                        <button class="btn btn-small" onclick="openEditModal('${docId}')">✏️ Edit</button>
                        <button class="btn btn-small btn-secondary" onclick="deleteOrder('${docId}')">🗑️</button>
                    </td>
                </tr>
            `;
            ordersTableBody.innerHTML += row;
        });
    } catch (error) { console.error(error); }
}

function getStatusColor(status) {
    if (status === 'Completed') return '#4caf50';
    if (status === 'Ready for Trial') return '#9c27b0';
    if (status === 'Stitching') return '#2196f3';
    if (status === 'Cutting Started') return '#ff9800';
    return '#777';
}

// --- 4. EDIT & DELETE LOGIC ---
window.updateOrderStatus = async function(docId, newStatus) {
    try { await updateDoc(doc(db, "orders", docId), { status: newStatus }); loadOrders(); } 
    catch (e) { alert(e.message); }
}

window.deleteOrder = async function(docId) {
    if(confirm("Delete this order?")) {
        await deleteDoc(doc(db, "orders", docId));
        loadOrders();
    }
}

// Edit Modal Open
window.openEditModal = async function(docId) {
    const docSnap = await getDoc(doc(db, "orders", docId));
    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('editDocId').value = docId;
        document.getElementById('editName').value = data.customerName;
        document.getElementById('editOutfit').value = data.outfitType;
        document.getElementById('editNotes').value = data.notes;
        document.getElementById('editOrderModal').style.display = 'block';
    }
}

// Save Edit
window.saveEditedOrder = async function() {
    const docId = document.getElementById('editDocId').value;
    try {
        await updateDoc(doc(db, "orders", docId), {
            customerName: document.getElementById('editName').value,
            outfitType: document.getElementById('editOutfit').value,
            notes: document.getElementById('editNotes').value
        });
        alert("Order Updated!");
        document.getElementById('editOrderModal').style.display = 'none';
        loadOrders();
    } catch(e) { alert("Error updating: " + e.message); }
}

loadOrders();