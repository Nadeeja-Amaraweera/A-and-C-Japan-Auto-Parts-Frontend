import { GoogleGenAI } from 'https://esm.sh/@google/genai';
import { CONFIG } from './training-data.js';

// DOM Elements
const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const chatForm = document.getElementById('chatForm');
const statusDot = document.getElementById('statusDot');
const botStatusText = document.getElementById('botStatusText');
const clearBtn = document.getElementById('clearBtn');
const suggestionsContainer = document.getElementById('suggestionsContainer');
const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
const chatbotWindow = document.getElementById('chatbot-window');
const chatbotCloseBtn = document.getElementById('chatbotCloseBtn');

// Application State
const apiKey = CONFIG.apiKey;
const modelName = CONFIG.modelName || 'gemini-3.6-flash';
const baseSystemInstruction = CONFIG.systemInstruction;
let chatHistory = JSON.parse(localStorage.getItem('ac_gemini_chat_history') || localStorage.getItem('gemini_chat_history')) || [];
let aiClient = null;

// Database Backend Configuration
const BACKEND_BASE_URL = 'http://localhost:8080';
let liveAuctions = [];

// Fetch live auction vehicles from database
async function fetchAuctionsFromDB() {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v1/auctions`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.body) && data.body.length > 0) {
        liveAuctions = data.body;
        return liveAuctions;
      }
    }
  } catch (err) {
    console.warn('Could not fetch auctions from /api/v1/auctions, trying fallback:', err);
  }

  try {
    const res2 = await fetch(`${BACKEND_BASE_URL}/api/auctions`);
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2 && Array.isArray(data2.body) && data2.body.length > 0) {
        liveAuctions = data2.body;
        return liveAuctions;
      }
    }
  } catch (e) {
    console.warn('Fallback auction fetch failed:', e);
  }

  return liveAuctions;
}

// Normalize image URL from backend database
function getVehicleImageUrl(auc) {
  const v = auc.vehicle || {};
  let img = v.primaryImage || (v.images && v.images[0]) || (v.imageUrls && v.imageUrls[0]);
  if (!img) {
    return 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop';
  }
  if (img.startsWith('http://') || img.startsWith('https://')) {
    return img;
  }
  if (img.startsWith('/')) {
    return `${BACKEND_BASE_URL}${img}`;
  }
  return `${BACKEND_BASE_URL}/${img}`;
}

// Generate interactive vehicle cards HTML for the chatbot
function renderAuctionCardsHTML(auctions) {
  if (!auctions || auctions.length === 0) return '';

  const cardsHtml = auctions.map(auc => {
    const v = auc.vehicle || {};
    const aucId = auc.id || auc.auctionId;
    const year = v.year ? `${v.year} ` : '';
    const model = v.model || v.title || auc.title || 'Vehicle';
    const title = `${year}${model}`;
    const imgUrl = getVehicleImageUrl(auc);
    const bidAmount = (auc.currentBid || auc.highestBid || auc.startingPrice || 0).toLocaleString();
    const mileage = v.mileage ? `${Number(v.mileage).toLocaleString()} km` : '';
    const fuel = v.fuelType ? v.fuelType : '';
    const trans = v.transmission ? v.transmission : '';
    const color = v.color ? v.color : '';

    return `
      <a href="auction-details.html?id=${aucId}" class="cb-vehicle-card" title="Click to view details for ${title}">
        <div class="cb-vehicle-img-box">
          <img src="${imgUrl}" alt="${title}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop';">
          <span class="cb-badge-live">Live Auction</span>
        </div>
        <div class="cb-vehicle-content">
          <div class="cb-vehicle-header">
            <h4 class="cb-vehicle-title">${title}</h4>
          </div>
          <div class="cb-vehicle-details">
            ${mileage ? `<span>🚗 ${mileage}</span>` : ''}
            ${fuel ? `<span>⛽ ${fuel}</span>` : ''}
            ${trans ? `<span>⚙️ ${trans}</span>` : ''}
            ${color ? `<span>🎨 ${color}</span>` : ''}
          </div>
          <div class="cb-vehicle-footer">
            <div class="cb-price-box">
              <span class="cb-price-label">Current Bid</span>
              <span class="cb-price-value">$${bidAmount}</span>
            </div>
            <span class="cb-action-link">View Details &rarr;</span>
          </div>
        </div>
      </a>
    `;
  }).join('');

  return `<div class="cb-vehicles-list">${cardsHtml}</div>`;
}

// Build dynamic system instructions including live database vehicles
function getDynamicSystemInstruction() {
  if (!liveAuctions || liveAuctions.length === 0) {
    return `${baseSystemInstruction}

LIVE DATABASE VEHICLE AUCTIONS:
Currently, there are no live vehicle auctions recorded in our system database. If the user asks about cars or auctions, inform them that our inventory database is currently being updated with new arrivals, and encourage them to check listing.html or contact our team. DO NOT make up or describe any fictional vehicles.`;
  }

  const liveSummary = liveAuctions.map((auc, idx) => {
    const v = auc.vehicle || {};
    const aucId = auc.id || auc.auctionId;
    const year = v.year || '';
    const model = v.model || v.title || auc.title;
    const fullTitle = `${year} ${model}`.trim();
    const bid = (auc.currentBid || auc.highestBid || auc.startingPrice || 0).toLocaleString();
    const mileage = v.mileage ? `${Number(v.mileage).toLocaleString()} km` : 'N/A';
    const fuel = v.fuelType || 'N/A';
    const trans = v.transmission || 'N/A';
    const color = v.color || 'N/A';
    const condition = v.condition || 'USED';
    const imgUrl = getVehicleImageUrl(auc);
    const desc = v.description ? ` | Description: "${v.description}"` : '';
    return `- Database Auction #${aucId}: ${fullTitle}
  * Photo Image Markdown: ![${fullTitle}](${imgUrl})
  * Current Bid: $${bid}
  * Specs: Mileage: ${mileage} | Transmission: ${trans} | Fuel: ${fuel} | Color: ${color} | Condition: ${condition}${desc}
  * Auction Link: [View Auction #${aucId} - ${fullTitle}](auction-details.html?id=${aucId})`;
  }).join('\n\n');

  return `${baseSystemInstruction}

LIVE DATABASE VEHICLE AUCTIONS (ONLY THESE VEHICLES EXIST IN OUR DATABASE):
${liveSummary}

STRICT INVENTORY & IMAGE RULES:
- You must ONLY describe and present the actual vehicles listed above directly from our database.
- DO NOT invent, assume, or mention any sample cars (such as Tesla, 2002 Skyline, Supra, etc.) unless they are explicitly present in the live database list above.
- Whenever you mention or recommend any vehicle, ALWAYS include its photo image using Markdown: ![Vehicle Name](image_url) and its link [View Details](auction-details.html?id=<id>).`;
}

// Check if message is inquiring about auction vehicles
function isVehicleInquiry(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  const keywords = [
    'available', 'car', 'cars', 'vehicle', 'vehicles', 'auction', 'auctions',
    'gtr', 'gt-r', 'nissan', 'skyline', 'land cruiser', 'cruiser', 'lancer', 'mitsubishi', 'toyota',
    'inventory', 'stock', 'show', 'photo', 'photos', 'image', 'images', 'picture', 'pictures',
    'what do you have', 'what cars', 'what vehicles', 'list', 'details', 'look', 'see'
  ];
  return keywords.some(k => lower.includes(k));
}

// Match specific or general vehicles from the database
function getRelevantVehicles(userText, botReply) {
  if (!liveAuctions || liveAuctions.length === 0) return [];

  const combined = `${userText} ${botReply}`.toLowerCase();

  // Find specific vehicles mentioned
  const matched = liveAuctions.filter(auc => {
    const v = auc.vehicle || {};
    const idStr = String(auc.id || auc.auctionId);
    const title = (auc.title || '').toLowerCase();
    const model = (v.model || '').toLowerCase();
    const brand = (v.brand || '').toLowerCase();

    if (combined.includes(`id: #${idStr}`) || combined.includes(`id #${idStr}`) || combined.includes(`id=${idStr}`) || combined.includes(`#${idStr}`) || combined.includes(`id: ${idStr}`)) return true;
    if (title && combined.includes(title)) return true;
    if (model && combined.includes(model)) return true;
    if (brand && brand !== 'unknown' && combined.includes(brand)) return true;
    if ((title.includes('gt-r') || model.includes('gt-r')) && (combined.includes('gtr') || combined.includes('gt-r'))) return true;
    if ((title.includes('land cruiser') || model.includes('land cruiser')) && combined.includes('cruiser')) return true;
    if ((title.includes('lancer') || model.includes('lancer')) && (combined.includes('lancer') || combined.includes('mitsubishi'))) return true;
    return false;
  });

  if (matched.length > 0) return matched;

  if (isVehicleInquiry(userText) || isVehicleInquiry(botReply)) {
    return liveAuctions;
  }

  return [];
}

// Initialize GoogleGenAI Client
function initGenAI() {
  if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY') {
    try {
      aiClient = new GoogleGenAI({ apiKey: apiKey });
      if (statusDot) statusDot.className = 'status-dot connected';
      if (botStatusText) botStatusText.textContent = 'Online • Ready';
    } catch (err) {
      console.error('Failed to initialize GoogleGenAI client:', err);
      if (statusDot) statusDot.className = 'status-dot disconnected';
      if (botStatusText) botStatusText.textContent = 'Init Error';
    }
  } else {
    aiClient = null;
    if (statusDot) statusDot.className = 'status-dot disconnected';
    if (botStatusText) botStatusText.textContent = 'API Key Required';
  }
}

// Simple Markdown to HTML parser
function markdownToHtml(text) {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Format Bold text (**text**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Format Inline code (`code`)
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  // Format Multi-line pre-formatted code block (```code```)
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // 1. Format Markdown images FIRST: ![alt](url)
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
    let cleanUrl = url.trim();
    if (cleanUrl.startsWith('/')) {
      cleanUrl = `${BACKEND_BASE_URL}${cleanUrl}`;
    }
    return `<div class="cb-embedded-img-wrap"><img src="${cleanUrl}" alt="${alt}" class="cb-embedded-img" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop';"></div>`;
  });

  // 2. Format Markdown links SECOND: [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="cb-inline-link" target="_self">$1</a>');

  // Process lists and paragraphs line-by-line
  const lines = html.split('\n');
  let inList = false;
  let result = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (line.startsWith('* ') || line.startsWith('- ')) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      result.push(`<li>${line.substring(2)}</li>`);
    } else if (line.match(/^\d+\.\s/)) {
      if (!inList) {
        result.push('<ol>');
        inList = true;
      }
      const listContent = line.replace(/^\d+\.\s/, '');
      result.push(`<li>${listContent}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      if (line !== '') {
        result.push(`<p>${line}</p>`);
      }
    }
  }

  if (inList) {
    result.push('</ul>');
  }

  return result.join('');
}

// Format message timestamp
function getFormattedTime() {
  const date = new Date();
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Render message in Chat Box
function appendMessage(sender, text, timestamp = getFormattedTime(), extraHtml = '') {
  if (!chatBox) return;

  const wrapper = document.createElement('div');
  wrapper.className = `message-wrapper ${sender}`;

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.innerHTML = markdownToHtml(text) + (extraHtml || '');

  const meta = document.createElement('div');
  meta.className = 'message-meta';
  meta.textContent = `${sender === 'user' ? 'You' : 'A-I bot'} • ${timestamp}`;

  wrapper.appendChild(bubble);
  wrapper.appendChild(meta);
  chatBox.appendChild(wrapper);

  // Scroll to bottom
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Show/Hide Typing Indicator
let typingIndicatorElem = null;
function showTypingIndicator() {
  if (typingIndicatorElem || !chatBox) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'message-wrapper bot';
  wrapper.id = 'typingIndicator';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
  `;

  bubble.appendChild(indicator);
  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
  typingIndicatorElem = wrapper;
}

function hideTypingIndicator() {
  if (typingIndicatorElem) {
    typingIndicatorElem.remove();
    typingIndicatorElem = null;
  }
}

// Load Chat History
function loadChatHistory() {
  if (!chatBox) return;
  chatBox.innerHTML = '';

  // Prune any legacy fictional sample messages from previous runs
  chatHistory = chatHistory.filter(msg => {
    const t = msg.text || '';
    return !t.includes('BNR34') && !t.includes('JZA80') && !t.includes('Tesla Model 3') && !t.includes('Ford Mustang GT') && !t.includes('2002 Nissan Skyline');
  });
  localStorage.setItem('ac_gemini_chat_history', JSON.stringify(chatHistory));

  if (chatHistory.length === 0) {
    appendMessage(
      'bot',
      `Ayubowan & Welcome to **A&C Japan Auto Parts**! 🚗✨\n\nI am connected directly to our live auction database. Ask me about available vehicles, bidding rules, fee calculations, or click the chips below to see our live inventory with photos!`,
      getFormattedTime()
    );
  } else {
    chatHistory.forEach(msg => {
      appendMessage(msg.role === 'user' ? 'user' : 'bot', msg.text, msg.timestamp, msg.extraHtml || '');
    });
  }
}

// Clear Chat History
function clearHistory() {
  if (confirm('Are you sure you want to clear your conversation history?')) {
    chatHistory = [];
    localStorage.removeItem('ac_gemini_chat_history');
    localStorage.removeItem('gemini_chat_history');
    loadChatHistory();
  }
}

// Send Message handler
async function handleSendMessage(text) {
  if (!text || text.trim() === '') return;

  const userMsgText = text.trim();
  const time = getFormattedTime();

  // 1. Render User Message
  appendMessage('user', userMsgText, time);
  if (userInput) userInput.value = '';

  // Save to state & local storage
  chatHistory.push({ role: 'user', text: userMsgText, timestamp: time });
  localStorage.setItem('ac_gemini_chat_history', JSON.stringify(chatHistory));

  // 2. Fetch latest live auctions from database
  if (liveAuctions.length === 0 || isVehicleInquiry(userMsgText)) {
    await fetchAuctionsFromDB();
  }

  // 3. Verify API Key and client setup
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY' || !aiClient) {
    showTypingIndicator();
    setTimeout(() => {
      hideTypingIndicator();
      const errorMsg = '⚠️ API Key is missing. Please edit `assets/chatbot/training-data.js` to configure your Gemini API Key.';
      appendMessage('bot', errorMsg);
      chatHistory.push({ role: 'bot', text: errorMsg, timestamp: getFormattedTime() });
      localStorage.setItem('ac_gemini_chat_history', JSON.stringify(chatHistory));
    }, 700);
    return;
  }

  // 4. Request Gemini API
  showTypingIndicator();
  try {
    const apiContents = [];
    const recentHistory = chatHistory.slice(-16);

    recentHistory.forEach(msg => {
      const role = msg.role === 'user' ? 'user' : 'model';
      if (!msg.text.includes('API Key is missing') && !msg.text.includes('API Key missing')) {
        apiContents.push({
          role: role,
          parts: [{ text: msg.text }]
        });
      }
    });

    const activeInstruction = getDynamicSystemInstruction();

    let response = null;
    try {
      response = await aiClient.models.generateContent({
        model: modelName,
        contents: apiContents,
        config: {
          systemInstruction: activeInstruction
        }
      });
    } catch (modelErr) {
      console.warn(`Primary model ${modelName} failed, attempting fallback:`, modelErr);
      const fallbackModel = modelName === 'gemini-3.6-flash' ? 'gemini-3.1-flash-lite' : 'gemini-3.6-flash';
      response = await aiClient.models.generateContent({
        model: fallbackModel,
        contents: apiContents,
        config: {
          systemInstruction: activeInstruction
        }
      });
    }

    hideTypingIndicator();

    let botReplyText = '';
    if (response && response.text) {
      botReplyText = response.text;
    } else {
      botReplyText = 'Here are our latest vehicle auctions from the database:';
    }

    // Determine relevant database vehicles to display with full cards & images
    let extraCardsHtml = '';
    const relevantVehicles = getRelevantVehicles(userMsgText, botReplyText);
    if (relevantVehicles.length > 0) {
      extraCardsHtml = renderAuctionCardsHTML(relevantVehicles);
    }

    const botTime = getFormattedTime();
    appendMessage('bot', botReplyText, botTime, extraCardsHtml);

    chatHistory.push({ role: 'bot', text: botReplyText, timestamp: botTime, extraHtml: extraCardsHtml });
    localStorage.setItem('ac_gemini_chat_history', JSON.stringify(chatHistory));

  } catch (error) {
    console.error('Gemini API Error:', error);
    hideTypingIndicator();

    const errorTime = getFormattedTime();
    let fallbackCards = '';
    const relevantVehicles = getRelevantVehicles(userMsgText, '');
    if (relevantVehicles.length > 0) {
      fallbackCards = renderAuctionCardsHTML(relevantVehicles);
    }

    const botErrorReply = `Here are the active auction vehicles directly from our database:`;
    appendMessage('bot', botErrorReply, errorTime, fallbackCards);

    chatHistory.push({ role: 'bot', text: botErrorReply, timestamp: errorTime, extraHtml: fallbackCards });
    localStorage.setItem('ac_gemini_chat_history', JSON.stringify(chatHistory));
  }
}

// Toggle Chatbot Window Open/Close
function toggleChatbot() {
  if (!chatbotWindow) return;
  const isHidden = chatbotWindow.classList.contains('hidden-widget');

  if (isHidden) {
    chatbotWindow.classList.remove('hidden-widget');
    chatbotWindow.classList.add('open-widget');
    if (chatbotToggleBtn) chatbotToggleBtn.classList.add('is-active');
    setTimeout(() => {
      if (userInput) userInput.focus();
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    }, 150);
  } else {
    chatbotWindow.classList.remove('open-widget');
    chatbotWindow.classList.add('hidden-widget');
    if (chatbotToggleBtn) chatbotToggleBtn.classList.remove('is-active');
  }
}

function closeChatbot() {
  if (!chatbotWindow) return;
  chatbotWindow.classList.remove('open-widget');
  chatbotWindow.classList.add('hidden-widget');
  if (chatbotToggleBtn) chatbotToggleBtn.classList.remove('is-active');
}

// Event Listeners
if (chatForm) {
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (userInput) handleSendMessage(userInput.value);
  });
}

if (clearBtn) {
  clearBtn.addEventListener('click', clearHistory);
}

if (suggestionsContainer) {
  suggestionsContainer.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (chip) {
      const prompt = chip.getAttribute('data-prompt');
      handleSendMessage(prompt);
    }
  });
}

if (chatbotToggleBtn) {
  chatbotToggleBtn.addEventListener('click', toggleChatbot);
}

if (chatbotCloseBtn) {
  chatbotCloseBtn.addEventListener('click', closeChatbot);
}

// Pre-fetch live auctions from DB on load
fetchAuctionsFromDB();

// Start Application
initGenAI();
loadChatHistory();
