// AI Advisor JavaScript with Gemini API Integration

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const suggestionChips = document.querySelectorAll('.chip');
    
    // Gemini API Key (replace with your actual API key)
    const API_KEY = 'YOUR_GEMINI_API_KEY';
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
    }
    
    // Event listeners
    sendButton.addEventListener('click', handleUserMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleUserMessage();
        }
    });
    
    // Suggestion chip event listeners
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', function() {
            const query = this.getAttribute('data-query');
            userInput.value = query;
            handleUserMessage();
        });
    });
    
    // Handle user message submission
    function handleUserMessage() {
        const message = userInput.value.trim();
        
        if (message) {
            // Add user message to chat
            addMessageToChat(message, 'user');
            
            // Clear input
            userInput.value = '';
            
            // Show typing indicator
            showTypingIndicator();
            
            // Get response from Gemini API
            getGeminiResponse(message);
        }
    }
    
    // Add message to chat
    function addMessageToChat(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        
        // Use innerHTML to support HTML content from Gemini
        messageElement.innerHTML = `<p>${formatMessage(message)}</p>`;
        
        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Format message with HTML support
    function formatMessage(text) {
        // Convert URLs to clickable links
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // Format code blocks
        text = text.replace(/```([\s\S]*?)```/g, '<div class="code-block">$1</div>');
        
        // Preserve line breaks
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message bot-message typing-indicator';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        typingIndicator.id = 'typingIndicator';
        
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Get response from Gemini API
    async function getGeminiResponse(message) {
        try {
            // Create a career guidance context for better responses
            const careerContext = `You are an AI career advisor, specialized in providing career guidance, resume tips, interview preparation advice, and professional development suggestions. Your responses should be helpful, concise, and personalized to the user's needs. For career-specific questions, provide data-backed insights when available. The user's message is: "${message}"`;
            
            // If you're using the actual Gemini API:
            const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: careerContext
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                const botResponse = data.candidates[0].content.parts[0].text;
                
                // Remove typing indicator and add bot message
                removeTypingIndicator();
                addMessageToChat(botResponse, 'bot');
            } else {
                // If API call fails, use fallback response
                handleGeminiError(message);
            }
        } catch (error) {
            console.error('Error with Gemini API:', error);
            handleGeminiError(message);
        }
    }
    
    // Handle API errors with fallback responses
    function handleGeminiError(message) {
        const lowercaseMessage = message.toLowerCase();
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Generate fallback response based on message content
        let response = '';
        
        if (lowercaseMessage.includes('resume') || lowercaseMessage.includes('cv')) {
            response = `Here are some tips to improve your resume:
            
1. Tailor your resume for each job application by matching keywords from the job description
2. Use action verbs and quantify achievements (e.g., "Increased sales by 20%")
3. Keep it concise - usually 1 page for early career, 2 pages maximum for experienced professionals
4. Include a professional summary that highlights your key qualifications
5. Proofread carefully for grammar and spelling errors
            
Would you like specific advice on a particular section of your resume?`;
        } 
        else if (lowercaseMessage.includes('interview')) {
            response = `Here are some interview preparation tips:
            
1. Research the company thoroughly - understand their products, culture, and recent news
2. Prepare stories using the STAR method (Situation, Task, Action, Result) for behavioral questions
3. Practice common questions for your industry and role
4. Prepare thoughtful questions to ask the interviewer
5. Do mock interviews to practice your responses and body language
            
Would you like advice for a specific type of interview question?`;
        }
        else if (lowercaseMessage.includes('career change') || lowercaseMessage.includes('switch career')) {
            response = `When considering a career change, consider these steps:
            
1. Identify your transferable skills that can apply to the new field
2. Research the new industry to understand requirements and growth potential
3. Consider education or certification needs and options
4. Build a network in the new industry through informational interviews
5. Adjust your resume to highlight relevant experience for the new career path
            
What specific field are you considering moving into?`;
        }
        else {
            response = `I'm your AI Career Advisor, and I can help with:
            
1. Career path guidance and exploration
2. Resume and cover letter optimization
3. Interview preparation and techniques
4. Skill development recommendations
5. Job search strategies
            
What specific aspect of your career journey can I assist with today?`;
        }
        
        addMessageToChat(response, 'bot');
    }
    
    // Add event listener to connect with the main page
    const connectWithMainPage = () => {
        // Add a link to the AI advisor in the main page if needed
        const mainPageAdvisorLink = document.querySelector('.navbar a[href="ai-advisor.html"]');
        if (mainPageAdvisorLink) {
            mainPageAdvisorLink.classList.add('active');
        }
    };
    
    // Initialize
    connectWithMainPage();
}); 