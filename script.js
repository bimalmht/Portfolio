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