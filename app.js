/**
 * Main Application Logic
 * AI-Assisted Engineering Project Approval Decision Simulation System
 * 
 * This system implements a between-subject experiment design to study
 * how AI recommendations affect individual decision-making and group
 * decision distribution in public engineering project approval contexts.
 */

// ===========================================
// State Management
// ===========================================

const state = {
    // Participant Information
    participantId: null,
    groupType: null, // 'AI' or 'Control'
    
    // Experiment Progress
    currentRound: 0,
    currentPage: 'consent',
    
    // Decision Data
    decisions: [],
    currentDecision: {
        startTime: null,
        selectedOption: null,
        project: null
    },
    
    // Questionnaire Data
    questionnaire: {},
    
    // Extreme Event Tracking
    extremeEventTriggered: false,
    
    // Database
    supabase: null
};

// ===========================================
// Initialization
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeExperiment();
    setupEventListeners();
    setupAdminPanel();
});

function initializeExperiment() {
    // Check if user has already completed the experiment
    if (localStorage.getItem(CONFIG.STORAGE_KEY)) {
        showNotification('您已经完成过本实验，感谢参与！', 'info');
        return;
    }
    
    // Generate unique participant ID
    state.participantId = generateUUID();
    
    // Random assignment to AI or Control group (50/50)
    state.groupType = Math.random() < 0.5 ? 'AI' : 'Control';
    
    // Initialize Supabase if configured
    if (CONFIG.IS_SUPABASE_CONFIGURED) {
        try {
            state.supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
            console.log('Supabase initialized successfully');
        } catch (error) {
            console.warn('Supabase initialization failed, using local storage fallback');
        }
    } else {
        console.log('Supabase not configured, using local storage fallback');
    }
    
    console.log(`Participant ID: ${state.participantId}`);
    console.log(`Group Type: ${state.groupType}`);
    
    updateProgress(0);
}

function setupEventListeners() {
    // Consent Page
    document.getElementById('consentCheck').addEventListener('change', (e) => {
        document.getElementById('consentBtn').disabled = !e.target.checked;
    });
    
    document.getElementById('consentBtn').addEventListener('click', () => {
        showPage('role');
        updateProgress(10);
    });
    
    // Role Page
    document.getElementById('startExperimentBtn').addEventListener('click', () => {
        startDecisionRounds();
    });
    
    // Decision Submit Button
    document.getElementById('submitDecisionBtn').addEventListener('click', () => {
        submitDecision();
    });
    
    // Feedback Page Buttons
    document.getElementById('continueAfterFeedbackBtn').addEventListener('click', () => {
        showPage('questionnaire');
        updateProgress(85);
    });
    
    document.getElementById('continueToQuestionnaireBtn').addEventListener('click', () => {
        showPage('questionnaire');
        updateProgress(85);
    });
    
    // Questionnaire
    setupQuestionnaireListeners();
    
    document.getElementById('submitQuestionnaireBtn').addEventListener('click', () => {
        submitQuestionnaire();
    });
}

function setupQuestionnaireListeners() {
    const questions = ['q1', 'q2', 'q3', 'q4'];
    questions.forEach(q => {
        document.querySelectorAll(`input[name="${q}"]`).forEach(radio => {
            radio.addEventListener('change', checkQuestionnaireComplete);
        });
    });
}

function checkQuestionnaireComplete() {
    const q1 = document.querySelector('input[name="q1"]:checked');
    const q2 = document.querySelector('input[name="q2"]:checked');
    const q3 = document.querySelector('input[name="q3"]:checked');
    const q4 = document.querySelector('input[name="q4"]:checked');
    
    document.getElementById('submitQuestionnaireBtn').disabled = !(q1 && q2 && q3 && q4);
}

// ===========================================
// Page Navigation
// ===========================================

function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show target page
    const targetPage = document.getElementById(`${pageName}Page`);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
    
    state.currentPage = pageName;
}

function updateProgress(percentage) {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}%`;
}

// ===========================================
// Decision Rounds
// ===========================================

function startDecisionRounds() {
    state.currentRound = 1;
    loadRound(state.currentRound);
    showPage('decision');
    updateProgress(20);
}

function loadRound(roundNumber) {
    // Get project data with shuffled options
    const project = getProjectForRound(roundNumber);
    state.currentDecision.project = project;
    state.currentDecision.startTime = Date.now();
    state.currentDecision.selectedOption = null;
    
    // Update UI
    document.getElementById('roundNumber').textContent = roundNumber;
    document.getElementById('projectName').textContent = project.name;
    document.getElementById('projectDescription').textContent = project.description;
    
    // Show AI recommendation for AI group only
    const aiRecommendationEl = document.getElementById('aiRecommendation');
    if (state.groupType === 'AI') {
        aiRecommendationEl.classList.remove('hidden');
        document.getElementById('aiSuggestion').textContent = `方案${project.aiRecommendation}`;
    } else {
        aiRecommendationEl.classList.add('hidden');
    }
    
    // Render options
    renderOptions(project.options);
    
    // Reset submit button
    document.getElementById('submitDecisionBtn').disabled = true;
    
    // Start timer
    startDecisionTimer();
}

function renderOptions(options) {
    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';
    
    options.forEach(option => {
        const card = document.createElement('div');
        card.className = 'option-card';
        card.dataset.optionId = option.id;
        
        card.innerHTML = `
            <input type="radio" name="decision" value="${option.id}">
            <div class="option-header">
                <span class="option-name">方案${option.id}</span>
                <span class="option-indicator"></span>
            </div>
            <div class="option-metrics">
                <div class="metric">
                    <span class="metric-label">💰 预算成本</span>
                    <span class="metric-value">${option.budget} 亿元</span>
                </div>
                <div class="metric risk">
                    <span class="metric-label">⚠️ 事故风险</span>
                    <span class="metric-value">${option.risk}%</span>
                </div>
                <div class="metric benefit">
                    <span class="metric-label">📈 经济收益指数</span>
                    <span class="metric-value">${option.benefit}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">📅 工期</span>
                    <span class="metric-value">${option.duration} 个月</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => selectOption(option.id));
        container.appendChild(card);
    });
}

function selectOption(optionId) {
    // Update visual selection
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.optionId === optionId) {
            card.classList.add('selected');
        }
    });
    
    // Update state
    state.currentDecision.selectedOption = optionId;
    
    // Enable submit button
    document.getElementById('submitDecisionBtn').disabled = false;
}

let timerInterval = null;

function startDecisionTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    const startTime = Date.now();
    const timerEl = document.getElementById('decisionTime');
    
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        timerEl.textContent = elapsed;
    }, 1000);
}

function stopDecisionTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

async function submitDecision() {
    stopDecisionTimer();
    
    const project = state.currentDecision.project;
    const selectedOptionId = state.currentDecision.selectedOption;
    const selectedOption = project.options.find(o => o.id === selectedOptionId);
    
    // Calculate decision time in milliseconds
    const decisionTime = Date.now() - state.currentDecision.startTime;
    
    // Determine if followed AI recommendation
    const followedAI = state.groupType === 'AI' && selectedOptionId === project.aiRecommendation;
    
    // Check for extreme event (Round 5 only, risk strictly greater than 10%)
    const isExtremeRound = state.currentRound === CONFIG.EXTREME_RISK_ROUND;
    const extremeEvent = isExtremeRound && selectedOption.risk > CONFIG.EXTREME_RISK_THRESHOLD;
    
    if (extremeEvent) {
        state.extremeEventTriggered = true;
    }
    
    // Record decision data
    const decisionData = {
        participant_id: state.participantId,
        group_type: state.groupType,
        round_number: state.currentRound,
        chosen_option: selectedOptionId,
        ai_recommendation: project.aiRecommendation,
        follow_ai: followedAI,
        risk_level: selectedOption.risk,
        decision_time: decisionTime,
        extreme_event: extremeEvent
    };
    
    state.decisions.push(decisionData);
    
    // Save to database
    await saveDecisionData(decisionData);
    
    // Progress to next round or feedback
    if (state.currentRound < CONFIG.TOTAL_ROUNDS) {
        state.currentRound++;
        loadRound(state.currentRound);
        updateProgress(20 + (state.currentRound - 1) * 13);
    } else {
        // End of rounds - show feedback
        if (state.extremeEventTriggered) {
            showPage('riskFeedback');
        } else {
            showPage('noAccident');
        }
        updateProgress(80);
    }
}

// ===========================================
// Questionnaire
// ===========================================

async function submitQuestionnaire() {
    // Collect questionnaire responses
    state.questionnaire = {
        q1_trust: parseInt(document.querySelector('input[name="q1"]:checked').value),
        q2_safer: parseInt(document.querySelector('input[name="q2"]:checked').value),
        q3_professional: parseInt(document.querySelector('input[name="q3"]:checked').value),
        q4_responsibility: parseInt(document.querySelector('input[name="q4"]:checked').value)
    };
    
    // Save questionnaire data
    await saveQuestionnaireData(state.questionnaire);
    
    // Mark experiment as completed
    localStorage.setItem(CONFIG.STORAGE_KEY, 'true');
    
    // Show end page
    document.getElementById('participantIdDisplay').textContent = state.participantId;
    document.getElementById('groupTypeDisplay').textContent = state.groupType === 'AI' ? '实验组(AI辅助)' : '对照组';
    showPage('end');
    updateProgress(100);
}

// ===========================================
// Data Storage
// ===========================================

async function saveDecisionData(data) {
    if (state.supabase) {
        try {
            const { error } = await state.supabase
                .from('experiment_data')
                .insert([data]);
            
            if (error) {
                console.error('Supabase insert error:', error);
                saveToLocalStorage(data);
            } else {
                console.log('Decision data saved to Supabase');
            }
        } catch (error) {
            console.error('Database error:', error);
            saveToLocalStorage(data);
        }
    } else {
        saveToLocalStorage(data);
    }
}

async function saveQuestionnaireData(questionnaire) {
    const data = {
        participant_id: state.participantId,
        group_type: state.groupType,
        round_number: null,
        chosen_option: null,
        ai_recommendation: null,
        follow_ai: null,
        risk_level: null,
        decision_time: null,
        extreme_event: null,
        ...questionnaire
    };
    
    if (state.supabase) {
        try {
            const { error } = await state.supabase
                .from('experiment_data')
                .insert([data]);
            
            if (error) {
                console.error('Supabase insert error:', error);
                saveToLocalStorage(data);
            } else {
                console.log('Questionnaire data saved to Supabase');
            }
        } catch (error) {
            console.error('Database error:', error);
            saveToLocalStorage(data);
        }
    } else {
        saveToLocalStorage(data);
    }
}

function saveToLocalStorage(data) {
    const storageKey = 'experiment_data_backup';
    let existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
    existingData.push({
        ...data,
        created_at: new Date().toISOString()
    });
    localStorage.setItem(storageKey, JSON.stringify(existingData));
    console.log('Data saved to local storage backup');
}

// ===========================================
// Admin Panel & Data Export
// ===========================================

function setupAdminPanel() {
    // Listen for admin key combination (Ctrl+Shift+A)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            document.getElementById('adminPanel').classList.toggle('hidden');
        }
    });
    
    document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);
    document.getElementById('closeAdminBtn').addEventListener('click', () => {
        document.getElementById('adminPanel').classList.add('hidden');
    });
}

async function exportToCSV() {
    let allData = [];
    
    // Try to get data from Supabase
    if (state.supabase) {
        try {
            const { data, error } = await state.supabase
                .from('experiment_data')
                .select('*')
                .order('created_at', { ascending: true });
            
            if (!error && data) {
                allData = data;
            }
        } catch (error) {
            console.error('Error fetching from Supabase:', error);
        }
    }
    
    // Also include local storage backup
    const localData = JSON.parse(localStorage.getItem('experiment_data_backup') || '[]');
    allData = [...allData, ...localData];
    
    if (allData.length === 0) {
        showNotification('没有可导出的数据', 'warning');
        return;
    }
    
    // Convert to CSV
    const headers = [
        'id', 'participant_id', 'group_type', 'round_number', 
        'chosen_option', 'ai_recommendation', 'follow_ai', 
        'risk_level', 'decision_time', 'extreme_event',
        'q1_trust', 'q2_safer', 'q3_professional', 'q4_responsibility',
        'created_at'
    ];
    
    let csv = headers.join(',') + '\n';
    
    allData.forEach((row) => {
        const values = headers.map(header => {
            let value = row[header];
            if (value === null || value === undefined) {
                return '';
            }
            if (typeof value === 'string' && value.includes(',')) {
                return `"${value}"`;
            }
            return value;
        });
        csv += values.join(',') + '\n';
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `experiment_data_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

// ===========================================
// Utility Functions
// ===========================================

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Show an accessible notification instead of blocking alert
 * @param {string} message - The message to display
 * @param {string} type - Type of notification: 'info', 'warning', 'success', 'error'
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 30px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        z-index: 10000;
        animation: slideDown 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        background: ${type === 'warning' ? '#fff3cd' : type === 'error' ? '#f8d7da' : '#d4edda'};
        color: ${type === 'warning' ? '#856404' : type === 'error' ? '#721c24' : '#155724'};
        border: 1px solid ${type === 'warning' ? '#ffc107' : type === 'error' ? '#f5c6cb' : '#c3e6cb'};
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}
