let currentLanguage = 'bn';
let boothData = [];
let workersData = JSON.parse(localStorage.getItem('workers')) || {};

const translations = {
    en: { 
        chooseOption: "-- Choose a booth --", 
        addButton: "✅ Add Worker", 
        noWorkers: "No workers added for this booth yet.", 
        successMsg: "Worker added successfully!", 
        errorMsg: "Error: ", 
        required: "Name, phone and role are required", 
        duplicatePhone: "This phone number is already added for this booth.",
        analysisNotAvailable: "No analysis provided",
        strategyNotAvailable: "No strategy provided"
    },
    hi: { 
        chooseOption: "-- एक बूथ चुनें --", 
        addButton: "✅ कार्यकर्ता जोड़ें", 
        noWorkers: "इस बूथ के लिए अभी कोई कार्यकर्ता नहीं जोड़ा गया।", 
        successMsg: "कार्यकर्ता सफलतापूर्वक जोड़ा गया!", 
        errorMsg: "त्रुटि: ", 
        required: "नाम, फोन और भूमिका आवश्यक है", 
        duplicatePhone: "यह फोन नंबर पहले से इस बूथ में जोड़ा गया है।",
        analysisNotAvailable: "विश्लेषण नहीं दिया गया",
        strategyNotAvailable: "रणनीति नहीं दी गई"
    },
    bn: { 
        chooseOption: "-- একটি বুথ বেছে নিন --", 
        addButton: "✅ কর্মী যুক্ত করুন", 
        noWorkers: "এই বুথে এখনও কোনো কর্মী যুক্ত হয়নি।", 
        successMsg: "কর্মী সফলভাবে যুক্ত হয়েছে!", 
        errorMsg: "ত্রুটি: ", 
        required: "নাম, ফোন ও দায়িত্ব আবশ্যক", 
        duplicatePhone: "এই ফোন নম্বরটি ইতিমধ্যে এই বুথে যুক্ত আছে।",
        analysisNotAvailable: "বিশ্লেষণ দেওয়া নেই",
        strategyNotAvailable: "কৌশল দেওয়া নেই"
    }
};

function setLanguage(lang) {
    currentLanguage = lang;
    
    // Update dropdown placeholder
    const select = document.getElementById('boothSelect');
    const defaultOption = select.querySelector('option[value=""]');
    if (defaultOption) defaultOption.textContent = translations[lang].chooseOption;
    
    // Update add worker button text
    document.getElementById('addWorkerBtn').textContent = translations[lang].addButton;
    
    // Update language visibility
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (key === 'en' || key === 'hi' || key === 'bn') {
            el.style.display = (key === lang) ? 'inline' : 'none';
        }
    });
    
    // Update active class on language buttons
    document.getElementById('langBn').classList.toggle('active', lang === 'bn');
    document.getElementById('langHi').classList.toggle('active', lang === 'hi');
    document.getElementById('langEn').classList.toggle('active', lang === 'en');
}

window.onload = function() {
    setLanguage('bn');
    fetch('data/boothData.json')
        .then(res => res.json())
        .then(data => { 
            boothData = data; 
            populateBoothDropdown(); 
        })
        .catch(err => console.error('ডেটা লোড করতে সমস্যা:', err));
};

function populateBoothDropdown() {
    const select = document.getElementById('boothSelect');
    select.innerHTML = `<option value="">${translations[currentLanguage].chooseOption}</option>`;
    boothData.sort((a,b) => a.BoothNo - b.BoothNo).forEach(b => {
        const option = document.createElement('option');
        option.value = b.BoothNo;
        option.textContent = `${b.BoothNo}. ${b.BoothName} (${b.Segment}, ${b.MuslimPercent}% ${currentLanguage==='bn'?'মুসলমান':currentLanguage==='hi'?'मुस्लिम':'Muslim'})`;
        select.appendChild(option);
    });
}

let currentBooth = null;
let currentBoothDetails = null;

function loadBoothDetails() {
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
    }
    displayWorkers(workersData[boothNo] || []);
}

function displayBoothDetails(b) {
    const table = document.getElementById('analysisTable');
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

// Modal functions
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

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

function displayWorkers(workers) {
    const container = document.getElementById('workersList');
    if (!workers || workers.length === 0) { 
        container.innerHTML = `<p class="error">${translations[currentLanguage].noWorkers}</p>`; 
        return; 
    }
    let html = '';
    workers.forEach(w => {
        html += `
            <div class="worker-item">
                <div class="worker-info">
                    <strong>${w.name}</strong><br>
                    📞 ${w.phone} | 🎯 ${w.role}<br>
                    <small>${currentLanguage==='bn'?'যুক্ত':currentLanguage==='hi'?'जोड़ा गया':'Added'}: ${new Date(w.addedDate).toLocaleDateString()}</small>
                </div>
                <div class="worker-actions">
                    <a href="tel:${w.phone}" class="btn-call">${currentLanguage==='bn'?'কল':currentLanguage==='hi'?'कॉल':'Call'}</a>
                    <a href="https://wa.me/${w.whatsapp.replace(/[^0-9]/g, '')}" target="_blank" class="btn-wa">${currentLanguage==='bn'?'হোয়াটসঅ্যাপ':currentLanguage==='hi'?'व्हाट्सएप':'WhatsApp'}</a>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function addNewWorker(event) {
    event.preventDefault();
    const formMsg = document.getElementById('formMessage');
    formMsg.innerHTML = `<div class="loading">${currentLanguage==='bn'?'যুক্ত হচ্ছে...':currentLanguage==='hi'?'जोड़ा जा रहा है...':'Adding...'}</div>`;

    const phone = document.getElementById('workerPhone').value.trim();
    const whatsapp = document.getElementById('workerWhatsapp').value.trim() || phone;

    // Check for duplicate phone number in the same booth
    const existingWorkers = workersData[currentBooth] || [];
    if (existingWorkers.some(w => w.phone === phone)) {
        formMsg.innerHTML = `<div class="error">${translations[currentLanguage].errorMsg} ${translations[currentLanguage].duplicatePhone}</div>`;
        return;
    }

    const workerData = {
        boothNo: currentBooth,
        name: document.getElementById('workerName').value.trim(),
        phone: phone,
        whatsapp: whatsapp,
        role: document.getElementById('workerRole').value.trim(),
        notes: document.getElementById('workerNotes').value.trim(),
        addedDate: new Date().toISOString()
    };

    if (!workerData.name || !workerData.phone || !workerData.role) {
        formMsg.innerHTML = `<div class="error">${translations[currentLanguage].errorMsg} ${translations[currentLanguage].required}</div>`;
        return;
    }

    if (!workersData[currentBooth]) workersData[currentBooth] = [];
    workersData[currentBooth].push(workerData);
    localStorage.setItem('workers', JSON.stringify(workersData));

    formMsg.innerHTML = `<div class="success">✅ ${translations[currentLanguage].successMsg}</div>`;
    document.getElementById('workerForm').reset();
    displayWorkers(workersData[currentBooth]);
}
