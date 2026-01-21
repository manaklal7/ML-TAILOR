// js/orders.js
import { db, collection, query, where, getDocs } from "./firebase.js";

const trackBtn = document.getElementById('trackBtn');
const orderInput = document.getElementById('orderInput');
const resultArea = document.getElementById('resultArea');
const errorMsg = document.getElementById('errorMsg');

// Elements to update
const orderStatusText = document.getElementById('orderStatusText');
const outfitName = document.getElementById('outfitName');
const customerName = document.getElementById('customerName');

// Status Steps logic
const steps = ['Cutting Started', 'Stitching', 'Ready for Trial', 'Completed'];
const stepIds = ['step-cutting', 'step-stitching', 'step-trial', 'step-completed'];

if (trackBtn) {
    trackBtn.addEventListener('click', async () => {
        const orderId = orderInput.value.trim();
        
        if (!orderId) {
            alert("Please enter Order ID");
            return;
        }

        // Reset UI
        resultArea.style.display = 'none';
        errorMsg.style.display = 'none';
        trackBtn.innerText = "Checking...";

        try {
            // Firestore Query: Find order where orderId == input
            const q = query(collection(db, "orders"), where("orderId", "==", orderId));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                errorMsg.style.display = 'block';
                trackBtn.innerText = "Track Status";
                return;
            }

            // Data mil gaya
            const orderData = querySnapshot.docs[0].data();
            
            // UI Update
            resultArea.style.display = 'block';
            orderStatusText.innerText = "Status: " + orderData.status;
            outfitName.innerText = orderData.outfitType;
            // Privacy: Sirf First name dikhana (Space se split karke pehla word)
            customerName.innerText = orderData.customerName.split(" ")[0] + "***";

            // Update Progress Bar (Steps)
            updateProgressBar(orderData.status);
            
            trackBtn.innerText = "Track Status";

        } catch (error) {
            console.error("Tracking Error:", error);
            alert("Something went wrong. Check console.");
            trackBtn.innerText = "Track Status";
        }
    });
}

function updateProgressBar(currentStatus) {
    // Reset all
    stepIds.forEach(id => document.getElementById(id).classList.remove('active'));

    // Find index of current status
    let statusIndex = steps.indexOf(currentStatus);
    
    // Agar status steps me nahi hai (e.g. "Pending"), to kuch mat highlight karo
    if (statusIndex === -1) return;

    // Highlight current and previous steps
    for (let i = 0; i <= statusIndex; i++) {
        document.getElementById(stepIds[i]).classList.add('active');
    }
}