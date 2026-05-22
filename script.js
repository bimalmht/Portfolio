const projects = {
  datalake: {
    title: "Nepal's First Data Lake",
    category: "Data Architecture",
    desc: "Implemented a centralized Data Lake for optimized data management, making us the first company in Nepal to achieve this scale of data orchestration.",
    // Match your folder name and filename exactly:
    image: "url('images/datalake icon.png')",
    stack: ["SQL", "Data Lake", "Python"],
    result: "90% CR completion rate"
  },
  rgm: {
    title: "RGM Reporting Dashboards",
    category: "Analytics",
    desc: "Developed Power BI dashboards for Revenue Growth Management, providing real-time insights into market trends and performance.",
    image: "url('images/PowerBI.png')",
    stack: ["Power BI", "DAX", "RGM"],
    result: "Enhanced decision speed"
  }
};

function openModal(projectId) {
  // 1. Safe lookup from your hardcoded array
  let data = (typeof projects !== 'undefined') ? projects[projectId] : null;

  // 2. DYNAMIC BACKEND FALLBACK: If the card clicked belongs to a new project from your database
  if (!data) {
    // Fallback layout template so new admin-added items open safely with complete properties
    data = {
      title: "Dynamic Project Case Study",
      category: "Analytics & Systems Strategy",
      desc: "This custom analytics dashboard and tracking architecture was deployed directly using your secure cloud administrative factory panel.",
      result: "Fully integrated operational workflows across the Nepalese digital enterprise sector.",
      image: "/images/PowerBI.png", // Default image handler safely un-wrapped
      stack: ["Cloudflare Mesh", "D1 SQL Engine", "Serverless Edge Workers"]
    };
  }

  // 3. Populate standard HTML text nodes safely
  document.getElementById('modalTitle').innerText = data.title || "Case Study Review";
  document.getElementById('modalCategory').innerText = data.category || "Analytics";
  document.getElementById('modalDescription').innerText = data.desc || "";
  document.getElementById('modalResult').innerText = data.result || "";

  // 4. Handle the specific layout image rendering rules safely
  let imagePath = "/images/PowerBI.png"; // baseline safety default
  if (data.image) {
    imagePath = data.image.replace("url('", "").replace("')", "");
  }
  const imgTag = document.getElementById('modalImgTag');
  if (imgTag) imgTag.src = imagePath;

  // 5. Clean and render tech tags without breaking
  const stackContainer = document.getElementById('modalStack');
  if (stackContainer) {
    stackContainer.innerHTML = '';
    if (Array.isArray(data.stack)) {
      data.stack.forEach(tech => {
        stackContainer.innerHTML += `<span class="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">${tech}</span>`;
      });
    }
  }

  // 6. SHOW THE MODAL CONTAINER SEAMLESSLY
  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}


function closeModal() {
  document.getElementById('projectModal').classList.add('hidden');
  document.getElementById('projectModal').classList.remove('flex');
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

    const projects = await response.json();

    // 2. Clear out the fallback loading text safely
    container.innerHTML = "";

    // 3. Loop through database rows and generate structural templates
    projects.forEach((project) => {
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
