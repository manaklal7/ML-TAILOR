// js/designs-admin.js
import { db, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, cloudinaryConfig } from "./firebase.js";

const uploadWidgetBtn = document.getElementById('uploadWidgetBtn');
const uploadStatus = document.getElementById('uploadStatus');
const previewImg = document.getElementById('previewImg');
const saveBtn = document.getElementById('saveBtn');
const uploadDesignForm = document.getElementById('uploadDesignForm');
const adminGalleryGrid = document.getElementById('adminGalleryGrid');

let uploadedImageUrl = ""; 

// --- 1. CLOUDINARY WIDGET SETUP ---
const myWidget = cloudinary.createUploadWidget({
    cloudName: cloudinaryConfig.cloudName, 
    uploadPreset: cloudinaryConfig.uploadPreset,
    sources: ['local', 'camera', 'url'], 
    multiple: false, 
    folder: "ml_tailor_gallery" 
  }, (error, result) => { 
    if (!error && result && result.event === "success") { 
      console.log('Image Info: ', result.info); 
      uploadedImageUrl = result.info.secure_url;
      
      // UI Update
      uploadStatus.innerText = "✅ Upload Successful!";
      uploadStatus.style.color = "green";
      previewImg.src = uploadedImageUrl;
      previewImg.style.display = "block";
      
      saveBtn.disabled = false;
      saveBtn.innerText = "Save to Gallery";
    }
  }
);

if (uploadWidgetBtn) {
    uploadWidgetBtn.addEventListener("click", function() {
        myWidget.open();
    }, false);
}

// --- 2. LOAD CATEGORIES (Upload & Filter dono ke liye) ---
async function loadCategories() {
    const uploadSelect = document.getElementById('designCategory');
    const filterSelect = document.getElementById('adminFilterCategory');
    
    // Agar elements nahi mile (page load error), to ruk jao
    if(!uploadSelect) return;

    // Pehle options clear karo
    uploadSelect.innerHTML = '';
    if(filterSelect) filterSelect.innerHTML = '<option value="All">All Categories</option>';

    try {
        const q = query(collection(db, "categories"), orderBy("name"));
        const snap = await getDocs(q);
        
        snap.forEach(d => {
            const catName = d.data().name;
            
            // Upload Dropdown me add karo
            uploadSelect.innerHTML += `<option value="${catName}">${catName}</option>`;
            
            // Filter Dropdown me add karo
            if(filterSelect) filterSelect.innerHTML += `<option value="${catName}">${catName}</option>`;
        });

    } catch (e) {
        console.error("Error loading categories:", e);
    }
}
// Page khulte hi categories load karo
loadCategories();


// --- 3. SAVE TO FIREBASE ---
if (uploadDesignForm) {
    uploadDesignForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!uploadedImageUrl) {
            alert("Please upload an image first!");
            return;
        }

        saveBtn.innerText = "Saving...";
        
        try {
            await addDoc(collection(db, "designs"), {
                imageUrl: uploadedImageUrl,
                category: document.getElementById('designCategory').value, // Ab ye dynamic hai
                description: document.getElementById('designDesc').value,
                uploadedAt: new Date().toISOString()
            });

            alert("Design added to Gallery!");
            
            // Reset Form
            uploadDesignForm.reset();
            uploadedImageUrl = "";
            previewImg.style.display = "none";
            uploadStatus.innerText = "No image selected";
            saveBtn.disabled = true;
            
            // Refresh Grid
            loadAdminDesigns();

        } catch (error) {
            console.error("Error saving design:", error);
            alert("Error: " + error.message);
        }
    });
}

// --- 4. LOAD DESIGNS (With Filter Support) ---
async function loadAdminDesigns() {
    if(!adminGalleryGrid) return;

    adminGalleryGrid.innerHTML = '<p>Loading...</p>';

    try {
        const q = query(collection(db, "designs"), orderBy("uploadedAt", "desc"));
        const querySnapshot = await getDocs(q);

        adminGalleryGrid.innerHTML = '';

        if (querySnapshot.empty) {
            adminGalleryGrid.innerHTML = '<p>No designs found.</p>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const docId = docSnap.id;

            // Note: Humne class "design-card-admin" aur attribute "data-category" add kiya hai filter ke liye
            const card = `
                <div class="card design-card-admin" data-category="${data.category}">
                    <img src="${data.imageUrl}" alt="Design" style="height: 150px; width: 100%; object-fit: cover; border-radius: 4px;">
                    <h4>${data.category}</h4>
                    <p style="font-size: 0.8rem;">${data.description || ''}</p>
                    <button class="btn btn-small btn-secondary" style="background: #d32f2f; margin-top: 10px;" onclick="deleteDesign('${docId}')">Delete</button>
                </div>
            `;
            adminGalleryGrid.innerHTML += card;
        });

    } catch (error) {
        console.error("Error loading gallery:", error);
    }
}

// --- 5. FILTER FUNCTION ---
window.filterAdminDesigns = function() {
    const selected = document.getElementById('adminFilterCategory').value;
    const cards = document.querySelectorAll('.design-card-admin');

    cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        
        if(selected === "All" || cardCat === selected) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// --- 6. DELETE FUNCTION ---
window.deleteDesign = async function(docId) {
    if(!confirm("Are you sure you want to remove this design?")) return;

    try {
        await deleteDoc(doc(db, "designs", docId));
        loadAdminDesigns(); 
    } catch (error) {
        alert("Error deleting: " + error.message);
    }
}

// Initial Load
loadAdminDesigns();