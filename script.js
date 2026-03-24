// ================== PASSWORD ==================
const CORRECT_PASSWORD = "bjp2026";

function checkPassword() {
    const input = document.getElementById('passwordInput').value;
    const errorDiv = document.getElementById('passwordError');
    
    if (input === CORRECT_PASSWORD) {
        document.getElementById('passwordModal').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        initializeApp();
    } else {
        errorDiv.innerHTML = '❌ Wrong password! Please try again.';
        document.getElementById('passwordInput').value = '';
    }
}

// ================== GLOBAL VARIABLES ==================
let boothData = [];
let workersData = JSON.parse(localStorage.getItem('workers')) || {};
let opinionsData = JSON.parse(localStorage.getItem('opinions')) || {};
let boothTargets = JSON.parse(localStorage.getItem('boothTargets')) || {};
let currentBooth = null;
let currentBoothDetails = null;
let voteChart = null;

// ================== COUNTDOWN ==================
function updateCountdown() {
    const electionDate = new Date(2026, 2, 24);
    const today = new Date();
    const diffDays = Math.ceil((electionDate - today) / (1000 * 60 * 60 * 24));
    document.getElementById('daysLeft').textContent = diffDays > 0 ? diffDays : 0;
}

// ================== DARK MODE ==================
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const btn = document.querySelector('.dark-mode-btn i');
    if (btn) {
        btn.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';
    }
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// ================== NOTIFICATION ==================
function showNotification(msg, isError = false) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.style.background = isError ? '#dc3545' : '#28a745';
    notif.innerHTML = `<i class="fas fa-${isError ? 'exclamation-circle' : 'check-circle'}"></i> ${msg}`;
    document.body.appendChild(notif);
    notif.onclick = () => notif.remove();
    setTimeout(() => notif.remove(), 3000);
}

// ================== FORM FUNCTIONS ==================
function openWorkerForm() {
    const form = document.getElementById('workerFormContainer');
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function closeWorkerForm() {
    const form = document.getElementById('workerFormContainer');
    form.style.display = 'none';
    document.getElementById('workerName').value = '';
    document.getElementById('workerPhone').value = '';
    document.getElementById('workerWhatsapp').value = '';
    document.getElementById('workerRole').value = '';
    document.getElementById('workerNotes').value = '';
    document.getElementById('workerMsg').innerHTML = '';
}

function openOpinionForm() {
    const form = document.getElementById('opinionFormContainer');
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function closeOpinionForm() {
    const form = document.getElementById('opinionFormContainer');
    form.style.display = 'none';
    document.getElementById('opinionName').value = '';
    document.getElementById('opinionPhone').value = '';
    document.getElementById('opinionText').value = '';
    document.getElementById('opinionNotes').value = '';
    document.getElementById('opinionMsg').innerHTML = '';
}

// Attach event listeners after DOM loads
document.addEventListener('DOMContentLoaded', function() {
    const openWorkerBtn = document.getElementById('openWorkerFormBtn');
    const openOpinionBtn = document.getElementById('openOpinionFormBtn');
    
    if (openWorkerBtn) {
        openWorkerBtn.onclick = function(e) {
            e.preventDefault();
            openWorkerForm();
        };
    }
    
    if (openOpinionBtn) {
        openOpinionBtn.onclick = function(e) {
            e.preventDefault();
            openOpinionForm();
        };
    }
});

// ================== LOAD BOOTH DATA ==================
async function loadBoothData() {
    try {
        const response = await fetch('data/boothData.json');
        boothData = await response.json();
        populateBoothDropdown();
        updateDashboard();
        updateRankings();
        showNotification('Data loaded successfully!');
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading data! Please check boothData.json', true);
    }
}

function populateBoothDropdown() {
    const select = document.getElementById('boothSelect');
    select.innerHTML = `<option value="">-- Choose a booth --</option>`;
    boothData.sort((a,b) => (a.BoothNo || 0) - (b.BoothNo || 0)).forEach(b => {
        const option = document.createElement('option');
        option.value = b.BoothNo;
        option.textContent = `${b.BoothNo}. ${b.BoothName} (${b.Segment})`;
        select.appendChild(option);
    });
}

// ================== DASHBOARD ==================
function updateDashboard() {
    if (!boothData.length) return;
    
    document.getElementById('totalBooths').textContent = boothData.length;
    
    let critical = 0, swing = 0, safe = 0;
    boothData.forEach(b => {
        const diff = (b.BJP2024 || 0) - (b.BJP2021 || 0);
        if (diff < -10) critical++;
        else if (Math.abs(diff) <= 10 && (b.BJP2024 || 0) < 55) swing++;
        else if (diff > 5) safe++;
    });
    
    document.getElementById('criticalBooths').textContent = critical;
    document.getElementById('swingBooths').textContent = swing;
    document.getElementById('safeBooths').textContent = safe;
    
    let totalWorkers = 0, totalOpinions = 0;
    Object.values(workersData).forEach(w => totalWorkers += w.length);
    Object.values(opinionsData).forEach(o => totalOpinions += o.length);
    document.getElementById('totalWorkers').textContent = totalWorkers;
    document.getElementById('totalOpinions').textContent = totalOpinions;
    
    const workerPercent = Math.min(100, Math.round((totalWorkers / 250) * 100));
    const opinionPercent = Math.min(100, Math.round((totalOpinions / 500) * 100));
    document.getElementById('workerProgress').style.width = workerPercent + '%';
    document.getElementById('opinionProgress').style.width = opinionPercent + '%';
    document.getElementById('workerPercent').textContent = workerPercent + '%';
    document.getElementById('opinionPercent').textContent = opinionPercent + '%';
    
    const weeksLeft = Math.ceil((new Date(2026, 2, 24) - new Date()) / (7 * 24 * 60 * 60 * 1000));
    const remainingWorkers = Math.max(0, 250 - totalWorkers);
    const remainingOpinions = Math.max(0, 500 - totalOpinions);
    const perWeekWorkers = Math.ceil(remainingWorkers / Math.max(1, weeksLeft));
    const perWeekOpinions = Math.ceil(remainingOpinions / Math.max(1, weeksLeft));
    document.getElementById('weeklyTarget').innerHTML = `
        <li>🎯 Hire <strong>${perWeekWorkers}</strong> new workers this week</li>
        <li>📝 Collect <strong>${perWeekOpinions}</strong> opinions this week</li>
        <li>🏠 Contact <strong>${Math.ceil(perWeekWorkers * 10)}</strong> households daily</li>
        <li>🚨 Send special teams to <strong>${critical}</strong> critical booths</li>
    `;
    
    const alertDiv = document.getElementById('priorityAlert');
    if (critical > 0 || swing > 0) {
        alertDiv.style.display = 'block';
        document.getElementById('alertContent').innerHTML = `
            ${critical > 0 ? `<p>🔴 <strong>${critical} Critical Booths</strong> - Vote share dropped by 10%+! Immediate action required.</p>` : ''}
            ${swing > 0 ? `<p>🟡 <strong>${swing} Swing Booths</strong> - Winning these ensures victory. Deploy special teams.</p>` : ''}
        `;
    } else {
        alertDiv.style.display = 'none';
    }
}

// ================== RANKINGS ==================
function updateRankings() {
    if (!boothData.length) return;
    
    const danger = boothData.filter(b => ((b.BJP2024 || 0) - (b.BJP2021 || 0)) < -10)
        .sort((a,b) => ((a.BJP2021 - a.BJP2024) - (b.BJP2021 - b.BJP2024)));
    
    document.getElementById('dangerRanking').innerHTML = danger.map(b => `
        <div class="ranking-item" onclick="selectBooth('${b.BoothNo}')">
            <div class="booth-name"><strong>${b.BoothNo}</strong> - ${b.BoothName}</div>
            <div class="change-negative">⬇️ ${((b.BJP2021 - b.BJP2024) || 0).toFixed(1)}%</div>
        </div>
    `).join('') || '<p class="text-muted">No critical booths found</p>';
    
    const swing = boothData.filter(b => {
        const diff = (b.BJP2024 || 0) - (b.BJP2021 || 0);
        return Math.abs(diff) <= 10 && (b.BJP2024 || 0) < 55;
    }).sort((a,b) => (b.BJP2024 || 0) - (a.BJP2024 || 0));
    
    document.getElementById('swingRanking').innerHTML = swing.map(b => `
        <div class="ranking-item" onclick="selectBooth('${b.BoothNo}')">
            <div class="booth-name"><strong>${b.BoothNo}</strong> - ${b.BoothName}</div>
            <div>🎯 ${b.BJP2024}% (Target: ${boothTargets[b.BoothNo] || '55'}%)</div>
        </div>
    `).join('') || '<p class="text-muted">No swing booths found</p>';
    
    const safe = boothData.filter(b => {
        const diff = (b.BJP2024 || 0) - (b.BJP2021 || 0);
        return diff > 5 && (b.BJP2024 || 0) > 55;
    }).sort((a,b) => (b.BJP2024 || 0) - (a.BJP2024 || 0));
    
    document.getElementById('safeRanking').innerHTML = safe.map(b => `
        <div class="ranking-item" onclick="selectBooth('${b.BoothNo}')">
            <div class="booth-name"><strong>${b.BoothNo}</strong> - ${b.BoothName}</div>
            <div class="change-positive">✅ +${((b.BJP2024 - b.BJP2021) || 0).toFixed(1)}%</div>
        </div>
    `).join('') || '<p class="text-muted">No safe booths found</p>';
}

function showRankingTab(tab) {
    const btn = event.target;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('dangerRanking').style.display = tab === 'danger' ? 'block' : 'none';
    document.getElementById('swingRanking').style.display = tab === 'swing' ? 'block' : 'none';
    document.getElementById('safeRanking').style.display = tab === 'safe' ? 'block' : 'none';
}

function selectBooth(boothNo) {
    document.getElementById('boothSelect').value = boothNo;
    loadBoothDetails();
    document.getElementById('boothDetails').scrollIntoView({ behavior: 'smooth' });
}

// ================== BOOTH DETAILS ==================
function loadBoothDetails() {
    const boothNo = document.getElementById('boothSelect').value;
    if (!boothNo) {
        document.getElementById('boothDetails').style.display = 'none';
        return;
    }
    
    currentBooth = boothNo;
    currentBoothDetails = boothData.find(b => b.BoothNo == boothNo);
    document.getElementById('boothDetails').style.display = 'block';
    document.getElementById('boothTitle').innerHTML = `${currentBoothDetails.BoothNo}. ${currentBoothDetails.BoothName}`;
    
    const diff = (currentBoothDetails.BJP2024 || 0) - (currentBoothDetails.BJP2021 || 0);
    const statusDiv = document.getElementById('boothStatus');
    if (diff < -10) {
        statusDiv.innerHTML = '🔴 Critical';
        statusDiv.className = 'booth-status status-critical';
    } else if (Math.abs(diff) <= 10 && (currentBoothDetails.BJP2024 || 0) < 55) {
        statusDiv.innerHTML = '🟡 Swing Booth';
        statusDiv.className = 'booth-status status-swing';
    } else if (diff > 5) {
        statusDiv.innerHTML = '🟢 Safe';
        statusDiv.className = 'booth-status status-safe';
    } else {
        statusDiv.innerHTML = '⚪ Stable';
        statusDiv.className = 'booth-status status-stable';
    }
    
    const table = document.getElementById('boothInfoTable');
    table.innerHTML = `
        <tr><td>Segment</td><td>${currentBoothDetails.Segment}</td></tr>
        <tr><td>Muslim %</td><td>${currentBoothDetails.MuslimPercent}%</td></tr>
        <tr><td>Total Electors</td><td>${currentBoothDetails.TotalElectors}</td></tr>
        <tr><td>Turnout 2021</td><td>${currentBoothDetails.Poll2021}%</td></tr>
        <tr><td>Turnout 2024</td><td>${currentBoothDetails.Poll2024}%</td></tr>
        <tr><td>BJP 2021</td><td>${currentBoothDetails.BJP2021}%</td></tr>
        <tr><td>TMC 2021</td><td>${currentBoothDetails.TMC2021}%</td></tr>
        <tr><td>Others 2021</td><td>${currentBoothDetails.Other2021}%</td></tr>
        <tr><td>BJP 2024</td><td>${currentBoothDetails.BJP2024}%</td></tr>
        <tr><td>TMC 2024</td><td>${currentBoothDetails.TMC2024}%</td></tr>
        <tr><td>Others 2024</td><td>${currentBoothDetails.Other2024}%</td></tr>
    `;
    
    const target = boothTargets[boothNo];
    document.getElementById('targetDisplay').innerHTML = target ? `🎯 Target: ${target}% (Current: ${currentBoothDetails.BJP2024}%)` : '🎯 No target set yet';
    document.getElementById('targetVote').value = target || '';
    
    displayWorkers(workersData[boothNo] || []);
    displayOpinions(opinionsData[boothNo] || []);
    generateAnalysis();
}

function setBoothTarget() {
    if (!currentBooth) return;
    const target = parseFloat(document.getElementById('targetVote').value);
    if (isNaN(target) || target < 0 || target > 100) {
        showNotification('Please enter a valid target (0-100)', true);
        return;
    }
    boothTargets[currentBooth] = target;
    localStorage.setItem('boothTargets', JSON.stringify(boothTargets));
    document.getElementById('targetDisplay').innerHTML = `🎯 Target: ${target}% (Current: ${currentBoothDetails.BJP2024}%)`;
    showNotification(`Target set to ${target}%`);
    updateRankings();
}

// ================== ANALYSIS & ADVICE ==================
function generateAnalysis() {
    if (!currentBoothDetails) return;
    
    const ctx = document.getElementById('voteChart').getContext('2d');
    if (voteChart) voteChart.destroy();
    voteChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['2021', '2024'],
            datasets: [
                { label: 'BJP', data: [currentBoothDetails.BJP2021, currentBoothDetails.BJP2024], backgroundColor: '#ff6b6b', borderRadius: 6 },
                { label: 'TMC', data: [currentBoothDetails.TMC2021, currentBoothDetails.TMC2024], backgroundColor: '#4ecdc4', borderRadius: 6 },
                { label: 'Others', data: [currentBoothDetails.Other2021, currentBoothDetails.Other2024], backgroundColor: '#95a5a6', borderRadius: 6 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }
    });
    
    const opinions = opinionsData[currentBooth] || [];
    const cloudDiv = document.getElementById('keywordCloud');
    if (opinions.length === 0) {
        cloudDiv.innerHTML = '<span class="text-muted">Add opinions to see keywords...</span>';
    } else {
        const allText = opinions.map(o => o.opinion + ' ' + (o.notes || '')).join(' ');
        const words = allText.toLowerCase().split(/[\s,.!?]+/).filter(w => w.length > 2);
        const stopwords = ['the', 'and', 'for', 'this', 'that', 'with', 'from', 'have', 'are', 'was', 'were'];
        const filtered = words.filter(w => !stopwords.includes(w) && !/^\d+$/.test(w));
        const freq = {};
        filtered.forEach(w => freq[w] = (freq[w] || 0) + 1);
        const sorted = Object.entries(freq).sort((a,b) => b[1] - a[1]).slice(0, 20);
        const maxFreq = sorted[0]?.[1] || 1;
        cloudDiv.innerHTML = sorted.map(([word, count]) => {
            const size = count / maxFreq;
            let cls = 'keyword-tag';
            if (size > 0.7) cls += ' large';
            else if (size > 0.4) cls += ' medium';
            else cls += ' small';
            return `<span class="${cls}">${word}</span>`;
        }).join('');
    }
    
    const indicator = document.getElementById('sentimentIndicator');
    if (opinions.length === 0) {
        indicator.style.left = '50%';
    } else {
        let score = 0;
        const pos = ['good', 'great', 'excellent', 'satisfied', 'thanks', 'improvement', 'happy'];
        const neg = ['bad', 'problem', 'issue', 'complaint', 'corruption', 'failed', 'poor'];
        opinions.forEach(o => {
            const text = o.opinion.toLowerCase();
            pos.forEach(w => { if (text.includes(w)) score += 2; });
            neg.forEach(w => { if (text.includes(w)) score -= 2; });
        });
        const normalized = 50 + (score / (opinions.length * 2)) * 50;
        indicator.style.left = Math.min(100, Math.max(0, normalized)) + '%';
    }
    
    const advice = [];
    const bjpDiff = (currentBoothDetails.BJP2024 || 0) - (currentBoothDetails.BJP2021 || 0);
    const tmcDiff = (currentBoothDetails.TMC2024 || 0) - (currentBoothDetails.TMC2021 || 0);
    const turnoutDiff = (currentBoothDetails.Poll2024 || 0) - (currentBoothDetails.Poll2021 || 0);
    
    if (bjpDiff < -10) advice.push({ type: 'danger', text: `🔴 BJP vote dropped by ${Math.abs(bjpDiff).toFixed(1)}%! Replace local leadership urgently.` });
    else if (bjpDiff > 10) advice.push({ type: 'success', text: `🟢 BJP vote increased by ${bjpDiff.toFixed(1)}%! Apply this strategy to other booths.` });
    
    if (tmcDiff > 10) advice.push({ type: 'warning', text: `⚠️ TMC gained ${tmcDiff.toFixed(1)}% votes here. Analyze their campaign strategy.` });
    if (turnoutDiff < -10) advice.push({ type: 'danger', text: `📉 Voter turnout dropped by ${Math.abs(turnoutDiff).toFixed(1)}%! Increase voter awareness.` });
    
    const muslim = parseFloat(currentBoothDetails.MuslimPercent);
    if (muslim > 30 && bjpDiff < 0) advice.push({ type: 'warning', text: `🕌 ${muslim}% Muslim voters. Highlight development and minority-friendly schemes.` });
    
    if (currentBoothDetails.BoothName.includes('Tea Garden') && bjpDiff < -5) {
        advice.push({ type: 'warning', text: '🍃 Tea garden workers are dissatisfied. Address bonus, wages, and health issues. Highlight TMC failures.' });
    }
    
    const workers = workersData[currentBooth] || [];
    const votersPerWorker = (currentBoothDetails.TotalElectors || 0) / (workers.length || 1);
    if (votersPerWorker > 300) advice.push({ type: 'warning', text: `👥 ${Math.round(votersPerWorker)} voters per worker. Need ${Math.ceil(votersPerWorker / 200)} more workers.` });
    
    if (opinions.length === 0) advice.push({ type: 'info', text: '📝 No opinions recorded yet. Start collecting feedback from voters.' });
    
    const adviceDiv = document.getElementById('adviceList');
    adviceDiv.innerHTML = advice.map(a => `
        <div class="advice-item ${a.type}">
            <i class="fas fa-${a.type==='danger'?'exclamation-circle':a.type==='warning'?'exclamation-triangle':a.type==='success'?'check-circle':'info-circle'}"></i>
            ${a.text}
        </div>
    `).join('');
}

function showAnalysisModal() {
    document.getElementById('modalAnalysis').innerHTML = currentBoothDetails?.MyAnalysis || 'No analysis provided.';
    document.getElementById('analysisModal').style.display = 'block';
}

function showStrategyModal() {
    document.getElementById('modalStrategy').innerHTML = currentBoothDetails?.MyStrategy || 'No strategy provided.';
    document.getElementById('strategyModal').style.display = 'block';
}

// ================== WORKERS ==================
function displayWorkers(workers) {
    const container = document.getElementById('workersList');
    if (!workers.length) {
        container.innerHTML = '<p class="text-muted">No workers added for this booth yet.</p>';
        return;
    }
    container.innerHTML = workers.map((w, i) => `
        <div class="item-card">
            <div class="item-header">
                <div><strong>${w.name}</strong><br>📞 ${w.phone} | 🎯 ${w.role}<br><small>Added: ${new Date(w.addedDate).toLocaleDateString()}</small>${w.notes ? `<br><small>📝 ${w.notes}</small>` : ''}</div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="openEditWorker(${i})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-delete" onclick="deleteWorker(${i})"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
            <div>
                <a href="tel:${w.phone}" class="btn-call"><i class="fas fa-phone"></i> Call</a>
                <a href="https://wa.me/${(w.whatsapp || w.phone).replace(/[^0-9]/g, '')}" target="_blank" class="btn-wa"><i class="fab fa-whatsapp"></i> WhatsApp</a>
            </div>
        </div>
    `).join('');
}

function addWorker() {
    const name = document.getElementById('workerName').value.trim();
    const phone = document.getElementById('workerPhone').value.trim();
    const whatsapp = document.getElementById('workerWhatsapp').value.trim() || phone;
    const role = document.getElementById('workerRole').value.trim();
    const notes = document.getElementById('workerNotes').value.trim();
    const msgDiv = document.getElementById('workerMsg');
    
    if (!name || !phone || !role) {
        msgDiv.innerHTML = '<div class="error">Please fill all required fields.</div>';
        return;
    }
    
    const existing = workersData[currentBooth] || [];
    if (existing.some(w => w.phone === phone)) {
        msgDiv.innerHTML = '<div class="error">This phone number is already registered for this booth.</div>';
        return;
    }
    
    if (!workersData[currentBooth]) workersData[currentBooth] = [];
    workersData[currentBooth].push({ name, phone, whatsapp, role, notes, addedDate: new Date().toISOString() });
    localStorage.setItem('workers', JSON.stringify(workersData));
    
    document.getElementById('workerName').value = '';
    document.getElementById('workerPhone').value = '';
    document.getElementById('workerWhatsapp').value = '';
    document.getElementById('workerRole').value = '';
    document.getElementById('workerNotes').value = '';
    msgDiv.innerHTML = '<div class="success">✅ Worker added successfully!</div>';
    setTimeout(() => msgDiv.innerHTML = '', 2000);
    displayWorkers(workersData[currentBooth]);
    generateAnalysis();
    updateDashboard();
    closeWorkerForm();
}

function openEditWorker(index) {
    const w = workersData[currentBooth][index];
    document.getElementById('editWorkerIndex').value = index;
    document.getElementById('editWorkerName').value = w.name;
    document.getElementById('editWorkerPhone').value = w.phone;
    document.getElementById('editWorkerWhatsapp').value = w.whatsapp || '';
    document.getElementById('editWorkerRole').value = w.role;
    document.getElementById('editWorkerNotes').value = w.notes || '';
    document.getElementById('editWorkerModal').style.display = 'block';
}

function updateWorker() {
    const index = document.getElementById('editWorkerIndex').value;
    workersData[currentBooth][index] = {
        name: document.getElementById('editWorkerName').value.trim(),
        phone: document.getElementById('editWorkerPhone').value.trim(),
        whatsapp: document.getElementById('editWorkerWhatsapp').value.trim(),
        role: document.getElementById('editWorkerRole').value.trim(),
        notes: document.getElementById('editWorkerNotes').value.trim(),
        addedDate: workersData[currentBooth][index].addedDate
    };
    localStorage.setItem('workers', JSON.stringify(workersData));
    closeModal('editWorkerModal');
    displayWorkers(workersData[currentBooth]);
    generateAnalysis();
    updateDashboard();
    showNotification('Worker updated successfully!');
}

function deleteWorker(index) {
    if (confirm('Are you sure you want to delete this worker?')) {
        workersData[currentBooth].splice(index, 1);
        if (workersData[currentBooth].length === 0) delete workersData[currentBooth];
        localStorage.setItem('workers', JSON.stringify(workersData));
        displayWorkers(workersData[currentBooth] || []);
        generateAnalysis();
        updateDashboard();
        showNotification('Worker deleted successfully!');
    }
}

// ================== OPINIONS ==================
function displayOpinions(opinions) {
    const container = document.getElementById('opinionsList');
    if (!opinions.length) {
        container.innerHTML = '<p class="text-muted">No opinions recorded for this booth yet.</p>';
        return;
    }
    container.innerHTML = opinions.map((o, i) => `
        <div class="item-card">
            <div class="item-header">
                <div><strong>${o.personName}</strong> (📞 ${o.phone})<br>💬 ${o.opinion}<br><small>Recorded: ${new Date(o.addedDate).toLocaleDateString()}</small>${o.notes ? `<br><small>📝 ${o.notes}</small>` : ''}</div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="openEditOpinion(${i})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-delete" onclick="deleteOpinion(${i})"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function addOpinion() {
    const personName = document.getElementById('opinionName').value.trim();
    const phone = document.getElementById('opinionPhone').value.trim();
    const opinion = document.getElementById('opinionText').value.trim();
    const notes = document.getElementById('opinionNotes').value.trim();
    const msgDiv = document.getElementById('opinionMsg');
    
    if (!personName || !phone || !opinion) {
        msgDiv.innerHTML = '<div class="error">Please fill all required fields.</div>';
        return;
    }
    
    if (!opinionsData[currentBooth]) opinionsData[currentBooth] = [];
    opinionsData[currentBooth].push({ personName, phone, opinion, notes, addedDate: new Date().toISOString() });
    localStorage.setItem('opinions', JSON.stringify(opinionsData));
    
    document.getElementById('opinionName').value = '';
    document.getElementById('opinionPhone').value = '';
    document.getElementById('opinionText').value = '';
    document.getElementById('opinionNotes').value = '';
    msgDiv.innerHTML = '<div class="success">✅ Opinion added successfully!</div>';
    setTimeout(() => msgDiv.innerHTML = '', 2000);
    displayOpinions(opinionsData[currentBooth]);
    generateAnalysis();
    updateDashboard();
    closeOpinionForm();
}

function openEditOpinion(index) {
    const o = opinionsData[currentBooth][index];
    document.getElementById('editOpinionIndex').value = index;
    document.getElementById('editOpinionName').value = o.personName;
    document.getElementById('editOpinionPhone').value = o.phone;
    document.getElementById('editOpinionText').value = o.opinion;
    document.getElementById('editOpinionNotes').value = o.notes || '';
    document.getElementById('editOpinionModal').style.display = 'block';
}

function updateOpinion() {
    const index = document.getElementById('editOpinionIndex').value;
    opinionsData[currentBooth][index] = {
        personName: document.getElementById('editOpinionName').value.trim(),
        phone: document.getElementById('editOpinionPhone').value.trim(),
        opinion: document.getElementById('editOpinionText').value.trim(),
        notes: document.getElementById('editOpinionNotes').value.trim(),
        addedDate: opinionsData[currentBooth][index].addedDate
    };
    localStorage.setItem('opinions', JSON.stringify(opinionsData));
    closeModal('editOpinionModal');
    displayOpinions(opinionsData[currentBooth]);
    generateAnalysis();
    updateDashboard();
    showNotification('Opinion updated successfully!');
}

function deleteOpinion(index) {
    if (confirm('Are you sure you want to delete this opinion?')) {
        opinionsData[currentBooth].splice(index, 1);
        if (opinionsData[currentBooth].length === 0) delete opinionsData[currentBooth];
        localStorage.setItem('opinions', JSON.stringify(opinionsData));
        displayOpinions(opinionsData[currentBooth] || []);
        generateAnalysis();
        updateDashboard();
        showNotification('Opinion deleted successfully!');
    }
}

// ================== EXPORTS ==================
function exportCSVReport() {
    if (!currentBoothDetails) return;
    const workers = workersData[currentBooth] || [];
    const opinions = opinionsData[currentBooth] || [];
    let csv = "Field,Value\n";
    Object.entries(currentBoothDetails).forEach(([k,v]) => csv += `${k},${v}\n`);
    csv += "\nWorkers\nName,Phone,WhatsApp,Role,Notes,AddedDate\n";
    workers.forEach(w => csv += `"${w.name}",${w.phone},${w.whatsapp},"${w.role}","${w.notes}",${w.addedDate}\n`);
    csv += "\nOpinions\nPersonName,Phone,Opinion,Notes,AddedDate\n";
    opinions.forEach(o => csv += `"${o.personName}",${o.phone},"${o.opinion}","${o.notes}",${o.addedDate}\n`);
    
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booth_${currentBooth}_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('CSV report downloaded');
}

function exportPDFReport() {
    if (!currentBoothDetails) return;
    const element = document.createElement('div');
    element.innerHTML = `
        <h1>Nagrakata (ST) - Booth ${currentBoothDetails.BoothNo} Report</h1>
        <p>Date: ${new Date().toLocaleDateString()}</p><hr>
        <h2>Booth Information</h2>
        <table border="1">${document.getElementById('boothInfoTable').innerHTML} 20#
        <h2>Analysis</h2><p>${currentBoothDetails.MyAnalysis || 'No analysis available'}</p>
        <h2>Strategy</h2><p>${currentBoothDetails.MyStrategy || 'No strategy available'}</p>
        <h2>Workers</h2>${workersData[currentBooth]?.map(w => `<p>${w.name} - ${w.phone} - ${w.role}</p>`).join('') || '<p>No workers</p>'}
        <h2>Public Opinions</h2>${opinionsData[currentBooth]?.map(o => `<p>${o.personName}: ${o.opinion}</p>`).join('') || '<p>No opinions</p>'}
    `;
    html2pdf().from(element).set({ filename: `booth_${currentBooth}_report.pdf` }).save();
    showNotification('PDF report is being generated');
}

// ================== UTILITIES ==================
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const chevron = document.getElementById(sectionId === 'workerSection' ? 'workerChevron' : 
                                         sectionId === 'opinionSection' ? 'opinionChevron' :
                                         sectionId === 'rankingSection' ? 'rankingChevron' : 'progressChevron');
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

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) event.target.style.display = 'none';
};

// ================== INITIALIZE ==================
function initializeApp() {
    updateCountdown();
    setInterval(updateCountdown, 3600000);
    if (localStorage.getItem('darkMode') === 'true') toggleDarkMode();
    loadBoothData();
    setInterval(() => updateDashboard(), 1000);
}
