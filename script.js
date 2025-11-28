/**
 * ============================================
 * DARK ROMANTIC LOVE QUESTIONNAIRE
 * ============================================
 * 
 * USAGE:
 * 1. Open index.html in any modern browser
 * 2. Answer all 13 questions step-by-step
 * 3. Review answers and download as PDF
 * 
 * CUSTOMIZATION:
 * - Edit questions array below to change questions
 * - Modify CSS variables in styles.css for colors
 * - All dependencies loaded via CDN
 * 
 * DEPENDENCIES:
 * - html2canvas (for screenshot)
 * - jsPDF (for PDF generation)
 * ============================================
 */

// ============================================
// QUESTIONS DATA
// ============================================
const questions = [
    { id: 'name', label: 'What is your name?', type: 'text', emoji: '👤' },
    { id: 'nickname', label: 'Your favorite nickname?', type: 'text', emoji: '💝' },
    { id: 'movie', label: 'Your favorite movie?', type: 'text', emoji: '🎬' },
    { id: 'friend', label: 'Your favorite friend?', type: 'text', emoji: '👫' },
    { id: 'maleFriend', label: 'Your favorite male friend?', type: 'text', emoji: '🤝' },
    { id: 'series', label: 'Your favorite series?', type: 'text', emoji: '📺' },
    { id: 'cartoon', label: 'Your favorite cartoon?', type: 'text', emoji: '🎨' },
    { id: 'food', label: 'Your favorite food?', type: 'text', emoji: '🍕' },
    { id: 'aboutMe', label: 'Something you want to say about me?', type: 'textarea', emoji: '💭' },
    { id: 'loveAbout', label: 'What do you love about me?', type: 'textarea', emoji: '💖' },
    { id: 'notDo', label: 'One thing you want me not to do?', type: 'text', emoji: '🚫' },
    { id: 'sorry', label: 'Something you feel sorry about that you did to me?', type: 'textarea', emoji: '😢' },
    { id: 'reallyLove', label: 'Do you really love me?', type: 'choice', options: ['Yes', 'No', 'Maybe'], emoji: '❤️' }
];

// ============================================
// STATE MANAGEMENT
// ============================================
let currentStep = 0;
let answers = {};
let highContrastMode = false;

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
    // Form elements
    formContainer: document.getElementById('form-container'),
    questionCard: document.getElementById('question-card'),
    stepCounter: document.getElementById('step-counter'),
    progressPercentage: document.getElementById('progress-percentage'),
    progressFill: document.getElementById('progress-fill'),
    emojiDisplay: document.getElementById('emoji-display'),
    questionTitle: document.getElementById('question-title'),
    inputContainer: document.getElementById('input-container'),
    errorMessage: document.getElementById('error-message'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    
    // Review elements
    reviewContainer: document.getElementById('review-container'),
    reviewContent: document.getElementById('review-content'),
    reviewDate: document.getElementById('review-date'),
    reviewAnswers: document.getElementById('review-answers'),
    toggleModeBtn: document.getElementById('toggle-mode-btn'),
    downloadPdfBtn: document.getElementById('download-pdf-btn'),
    printPdfBtn: document.getElementById('print-pdf-btn'),
    startOverBtn: document.getElementById('start-over-btn'),
    
    // Background
    heartsBg: document.getElementById('hearts-bg')
};

// ============================================
// INITIALIZATION
// ============================================
function init() {
    createFloatingHearts();
    renderQuestion();
    attachEventListeners();
}

// ============================================
// FLOATING HEARTS ANIMATION
// ============================================
function createFloatingHearts() {
    for (let i = 0; i < 8; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.innerHTML = '❤️';
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.top = `${Math.random() * 100}%`;
        heart.style.animationDelay = `${Math.random() * 2}s`;
        heart.style.animationDuration = `${3 + Math.random() * 2}s`;
        elements.heartsBg.appendChild(heart);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function attachEventListeners() {
    // Navigation buttons
    elements.nextBtn.addEventListener('click', handleNext);
    elements.prevBtn.addEventListener('click', handlePrevious);
    
    // Keyboard navigation
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !elements.reviewContainer.style.display) {
            const currentQuestion = questions[currentStep];
            if (currentQuestion.type !== 'textarea') {
                handleNext();
            }
        }
    });
    
    // Review buttons
    elements.toggleModeBtn.addEventListener('click', toggleHighContrast);
    elements.downloadPdfBtn.addEventListener('click', () => generatePDF(false));
    elements.printPdfBtn.addEventListener('click', () => generatePDF(true));
    elements.startOverBtn.addEventListener('click', startOver);
}

// ============================================
// RENDER QUESTION
// ============================================
function renderQuestion() {
    const question = questions[currentStep];
    
    // Update progress
    const progress = ((currentStep + 1) / questions.length) * 100;
    elements.stepCounter.textContent = `Step ${currentStep + 1} of ${questions.length}`;
    elements.progressPercentage.textContent = `${Math.round(progress)}%`;
    elements.progressFill.style.width = `${progress}%`;
    
    // Update question display
    elements.emojiDisplay.textContent = question.emoji;
    elements.questionTitle.textContent = question.label;
    
    // Clear previous input
    elements.inputContainer.innerHTML = '';
    elements.errorMessage.textContent = '';
    
    // Render appropriate input type
    if (question.type === 'text') {
        renderTextInput(question);
    } else if (question.type === 'textarea') {
        renderTextarea(question);
    } else if (question.type === 'choice') {
        renderChoiceButtons(question);
    }
    
    // Update navigation buttons
    elements.prevBtn.style.display = currentStep > 0 ? 'flex' : 'none';
    elements.nextBtn.textContent = currentStep === questions.length - 1 ? 'Review' : 'Next';
    
    // Add next button icon
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('width', '20');
    icon.setAttribute('height', '20');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor');
    icon.setAttribute('stroke-width', '2');
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', '9 18 15 12 9 6');
    icon.appendChild(polyline);
    elements.nextBtn.appendChild(icon);
    
    // Animate card appearance
    elements.questionCard.style.animation = 'none';
    setTimeout(() => {
        elements.questionCard.style.animation = 'cardAppear 0.5s ease-out';
    }, 10);
}

// ============================================
// INPUT RENDERERS
// ============================================
function renderTextInput(question) {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'answer-input';
    input.className = 'text-input';
    input.placeholder = 'Type your answer...';
    input.value = answers[question.id] || '';
    input.autocomplete = 'off';
    input.addEventListener('input', (e) => {
        answers[question.id] = e.target.value;
        elements.errorMessage.textContent = '';
    });
    elements.inputContainer.appendChild(input);
    input.focus();
}

function renderTextarea(question) {
    const textarea = document.createElement('textarea');
    textarea.id = 'answer-input';
    textarea.className = 'textarea-input';
    textarea.placeholder = 'Share your thoughts...';
    textarea.value = answers[question.id] || '';
    textarea.rows = 4;
    textarea.addEventListener('input', (e) => {
        answers[question.id] = e.target.value;
        elements.errorMessage.textContent = '';
    });
    elements.inputContainer.appendChild(textarea);
    textarea.focus();
}

function renderChoiceButtons(question) {
    const container = document.createElement('div');
    container.className = 'choice-buttons';
    
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = option;
        
        if (answers[question.id] === option) {
            button.classList.add('selected');
            const checkmark = document.createElement('span');
            checkmark.className = 'checkmark';
            checkmark.textContent = '✓';
            button.prepend(checkmark);
        }
        
        button.addEventListener('click', () => {
            answers[question.id] = option;
            renderQuestion(); // Re-render to show selection
        });
        
        container.appendChild(button);
    });
    
    elements.inputContainer.appendChild(container);
}

// ============================================
// VALIDATION
// ============================================
function validateStep() {
    const question = questions[currentStep];
    const answer = answers[question.id];
    
    if (!answer || (typeof answer === 'string' && answer.trim() === '')) {
        elements.errorMessage.textContent = 'This field is required';
        elements.questionCard.classList.add('shake');
        setTimeout(() => {
            elements.questionCard.classList.remove('shake');
        }, 500);
        return false;
    }
    
    return true;
}

// ============================================
// NAVIGATION
// ============================================
function handleNext() {
    if (!validateStep()) return;
    
    if (currentStep < questions.length - 1) {
        currentStep++;
        renderQuestion();
    } else {
        showReview();
    }
}

function handlePrevious() {
    if (currentStep > 0) {
        currentStep--;
        renderQuestion();
    }
}

// ============================================
// REVIEW SCREEN
// ============================================
function showReview() {
    elements.formContainer.style.display = 'none';
    elements.reviewContainer.style.display = 'block';
    
    // Set date
    const now = new Date();
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    elements.reviewDate.textContent = now.toLocaleDateString('en-US', dateOptions);
    
    // Render answers
    elements.reviewAnswers.innerHTML = '';
    questions.forEach(question => {
        const answerItem = document.createElement('div');
        answerItem.className = 'answer-item';
        
        const questionLabel = document.createElement('p');
        questionLabel.className = 'answer-question';
        questionLabel.innerHTML = `<span>${question.emoji}</span> ${question.label}`;
        
        const answerText = document.createElement('p');
        answerText.className = 'answer-text';
        answerText.textContent = answers[question.id] || 'No answer provided';
        
        answerItem.appendChild(questionLabel);
        answerItem.appendChild(answerText);
        elements.reviewAnswers.appendChild(answerItem);
    });
}

// ============================================
// HIGH CONTRAST MODE
// ============================================
function toggleHighContrast() {
    highContrastMode = !highContrastMode;
    
    if (highContrastMode) {
        elements.reviewContent.classList.add('high-contrast');
        elements.toggleModeBtn.textContent = 'Dark Mode';
    } else {
        elements.reviewContent.classList.remove('high-contrast');
        elements.toggleModeBtn.textContent = 'High Contrast';
    }
}

// ============================================
// PDF GENERATION
// ============================================
async function generatePDF(printFriendly) {
    const content = elements.reviewContent;
    
    try {
        // Store original styles
        const originalBackground = content.style.background;
        const originalColor = content.style.color;
        
        // Apply print-friendly styles if needed
        if (printFriendly) {
            content.style.background = '#ffffff';
            content.style.color = '#000000';
            content.classList.add('high-contrast');
        }
        
        // Generate canvas from HTML
        const canvas = await html2canvas(content, {
            scale: 2,
            backgroundColor: printFriendly ? '#ffffff' : '#06070a',
            logging: false,
            useCORS: true
        });
        
        // Restore original styles
        if (printFriendly) {
            content.style.background = originalBackground;
            content.style.color = originalColor;
            content.classList.remove('high-contrast');
        }
        
        // Create PDF
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 190;
        const pageHeight = 277;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 10;
        
        // Add first page
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add additional pages if needed
        while (heightLeft > 0) {
            position = heightLeft - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Save PDF
        const filename = `love-questionnaire-${answers.name || 'response'}.pdf`;
        pdf.save(filename);
        
    } catch (error) {
        console.error('PDF generation failed:', error);
        
        // Fallback: Copy to clipboard
        const confirmCopy = confirm(
            'PDF generation failed. Would you like to copy the answers to your clipboard instead?'
        );
        
        if (confirmCopy) {
            copyToClipboard();
        }
    }
}

// ============================================
// CLIPBOARD FALLBACK
// ============================================
function copyToClipboard() {
    const text = questions.map(q => 
        `${q.label}\n${answers[q.id] || 'No answer'}\n`
    ).join('\n');
    
    navigator.clipboard.writeText(text).then(() => {
        alert('Answers copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard. Please try again.');
    });
}

// ============================================
// START OVER
// ============================================
function startOver() {
    const confirm = window.confirm('Are you sure you want to start over? All answers will be lost.');
    
    if (confirm) {
        currentStep = 0;
        answers = {};
        highContrastMode = false;
        
        elements.reviewContainer.style.display = 'none';
        elements.formContainer.style.display = 'block';
        elements.reviewContent.classList.remove('high-contrast');
        elements.toggleModeBtn.textContent = 'High Contrast';
        
        renderQuestion();
    }
}

// ============================================
// START APPLICATION
// ============================================
document.addEventListener('DOMContentLoaded', init);