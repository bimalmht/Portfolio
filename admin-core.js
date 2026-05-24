/**
 * ===================================================
 * ENTERPRISE CONSOLE ARCHITECTURE - ADMIN-CORE.JS
 * ===================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    const projectForm = document.getElementById('projectForm');
    
    if (projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 1. Safe Element Guard Checking Function
            const getFormElement = (id) => {
                const el = document.getElementById(id);
                if (!el) {
                    throw new Error(`DOM Element Mismatch: The element with id="${id}" was not found in your admin.html form structure.`);
                }
                return el;
            };

            try {
                // 2. Validate token availability safely
                const token = getFormElement('adminToken').value;

                // 3. Extract and check file target structures
                const fileInput = getFormElement('imageFile');
                const file = fileInput.files[0];
                
                if (!file) {
                    alert("Validation Error: Please select an asset image file to upload first.");
                    return;
                }

                if (file.size > 1024 * 1024) { 
                    alert("File Warning: Image exceeds 1MB threshold. Please optimize or compress your graphic asset.");
                    return;
                }

                // File converter utility execution wrapper
                const toBase64 = fileObj => new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(fileObj);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                });

                const finalImagePath = await toBase64(file);

                // 4. Securely extract values checking each element step by step
                const payload = {
                    modal_id: getFormElement('modalId').value,
                    image_path: finalImagePath,
                    category: getFormElement('category').value,
                    title: getFormElement('title').value,
                    desc: getFormElement('projectDesc').value,
                    stack: getFormElement('projectStack').value,
                    result: getFormElement('projectResult').value
                };

                // 5. Stream data array to serverless backend
                const response = await fetch('/projects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': token },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert('Data element securely injected into production schema!');
                    projectForm.reset();
                } else {
                    alert(`Execution Rejected: ${response.status} - Verification signature failure.`);
                }
            } catch (err) {
                console.error("Pipeline Validation Trace Exception:", err);
                // This alert will tell you exactly which input element ID is missing or misspelled!
                alert(err.message);
            }
        });
    }
});

// Pipeline Dataset Synchronizer (Exposed globally for the button click)
async function loadDashboardData() {
    const token = document.getElementById('adminToken').value;
    const container = document.getElementById('messagesContainer');
    const statusBadge = document.getElementById('systemStatusBadge');
    const statusText = document.getElementById('systemStatusText');
    const statsCounter = document.getElementById('statMessagesCount');

    if (!container) return;

    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 gap-3">
            <div class="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p class='text-cyan-400 font-medium text-xs tracking-wider uppercase animate-pulse'>Authorizing mesh pipeline logs...</p>
        </div>
    `;

    try {
        const response = await fetch('/messages', {
            headers: { 'Authorization': token }
        });

        if (!response.ok) throw new Error('Unauthorized');

        const messages = await response.json();
        
        // Swap State Indicators on Verified Connection Match
        statusBadge.className = "h-2 w-2 rounded-full bg-emerald-500 animate-pulse";
        statusText.innerText = "Pipeline Authorized";
        statusText.className = "text-xs font-semibold uppercase tracking-wider text-emerald-400";
        statsCounter.innerText = `${messages.length} Rows Processed`;

        if (messages.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-slate-500 italic text-sm">
                    No log activity currently recorded inside database stack.
                </div>
            `;
            return;
        }

        container.innerHTML = "";
        
        // Loop Rows cleanly into structural elements
        messages.forEach(msg => {
            container.innerHTML += `
                <div class="bg-[#1f2937]/50 border border-slate-800 hover:border-slate-700/80 p-5 rounded-xl transition-all shadow-sm group">
                    <div class="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800/80 pb-3 mb-3 gap-2">
                        <div class="flex flex-col">
                            <span class="font-bold text-white text-base tracking-tight">${msg.name}</span>
                            <span class="text-xs text-cyan-400 font-medium font-mono">${msg.email}</span>
                        </div>
                        <span class="text-[11px] font-semibold text-slate-500 font-mono bg-[#111827] px-2.5 py-1 rounded-md self-start sm:self-center border border-slate-800">
                            ${new Date(msg.created_at).toLocaleString()}
                        </span>
                    </div>
                    <p class="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap selection:bg-cyan-500/30">${msg.message}</p>
                </div>
            `;
        });
    } catch (err) {
        // Handle Mismatch Failures gracefully
        statusBadge.className = "h-2 w-2 rounded-full bg-rose-500 animate-pulse";
        statusText.innerText = "Access Rejected";
        statusText.className = "text-xs font-semibold uppercase tracking-wider text-rose-400";
        statsCounter.innerText = "-- Records Loaded";
        
        container.innerHTML = `
            <div class="bg-rose-950/20 border border-rose-900/40 p-4 rounded-xl text-center">
                <p class="text-rose-400 font-medium text-sm">Authentication Failure: Valid authentication payload mismatch.</p>
            </div>
        `;
    }
}
