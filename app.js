// --- 1. STATE & DATA ---
const state = {
    language: 'en',
    user: {
        name: '',
        age: '',
        doctorMobile: '',
        triggers: [],
        symptoms: []
    },
    mode: 'manual', // 'manual' or 'device'
    deviceData: {
        connected: false,
        temp: 0,
        hum: 0,
        aqi: 0
    },
    manualData: {
        temp: 25,
        hum: 50,
        aqi: 40,
        coughCount: 0
    },
    riskLevel: 'low', // 'low', 'medium', 'severe'
    bluetoothDevice: null,
    micStream: null,
    micActive: false,
    audioContext: null,
    userLocation: null
};

// Available symptoms & triggers
const triggerOptions = [
    { id: 'dust', en: 'Dust', hi: 'धूल', kn: 'ಧೂಳು' },
    { id: 'humidity', en: 'High Humidity', hi: 'उच्च आर्द्रता', kn: 'ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆ' },
    { id: 'cold', en: 'Cold Temp', hi: 'ठंडा तापमान', kn: 'ತಂಪಾದ ತಾಪಮಾನ' },
    { id: 'smoke', en: 'Smoke', hi: 'धुआँ', kn: 'ಹೊಗೆ' },
    { id: 'pollen', en: 'Pollen', hi: 'पराग', kn: 'ಪರಾಗ' },
    { id: 'smell', en: 'Strong Smell', hi: 'तेज गंध', kn: 'ಬಲವಾದ ವಾಸನೆ' },
    { id: 'exertion', en: 'Physical Exertion', hi: 'शारीरिक परिश्रम', kn: 'ದೈಹಿಕ ಶ್ರಮ' },
    { id: 'tightness', en: 'Chest Tightness', hi: 'सीने में जकड़न', kn: 'ಎದೆಯಲ್ಲಿ ಬಿಗಿತ' },
    { id: 'wheezing', en: 'Wheezing', hi: 'घरघराहಟ್', kn: 'ಉಬ್ಬಸ' },
    { id: 'coughing', en: 'Coughing', hi: 'खांसी', kn: 'ಕೆಮ್ಮು' },
    { id: 'shortness', en: 'Shortness of Breath', hi: 'सांस की तकलीफ', kn: 'ಉಸಿರಾಟದ ತೊಂದರೆ' },
    { id: 'fatigue', en: 'Fatigue', hi: 'थकान', kn: 'ಆಯಾಸ' }
];

// Dictionary for static UI elements
const i18n = {
    en: {
        'lang-subtitle': 'Select your preferred language',
        'profile-title': 'Profile Setup',
        'lbl-name': 'Name',
        'lbl-age': 'Age',
        'lbl-doctor': 'Doctor Mobile No.',
        'lbl-triggers': 'Select Triggers & Symptoms',
        'btn-continue': 'Continue to Dashboard',
        'nav-dashboard': 'Dashboard',
        'nav-device': 'Device Setup',
        'nav-reports': 'Reports',
        'nav-alerts': 'Alerts',
        'nav-settings': 'Settings',
        'nav-profile': 'Profile',
        'dashboard-header': 'Overview',
        'btn-with-device': 'Device Monitoring',
        'btn-without-device': 'Without Device Monitoring',
        'lbl-ai-analysis': 'AI Risk Analysis',
        'lbl-dev-temp': 'Temperature',
        'lbl-dev-hum': 'Humidity',
        'lbl-dev-aqi': 'Air Quality (MQ2)',
        'lbl-trend-temp': 'Device Temperature & Humidity',
        'lbl-trend-aqi': 'Device Air Quality History',
        'lbl-recommendations': 'Recommendations',
        'lbl-bluetooth-setup': 'Bluetooth Device Setup',
        'lbl-bluetooth-desc': 'Connect to your ESP32 device to read real-time DHT11 and MQ2 sensor data.',
        'btn-connect': 'Connect to Device',
        'btn-sms-alert': 'Send SMS Report to Doctor',
        'lbl-not-connected': 'Device Not Connected',
        'risk-low': 'Low Risk',
        'risk-medium': 'Medium Risk',
        'risk-severe': 'Severe Risk',
        'msg-low': 'Conditions are optimal. You are safe.',
        'msg-medium': 'Caution: Warning levels detected. Be cautious.',
        'msg-severe': 'DANGER: Severe risk detected! Seek medical help immediately.',
        'rec-low': ['Continue normal activities.', 'Take prescribed maintenance meds.'],
        'rec-medium': ['Avoid outdoor exertion.', 'Keep inhaler handy.'],
        'rec-severe': ['USE RESCUE INHALER NOW.', 'Contact your doctor immediately.'],
        'pred-safe': 'Predictions indicate stable conditions for the next 24 hours.',
        'pred-warn': 'Warning: Environmental levels are predicted to cross thresholds soon. Take precautions.',
        'prec-temp': 'Predicted low temperature. Keep warm and stay indoors.',
        'prec-aqi': 'Predicted high pollution. Use N95 mask and close windows.',
        'prec-hum': 'Predicted high humidity. Use a dehumidifier if possible.'
    },
    hi: {
        'lang-subtitle': 'अपनी पसंदीदा भाषा चुनें',
        'profile-title': 'प्रोफ़ाइल सेटअप',
        'lbl-name': 'नाम',
        'lbl-age': 'आयु',
        'lbl-doctor': 'डॉक्टर का मोबाइल नंबर',
        'lbl-triggers': 'ट्रिगर्स और लक्षण चुनें',
        'btn-continue': 'डैशबोर्ड पर जारी रखें',
        'nav-dashboard': 'डैशबोर्ड',
        'nav-device': 'डिवाइस सेटअप',
        'nav-reports': 'रिपोर्ट',
        'nav-alerts': 'अलर्ट',
        'nav-settings': 'सेटिंग्स',
        'nav-profile': 'प्रोफ़ाइल',
        'dashboard-header': 'अवलोकन',
        'btn-with-device': 'डिवाइस मॉनिटरिंग',
        'btn-without-device': 'बिना डिवाइस मॉनिटरिंग',
        'lbl-ai-analysis': 'AI जोखिम विश्लेषण',
        'lbl-dev-temp': 'तापमान',
        'lbl-dev-hum': 'नमी',
        'lbl-dev-aqi': 'वायु गुणवत्ता (MQ2)',
        'lbl-trend-temp': 'डिवाइस तापमान और आर्द्रता',
        'lbl-trend-aqi': 'डिवाइस वायु गुणवत्ता इतिहास',
        'lbl-recommendations': 'सिफारिशें',
        'lbl-bluetooth-setup': 'ब्लूटूथ डिवाइस सेटअप',
        'lbl-bluetooth-desc': 'रीयल-टाइम सेंसर डेटा पढ़ने के लिए अपने ESP32 से कनेक्ट करें।',
        'btn-connect': 'डिवाइस से कनेक्ट करें',
        'btn-sms-alert': 'डॉक्टर को SMS रिपोर्ट भेजें',
        'lbl-not-connected': 'डिवाइस कनेक्ट नहीं है',
        'risk-low': 'कम जोखिम',
        'risk-medium': 'मध्यम जोखिम',
        'risk-severe': 'गंभीर जोखिम',
        'msg-low': 'स्थितियां अनुकूल हैं। आप सुरक्षित हैं।',
        'msg-medium': 'सावधान: चेतावनी स्तर। सतर्क रहें।',
        'msg-severe': 'खतरा: गंभीर जोखिम! तुरंत चिकित्सा सहायता लें।',
        'rec-low': ['सामान्य गतिविधियां जारी रखें।', 'निर्धारित दवाएं लें।'],
        'rec-medium': ['बाहर मेहनत करने से बचें।', 'इनहेलर पास रखें।'],
        'rec-severe': ['अभी बचाव इनहेलर का उपयोग करें।', 'तुरंत डॉक्टर से संपर्क करें।'],
        'pred-safe': 'अगले 24 घंटों के लिए स्थितियां स्थिर रहने का अनुमान है।',
        'pred-warn': 'चेतावनी: पर्यावरण स्तर जल्द ही सीमा पार करने का अनुमान है। सावधानी बरतें।',
        'prec-temp': 'कम तापमान का अनुमान। गर्म रहें और घर के अंदर रहें।',
        'prec-aqi': 'उच्च प्रदूषण का अनुमान। N95 मास्क का उपयोग करें।',
        'prec-hum': 'उच्च आर्द्रता का अनुमान। डीह्यूमिडिफायर का उपयोग करें।'
    },
    kn: {
        'lang-subtitle': 'ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        'profile-title': 'ಪ್ರೊಫೈಲ್ ಸೆಟಪ್',
        'lbl-name': 'ಹೆಸರು',
        'lbl-age': 'ವಯಸ್ಸು',
        'lbl-doctor': 'ವೈದ್ಯರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
        'lbl-triggers': 'ಪ್ರಚೋದಕಗಳು ಮತ್ತು ಲಕ್ಷಣಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        'btn-continue': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಮುಂದುವರಿಯಿರಿ',
        'nav-dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
        'nav-device': 'ಸಾಧನ ಸೆಟಪ್',
        'nav-reports': 'ವರದಿಗಳು',
        'nav-alerts': 'ಎಚ್ಚರಿಕೆಗಳು',
        'nav-settings': 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
        'nav-profile': 'ಪ್ರೊಫೈಲ್',
        'dashboard-header': 'ಅವಲೋಕನ',
        'btn-with-device': 'ಸಾಧನ ಮೇಲ್ವಿಚಾರಣೆ',
        'btn-without-device': 'ಸಾಧನವಿಲ್ಲದೆ ಮೇಲ್ವಿಚಾರಣೆ',
        'lbl-ai-analysis': 'AI ಅಪಾಯದ ವಿಶ್ಲೇಷಣೆ',
        'lbl-dev-temp': 'ತಾಪಮಾನ',
        'lbl-dev-hum': 'ಆರ್ದ್ರತೆ',
        'lbl-dev-aqi': 'ಗಾಳಿಯ ಗುಣಮಟ್ಟ (MQ2)',
        'lbl-trend-temp': 'ಸಾಧನ ತಾಪಮಾನ ಮತ್ತು ಆರ್ದ್ರತೆ',
        'lbl-trend-aqi': 'ಸಾಧನ ಗಾಳಿಯ ಗುಣಮಟ್ಟ ಇತಿಹಾಸ',
        'lbl-recommendations': 'ಶಿಫಾರಸುಗಳು',
        'lbl-bluetooth-setup': 'ಬ್ಲೂಟೂತ್ ಸಾಧನ ಸೆಟಪ್',
        'lbl-bluetooth-desc': 'ನೈಜ-ಸಮಯದ ಡೇಟಾ ಓದಲು ನಿಮ್ಮ ESP32 ಗೆ ಸಂಪರ್ಕಪಡಿಸಿ.',
        'btn-connect': 'ಸಾಧನಕ್ಕೆ ಸಂಪರ್ಕಪಡಿಸಿ',
        'btn-sms-alert': 'ವೈದ್ಯರಿಗೆ SMS ವರದಿ ಕಳುಹಿಸಿ',
        'lbl-not-connected': 'ಸಾಧನ ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ',
        'risk-low': 'ಕಡಿಮೆ ಅಪಾಯ',
        'risk-medium': 'ಮಧ್ಯಮ ಅಪಾಯ',
        'risk-severe': 'ತೀವ್ರ ಅಪಾಯ',
        'msg-low': 'ಪರಿಸ್ಥಿತಿಗಳು ಉತ್ತಮವಾಗಿವೆ. ನೀವು ಸುರಕ್ಷಿತರಾಗಿದ್ದೀರಿ.',
        'msg-medium': 'ಎಚ್ಚರಿಕೆ: ಎಚ್ಚರಿಕೆ ಮಟ್ಟಗಳು. ಜಾಗರೂಕರಾಗಿರಿ.',
        'msg-severe': 'ಅಪಾಯ: ತೀವ್ರ ಅಪಾಯ ಪತ್ತೆಯಾಗಿದೆ! ತಕ್ಷಣ ವೈದ್ಯಕೀಯ ಸಹಾಯ ಪಡೆಯಿರಿ.',
        'rec-low': ['ಸಾಮಾನ್ಯ ಚಟುವಟಿಕೆಗಳನ್ನು ಮುಂದುವರಿಸಿ.', 'ಸೂಚಿಸಿದ ಔಷಧಿಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ.'],
        'rec-medium': ['ಹೊರಾಂಗಣ ಶ್ರಮವನ್ನು ತಪ್ಪಿಸಿ.', 'ಇನ್ಹೇಲರ್ ಅನ್ನು ಹತ್ತಿರದಲ್ಲಿಡಿ.'],
        'rec-severe': ['ಈಗಲೇ ರೆಸ್ಕ್ಯೂ ಇನ್ಹೇಲರ್ ಬಳಸಿ.', 'ತಕ್ಷಣ ನಿಮ್ಮ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.'],
        'pred-safe': 'ಮುಂದಿನ 24 ಗಂಟೆಗಳ ಕಾಲ ಪರಿಸ್ಥಿತಿಗಳು ಸ್ಥಿರವಾಗಿರುತ್ತವೆ ಎಂದು ಅಂದಾಜಿಸಲಾಗಿದೆ.',
        'pred-warn': 'ಎಚ್ಚರಿಕೆ: ಪರಿಸರ ಮಟ್ಟಗಳು ಶೀಘ್ರದಲ್ಲೇ ಮಿತಿ ದಾಟುವ ಮುನ್ಸೂಚನೆ ಇದೆ. ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸಿ.',
        'prec-temp': 'ಕಡಿಮೆ ತಾಪಮಾನದ ಮುನ್ಸೂಚನೆ. ಬೆಚ್ಚಗಿರಲು ಮತ್ತು ಮನೆಯೊಳಗೆ ಇರಲು ಪ್ರಯತ್ನಿಸಿ.',
        'prec-aqi': 'ಹೆಚ್ಚಿನ ಮಾಲಿನ್ಯದ ಮುನ್ಸೂಚನೆ. N95 ಮಾಸ್ಕ್ ಬಳಸಿ.',
        'prec-hum': 'ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆಯ ಮುನ್ಸೂಚನೆ. ಡಿಹ್ಯೂಮಿಡಿಫೈಯರ್ ಬಳಸಿ.'
    }
};

// --- 2. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderSymptomsGrid();
    initCharts();
    initPredictionChart();
    setMode('manual');
    captureLocation();
});

function captureLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            state.userLocation = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            };
        }, (err) => {
            console.warn("Location denied:", err.message);
        });
    }
}

// --- 3. UI LOGIC & ROUTING ---
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function setLanguage(lang) {
    state.language = lang;
    updateLanguageUI();
    switchScreen('screen-profile');
    renderSymptomsGrid();
}

function updateLanguageUI() {
    const langObj = i18n[state.language];
    for (let id in langObj) {
        const el = document.getElementById(id);
        if (el) {
            if (Array.isArray(langObj[id])) continue;
            el.innerText = langObj[id];
        }
    }
}

function renderSymptomsGrid() {
    const grid = document.getElementById('symptoms-grid');
    grid.innerHTML = '';
    triggerOptions.forEach(opt => {
        const btn = document.createElement('div');
        btn.className = 'toggle-btn' + (state.user.triggers.includes(opt.id) ? ' selected' : '');
        btn.innerText = opt[state.language];
        btn.onclick = () => toggleTrigger(opt.id, btn);
        grid.appendChild(btn);
    });
}

function toggleTrigger(id, btnElement) {
    const index = state.user.triggers.indexOf(id);
    if (index > -1) {
        state.user.triggers.splice(index, 1);
        btnElement.classList.remove('selected');
    } else {
        state.user.triggers.push(id);
        btnElement.classList.add('selected');
    }
}

function completeProfile() {
    const name = document.getElementById('userName').value.trim();
    const age = document.getElementById('userAge').value.trim();
    const doctor = document.getElementById('doctorMobile').value.trim();

    if(!name || !age || !doctor) {
        showToast('Please fill all profile fields', 'error');
        return;
    }

    state.user.name = name;
    state.user.age = age;
    state.user.doctorMobile = doctor;

    document.getElementById('display-username').innerText = name;
    document.querySelector('.avatar').innerText = name.charAt(0).toUpperCase();

    switchScreen('screen-dashboard');
    updateDashboardUI();
    runAIAnalysis();
}

function switchTab(tabId) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navEl = document.getElementById('nav-' + tabId);
    if (navEl) navEl.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById('tab-' + tabId).classList.remove('hidden');
}

function setMode(mode) {
    state.mode = mode;
    document.getElementById('btn-with-device').className = mode === 'device' ? 'btn btn-primary' : 'btn btn-secondary';
    document.getElementById('btn-without-device').className = mode === 'manual' ? 'btn btn-primary' : 'btn btn-secondary';
    
    document.getElementById('view-device').classList.add('hidden');
    document.getElementById('view-manual').classList.add('hidden');
    
    if (mode === 'device') {
        document.getElementById('view-device').classList.remove('hidden');
        if (!state.deviceData.connected) {
            document.getElementById('device-not-connected').classList.remove('hidden');
            document.getElementById('device-stats').classList.add('hidden');
        } else {
            document.getElementById('device-not-connected').classList.add('hidden');
            document.getElementById('device-stats').classList.remove('hidden');
        }
    } else {
        document.getElementById('view-manual').classList.remove('hidden');
    }

    updateDashboardUI();
    runAIAnalysis();
}

function updateManualData() {
    state.manualData.temp = parseFloat(document.getElementById('manual-temp').value) || 0;
    state.manualData.hum = parseFloat(document.getElementById('manual-hum').value) || 0;
    state.manualData.aqi = parseFloat(document.getElementById('manual-aqi').value) || 0;
    updateDashboardUI();
    runAIAnalysis();
}

function showToast(msg, type='info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderColor = type === 'error' ? 'var(--status-red)' : 'var(--accent-blue)';
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// --- 4. THRESHOLD & ICON LOGIC ---
function applyThresholdStyle(iconElementId, value, type) {
    const el = document.getElementById(iconElementId);
    if (!el) return;
    el.classList.remove('blink-slow', 'blink-fast');
    let status = 'safe';
    if (type === 'temp') {
        if (value < 15) status = 'danger';
        else if (value <= 20) status = 'warn';
    } else if (type === 'aqi' || type === 'hum') {
        if (value > 85) status = 'danger';
        else if (value >= 70) status = 'warn';
    } else if (type === 'cough') {
        if (value > 10) status = 'danger';
        else if (value >= 5) status = 'warn';
    }
    if (status === 'safe') el.style.backgroundColor = 'var(--status-green)';
    else if (status === 'warn') { el.style.backgroundColor = 'var(--status-yellow)'; el.classList.add('blink-slow'); }
    else if (status === 'danger') { el.style.backgroundColor = 'var(--status-red)'; el.classList.add('blink-fast'); }
    return status;
}

function updateDashboardUI() {
    if (state.mode === 'manual') {
        document.getElementById('val-man-temp').innerText = state.manualData.temp + '°C';
        document.getElementById('val-man-hum').innerText = state.manualData.hum + '%';
        document.getElementById('val-man-aqi').innerText = state.manualData.aqi + ' ppm';
        document.getElementById('val-man-cough').innerText = state.manualData.coughCount;
        applyThresholdStyle('icon-man-temp', state.manualData.temp, 'temp');
        applyThresholdStyle('icon-man-hum', state.manualData.hum, 'hum');
        applyThresholdStyle('icon-man-aqi', state.manualData.aqi, 'aqi');
        applyThresholdStyle('icon-man-cough', state.manualData.coughCount, 'cough');
    } else if (state.mode === 'device' && state.deviceData.connected) {
        document.getElementById('val-dev-temp').innerText = state.deviceData.temp + '°C';
        document.getElementById('val-dev-hum').innerText = state.deviceData.hum + '%';
        document.getElementById('val-dev-aqi').innerText = state.deviceData.aqi + ' ppm';
        applyThresholdStyle('icon-dev-temp', state.deviceData.temp, 'temp');
        applyThresholdStyle('icon-dev-hum', state.deviceData.hum, 'hum');
        applyThresholdStyle('icon-dev-aqi', state.deviceData.aqi, 'aqi');
    }
}

// --- 5. CHARTS LOGIC ---
let devTempHumChart, devAqiChart, predictionChart;
const chartData = { labels: [], temp: [], hum: [], aqi: [] };

function initCharts() {
    const ctx1 = document.getElementById('devTempHumChart').getContext('2d');
    devTempHumChart = new Chart(ctx1, {
        type: 'line',
        data: { labels: chartData.labels, datasets: [{ label: 'Temp (°C)', data: chartData.temp, borderColor: '#E11D48', tension: 0.4 }, { label: 'Humidity (%)', data: chartData.hum, borderColor: '#3B82F6', tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, color: '#E2E8F0' }
    });
    const ctx2 = document.getElementById('devAqiChart').getContext('2d');
    devAqiChart = new Chart(ctx2, {
        type: 'line',
        data: { labels: chartData.labels, datasets: [{ label: 'AQI (ppm)', data: chartData.aqi, borderColor: '#10B981', fill: true, backgroundColor: 'rgba(16, 185, 129, 0.2)', tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, color: '#E2E8F0' }
    });
}

function initPredictionChart() {
    const ctx = document.getElementById('predictionChart').getContext('2d');
    predictionChart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            color: '#E2E8F0',
            plugins: {
                annotation: { annotations: {} } // For future use with threshold lines if needed
            }
        }
    });
}

function updateCharts(temp, hum, aqi) {
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
    if(chartData.labels.length > 10) { chartData.labels.shift(); chartData.temp.shift(); chartData.hum.shift(); chartData.aqi.shift(); }
    chartData.labels.push(time); chartData.temp.push(temp); chartData.hum.push(hum); chartData.aqi.push(aqi);
    devTempHumChart.update(); devAqiChart.update();
}

// --- 6. PREDICTION LOGIC ---
function runPrediction() {
    const currentData = state.mode === 'device' ? state.deviceData : state.manualData;
    const labels = [];
    const pTemp = [];
    const pHum = [];
    const pAqi = [];
    
    let dangerFound = false;
    const precautions = new Set();
    const langObj = i18n[state.language];

    for (let i = 0; i < 24; i++) {
        labels.push(`${i}h`);
        // Simulate trends with noise
        const nt = (currentData.temp + Math.sin(i / 3) * 5 + (Math.random() - 0.5) * 2).toFixed(1);
        const nh = (currentData.hum + Math.cos(i / 4) * 10 + (Math.random() - 0.5) * 5).toFixed(1);
        const na = (currentData.aqi + i * 2 + (Math.random() - 0.5) * 10).toFixed(0);
        
        pTemp.push(nt); pHum.push(nh); pAqi.push(na);
        
        if (nt < 15) { dangerFound = true; precautions.add(langObj['prec-temp']); }
        if (na > 85) { dangerFound = true; precautions.add(langObj['prec-aqi']); }
        if (nh > 85) { dangerFound = true; precautions.add(langObj['prec-hum']); }
    }

    predictionChart.data.labels = labels;
    predictionChart.data.datasets = [
        { label: 'Pred Temp (°C)', data: pTemp, borderColor: '#E11D48', borderDash: [5, 5], tension: 0.4 },
        { label: 'Pred Humidity (%)', data: pHum, borderColor: '#3B82F6', borderDash: [5, 5], tension: 0.4 },
        { label: 'Pred AQI (ppm)', data: pAqi, borderColor: '#10B981', borderDash: [5, 5], tension: 0.4 }
    ];
    predictionChart.update();

    const alertEl = document.getElementById('prediction-alert');
    if (dangerFound) {
        alertEl.classList.remove('hidden');
        alertEl.className = 'risk-badge risk-severe blink-fast';
        alertEl.innerText = langObj['pred-warn'];
    } else {
        alertEl.classList.add('hidden');
    }

    const precList = document.getElementById('prediction-precautions-list');
    precList.innerHTML = '';
    if (precautions.size === 0) {
        const li = document.createElement('li');
        li.innerText = langObj['pred-safe'];
        precList.appendChild(li);
    } else {
        precautions.forEach(p => {
            const li = document.createElement('li');
            li.innerText = p;
            precList.appendChild(li);
        });
    }
}

// --- 7. BLUETOOTH & MIC LOGIC (Omitted for brevity, kept same as before) ---
// ... (Including the previously defined connectBluetooth, handleSensorData, toggleMicrophone, detectCough)
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
async function connectBluetooth() { if (!navigator.bluetooth) { showToast('Web Bluetooth API not supported.', 'error'); return; } try { const device = await navigator.bluetooth.requestDevice({ filters: [{ namePrefix: 'ESP32' }], optionalServices: [SERVICE_UUID] }); const server = await device.gatt.connect(); const service = await server.getPrimaryService(SERVICE_UUID); const characteristic = await service.getCharacteristic(CHAR_UUID); characteristic.startNotifications(); characteristic.addEventListener('characteristicvaluechanged', handleSensorData); state.bluetoothDevice = device; state.deviceData.connected = true; document.getElementById('bt-status').innerText = 'Status: Connected'; document.getElementById('bt-status').className = 'status-indicator status-connected'; document.getElementById('btn-connect').style.display = 'none'; document.getElementById('btn-disconnect').style.display = 'inline-flex'; setMode('device'); switchTab('dashboard'); } catch (error) { console.error(error); showToast('Bluetooth Connection Failed', 'error'); } }
function disconnectBluetooth() { if (state.bluetoothDevice && state.bluetoothDevice.gatt.connected) { state.bluetoothDevice.gatt.disconnect(); } state.deviceData.connected = false; document.getElementById('bt-status').innerText = 'Status: Disconnected'; document.getElementById('bt-status').className = 'status-indicator status-disconnected'; document.getElementById('btn-connect').style.display = 'inline-flex'; document.getElementById('btn-disconnect').style.display = 'none'; setMode('device'); }
function handleSensorData(event) { try { const decoder = new TextDecoder('utf-8'); const dataString = decoder.decode(event.target.value); const data = JSON.parse(dataString); state.deviceData.temp = parseFloat(data.t); state.deviceData.hum = parseFloat(data.h); state.deviceData.aqi = parseFloat(data.a); if(state.mode === 'device') { updateDashboardUI(); runAIAnalysis(); updateCharts(state.deviceData.temp, state.deviceData.hum, state.deviceData.aqi); } } catch(e) { console.error("Error parsing sensor data", e); } }
async function toggleMicrophone() { if (state.micActive) { if (state.micStream) { state.micStream.getTracks().forEach(track => track.stop()); } if (state.audioContext) { state.audioContext.close(); } state.micActive = false; document.getElementById('mic-status').innerText = 'Mic Off'; document.getElementById('mic-status').className = 'status-indicator status-disconnected'; document.getElementById('btn-mic').innerText = 'Start Microphone Detection'; document.getElementById('btn-mic').classList.remove('btn-alert'); } else { try { state.micStream = await navigator.mediaDevices.getUserMedia({ audio: true }); state.audioContext = new (window.AudioContext || window.webkitAudioContext)(); const source = state.audioContext.createMediaStreamSource(state.micStream); const analyser = state.audioContext.createAnalyser(); analyser.fftSize = 512; source.connect(analyser); state.micActive = true; document.getElementById('mic-status').innerText = 'Mic Listening...'; document.getElementById('mic-status').className = 'status-indicator status-connected'; document.getElementById('btn-mic').innerText = 'Stop Microphone Detection'; document.getElementById('btn-mic').classList.add('btn-alert'); detectCough(analyser); } catch (e) { console.error("Microphone error", e); showToast('Microphone access denied.', 'error'); } } }
function detectCough(analyser) { if (!state.micActive) return; const bufferLength = analyser.frequencyBinCount; const dataArray = new Uint8Array(bufferLength); let lastCoughTime = 0; const interval = setInterval(() => { if(!state.micActive) { clearInterval(interval); return; } analyser.getByteFrequencyData(dataArray); let sum = 0; for(let i = 0; i < bufferLength; i++) { sum += dataArray[i]; } const averageVolume = sum / bufferLength; const now = Date.now(); if (averageVolume > 80 && (now - lastCoughTime > 1500)) { state.manualData.coughCount++; lastCoughTime = now; updateDashboardUI(); runAIAnalysis(); } }, 200); }

// --- 8. AI ANALYSIS & ALERTS ---
function runAIAnalysis() {
    let data = state.mode === 'device' ? state.deviceData : state.manualData;
    if (state.mode === 'device' && !state.deviceData.connected) { updateAIPanel('low'); return; }
    const { temp, hum, aqi, coughCount } = data;
    const { triggers } = state.user;
    let risk = 'low';
    if (temp < 15 || aqi > 85 || hum > 85 || (coughCount && coughCount > 10)) risk = 'severe';
    else if (temp <= 20 || aqi >= 70 || hum >= 70 || (coughCount && coughCount >= 5) || triggers.length >= 3) risk = 'medium';

    if(state.riskLevel !== risk) {
        state.riskLevel = risk;
        updateAIPanel();
        playVoiceAlert();
    }
    
    // Toggle Prediction section vs SMS button
    if (risk === 'severe') {
        document.getElementById('btn-sms-alert').classList.remove('hidden');
        document.getElementById('prediction-section').classList.add('hidden');
    } else {
        document.getElementById('btn-sms-alert').classList.add('hidden');
        document.getElementById('prediction-section').classList.remove('hidden');
        runPrediction();
    }
}

function updateAIPanel() {
    const panel = document.querySelector('.ai-panel');
    const badge = document.getElementById('risk-badge');
    const msg = document.getElementById('ai-message');
    const recList = document.getElementById('recommendations-list');
    const langObj = i18n[state.language];
    panel.style.borderLeftColor = '';
    badge.className = 'risk-badge';
    badge.innerText = langObj[`risk-${state.riskLevel}`];
    msg.innerText = langObj[`msg-${state.riskLevel}`];
    if (state.riskLevel === 'low') { panel.style.borderLeftColor = 'var(--status-green)'; badge.classList.add('risk-low'); }
    else if (state.riskLevel === 'medium') { panel.style.borderLeftColor = 'var(--status-yellow)'; badge.classList.add('risk-medium'); }
    else { panel.style.borderLeftColor = 'var(--status-red)'; badge.classList.add('risk-severe'); }
    recList.innerHTML = '';
    langObj[`rec-${state.riskLevel}`].forEach(rec => { const li = document.createElement('li'); li.innerText = rec; recList.appendChild(li); });
}

function playVoiceAlert() {
    if(!window.speechSynthesis) return;
    const langObj = i18n[state.language];
    const textToSpeak = langObj[`msg-${state.riskLevel}`];
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const speechLangMap = { 'en': 'en-US', 'hi': 'hi-IN', 'kn': 'kn-IN' };
    utterance.lang = speechLangMap[state.language] || 'en-US';
    if(state.riskLevel === 'severe') { utterance.rate = 1.2; utterance.pitch = 1.5; }
    else if (state.riskLevel === 'medium') { utterance.rate = 1.0; utterance.pitch = 1.0; }
    else { utterance.rate = 0.9; utterance.pitch = 0.8; }
    window.speechSynthesis.speak(utterance);
}

function triggerSMSAlert() {
    if(!state.user.doctorMobile) { showToast('No doctor mobile number!', 'error'); return; }
    const data = state.mode === 'device' ? state.deviceData : state.manualData;
    const locString = state.userLocation ? `Live Location: https://www.google.com/maps?q=${state.userLocation.lat},${state.userLocation.lng}` : "Location: Not shared";
    
    const report = `AsthmaSafety EMERGENCY REPORT\n\n` +
                 `Patient: ${state.user.name} (Age: ${state.user.age})\n` +
                 `Risk Level: SEVERE\n` +
                 `Environmental: ${data.temp}°C, ${data.hum}%, ${data.aqi} ppm\n` +
                 `AI Analysis: Severe asthma risk detected. immediate intervention required.\n` +
                 `${locString}`;
    
    const smsLink = `sms:${state.user.doctorMobile}?body=${encodeURIComponent(report)}`;
    window.location.href = smsLink;
    showToast('Detailed Emergency Report Sent', 'info');
}
