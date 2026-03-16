// ================== Language & Translations ==================
let currentLanguage = 'bn';
let boothData = [];
let workersData = JSON.parse(localStorage.getItem('workers')) || {};
let opinionsData = JSON.parse(localStorage.getItem('opinions')) || {};
let myChart = null;

const translations = {
    en: {
        chooseOption: "-- Choose a booth --",
        addWorkerBtn: "✅ Add Worker",
        addOpinionBtn: "✅ Add Opinion",
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
        advice: {
            turnoutDrop: "⚠️ Voter turnout dropped by {percent}%. Investigate reasons and take action.",
            turnoutIncrease: "✅ Voter turnout increased by {percent}%. Keep up the good work!",
            roadIssue: "🛣️ Road condition issues frequently mentioned. Contact local authorities.",
            waterIssue: "💧 Water supply problems reported. Prioritize this issue.",
            workerShortage: "👥 Worker shortage: {ratio} voters per worker. Need {needed} more workers.",
            negativeSentiment: "😞 Overall sentiment is negative. Address public concerns urgently.",
            neutralSentiment: "😐 Mixed public opinion. Engage more with voters.",
            positiveSentiment: "😊 Positive public sentiment. Maintain momentum.",
            lowBjp: "📉 BJP vote share dropped significantly. Re-evaluate campaign strategy.",
            highTmc: "📈 TMC gained here. Study their approach.",
            noOpinions: "No opinions recorded yet. Start collecting feedback."
        }
    },
    hi: {
        chooseOption: "-- एक बूथ चुनें --",
        addWorkerBtn: "✅ कार्यकर्ता जोड़ें",
        addOpinionBtn: "✅ राय जोड़ें",
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
        advice: {
            turnoutDrop: "⚠️ मतदान में {percent}% की गिरावट आई है। कारणों की जांच करें और कार्रवाई करें।",
            turnoutIncrease: "✅ मतदान में {percent}% की वृद्धि हुई है। अच्छा काम जारी रखें।",
            roadIssue: "🛣️ सड़क की समस्या बार-बार उठ रही है। स्थानीय प्रशासन से संपर्क करें।",
            waterIssue: "💧 पानी की आपूर्ति की समस्या बताई जा रही है। इस मुद्दे को प्राथमिकता दें।",
            workerShortage: "👥 कार्यकर्ताओं की कमी: {ratio} मतदाता प्रति कार्यकर्ता। {needed} और कार्यकर्ता चाहिए।",
            negativeSentiment: "😞 समग्र भावना नकारात्मक है। जनता की चिंताओं का तुरंत समाधान करें।",
            neutralSentiment: "😐 मिश्रित जनमत। मतदाताओं के साथ अधिक जुड़ें।",
            positiveSentiment: "😊 सकारात्मक जनमत। गति बनाए रखें।",
            lowBjp: "📉 भाजपा का वोट शेयर काफी गिरा। रणनीति पर पुनर्विचार करें।",
            highTmc: "📈 टीएमसी ने यहां बढ़त हासिल की। उनके दृष्टिकोण का अध्ययन करें।",
            noOpinions: "अभी कोई राय दर्ज नहीं की गई। प्रतिक्रिया एकत्र करना शुरू करें।"
        }
    },
    bn: {
        chooseOption: "-- একটি বুথ বেছে নিন --",
        addWorkerBtn: "✅ কর্মী যুক্ত করুন",
        addOpinionBtn: "✅ মতামত যোগ করুন",
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
            turnoutDrop: "⚠️ ভোট পড়েছে {percent}% কমেছে। কারণ খতিয়ে দেখুন এবং ব্যবস্থা নিন।",
            turnoutIncrease: "✅ ভোট পড়েছে {percent}% বেড়েছে। ভালো কাজ চালিয়ে যান।",
            roadIssue: "🛣️ রাস্তার সমস্যা বারবার উঠেছে। স্থানীয় প্রশাসনের সাথে যোগাযোগ করুন।",
            waterIssue: "💧 পানীয় জলের সমস্যা জানানো হচ্ছে। এই ইস্যুকে প্রাধান্য দিন।",
            workerShortage: "👥 কর্মী সংকট: প্রতি কর্মীর জন্য {ratio} ভোটার। আরও {needed} জন কর্মী দরকার।",
            negativeSentiment: "😞 সামগ্রিক মতামত নেতিবাচক। জনগণের উদ্বেগ দ্রুত সমাধান করুন।",
            neutralSentiment: "😐 মিশ্র জনমত। ভোটারদের সাথে আরও সম্পৃক্ত হোন।",
            positiveSentiment: "😊 ইতিবাচক জনমত। গতি ধরে রাখুন।",
            lowBjp: "📉 বিজেপি ভোটশেয়ার উল্লেখযোগ্যভাবে কমেছে। কৌশল পুনর্মূল্যায়ন করুন।",
            highTmc: "📈 তৃণমূল এখানে লাভ করেছে। তাদের পদ্ধতি অধ্যয়ন করুন।",
            noOpinions: "এখনও কোনো মতামত রেকর্ড হয়নি। মতামত সংগ্রহ শুরু করুন।"
        }
    }
};

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

window.onload = function() {
    console.log('Window loaded, setting language to bn');
    setLanguage('bn');
    fetch('data/boothData.json')
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log('Booth data loaded:', data.length, 'booths');
            boothData = data;
            populateBoothDropdown();
            checkForAlerts();
        })
        .catch(err => {
            console.error('ডেটা লোড করতে সমস্যা:', err);
            alert('ডেটা লোড করতে সমস্যা হয়েছে। কনসোল চেক করুন।');
        });
};

function populateBoothDropdown() {
    const select = document.getElementById('boothSelect');
    if (!select) return;
    select.innerHTML = `<option value="">${translations[currentLanguage].chooseOption}</option>`;
    if (!boothData || boothData.length === 0) return;
    boothData.sort((a,b) => (a.BoothNo || 0) - (b.BoothNo || 0)).forEach(b => {
        const option = document.createElement('option');
        option.value = b.BoothNo;
        const muslimText = currentLanguage==='bn'?'মুসলমান':currentLanguage==='hi'?'मुस्लिम':'Muslim';
        option.textContent = `${b.BoothNo}. ${b.BoothName} (${b.Segment}, ${b.MuslimPercent}% ${muslimText})`;
        select.appendChild(option);
    });
}

let currentBooth = null;
let currentBoothDetails = null;

function loadBoothDetails() {
    console.log('loadBoothDetails called');
    const boothNo = document.getElementById('boothSelect').value;
    if (!boothNo) {
        document.getElementById('boothDetails').style.display = 'none';
        return;
    }
    currentBooth = boothNo;
    document.getElementById('boothDetails').style.display = 'block';

    const booth = boothData.find(b => b.BoothNo == boothNo);
    if (booth) {
        currentBoothDetails = booth;
        displayBoothDetails(booth);
        generateAnalysis(booth, workersData[boothNo] || [], opinionsData[boothNo] || []);
    }
    displayWorkers(workersData[boothNo] || []);
    displayOpinions(opinionsData[boothNo] || []);
}

function displayBoothDetails(b) {
    const table = document.getElementById('analysisTable');
    if (!table) return;
    table.innerHTML = `
        <tr><td>Booth No</td><td>${b.BoothNo}</td></tr>
        <tr><td>Booth Name</td><td>${b.BoothName}</td></tr>
        <tr><td>Segment</td><td>${b.Segment}</td></tr>
        <tr><td>Muslim %</td><td>${b.MuslimPercent}%</td></tr>
        <tr><td>Total Electors</td><td>${b.TotalElectors}</td></tr>
        <tr><td>Poll % 2021</td><td>${b.Poll2021}%</td></tr>
        <tr><td>Poll % 2024</td><td>${b.Poll2024}%</td></tr>
        <tr><td>BJP 2021</td><td>${b.BJP2021}%</td></tr>
        <tr><td>TMC 2021</td><td>${b.TMC2021}%</td></tr>
        <tr><td>Others 2021</td><td>${b.Other2021}%</td></tr>
        <tr><td>BJP 2024</td><td>${b.BJP2024}%</td></tr>
        <tr><td>TMC 2024</td><td>${b.TMC2024}%</td></tr>
        <tr><td>Others 2024</td><td>${b.Other2024}%</td></tr>
    `;
}

function showAnalysisModal() {
    if (!currentBoothDetails) return;
    const text = currentBoothDetails.MyAnalysis || translations[currentLanguage].analysisNotAvailable;
    document.getElementById('modalAnalysisText').innerText = text;
    document.getElementById('analysisModal').style.display = 'block';
}

function showStrategyModal() {
    if (!currentBoothDetails) return;
    const text = currentBoothDetails.MyStrategy || translations[currentLanguage].strategyNotAvailable;
    document.getElementById('modalStrategyText').innerText = text;
    document.getElementById('strategyModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const chevron = document.getElementById(sectionId === 'workerSection' ? 'workerChevron' : 'opinionChevron');
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
    console.log('Generating analysis for booth:', booth.BoothNo);
    updateVoteChart(booth);
    updateKeywordCloud(opinions);
    updateSentimentMeter(opinions);
    displayAdvice(generateAdvice(booth, workers, opinions));
}

function updateVoteChart(booth) {
    const canvas = document.getElementById('voteChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['2021', '2024'],
            datasets: [
                { label: 'BJP', data: [booth.BJP2021 || 0, booth.BJP2024 || 0], backgroundColor: '#ff6b6b', borderRadius: 6 },
                { label: 'TMC', data: [booth.TMC2021 || 0, booth.TMC2024 || 0], backgroundColor: '#4ecdc4', borderRadius: 6 },
                { label: 'Others', data: [booth.Other2021 || 0, booth.Other2024 || 0], backgroundColor: '#95a5a6', borderRadius: 6 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 100, grid: { color: '#f0f0f0' } } },
            plugins: { legend: { position: 'top', labels: { boxWidth: 12, usePointStyle: true } } }
        }
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
    if (typeof nlp === 'undefined') {
        container.innerHTML = `<span class="text-muted">NLP library not loaded</span>`;
        return;
    }
    const doc = nlp(allText);
    const nouns = doc.nouns().out('array');
    const adjectives = doc.adjectives().out('array');
    const words = [...nouns, ...adjectives].map(w => w.toLowerCase());

    const stopwords = { bn: ['এবং', 'করে', 'থেকে', 'এই', 'যে', 'কি', 'তা', 'জন্য', 'হয়', 'না', 'তে', 'ের'], hi: ['और', 'से', 'यह', 'वह', 'की', 'का', 'में'], en: ['the', 'and', 'for', 'this', 'that', 'with'] };
    const currentStopwords = stopwords[currentLanguage] || [];
    const filtered = words.filter(w => w && w.length > 1 && !currentStopwords.includes(w));

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
    if (!opinions || opinions.length === 0) {
        indicator.style.left = '50%';
        return;
    }

    const sentimentWords = {
        bn: { positive: ['ভাল', 'সন্তুষ্ট', 'ধন্যবাদ', 'উন্নতি', 'সহযোগিতা', 'চমৎকার', 'ঠিক'], negative: ['খারাপ', 'সমস্যা', 'অভিযোগ', 'দুর্নীতি', 'ব্যর্থ', 'ক্ষতি', 'বিরক্ত'] },
        hi: { positive: ['अच्छा', 'संतुष्ट', 'धन्यवाद', 'सुधार', 'बढ़िया'], negative: ['बुरा', 'समस्या', 'शिकायत', 'भ्रष्टाचार', 'असफल'] },
        en: { positive: ['good', 'satisfied', 'thanks', 'improvement', 'excellent', 'great'], negative: ['bad', 'problem', 'complaint', 'corruption', 'failed', 'damage'] }
    };
    const words = sentimentWords[currentLanguage] || sentimentWords.en;

    let score = 0;
    opinions.forEach(o => {
        const text = ((o.opinion || '') + ' ' + (o.notes || '')).toLowerCase();
        words.positive.forEach(w => { if (text.includes(w)) score++; });
        words.negative.forEach(w => { if (text.includes(w)) score--; });
    });

    const max = opinions.length * 2;
    const normalized = 50 + (score / max) * 50;
    const final = Math.min(100, Math.max(0, normalized));
    indicator.style.left = final + '%';
}

function generateAdvice(booth, workers, opinions) {
    const advice = [];
    const t = translations[currentLanguage].advice;

    const turnoutDiff = (booth.Poll2024 || 0) - (booth.Poll2021 || 0);
    if (turnoutDiff < -5) advice.push({ type: 'danger', text: t.turnoutDrop.replace('{percent}', Math.abs(turnoutDiff).toFixed(1)) });
    else if (turnoutDiff > 5) advice.push({ type: 'success', text: t.turnoutIncrease.replace('{percent}', turnoutDiff.toFixed(1)) });

    if (opinions.length > 0) {
        const all = opinions.map(o => o.opinion || '').join(' ').toLowerCase();
        if (all.includes('রাস্তা') || all.includes('সড়ক') || all.includes('road')) advice.push({ type: 'warning', text: t.roadIssue });
        if (all.includes('পানি') || all.includes('জল') || all.includes('water')) advice.push({ type: 'warning', text: t.waterIssue });
    } else {
        advice.push({ type: 'info', text: t.noOpinions });
    }

    const voterPerWorker = (booth.TotalElectors || 0) / (workers.length || 1);
    if (voterPerWorker > 500) {
        const needed = Math.ceil(workers.length ? (voterPerWorker - 300) / 300 : 3);
        advice.push({ type: 'warning', text: t.workerShortage.replace('{ratio}', Math.round(voterPerWorker)).replace('{needed}', needed) });
    }

    const bjpDiff = (booth.BJP2024 || 0) - (booth.BJP2021 || 0);
    if (bjpDiff < -10) advice.push({ type: 'danger', text: t.lowBjp });

    const tmcDiff = (booth.TMC2024 || 0) - (booth.TMC2021 || 0);
    if (tmcDiff > 10) advice.push({ type: 'warning', text: t.highTmc });

    return advice;
}

function displayAdvice(adviceList) {
    const container = document.getElementById('adviceList');
    if (!container) return;
    if (adviceList.length === 0) {
        container.innerHTML = `<p class="text-muted">${currentLanguage==='bn'?'কোনো পরামর্শ নেই':currentLanguage==='hi'?'कोई सलाह नहीं':'No advice'}</p>`;
        return;
    }
    container.innerHTML = adviceList.map(item =>
        `<div class="advice-item ${item.type}"><i class="fas fa-${item.type==='danger'?'exclamation-circle':item.type==='warning'?'exclamation-triangle':item.type==='success'?'check-circle':'info-circle'}"></i> ${item.text}</div>`
    ).join('');
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
}

function checkForAlerts() {
    boothData.forEach(booth => {
        const drop = (booth.Poll2021 || 0) - (booth.Poll2024 || 0);
        if (drop > 10) showNotification(`⚠️ Booth ${booth.BoothNo}: turnout dropped by ${drop.toFixed(1)}%`);
    });
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
    if (!workers || workers.length === 0) {
        container.innerHTML = `<p class="text-muted">${translations[currentLanguage].noWorkers}</p>`;
        return;
    }
    let html = '';
    workers.forEach((w, index) => {
        html += `
            <div class="item-card">
                <div class="item-header">
                    <div class="item-info">
                        <strong>${w.name}</strong><br>
                        📞 ${w.phone} | 🎯 ${w.role}<br>
                        <small>${currentLanguage==='bn'?'যুক্ত':currentLanguage==='hi'?'जोड़ा गया':'Added'}: ${new Date(w.addedDate).toLocaleDateString()}</small>
                        ${w.notes ? `<br><small>📝 ${w.notes}</small>` : ''}
                    </div>
                    <div class="item-actions">
                        <button class="btn-edit" onclick="openEditWorkerModal(${index})"><i class="fas fa-edit"></i> ${currentLanguage==='bn'?'সম্পাদনা':currentLanguage==='hi'?'संपादित करें':'Edit'}</button>
                        <button class="btn-delete" onclick="deleteWorker(${index})"><i class="fas fa-trash"></i> ${currentLanguage==='bn'?'মুছুন':currentLanguage==='hi'?'हटाएं':'Delete'}</button>
                    </div>
                </div>
                <div style="margin-top:12px;">
                    <a href="tel:${w.phone}" class="btn-call"><i class="fas fa-phone"></i> ${currentLanguage==='bn'?'কল':currentLanguage==='hi'?'कॉल':'Call'}</a>
                    <a href="https://wa.me/${(w.whatsapp || w.phone).replace(/[^0-9]/g, '')}" target="_blank" class="btn-wa"><i class="fab fa-whatsapp"></i> ${currentLanguage==='bn'?'হোয়াটসঅ্যাপ':currentLanguage==='hi'?'व्हाट्सएप':'WhatsApp'}</a>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function addNewWorker(event) {
    event.preventDefault();
    const formMsg = document.getElementById('formMessage');
    if (formMsg) formMsg.innerHTML = `<div class="loading">${currentLanguage==='bn'?'যুক্ত হচ্ছে...':currentLanguage==='hi'?'जोड़ा जा रहा है...':'Adding...'}</div>`;

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
    const updatedData = {
        name: document.getElementById('editWorkerName').value.trim(),
        phone: document.getElementById('editWorkerPhone').value.trim(),
        whatsapp: document.getElementById('editWorkerWhatsapp').value.trim() || document.getElementById('editWorkerPhone').value.trim(),
        role: document.getElementById('editWorkerRole').value.trim(),
        notes: document.getElementById('editWorkerNotes').value.trim(),
        addedDate: workersData[currentBooth][index].addedDate
    };

    workersData[currentBooth][index] = updatedData;
    localStorage.setItem('workers', JSON.stringify(workersData));

    closeModal('editWorkerModal');
    displayWorkers(workersData[currentBooth]);
    if (currentBoothDetails) generateAnalysis(currentBoothDetails, workersData[currentBooth], opinionsData[currentBooth] || []);
    alert(translations[currentLanguage].updateSuccess);
}

function deleteWorker(index) {
    if (confirm(translations[currentLanguage].confirmDelete)) {
        workersData[currentBooth].splice(index, 1);
        if (workersData[currentBooth].length === 0) delete workersData[currentBooth];
        localStorage.setItem('workers', JSON.stringify(workersData));
        displayWorkers(workersData[currentBooth] || []);
        if (currentBoothDetails) generateAnalysis(currentBoothDetails, workersData[currentBooth] || [], opinionsData[currentBooth] || []);
        alert(translations[currentLanguage].deleteSuccess);
    }
}

// ================== Opinion Functions ==================
function displayOpinions(opinions) {
    const container = document.getElementById('opinionsList');
    if (!container) return;
    if (!opinions || opinions.length === 0) {
        container.innerHTML = `<p class="text-muted">${translations[currentLanguage].noOpinions}</p>`;
        return;
    }
    let html = '';
    opinions.forEach((o, index) => {
        html += `
            <div class="item-card">
                <div class="item-header">
                    <div class="item-info">
                        <strong>${o.personName}</strong> (📞 ${o.phone})<br>
                        💬 ${o.opinion}<br>
                        <small>${currentLanguage==='bn'?'রেকর্ড':currentLanguage==='hi'?'रिकॉर्ड किया गया':'Recorded'}: ${new Date(o.addedDate).toLocaleDateString()}</small>
                        ${o.notes ? `<br><small>📝 ${o.notes}</small>` : ''}
                    </div>
                    <div class="item-actions">
                        <button class="btn-edit" onclick="openEditOpinionModal(${index})"><i class="fas fa-edit"></i> ${currentLanguage==='bn'?'সম্পাদনা':currentLanguage==='hi'?'संपादित करें':'Edit'}</button>
                        <button class="btn-delete" onclick="deleteOpinion(${index})"><i class="fas fa-trash"></i> ${currentLanguage==='bn'?'মুছুন':currentLanguage==='hi'?'हटाएं':'Delete'}</button>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function addNewOpinion(event) {
    event.preventDefault();
    const formMsg = document.getElementById('formMessage');
    if (formMsg) formMsg.innerHTML = `<div class="loading">${currentLanguage==='bn'?'যুক্ত হচ্ছে...':currentLanguage==='hi'?'जोड़ा जा रहा है...':'Adding...'}</div>`;

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
    const updatedData = {
        personName: document.getElementById('editOpinionPersonName').value.trim(),
        phone: document.getElementById('editOpinionPhone').value.trim(),
        opinion: document.getElementById('editOpinionText').value.trim(),
        notes: document.getElementById('editOpinionNotes').value.trim(),
        addedDate: opinionsData[currentBooth][index].addedDate
    };

    opinionsData[currentBooth][index] = updatedData;
    localStorage.setItem('opinions', JSON.stringify(opinionsData));

    closeModal('editOpinionModal');
    displayOpinions(opinionsData[currentBooth]);
    if (currentBoothDetails) generateAnalysis(currentBoothDetails, workersData[currentBooth] || [], opinionsData[currentBooth]);
    alert(translations[currentLanguage].updateSuccess);
}

function deleteOpinion(index) {
    if (confirm(translations[currentLanguage].confirmDelete)) {
        opinionsData[currentBooth].splice(index, 1);
        if (opinionsData[currentBooth].length === 0) delete opinionsData[currentBooth];
        localStorage.setItem('opinions', JSON.stringify(opinionsData));
        displayOpinions(opinionsData[currentBooth] || []);
        if (currentBoothDetails) generateAnalysis(currentBoothDetails, workersData[currentBooth] || [], opinionsData[currentBooth] || []);
        alert(translations[currentLanguage].deleteSuccess);
    }
}
