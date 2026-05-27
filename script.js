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

// ==========================================
// INTERACTIVE ANTIGRAVITY ENGINE BACKGROUND
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('home');
  
  if (container) {
    const canvas = document.createElement('canvas');
    canvas.id = 'antigravity-canvas';
    
    // Absolute layout abstraction tracking parent coordinates
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';
    canvas.style.pointerEvents = 'none'; // Keeps interactive text blocks and CTA links responsive

    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let particles = [];
    const mouse = { x: null, y: null, radius: 140 };

    function resizeCanvas() {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track cursor vectors crossing the container layer
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    container.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Interactive mouse tracking node logic
        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.hypot(dx, dy);
          if (distance < mouse.radius) {
            this.x -= dx * 0.02;
            this.y -= dy * 0.02;
          }
        }
      }
      draw() {
        // Dynamic lighting rules checking document mode configuration runtime matrices
        ctx.fillStyle = document.documentElement.classList.contains('dark') 
          ? 'rgba(6, 182, 212, 0.4)' 
          : 'rgba(14, 165, 233, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function init() {
      particles = [];
      const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 9000));
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }
    init();

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const isDark = document.documentElement.classList.contains('dark');
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        // Link engine calculating node distances to draw fine mesh vectors
        for (let j = i + 1; j < particles.length; j++) {
          let dx = particles[i].x - particles[j].x;
          let dy = particles[i].y - particles[j].y;
          let dist = Math.hypot(dx, dy);
          
          if (dist < 110) {
            ctx.strokeStyle = isDark 
              ? `rgba(6, 182, 212, ${0.15 * (1 - dist/110)})` 
              : `rgba(14, 165, 233, ${0.12 * (1 - dist/110)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    }
    animate();
  }
});

// Add this inside your public script.js file
document.addEventListener("DOMContentLoaded", () => {
    // Silently notify the D1 backend database of a new page impression
    fetch('/api/analytics', { method: 'POST' }).catch(err => console.log("Analytics muted."));
});

// PUBLIC TRAFFIC GRAPH ENGINE
// ==========================================
async function renderPublicTrafficGraph() {
    const ctx = document.getElementById('publicTrafficChart');
    if (!ctx) return;

    try {
        const response = await fetch('/api/public-analytics');
        if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
        
        const data = await response.json();
        
        // --- TEST LOGGER ---
        console.log("📊 Public Analytics Payload Received:", data);

        if (!data || data.length === 0) {
            console.warn("⚠️ Analytics array is completely empty. Graph rendering bypassed.");
            // Optional: Draw a temporary visual notice so you know the pipeline is empty
            ctx.parentElement.innerHTML = `<p style="color:#64748b; text-align:center; padding-top:100px; font-style:italic;">Awaiting initial traffic logs to compile telemetry...</p>`;
            return;
        }

        const labels = data.map(item => {
            const dateObj = new Date(item.date);
            return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
        });
        const counts = data.map(item => item.count);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Impressions',
                    data: counts,
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.05)',
                    borderWidth: 3,
                    tension: 0.3,
                    pointBackgroundColor: '#06b6d4',
                    pointHoverRadius: 6,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#64748b', stepSize: 1, beginAtZero: true }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#64748b' }
                    }
                }
            }
        });
    } catch (err) {
        console.error("❌ Public Graph Engine Crashed:", err);
    }
}

// Hook into your existing layout lifecycle event loader
document.addEventListener("DOMContentLoaded", renderPublicTrafficGraph);