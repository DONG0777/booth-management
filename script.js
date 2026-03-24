// ================== Global Variables ==================
let currentLanguage = 'bn';
let boothData = [];
let workersData = JSON.parse(localStorage.getItem('workers')) || {};
let opinionsData = JSON.parse(localStorage.getItem('opinions')) || {};
let boothTargets = JSON.parse(localStorage.getItem('boothTargets')) || {};
let myChart = null;
let currentBooth = null;
let currentBoothDetails = null;

// ================== Translations ==================
const translations = {
    bn: {
        chooseOption: "-- একটি বুথ বেছে নিন --",
        noWorkers: "এই বুথে এখনও কোনো কর্মী যুক্ত হয়নি।",
        noOpinions: "এই বুথে এখনও কোনো মতামত রেকর্ড হয়নি।",
        successMsg: "সফলভাবে যুক্ত হয়েছে!",
        updateSuccess: "সফলভাবে আপডেট হয়েছে!",
        deleteSuccess: "সফলভাবে মুছে ফেলা হয়েছে!",
        errorMsg: "ত্রুটি: ",
        required: "সব আবশ্যক ফিল্ড পূরণ করুন",
        duplicatePhone: "এই ফোন নম্বরটি ইতিমধ্যে এই বুথে যুক্ত আছে।",
        analysisNotAvailable: "বিশ্লেষণ দেওয়া নেই",
        strategyNotAvailable: "কৌশল দেওয়া নেই",
        confirmDelete: "আপনি কি নিশ্চিত যে এটি মুছে ফেলতে চান?",
        advice: {
            noOpinions: "এখনও কোনো মতামত রেকর্ড হয়নি। মতামত সংগ্রহ শুরু করুন।"
        }
    },
    hi: {
        chooseOption: "-- एक बूथ चुनें --",
        noWorkers: "इस बूथ के लिए अभी कोई कार्यकर्ता नहीं जोड़ा गया।",
        noOpinions: "इस बूथ के लिए अभी कोई राय दर्ज नहीं की गई।",
        successMsg: "सफलतापूर्वक जोड़ा गया!",
        updateSuccess: "सफलतापूर्वक अपडेट किया गया!",
        deleteSuccess: "सफलतापूर्वक हटा दिया गया!",
        errorMsg: "त्रुटि: ",
        required: "सभी आवश्यक फ़ील्ड भरें",
        duplicatePhone: "यह फोन नंबर पहले से इस बूथ में जोड़ा गया है।",
        analysisNotAvailable: "विश्लेषण नहीं दिया गया",
        strategyNotAvailable: "रणनीति नहीं दी गई",
        confirmDelete: "क्या आप वाकई इसे हटाना चाहते हैं?",
        advice: { noOpinions: "अभी कोई राय दर्ज नहीं की गई। प्रतिक्रिया एकत्र करना शुरू करें।" }
    },
    en: {
        chooseOption: "-- Choose a booth --",
        noWorkers: "No workers added for this booth yet.",
        noOpinions: "No opinions recorded for this booth yet.",
        successMsg: "Added successfully!",
        updateSuccess: "Updated successfully!",
        deleteSuccess: "Deleted successfully!",
        errorMsg: "Error: ",
        required: "All required fields must be filled",
        duplicatePhone: "This phone number is already added for this booth.",
        analysisNotAvailable: "No analysis provided",
        strategyNotAvailable: "No strategy provided",
        confirmDelete: "Are you sure you want to delete this item?",
        advice: { noOpinions: "No opinions recorded yet. Start collecting feedback." }
    }
};

// ================== Language Functions ==================
function setLanguage(lang) {
    currentLanguage = lang;
    const select = document.getElementById('boothSelect');
    if (select) {
        const defaultOption = select.querySelector('option[value=""]');
        if (defaultOption) defaultOption.textContent = translations[lang].chooseOption;
    }
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (key === 'en' || key === 'hi' || key === 'bn') {
            el.style.display = (key === lang) ? 'inline' : 'none';
        }
    });
    document.getElementById('langBn')?.classList.toggle('active', lang === 'bn');
    document.getElementById('langHi')?.classList.toggle('active', lang === 'hi');
    document.getElementById('langEn')?.classList.toggle('active', lang === 'en');
}

// ================== Countdown Timer ==================
function updateCountdown() {
    const electionDate = new Date(2026, 2, 24);
    const today = new Date();
    const diffTime = electionDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysLeftElement = document.getElementById('daysLeft');
    if (daysLeftElement) {
        daysLeftElement.textContent = diffDays > 0 ? diffDays : 0;
    }
    if (diffDays <= 30 && diffDays > 0 && diffDays % 7 === 0) {
        showNotification(`⚠️ মাত্র ${diffDays} দিন বাকি! জরুরি প্রস্তুতি নিন।`);
    }
}

// ================== Dashboard Updates ==================
function updateDashboard() {
    if (!boothData.length) return;
    document.getElementById('totalBooths').textContent = boothData.length;
    let criticalCount = 0, swingCount = 0, safeCount = 0;
    boothData.forEach(booth => {
        const bjpDiff = (booth.BJP2024 || 0) - (booth.BJP2021 || 0);
        if (bjpDiff < -10) criticalCount++;
        else if (Math.abs(bjpDiff) <= 10) swingCount++;
        else if (bjpDiff > 5) safeCount++;
    });
    document.getElementById('criticalBooths').textContent = criticalCount;
    document.getElementById('swingBooths').textContent = swingCount;
    document.getElementById('safeBooths').textContent = safeCount;
    let totalWorkers = 0, totalOpinions = 0;
    Object.values(workersData).forEach(workers => totalWorkers += workers.length);
    Object.values(opinionsData).forEach(opinions => totalOpinions += opinions.length);
    document.getElementById('totalWorkers').textContent = totalWorkers;
    document.getElementById('totalOpinions').textContent = totalOpinions;
    updateProgressBars(totalWorkers, totalOpinions);
    checkPriorityAlerts(criticalCount, swingCount);
}

function updateProgressBars(workers, opinions) {
    const targetWorkers = 250, targetOpinions = 500, targetContacts = 1000;
    const workerPercent = Math.min(100, Math.round((workers / targetWorkers) * 100));
    const opinionPercent = Math.min(100, Math.round((opinions / targetOpinions) * 100));
    const contactPercent = Math.min(100, Math.round(((workers * 10 + opinions) / targetContacts) * 100));
    const workerProgress = document.getElementById('workerProgress');
    const opinionProgress = document.getElementById('opinionProgress');
    const contactProgress = document.getElementById('contactProgress');
    const workerText = document.getElementById('workerProgressText');
    const opinionText = document.getElementById('opinionProgressText');
    const contactText = document.getElementById('contactProgressText');
    if (workerProgress) workerProgress.style.width = workerPercent + '%';
    if (opinionProgress) opinionProgress.style.width = opinionPercent + '%';
    if (contactProgress) contactProgress.style.width = contactPercent + '%';
    if (workerText) workerText.textContent = workerPercent + '%';
    if (opinionText) opinionText.textContent = opinionPercent + '%';
    if (contactText) contactText.textContent = contactPercent + '%';
}

function checkPriorityAlerts(criticalCount, swingCount) {
    const alertCard = document.getElementById('priorityAlert');
    const alertContent = document.getElementById('alertContent');
    if (criticalCount > 0 || swingCount > 0) {
        alertCard.style.display = 'block';
        let html = '';
        if (criticalCount > 0) html += `<p>🔴 <strong>${criticalCount}টি বিপদজনক বুথ</strong> - ভোটশেয়ার ১০% এর বেশি কমেছে। তাত্ক্ষণিক পদক্ষেপ প্রয়োজন!</p>`;
        if (swingCount > 0) html += `<p>🟡 <strong>${swingCount}টি সুইং বুথ</strong> - এই বুথ জিতলেই জয় নিশ্চিত। বিশেষ টিম পাঠান।</p>`;
        alertContent.innerHTML = html;
    } else {
        alertCard.style.display = 'none';
    }
}

// ================== Booth Ranking ==================
function showRankingTab(tab) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('dangerRanking').style.display = tab === 'danger' ? 'block' : 'none';
    document.getElementById('swingRanking').style.display = tab === 'swing' ? 'block' : 'none';
    document.getElementById('safeRanking').style.display = tab === 'safe' ? 'block' : 'none';
    if (tab === 'danger') loadDangerRanking();
    else if (tab === 'swing') loadSwingRanking();
    else if (tab === 'safe') loadSafeRanking();
}

function loadDangerRanking() {
    const container = document.getElementById('dangerRanking');
    if (!container) return;
    const dangerBooths = boothData.filter(b => ((b.BJP2024 || 0) - (b.BJP2021 || 0)) < -10)
        .sort((a,b) => ((a.BJP2021 - a.BJP2024) - (b.BJP2021 - b.BJP2024)));
    if (dangerBooths.length === 0) { container.innerHTML = '<p class="text-muted">কোনো বিপদজনক বুথ নেই</p>'; return; }
    container.innerHTML = dangerBooths.map(b => `
        <div class="ranking-item" onclick="selectBoothFromRanking('${b.BoothNo}')">
            <div class="booth-name"><strong>${b.BoothNo}</strong> - ${b.BoothName} <small>(${b.Segment})</small></div>
            <div class="booth-change change-negative">⬇️ ${((b.BJP2021 - b.BJP2024) || 0).toFixed(1)}%</div>
        </div>
    `).join('');
}

function loadSwingRanking() {
    const container = document.getElementById('swingRanking');
    if (!container) return;
    const swingBooths = boothData.filter(b => {
        const diff = (b.BJP2024 || 0) - (b.BJP2021 || 0);
        return Math.abs(diff) <= 10 && (b.BJP2024 || 0) < 55;
    }).sort((a,b) => (b.BJP2024 || 0) - (a.BJP2024 || 0));
    if (swingBooths.length === 0) { container.innerHTML = '<p class="text-muted">কোনো সুইং বুথ নেই</p>'; return; }
    container.innerHTML = swingBooths.map(b => `
        <div class="ranking-item" onclick="selectBoothFromRanking('${b.BoothNo}')">
            <div class="booth-name"><strong>${b.BoothNo}</strong> - ${b.BoothName} <small>(${b.Segment})</small></div>
            <div class="booth-change">🎯 ${b.BJP2024}% (লক্ষ্য: ${boothTargets[b.BoothNo] || '55'}%)</div>
        </div>
    `).join('');
}

function loadSafeRanking() {
    const container = document.getElementById('safeRanking');
    if (!container) return;
    const safeBooths = boothData.filter(b => {
        const diff = (b.BJP2024 || 0) - (b.BJP2021 || 0);
        return diff > 5 && (b.BJP2024 || 0) > 55;
    }).sort((a,b) => (b.BJP2024 || 0) - (a.BJP2024 || 0));
    if (safeBooths.length === 0) { container.innerHTML = '<p class="text-muted">নিরাপদ বুথের তালিকা খালি</p>'; return; }
    container.innerHTML = safeBooths.map(b => `
        <div class="ranking-item" onclick="selectBoothFromRanking('${b.BoothNo}')">
            <div class="booth-name"><strong>${b.BoothNo}</strong> - ${b.BoothName} <small>(${b.Segment})</small></div>
            <div class="booth-change change-positive">✅ ${((b.BJP2024 - b.BJP2021) || 0).toFixed(1)}%</div>
        </div>
    `).join('');
}

function selectBoothFromRanking(boothNo) {
    const select = document.getElementById('boothSelect');
    select.value = boothNo;
    loadBoothDetails();
    document.getElementById('boothDetails').scrollIntoView({ behavior: 'smooth' });
}

// ================== Weekly Target ==================
function loadWeeklyTarget() {
    const container = document.getElementById('weeklyTargetList');
    if (!container) return;
    const totalWorkers = Object.values(workersData).reduce((sum, w) => sum + w.length, 0);
    const totalOpinions = Object.values(opinionsData).reduce((sum, o) => sum + o.length, 0);
    const remainingWorkers = 250 - totalWorkers;
    const remainingOpinions = 500 - totalOpinions;
    const weeksLeft = Math.ceil((new Date(2026, 2, 24) - new Date()) / (7 * 24 * 60 * 60 * 1000));
    const perWeekWorkers = Math.ceil(remainingWorkers / Math.max(1, weeksLeft));
    const perWeekOpinions = Math.ceil(remainingOpinions / Math.max(1, weeksLeft));
    container.innerHTML = `
        <li>🎯 এই সপ্তাহে <strong>${perWeekWorkers}</strong> জন নতুন কর্মী নিয়োগ করুন</li>
        <li>📝 এই সপ্তাহে <strong>${perWeekOpinions}</strong>টি মতামত সংগ্রহ করুন</li>
        <li>🏠 প্রতিদিন <strong>${Math.ceil(perWeekWorkers * 10)}</strong>টি বাড়িতে যোগাযোগ করুন</li>
        <li>🚨 ${document.getElementById('criticalBooths')?.textContent || 0}টি বিপদজনক বুথে বিশেষ টিম পাঠান</li>
    `;
}

// ================== Booth Target Setting ==================
function setBoothTarget() {
    if (!currentBooth) return;
    const target = parseFloat(document.getElementById('targetVoteShare').value);
    if (isNaN(target) || target < 0 || target > 100) {
        showNotification('সঠিক টার্গেট ভোটশেয়ার দিন (0-100)');
        return;
    }
    boothTargets[currentBooth] = target;
    localStorage.setItem('boothTargets', JSON.stringify(boothTargets));
    document.getElementById('targetDisplay').innerHTML = `🎯 টার্গেট: ${target}% ভোট`;
    showNotification(`বুথ ${currentBooth}-এর টার্গেট ${target}% সেট করা হয়েছে`);
}

// ================== PDF Report Export ==================
function exportPDFReport() {
    if (!currentBoothDetails) return;
    const element = document.createElement('div');
    element.innerHTML = `
        <h1>নাগরাকাটা (এসটি) - বুথ ${currentBoothDetails.BoothNo} রিপোর্ট</h1>
        <p>তারিখ: ${new Date().toLocaleDateString('bn-BD')}</p><hr/>
        <h2>বুথের তথ্য</h2>
        <table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">
            <tr><td><strong>বুথ নং</strong></td><td>${currentBoothDetails.BoothNo}</td></tr>
            <tr><td><strong>বুথের নাম</strong></td><td>${currentBoothDetails.BoothName}</td></tr>
            <tr><td><strong>সেগমেন্ট</strong></td><td>${currentBoothDetails.Segment}</td></tr>
            <tr><td><strong>মুসলমান %</strong></td><td>${currentBoothDetails.MuslimPercent}%</td></tr>
            <tr><td><strong>মোট ভোটার</strong></td><td>${currentBoothDetails.TotalElectors}</td></tr>
            <tr><td><strong>২০২১ ভোটদান</strong></td><td>${currentBoothDetails.Poll2021}%</td></tr>
            <tr><td><strong>২০২৪ ভোটদান</strong></td><td>${currentBoothDetails.Poll2024}%</td></tr>
            <tr><td><strong>বিজেপি ২০২১</strong></td><td>${currentBoothDetails.BJP2021}%</td></tr>
            <tr><td><strong>তৃণমূল ২০২১</strong></td><td>${currentBoothDetails.TMC2021}%</td></tr>
            <tr><td><strong>বিজেপি ২০২৪</strong></td><td>${currentBoothDetails.BJP2024}%</td></tr>
            <tr><td><strong>তৃণমূল ২০২৪</strong></td><td>${currentBoothDetails.TMC2024}%</td></tr>
        </table>
        <h2>বিশ্লেষণ</h2><p>${currentBoothDetails.MyAnalysis || 'বিশ্লেষণ নেই'}</p>
        <h2>কৌশল</h2><p>${currentBoothDetails.MyStrategy || 'কৌশল নেই'}</p>
        <h2>কর্মী তালিকা</h2>${renderWorkersForPDF()}
        <h2>জনমত</h2>${renderOpinionsForPDF()}
    `;
    html2pdf().from(element).set({
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `booth_${currentBoothDetails.BoothNo}_report.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, letterRendering: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }).save();
    showNotification('PDF রিপোর্ট তৈরি হচ্ছে...');
}

function renderWorkersForPDF() {
    const workers = workersData[currentBooth] || [];
    if (workers.length === 0) return '<p>কোনো কর্মী নেই</p>';
    let html = '<table border="1" cellpadding="5"><tr><th>নাম</th><th>ফোন</th><th>দায়িত্ব</th></tr>';
    workers.forEach(w => { html += `<tr><td>${w.name}</td><td>${w.phone}</td><td>${w.role}</td></tr>`; });
    html += '</table>';
    return html;
}

function renderOpinionsForPDF() {
    const opinions = opinionsData[currentBooth] || [];
    if (opinions.length === 0) return '<p>কোনো মতামত নেই</p>';
    let html = '<table border="1" cellpadding="5"><tr><th>নাম</th><th>মতামত</th></tr>';
    opinions.forEach(o => { html += `<tr><td>${o.personName}</td><td>${o.opinion}</td></tr>`; });
    html += '</table>';
    return html;
}

// ================== Dark Mode ==================
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const btn = document.getElementById('darkModeBtn');
    const isDark = document.body.classList.contains('dark-mode');
    btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('darkMode', isDark);
}

// ================== Booth Data Loading ==================
function populateBoothDropdown() {
    const select = document.getElementById('boothSelect');
    if (!select) return;
    select.innerHTML = `<option value="">${translations[currentLanguage].chooseOption}</option>`;
    if (!boothData || boothData.length === 0) return;
    boothData.sort((a,b) => (a.BoothNo || 0) - (b.BoothNo || 0)).forEach(b => {
        const option = document.createElement('option');
        option.value = b.BoothNo;
        option.textContent = `${b.BoothNo}. ${b.BoothName} (${b.Segment}, ${b.MuslimPercent}% মুসলমান)`;
        select.appendChild(option);
    });
}

function loadBoothDetails() {
    const boothNo = document.getElementById('boothSelect').value;
    if (!boothNo) { document.getElementById('boothDetails').style.display = 'none'; return; }
    currentBooth = boothNo;
    document.getElementById('boothDetails').style.display = 'block';
    const booth = boothData.find(b => b.BoothNo == boothNo);
    if (booth) {
        currentBoothDetails = booth;
        displayBoothDetails(booth);
        generateAnalysis(booth, workersData[boothNo] || [], opinionsData[boothNo] || []);
        updateBoothStatus(booth);
    }
    displayWorkers(workersData[boothNo] || []);
    displayOpinions(opinionsData[boothNo] || []);
}

function displayBoothDetails(b) {
    const table = document.getElementById('analysisTable');
    const title = document.getElementById('boothTitle');
    if (title) title.innerHTML = `${b.BoothNo}. ${b.BoothName}`;
    if (!table) return;
    table.innerHTML = `
        <tr><td>বুথ নং</td><td>${b.BoothNo}</td></tr>
        <tr><td>বুথের নাম</td><td>${b.BoothName}</td></tr>
        <tr><td>সেগমেন্ট</td><td>${b.Segment}</td></tr>
        <tr><td>মুসলমান %</td><td>${b.MuslimPercent}%</td></tr>
        <tr><td>মোট ভোটার</td><td>${b.TotalElectors}</td></tr>
        <tr><td>ভোট % ২০২১</td><td>${b.Poll2021}%</td></tr>
        <tr><td>ভোট % ২০২৪</td><td>${b.Poll2024}%</td></tr>
        <tr><td>বিজেপি ২০২১</td><td>${b.BJP2021}%</td></tr>
        <tr><td>তৃণমূল ২০২১</td><td>${b.TMC2021}%</td></tr>
        <tr><td>অন্যান্য ২০২১</td><td>${b.Other2021}%</td></tr>
        <tr><td>বিজেপি ২০২৪</td><td>${b.BJP2024}%</td></tr>
        <tr><td>তৃণমূল ২০২৪</td><td>${b.TMC2024}%</td></tr>
        <tr><td>অন্যান্য ২০২৪</td><td>${b.Other2024}%</td></tr>
    `;
    const target = boothTargets[currentBooth];
    const targetDisplay = document.getElementById('targetDisplay');
    if (targetDisplay) {
        targetDisplay.innerHTML = target ? `🎯 টার্গেট: ${target}% ভোট (বর্তমান: ${b.BJP2024}%)` : '🎯 এখনো টার্গেট সেট করা হয়নি';
    }
}

function updateBoothStatus(booth) {
    const badge = document.getElementById('boothStatusBadge');
    if (!badge) return;
    const diff = (booth.BJP2024 || 0) - (booth.BJP2021 || 0);
    if (diff < -10) {
        badge.innerHTML = '🔴 বিপদজনক';
        badge.className = 'booth-status status-critical';
    } else if (Math.abs(diff) <= 10 && (booth.BJP2024 || 0) < 55) {
        badge.innerHTML = '🟡 সুইং বুথ';
        badge.className = 'booth-status status-swing';
    } else if (diff > 5) {
        badge.innerHTML = '🟢 নিরাপদ';
        badge.className = 'booth-status status-safe';
    } else {
        badge.innerHTML = '⚪ স্থিতিশীল';
        badge.className = 'booth-status';
    }
}

function showAnalysisModal() {
    if (!currentBoothDetails) return;
    document.getElementById('modalAnalysisText').innerText = currentBoothDetails.MyAnalysis || translations[currentLanguage].analysisNotAvailable;
    document.getElementById('analysisModal').style.display = 'block';
}

function showStrategyModal() {
    if (!currentBoothDetails) return;
    document.getElementById('modalStrategyText').innerText = currentBoothDetails.MyStrategy || translations[currentLanguage].strategyNotAvailable;
    document.getElementById('strategyModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) event.target.style.display = 'none';
};

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const chevron = document.getElementById(sectionId === 'workerSection' ? 'workerChevron' : sectionId === 'opinionSection' ? 'opinionChevron' : sectionId === 'rankingSection' ? 'rankingChevron' : 'progressChevron');
    if (!section || !chevron) return;
    if (section.style.maxHeight && section.style.maxHeight !== '0px') {
        section.style.maxHeight = '0';
        chevron.classList.remove('fa-chevron-up');
        chevron.classList.add('fa-chevron-down');
    } else {
        section.style.maxHeight = section.scrollHeight + 'px';
        chevron.classList.remove('fa-chevron-down');
        chevron.classList.add('fa-chevron-up');
    }
}

function toggleForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function generateAnalysis(booth, workers, opinions) {
    updateVoteChart(booth);
    updateKeywordCloud(opinions);
    updateSentimentMeter(opinions);
    displayAdvice(generateEnhancedAdvice(booth, workers, opinions));
}

function updateVoteChart(booth) {
    const canvas = document.getElementById('voteChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['২০২১', '২০২৪'],
            datasets: [
                { label: 'বিজেপি', data: [booth.BJP2021 || 0, booth.BJP2024 || 0], backgroundColor: '#ff6b6b', borderRadius: 6 },
                { label: 'তৃণমূল', data: [booth.TMC2021 || 0, booth.TMC2024 || 0], backgroundColor: '#4ecdc4', borderRadius: 6 },
                { label: 'অন্যান্য', data: [booth.Other2021 || 0, booth.Other2024 || 0], backgroundColor: '#95a5a6', borderRadius: 6 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }
    });
}

function updateKeywordCloud(opinions) {
    const container = document.getElementById('keywordCloud');
    if (!container) return;
    if (!opinions || opinions.length === 0) {
        container.innerHTML = `<span class="text-muted">${translations[currentLanguage].noOpinions}</span>`;
        return;
    }
    const allText = opinions.map(o => (o.opinion || '') + ' ' + (o.notes || '')).join(' ');
    const words = allText.split(/[\s,।]+/).filter(w => w.length > 1);
    const stopwords = ['এবং', 'করে', 'থেকে', 'এই', 'যে', 'কি', 'তা', 'জন্য', 'হয়', 'না', 'তে', 'ের', 'আছে', 'ছিল', 'হবে'];
    const filtered = words.filter(w => !stopwords.includes(w) && !/^\d+$/.test(w));
    const freq = {};
    filtered.forEach(w => freq[w] = (freq[w] || 0) + 1);
    const sorted = Object.entries(freq).sort((a,b) => b[1] - a[1]).slice(0, 20);
    const maxFreq = sorted[0]?.[1] || 1;
    container.innerHTML = sorted.map(([word, count]) => {
        const size = count / maxFreq;
        let cls = 'keyword-tag';
        if (size > 0.7) cls += ' large';
        else if (size > 0.4) cls += ' medium';
        else cls += ' small';
        return `<span class="${cls}">${word}</span>`;
    }).join('');
}

function updateSentimentMeter(opinions) {
    const indicator = document.getElementById('sentimentIndicator');
    if (!indicator) return;
    if (!opinions || opinions.length === 0) { indicator.style.left = '50%'; return; }
    let score = 0;
    const positiveWords = ['ভাল', 'সন্তুষ্ট', 'ধন্যবাদ', 'উন্নতি', 'চমৎকার', 'ঠিক'];
    const negativeWords = ['খারাপ', 'সমস্যা', 'অভিযোগ', 'দুর্নীতি', 'ব্যর্থ', 'বিরক্ত'];
    opinions.forEach(o => {
        const text = (o.opinion || '').toLowerCase();
        positiveWords.forEach(w => { if (text.includes(w)) score += 2; });
        negativeWords.forEach(w => { if (text.includes(w)) score -= 2; });
    });
    const maxScore = opinions.length * 2;
    const normalized = 50 + (score / maxScore) * 50;
    const final = Math.min(100, Math.max(0, normalized));
    indicator.style.left = final + '%';
}

function generateEnhancedAdvice(booth, workers, opinions) {
    const advice = [];
    const bjpDiff = (booth.BJP2024 || 0) - (booth.BJP2021 || 0);
    const tmcDiff = (booth.TMC2024 || 0) - (booth.TMC2021 || 0);
    const turnoutDiff = (booth.Poll2024 || 0) - (booth.Poll2021 || 0);
    
    if (bjpDiff < -10) advice.push({ type: 'danger', text: `🔴 বিজেপি ভোট ${Math.abs(bjpDiff).toFixed(1)}% কমেছে! স্থানীয় নেতৃত্ব পরিবর্তনের প্রয়োজন হতে পারে।` });
    else if (bjpDiff > 10) advice.push({ type: 'success', text: `🟢 বিজেপি ভোট ${bjpDiff.toFixed(1)}% বেড়েছে! এই কৌশল অন্য বুথে প্রয়োগ করুন।` });
    
    if (tmcDiff > 10) advice.push({ type: 'warning', text: `⚠️ তৃণমূল ${tmcDiff.toFixed(1)}% ভোট বাড়িয়েছে। তাদের কৌশল বিশ্লেষণ করুন।` });
    if (turnoutDiff < -10) advice.push({ type: 'danger', text: `📉 ভোটার উপস্থিতি ${Math.abs(turnoutDiff).toFixed(1)}% কমেছে। ভোটার সচেতনতা বাড়ান।` });
    
    const muslimPercent = parseFloat(booth.MuslimPercent);
    if (muslimPercent > 30 && bjpDiff < 0) advice.push({ type: 'warning', text: `🕌 ${muslimPercent}% মুসলমান ভোটার। তাদের কাছে উন্নয়নের বার্তা ও সংখ্যালঘু-বান্ধব প্রকল্পের কথা বলুন।` });
    
    if (booth.BoothName.includes('চা বাগান') && bjpDiff < -5) advice.push({ type: 'warning', text: '🍃 চা বাগানের শ্রমিকদের মধ্যে অসন্তোষ। বোনাস, মজুরি ও স্বাস্থ্য সুবিধার ইস্যুতে তৃণমূলের ব্যর্থতা তুলে ধরুন।' });
    
    const votersPerWorker = (booth.TotalElectors || 0) / (workers.length || 1);
    if (votersPerWorker > 300) advice.push({ type: 'warning', text: `👥 প্রতি কর্মীর জন্য ${Math.round(votersPerWorker)} ভোটার। আরও ${Math.ceil(votersPerWorker / 200)} জন কর্মী প্রয়োজন।` });
    
    if (opinions.length === 0) advice.push({ type: 'info', text: translations[currentLanguage].advice.noOpinions });
    return advice;
}

function displayAdvice(adviceList) {
    const container = document.getElementById('adviceList');
    if (!container) return;
    if (adviceList.length === 0) { container.innerHTML = '<p class="text-muted">কোনো পরামর্শ নেই</p>'; return; }
    container.innerHTML = adviceList.map(item => `
        <div class="advice-item ${item.type}">
            <i class="fas fa-${item.type==='danger'?'exclamation-circle':item.type==='warning'?'exclamation-triangle':item.type==='success'?'check-circle':'info-circle'}"></i>
            ${item.text}
        </div>
    `).join('');
}

function exportBoothReport() {
    if (!currentBoothDetails) return;
    const booth = currentBoothDetails;
    const workers = workersData[currentBooth] || [];
    const opinions = opinionsData[currentBooth] || [];
    let csv = "Field,Value\n";
    Object.entries(booth).forEach(([k,v]) => csv += `${k},${v}\n`);
    csv += "\nWorkers\nName,Phone,WhatsApp,Role,Notes,AddedDate\n";
    workers.forEach(w => csv += `"${w.name}",${w.phone},${w.whatsapp},"${w.role}","${w.notes}",${w.addedDate}\n`);
    csv += "\nOpinions\nPersonName,Phone,Opinion,Notes,AddedDate\n";
    opinions.forEach(o => csv += `"${o.personName}",${o.phone},"${o.opinion}","${o.notes}",${o.addedDate}\n`);
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booth_${booth.BoothNo}_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('CSV রিপোর্ট ডাউনলোড শুরু হয়েছে');
}

function showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'notification-badge';
    notif.innerHTML = `<i class="fas fa-bell"></i> ${message}`;
    notif.onclick = () => notif.remove();
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 5000);
}

// ================== Worker Functions ==================
function displayWorkers(workers) {
    const container = document.getElementById('workersList');
    if (!container) return;
    if (!workers || workers.length === 0) { container.innerHTML = `<p class="text-muted">${translations[currentLanguage].noWorkers}</p>`; return; }
    let html = '';
    workers.forEach((w, index) => {
        html += `
            <div class="item-card">
                <div class="item-header">
                    <div class="item-info">
                        <strong>${w.name}</strong><br>
                        📞 ${w.phone} | 🎯 ${w.role}<br>
                        <small>যুক্ত: ${new Date(w.addedDate).toLocaleDateString()}</small>
                        ${w.notes ? `<br><small>📝 ${w.notes}</small>` : ''}
                    </div>
                    <div class="item-actions">
                        <button class="btn-edit" onclick="openEditWorkerModal(${index})"><i class="fas fa-edit"></i> সম্পাদনা</button>
                        <button class="btn-delete" onclick="deleteWorker(${index})"><i class="fas fa-trash"></i> মুছুন</button>
                    </div>
                </div>
                <div style="margin-top:12px;">
                    <a href="tel:${w.phone}" class="btn-call"><i class="fas fa-phone"></i> কল</a>
                    <a href="https://wa.me/${(w.whatsapp || w.phone).replace(/[^0-9]/g, '')}" target="_blank" class="btn-wa"><i class="fab fa-whatsapp"></i> হোয়াটসঅ্যাপ</a>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function addNewWorker(event) {
    event.preventDefault();
    const formMsg = document.getElementById('workerFormMessage');
    if (formMsg) formMsg.innerHTML = '<div class="loading">যুক্ত হচ্ছে...</div>';
    const phone = document.getElementById('workerPhone').value.trim();
    const whatsapp = document.getElementById('workerWhatsapp').value.trim() || phone;
    const existingWorkers = workersData[currentBooth] || [];
    if (existingWorkers.some(w => w.phone === phone)) {
        if (formMsg) formMsg.innerHTML = `<div class="error">${translations[currentLanguage].errorMsg} ${translations[currentLanguage].duplicatePhone}</div>`;
        return;
    }
    const workerData = {
        name: document.getElementById('workerName').value.trim(),
        phone: phone,
        whatsapp: whatsapp,
        role: document.getElementById('workerRole').value.trim(),
        notes: document.getElementById('workerNotes').value.trim(),
        addedDate: new Date().toISOString()
    };
    if (!workerData.name || !workerData.phone || !workerData.role) {
        if (formMsg) formMsg.innerHTML = `<div class="error">${translations[currentLanguage].errorMsg} ${translations[currentLanguage].required}</div>`;
        return;
    }
    if (!workersData[currentBooth]) workersData[currentBooth] = [];
    workersData[currentBooth].push(workerData);
    localStorage.setItem('workers', JSON.stringify(workersData));
    if (formMsg) formMsg.innerHTML = `<div class="success">✅ ${translations[currentLanguage].successMsg}</div>`;
    document.getElementById('workerForm').reset();
    displayWorkers(workersData[currentBooth]);
    if (currentBoothDetails) generateAnalysis(currentBoothDetails, workersData[currentBooth], opinionsData[currentBooth] || []);
    updateDashboard();
    loadWeeklyTarget();
}

function openEditWorkerModal(index) {
    const worker = workersData[currentBooth][index];
    document.getElementById('editWorkerId').value = index;
    document.getElementById('editWorkerName').value = worker.name;
    document.getElementById('editWorkerPhone').value = worker.phone;
    document.getElementById('editWorkerWhatsapp').value = worker.whatsapp || '';
    document.getElementById('editWorkerRole').value = worker.role;
    document.getElementById('editWorkerNotes').value = worker.notes || '';
    document.getElementById('editWorkerModal').style.display = 'block';
}

function updateWorker(event) {
    event.preventDefault();
    const index = document.getElementById('editWorkerId').value;
    workersData[currentBooth][index] = {
        name: document.getElementById('editWorkerName').value.trim(),
        phone: document.getElementById('editWorkerPhone').value.trim(),
        whatsapp: document.getElementById('editWorkerWhatsapp').value.trim() || document.getElementById('editWorkerPhone').value.trim(),
        role: document.getElementById('editWorkerRole').value.trim(),
        notes: document.getElementById('editWorkerNotes').value.trim(),
        addedDate: workersData[currentBooth][index].addedDate
    };
    localStorage.setItem('workers', JSON.stringify(workersData));
    closeModal('editWorkerModal');
    displayWorkers(workersData[currentBooth]);
    if (currentBoothDetails) generateAnalysis(currentBoothDetails, workersData[currentBooth], opinionsData[currentBooth] || []);
    updateDashboard();
    loadWeeklyTarget();
    showNotification(translations[currentLanguage].updateSuccess);
}

function deleteWorker(index) {
    if (confirm(translations[currentLanguage].confirmDelete)) {
        workersData[currentBooth].splice(index, 1);
        if (workersData[currentBooth].length === 0) delete workersData[currentBooth];
        localStorage.setItem('workers', JSON.stringify(workersData));
        displayWorkers(workersData[currentBooth] || []);
        if (currentBoothDetails) generateAnalysis(currentBoothDetails, workersData[currentBooth] || [], opinionsData[currentBooth] || []);
        updateDashboard();
        loadWeeklyTarget();
        showNotification(translations[currentLanguage].deleteSuccess);
    }
}

// ================== Opinion Functions ==================
function displayOpinions(opinions) {
    const container = document.getElementById('opinionsList');
    if (!container) return;
    if (!opinions || opinions.length === 0) { container.innerHTML = `<p class="text-muted">${translations[currentLanguage].noOpinions}</p>`; return; }
    let html = '';
    opinions.forEach((o, index) => {
        html += `
            <div class="item-card">
                <div class="item-header">
                    <div class="item-info">
                        <strong>${o.personName}</strong> (📞 ${o.phone})<br>
                        💬 ${o.opinion}<br>
                        <small>রেকর্ড: ${new Date(o.addedDate).toLocaleDateString()}</small>
                        ${o.notes ? `<br><small>📝 ${o.notes}</small>` : ''}
                    </div>
                    <div class="item-actions">
                        <button class="btn-edit" onclick="openEditOpinionModal(${index})"><i class="fas fa-edit"></i> সম্পাদনা</button>
                        <button class="btn-delete" onclick="deleteOpinion(${index})"><i class="fas fa-trash"></i> মুছুন</button>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function addNewOpinion(event) {
    event.preventDefault();
    const formMsg = document.getElementById('opinionFormMessage');
    if (formMsg) formMsg.innerHTML = '<div class="loading">যুক্ত হচ্ছে...</div>';
    const opinionData = {
        personName: document.getElementById('opinionPersonName').value.trim(),
        phone: document.getElementById('opinionPhone').value.trim(),
        opinion: document.getElementById('opinionText').value.trim(),
        notes: document.getElementById('opinionNotes').value.trim(),
        addedDate: new Date().toISOString()
    };
    if (!opinionData.personName || !opinionData.phone || !opinionData.opinion) {
        if (formMsg) formMsg.innerHTML = `<div class="error">${translations[currentLanguage].errorMsg} ${translations[currentLanguage].required}</div>`;
        return;
    }
    if (!opinionsData[currentBooth]) opinionsData[currentBooth] = [];
    opinionsData[currentBooth].push(opinionData);
    localStorage.setItem('opinions', JSON.stringify(opinionsData));
    if (formMsg) formMsg.innerHTML = `<div class="success">✅ ${translations[currentLanguage].successMsg}</div>`;
    document.getElementById('opinionForm').reset();
    displayOpinions(opinionsData[currentBooth]);
    if (currentBoothDetails) generateAnalysis(currentBoothDetails, workersData[currentBooth] || [], opinionsData[currentBooth]);
    updateDashboard();
    loadWeeklyTarget();
}

function openEditOpinionModal(index) {
    const opinion = opinionsData[currentBooth][index];
    document.getElementById('editOpinionId').value = index;
    document.getElementById('editOpinionPersonName').value = opinion.personName;
    document.getElementById('editOpinionPhone').value = opinion.phone;
    document.getElementById('editOpinionText').value = opinion.opinion;
    document.getElementById('editOpinionNotes').value = opinion.notes || '';
    document.getElementById('editOpinionModal').style.display = 'block';
}

function updateOpinion(event) {
    event.preventDefault();
    const index = document.getElementById('editOpinionId').value;
    opinionsData[currentBooth][index] = {
        personName: document.getElementById('editOpinionPersonName').value.trim(),
        phone: document.getElementById('editOpinionPhone').value.trim(),
        opinion: document.getElementById('editOpinionText').value.trim(),
        notes: document.getElementById('editOpinionNotes').value.trim(),
        addedDate: opinionsData[currentBooth][index].addedDate
    };
    localStorage.setItem('opinions', JSON.stringify(opinionsData));
    closeModal('editOpinionModal');
    displayOpinions(opinionsData[currentBooth]);
    if (currentBoothDetails) generateAnalysis(currentBoothDetails, workersData[currentBooth] || [], opinionsData[currentBooth]);
    updateDashboard();
    loadWeeklyTarget();
    showNotification(translations[currentLanguage].updateSuccess);
}

function deleteOpinion(index) {
    if (confirm(translations[currentLanguage].confirmDelete)) {
        opinionsData[currentBooth].splice(index, 1);
        if (opinionsData[currentBooth].length === 0) delete opinionsData[currentBooth];
        localStorage.setItem('opinions', JSON.stringify(opinionsData));
        displayOpinions(opinionsData[currentBooth] || []);
        if (currentBoothDetails) generateAnalysis(currentBoothDetails, workersData[currentBooth] || [], opinionsData[currentBooth] || []);
        updateDashboard();
        loadWeeklyTarget();
        showNotification(translations[currentLanguage].deleteSuccess);
    }
}

// ================== Initialize ==================
window.onload = function() {
    updateCountdown();
    setInterval(updateCountdown, 3600000);
    if (localStorage.getItem('darkMode') === 'true') toggleDarkMode();
    fetch('data/boothData.json')
        .then(res => res.json())
        .then(data => {
            boothData = data;
            populateBoothDropdown();
            updateDashboard();
            loadWeeklyTarget();
            loadDangerRanking();
        })
        .catch(err => console.error('Error loading data:', err));
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('workers', JSON.stringify(workersData));
        localStorage.setItem('opinions', JSON.stringify(opinionsData));
        localStorage.setItem('boothTargets', JSON.stringify(boothTargets));
    });
};
