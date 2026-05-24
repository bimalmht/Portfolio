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

                // INSIDE YOUR EXISTING SUBMIT EVENT LISTENER PRECISELY LOOK FOR THE payload ASSEMBLER:
                const finalImagePath = file ? await toBase64(file) : existingProjectTargetImage;

                const payload = {
                    modal_id: document.getElementById('modalId').value,
                    image_path: file ? finalImagePath : (adminProjectsCache.find(p => p.modal_id === document.getElementById('modalId').value)?.image_path || ""),
                    category: document.getElementById('category').value,
                    title: document.getElementById('title').value,
                    desc: document.getElementById('projectDesc').value,
                    stack: document.getElementById('projectStack').value,
                    result: document.getElementById('projectResult').value
                };

                // --- MULTI-METHOD SELECTION BLOCK CONFIGURATION ADDED HERE ---
                const requestMethod = isEditMode ? 'PUT' : 'POST';

                console.log(`Sending data via HTTP Method: ${requestMethod}`, payload);

                const response = await fetch('/projects', {
                    method: requestMethod, // Handles both creating or updating dynamically based on state
                    headers: { 'Content-Type': 'application/json', 'Authorization': token },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert(isEditMode ? 'Data element cleanly updated in production cluster!' : 'Data element securely injected!');

                    // Reset Form to native default creation parameters state
                    projectForm.reset();
                    document.getElementById('modalId').disabled = false;
                    document.getElementById('imageFile').required = true;

                    isEditMode = false;
                    const submitBtn = document.querySelector('#projectForm button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.innerText = "Inject Row Matrix";
                        submitBtn.style.background = "linear-gradient(to right, #0891b2, #2563eb)";
                    }

                    // Refresh view lists
                    loadAdminProjectsTable();
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

        // ==========================================
        // TRIGGER YOUR NEW PROJECTS TABLE MANAGEMENT
        // ==========================================
        loadAdminProjectsTable();

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
// Global variable cache to manage rows state changes
let adminProjectsCache = [];
let isEditMode = false;

// 1. DYNAMIC DATA LIST LOADER (Call this right after verifying Connect authentication matching)
async function loadAdminProjectsTable() {
    const tbody = document.getElementById('adminProjectsTableBody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:24px; color:#06b6d4;">Syncing workspace metrics...</td></tr>`;

    try {
        // Fetch raw elements
        const response = await fetch('/projects');
        if (!response.ok) throw new Error("Failed extraction payload link");

        adminProjectsCache = await response.json();
        tbody.innerHTML = "";

        if (adminProjectsCache.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:24px; color:#64748b; font-style:italic;">No project database nodes active.</td></tr>`;
            return;
        }

        adminProjectsCache.forEach(project => {
            const row = document.createElement('tr');
            row.style.borderBottom = "1px solid #1f2937";
            row.className = "hover:bg-slate-800/20";

            row.innerHTML = `
                <td style="padding: 14px 8px; font-weight:600; color:white;">${project.title}</td>
                <td style="padding: 14px 8px; color:#94a3b8;">${project.category}</td>
                <td style="padding: 14px 8px; text-align: right; display:flex; gap:8px; justify-content:flex-end;">
                    <button onclick="prepareEditForm('${project.modal_id}')" style="background:transparent; border:1px solid #06b6d4; color:#06b6d4; padding:6px 12px; font-size:12px;">Edit</button>
                    <button onclick="deleteProjectNode('${project.modal_id}')" style="background:#ef4444; color:white; padding:6px 12px; font-size:12px;">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:24px; color:#f43f5e;">Synchronization Failed.</td></tr>`;
    }
}

// 2. FILL FORM FIELDS READY FOR UPDATE
function prepareEditForm(modalId) {
    const project = adminProjectsCache.find(p => p.modal_id === modalId);
    if (!project) return;

    // Force values into form inputs
    document.getElementById('modalId').value = project.modal_id;
    document.getElementById('modalId').disabled = true; // Block reference identity altering
    document.getElementById('category').value = project.category || "";
    document.getElementById('title').value = project.title || "";
    document.getElementById('projectDesc').value = project.desc || "";
    document.getElementById('projectStack').value = project.stack || "";
    document.getElementById('projectResult').value = project.result || "";

    // Switch the image field accessibility since it's an update (make file input non-required for edits)
    document.getElementById('imageFile').required = false;

    // Toggle form button state indicator visual cues
    isEditMode = true;
    const submitBtn = document.querySelector('#projectForm button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerText = "Apply Updates to Matrix";
        submitBtn.style.background = "linear-gradient(to right, #10b981, #059669)";
    }

    // Scroll window up to form smoothly
    document.getElementById('projectForm').scrollIntoView({ behavior: 'smooth' });
}

// 3. DELETE EXECUTION ROUTE PIPELINE
async function deleteProjectNode(modalId) {
    if (!confirm(`Warning: Are you absolutely sure you want to drop project slot identity [${modalId}]? This action cannot be undone.`)) return;

    const token = document.getElementById('adminToken').value;

    try {
        const response = await fetch(`/projects?modal_id=${modalId}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });

        if (response.ok) {
            alert("Record successfully dropped out of edge cluster configuration mapping.");
            loadAdminProjectsTable(); // Hot reload local view list table mapping changes layout
        } else {
            alert("Deletion Rejected: Security layer verification check error.");
        }
    } catch (err) {
        console.error(err);
    }
}
