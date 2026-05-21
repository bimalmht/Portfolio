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
    const data = projects[projectId];

    document.getElementById('modalTitle').innerText = data.title;
    document.getElementById('modalCategory').innerText = data.category;
    document.getElementById('modalDescription').innerText = data.desc;
    document.getElementById('modalResult').innerText = data.result;

    // THE FIX: Set the 'src' of the image tag instead of background-image
    // We remove the url('') wrapper from the string
    const imagePath = data.image.replace("url('", "").replace("')", "");
    document.getElementById('modalImgTag').src = imagePath;

    // Clear and fill tech stack
    const stackContainer = document.getElementById('modalStack');
    stackContainer.innerHTML = '';
    data.stack.forEach(tech => {
        stackContainer.innerHTML += `<span class="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">${tech}</span>`;
    });

    document.getElementById('projectModal').classList.remove('hidden');
    document.getElementById('projectModal').classList.add('flex');
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
  const contactForm = document.querySelector('form[action*="formspree.io"]');

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      // 1. Prevent the page from reloading or redirecting to Formspree
      e.preventDefault();

      // 2. Find the submit button and show a loading state
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = "Sending Message...";

      // 3. Gather form field inputs dynamically
      const formData = {
        name: contactForm.querySelector('input[name="name"]').value,
        email: contactForm.querySelector('input[name="email"]').value,
        message: contactForm.querySelector('textarea[name="message"]').value,
      };

      try {
        // 4. Dispatch payload securely to your serverless Cloudflare Workers route
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          // 5. Success behavior: clear form and notify sender
          alert("Thanks, Bimal will look into this shortly!");
          contactForm.reset();
        } else {
          const errorText = await response.text();
          throw new Error(errorText || "Server error occurred");
        }
      } catch (error) {
        // 6. Handle errors cleanly without crashing the UI
        console.error("Submission failed:", error);
        alert("Oops! Something went wrong. Please try again later.");
      } finally {
        // 7. Restore submit button functionality
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
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
    const response = await fetch("/api/projects");
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
