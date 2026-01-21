// js/designs.js
import { db, collection, getDocs, query, orderBy } from "./firebase.js";

const galleryGrid = document.getElementById('design-gallery');
const servicesList = document.getElementById('services-list');
const filterContainer = document.getElementById('category-filters');

// 1. Function to Load Services (Categories)
async function loadServices() {
    if(!servicesList) return; // Agar hum index page par nahi hain to ruk jao

    servicesList.innerHTML = '<p>Loading...</p>';
    
    try {
        // Categories collection se data lao
        const q = query(collection(db, "categories"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        
        servicesList.innerHTML = ''; // Clear loading text
        
        if (querySnapshot.empty) {
            servicesList.innerHTML = '<p>No services listed yet.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // HTML create karna
            const card = `
                <div class="card" style="text-align: left;">
                    <h4>${data.name}</h4>
                    <p style="color: #666; font-size: 0.9rem;">Starting from: ₹${data.basePrice || 'On Request'}</p>
                </div>
            `;
            servicesList.innerHTML += card;

            // Filter Buttons bhi yahi add kar dete hain gallery ke liye
            if(filterContainer) {
                const btn = document.createElement('button');
                btn.className = 'btn btn-small btn-secondary';
                btn.innerText = data.name;
                btn.style.marginRight = '5px';
                btn.onclick = () => filterDesigns(data.name);
                filterContainer.appendChild(btn);
            }
        });

    } catch (error) {
        console.error("Error loading services:", error);
        servicesList.innerHTML = '<p>Error loading data.</p>';
    }
}

// 2. Function to Load Designs (Gallery)
async function loadDesigns() {
    if(!galleryGrid) return;

    galleryGrid.innerHTML = '<p>Loading latest trends...</p>';

    try {
        const q = query(collection(db, "designs"), orderBy("uploadedAt", "desc"));
        const querySnapshot = await getDocs(q);

        galleryGrid.innerHTML = '';
        
        if (querySnapshot.empty) {
            galleryGrid.innerHTML = '<p>No designs uploaded yet. Check back soon!</p>';
            window.allDesigns = []; // Empty array
            return;
        }

        let designsHTML = '';
        window.allDesigns = []; // Store locally for filtering

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Local storage me save karo filter ke liye
            window.allDesigns.push(data);

            designsHTML += `
                <div class="card design-card" data-category="${data.category}">
                    <img src="${data.imageUrl}" alt="${data.category}">
                    <h4>${data.category}</h4>
                    <p>${data.description || ''}</p>
                </div>
            `;
        });
        galleryGrid.innerHTML = designsHTML;

    } catch (error) {
        console.error("Error loading designs:", error);
        galleryGrid.innerHTML = '<p>Error loading gallery.</p>';
    }
}

// 3. Filter Function (Global window object me dalna padega taaki HTML onclick kaam kare)
window.filterDesigns = function(category) {
    const allCards = document.querySelectorAll('.design-card');
    
    allCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Page Load hone par run karo
document.addEventListener('DOMContentLoaded', () => {
    loadServices();
    loadDesigns();
});