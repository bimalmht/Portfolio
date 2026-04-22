const projects = {
    datalake: {
        title: "Nepal's First Data Lake",
        category: "Data Architecture",
        desc: "Implemented a centralized Data Lake for optimized data management, making us the first company in Nepal to achieve this scale of data orchestration.",
        // Match your folder name and filename exactly:
        image: "url('images/PowerBI.png')",
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
    document.getElementById('modalImage').style.backgroundImage = data.image;
    document.getElementById('modalResult').innerText = data.result;

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