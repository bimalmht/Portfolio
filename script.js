// ==========================================
// DYNAMIC MODAL & PORTFOLIO ENGINE
// ==========================================

// Global cache array to hold fetched projects from D1
let dynamicProjectsCache = [];

function openModal(projectId) {
  // Find the clicked item right out of our D1 database cache
  const data = dynamicProjectsCache.find(project => project.modal_id === projectId);

  // Fallback layout protection if the project isn't found for some reason
  if (!data) {
    console.error(`Project data not found for ID: ${projectId}`);
    return;
  }

  // 1. Populate standard HTML text nodes dynamically from the D1 row
  document.getElementById('modalTitle').innerText = data.title || "Case Study Review";
  document.getElementById('modalCategory').innerText = data.category || "Analytics";
  document.getElementById('modalDescription').innerText = data.desc || "No description provided.";
  document.getElementById('modalResult').innerText = data.result || "Case study under review.";

  // 2. Handle the specific layout image rendering rules safely
  let imagePath = "/images/PowerBI.png"; // your baseline safety default
  if (data.image_path) {
    // If your DB string ever contains url('...'), clean it. Otherwise, use it directly.
    imagePath = data.image_path.replace("url('", "").replace("')", "");
  }
  const imgTag = document.getElementById('modalImgTag');
  if (imgTag) imgTag.src = imagePath;

  // 3. Clean and render tech tags splitting your D1 text string dynamically
  const stackContainer = document.getElementById('modalStack');
  if (stackContainer) {
    stackContainer.innerHTML = '';

    if (data.stack) {
      // Handles both an array format or a comma-separated string seamlessly
      const tagsArray = Array.isArray(data.stack)
        ? data.stack
        : data.stack.split(',').map(tech => tech.trim());

      tagsArray.forEach(tech => {
        if (tech) {
          stackContainer.innerHTML += `<span class="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">${tech}</span>`;
        }
      });
    }
  }

  // 4. SHOW THE MODAL CONTAINER SEAMLESSLY
  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeModal() {
  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}
function updateAvailability() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  let quarter;

  if (month < 3) quarter = "Q1";
  else if (month < 6) quarter = "Q2";
  else if (month < 9) quarter = "Q3";
  else quarter = "Q4";

  const statusText = document.querySelector('.text-emerald-600\\/80');
  if (statusText) {
    statusText.innerText = `Available for ${quarter} ${year} Projects`;
  }
}

// Run it when the page loads
updateAvailability();
const toggleBtn = document.getElementById('darkModeToggle');
const html = document.documentElement;

// Check for saved user preference
if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  html.classList.add('dark');
}

toggleBtn.addEventListener('click', () => {
  html.classList.toggle('dark');

  // Save preference
  if (html.classList.contains('dark')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});
// ==========================================
// DYNAMIC CLOUDFLARE D1 CONTACT FORM HANDLER
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Target the form explicitly using its new ID attribute
  const contactForm = document.getElementById("portfolioContactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      // 1. Intercept standard form browser reload behaviors
      e.preventDefault();

      // 2. Locate the submit action element and activate loading feedback state
      const submitBtn = document.getElementById("submitBtn");
      let originalBtnText = "Send Message";

      if (submitBtn) {
        originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Sending Message...";
      }

      // 3. Extract parameter values explicitly using your precise HTML field IDs
      const formData = {
        name: document.getElementById("contactName").value,
        email: document.getElementById("contactEmail").value,
        message: document.getElementById("contactMessage").value
      };

      try {
        // 4. Asynchronously stream data straight to your compiled serverless route
        const response = await fetch("/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          // 5. Clear inputs and notify sender upon successful D1 insert verification
          alert("Thanks, Bimal will look into this shortly!");
          contactForm.reset();
        } else {
          const errorText = await response.text();
          throw new Error(errorText || "Server logging failure encountered.");
        }
      } catch (error) {
        console.error("Submission failed:", error);
        alert("Oops! Something went wrong. Please try again later.");
      } finally {
        // 6. Release button lock mechanisms and restore native UI styling states
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }
});

// ==========================================
// DYNAMIC CLOUDFLARE D1 FEATURED WORK LOADER
// ==========================================
async function loadDynamicProjects() {
  const container = document.getElementById("featured-work-container");
  if (!container) return;

  try {
    // 1. Fetch live project datasets from the Cloudflare API layer
    const response = await fetch("/projects");
    if (!response.ok) throw new Error("Failed to retrieve projects");

    dynamicProjectsCache = await response.json();

    // 2. Clear out the fallback loading text safely
    container.innerHTML = "";

    // 3. Loop through database rows and generate structural templates
    dynamicProjectsCache.forEach((project) => {
      container.innerHTML += `
        <div onclick="openModal('${project.modal_id}')"
            class="group cursor-pointer bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div class="h-64 flex items-center justify-center bg-slate-100 p-12">
                <img src="${project.image_path}" alt="${project.title}"
                    class="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500">
            </div>
            <div class="p-8">
                <span class="text-cyan-600 text-xs font-bold uppercase tracking-widest">${project.category}</span>
                <h3 class="text-2xl font-bold text-slate-900 mt-2 mb-4">${project.title}</h3>
                <button class="flex items-center gap-2 text-slate-900 font-bold group-hover:gap-4 transition-all">
                    View Case Study <span class="text-cyan-500">→</span>
                </button>
            </div>
        </div>
      `;
    });
  } catch (error) {
    console.error("Error loading portfolio items:", error);
    container.innerHTML = `<p class="text-center text-red-500 col-span-full">Failed to load projects. Please try refreshing.</p>`;
  }
}

// Fire the fetching hook as soon as the DOM tree loads
document.addEventListener("DOMContentLoaded", loadDynamicProjects);
