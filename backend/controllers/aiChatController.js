/**
 * Ecobin Production AI Chatbot Controller
 * Real-time LLM integration + Swachh Bharat Multilingual Knowledge Engine (Hindi, Hinglish, English).
 */

// Comprehensive Swachh Bharat NLP Knowledge Engine for instant fallback
function getLocalKnowledgeResponse(query) {
  const q = query.toLowerCase().trim();

  // 1. Greetings & Identity
  if (/^(hi|hello|hey|namaste|pranam|kem cho|kaisa|kaise|who are you|koun ho)/.test(q)) {
    return {
      reply: `Namaste! 🙏 Main hoon EcoBin Swachh AI Assistant.\n\nAap mujhse kisi bhi tarah ke kachre (Plastic, E-waste, Geela/Sukha kachra) ko segregate karne ka tarika, complaint lodge karne ki vidhi, ya Smart Bins live map ke baare mein pooch sakte hain!\n\nAap kya janna chahte hain?`,
      chips: [
        { label: '🚨 Kachra Report Kaise Karein?', action: 'report_issue' },
        { label: '🗑️ Green vs Blue Bin Rules', action: 'play_quiz' },
        { label: '📍 Nearest Smart Bin Map', action: 'goto_bins' },
        { label: '🏆 Eco Points Kaise Milenge?', action: 'play_quiz' }
      ]
    };
  }

  // 2. Plastic & Recyclables (Dry Waste / Sukha Kachra)
  if (q.includes('plastic') || q.includes('bottle') || q.includes('polythene') || q.includes('sukha') || q.includes('dry') || q.includes('paper') || q.includes('cardboard') || q.includes('glass') || q.includes('can') || q.includes('tin')) {
    return {
      reply: `♻️ **Sukha Kachra (Dry Recyclable Waste) Guide:**\n\n• **Kaunsa Bin:** 🔵 **Blue Bin (Neela Dustbin)**\n• **Kya Daalein:** Plastic bottles, carry bags, cardboard, packaging boxes, newspaper, aluminium cans, aur glass jars.\n• **Zaroori Tip:** Plastic bottles ko crush karke daalein aur food containers ko pehle halka sa dho kar sukha lein.\n• **Eco-Points:** Blue bin segregation follow karne par aapko +25 Eco-Points milte hain!`,
      chips: [
        { label: '🧠 Segregation Quiz Khelein', action: 'play_quiz' },
        { label: '🚨 Dry Waste Overflow Report Karein', action: 'report_issue' },
        { label: '📍 Blue Bins Map Dekhein', action: 'goto_bins' }
      ]
    };
  }

  // 3. Wet Waste / Kitchen Waste / Geela Kachra / Compost
  if (q.includes('geela') || q.includes('wet') || q.includes('food') || q.includes('khana') || q.includes('peel') || q.includes('chilka') || q.includes('vegetable') || q.includes('sabji') || q.includes('kitchen') || q.includes('compost') || q.includes('khad')) {
    return {
      reply: `🥬 **Geela Kachra (Wet Organic Waste & Composting):**\n\n• **Kaunsa Bin:** 🟢 **Green Bin (Hara Dustbin)**\n• **Kya Daalein:** Sabzi/phalon ke chhilke, bacha hua khana, chai patti, sukhe patte aur egg shells.\n• **Ghar Par Khad (Compost):** Ek matke ya bucket mein geela kachra aur thodi mitti daalkar 3-4 hafte mein behtareen organic compost taiyar kar sakte hain.\n• **Caution:** Green bin mein plastic wrapper ya polythene bilkul na daalein!`,
      chips: [
        { label: '🌱 Compost Guide & Quiz', action: 'play_quiz' },
        { label: '🚨 Green Bin Full Report', action: 'report_issue' }
      ]
    };
  }

  // 4. E-Waste (Electronic Waste)
  if (q.includes('e-waste') || q.includes('ewaste') || q.includes('battery') || q.includes('electronic') || q.includes('mobile') || q.includes('phone') || q.includes('wire') || q.includes('charger') || q.includes('laptop') || q.includes('computer')) {
    return {
      reply: `🔌 **Electronic Waste (E-Waste) Disposal:**\n\n• E-waste mein lead, mercury aur cadmium jaise toxic metals hote hain. Inhe sadharan kachre mein **kabhi na fekein**!\n• **EcoBin Solution:** EcoBin par aap **Doorstep E-Waste Pickup** schedule kar sakte hain.\n• Municipal authorized e-waste recyclers aapke ghar aakar ise pick karenge aur aapko **+40 Eco-Points** milenge!`,
      chips: [
        { label: '📦 Schedule E-Waste Pickup', action: 'goto_citizen' },
        { label: '🚨 Report Dumping Spot', action: 'report_issue' }
      ]
    };
  }

  // 5. Hazardous / Medical / Chemical Waste
  if (q.includes('hazard') || q.includes('paint') || q.includes('chemical') || q.includes('medicine') || q.includes('dawa') || q.includes('syringe') || q.includes('injection') || q.includes('sanitary') || q.includes('diaper') || q.includes('poison')) {
    return {
      reply: `☣️ **Gharelu Hanikarak Kachra (Household Hazardous Waste):**\n\n• **Kaunsa Bin:** 🔴 **Red Bin (Laal Dustbin)**\n• **Kya Aata Hai:** Expired medicines, syringes/needles, paint ke dabbe, insect spray, battery acid, aur sanitary waste.\n• **Disposal Rule:** Syringes ko safe puncture-proof container mein band karke red bin mein daalein ya nagar nigam ke hazardous collection center par bhejein.`,
      chips: [
        { label: '🚨 Hazardous Waste Report', action: 'report_issue' },
        { label: '📞 Swachh Helpline (1916)', action: 'goto_citizen' }
      ]
    };
  }

  // 6. Complaints & Grievance Reporting
  if (q.includes('report') || q.includes('complaint') || q.includes('shikayat') || q.includes('overflow') || q.includes('kachra') || q.includes('dump') || q.includes('gandagi') || q.includes('safai')) {
    return {
      reply: `🚨 **Kachra / Grievance Report Karne Ka Tarika:**\n\n1. Top menu se **"Citizen Services"** par click karein.\n2. **"Report Waste Issue"** button dabayein.\n3. Kachre ki photo click karein ya upload karein (hamara AI khud waste type detect kar lega!).\n4. Map par location pin karein aur Submit karein.\n\nNagar Nigam sanitation officer ko alert chala jayega aur aapko **+30 Eco Points** milenge!`,
      chips: [
        { label: '🚨 Abhi Report Karein', action: 'report_issue' },
        { label: '📊 Meri Complaints Dekhein', action: 'goto_citizen' }
      ]
    };
  }

  // 7. Smart Bins & IoT Ultrasonic Sensors
  if (q.includes('smart bin') || q.includes('bin') || q.includes('sensor') || q.includes('ultrasonic') || q.includes('dustbin') || q.includes('map') || q.includes('level') || q.includes('fill')) {
    return {
      reply: `📡 **EcoBin Smart Dustbin Telemetry System:**\n\nHar smart dustbin par ESP32 microcontroller aur ultrasonic sensor laga hota hai jo har 5 second mein real-time garbage fill level live update karta hai:\n\n• 🟢 **Green Marker (<50%):** Dustbin khali hai, use kar sakte hain.\n• 🟡 **Yellow Marker (50-80%):** Fill hone wala hai.\n• 🔴 **Red Marker (>80% Overflow Risk):** System automatically sanitation staff ko dispatch kar deta hai!`,
      chips: [
        { label: '📍 Live Smart Bins Map Kholein', action: 'goto_bins' },
        { label: '🚨 Full Bin Report Karein', action: 'report_issue' }
      ]
    };
  }

  // 8. Staff & Route Optimization
  if (q.includes('staff') || q.includes('route') || q.includes('truck') || q.includes('gadi') || q.includes('driver') || q.includes('pickup') || q.includes('timing')) {
    return {
      reply: `🚛 **Sanitation Route Optimization Console:**\n\n• Hamara system Travelling Salesperson Problem (TSP) algorithm use karke un sabhi bins (>65% full) aur pending citizen complaints ko ek shortest optimal route mein jod deta hai.\n• Staff turn-by-turn navigation follow karke bins empty karte hain aur completion photo upload karte hain!`,
      chips: [
        { label: '🚛 Staff Console Kholein', action: 'goto_staff' },
        { label: '🗺️ Waste Heatmap Dekhein', action: 'goto_heatmap' }
      ]
    };
  }

  // 9. Eco Points, Rewards & Leaderboard
  if (q.includes('point') || q.includes('reward') || q.includes('leaderboard') || q.includes('badge') || q.includes('prize') || q.includes('inaam')) {
    return {
      reply: `🏆 **Eco-Points & Swachh Citizen Rewards:**\n\nAap alag-alag activities se Eco-Points kama sakte hain:\n• 📸 Waste Issue Report karna: **+30 Points**\n• 📦 Doorstep E-Waste Pickup: **+40 Points**\n• 🧠 Daily Waste Segregation Quiz: **+50 Points**\n\nIn points se aap Green Badges unlock kar sakte hain aur aapka naam Society Leaderboard par dikhta hai!`,
      chips: [
        { label: '🧠 Segregation Quiz Khelein', action: 'play_quiz' },
        { label: '🚨 Report Waste (+30 Pts)', action: 'report_issue' }
      ]
    };
  }

  // 10. Helpline & Emergency
  if (q.includes('helpline') || q.includes('number') || q.includes('phone') || q.includes('contact') || q.includes('call') || q.includes('whatsapp')) {
    return {
      reply: `📞 **Swachh Bharat Municipal Emergency Helplines:**\n\n• **National Swachh Helpline:** Dial **1916** (Toll-Free, 24x7)\n• **Central Grievance Portal:** 1800-11-0011\n• **Emergency Whatsapp:** +91 99999-19160\n\nAap kisi bhi emergency dead animal removal ya illegal dumping ke liye turant call kar sakte hain.`,
      chips: [
        { label: '🚨 File Official Grievance', action: 'report_issue' },
        { label: '🏠 Home Page', action: 'goto_dashboard' }
      ]
    };
  }

  // Fallback intelligent answer
  return {
    reply: `Swachh Bharat & EcoBin Guidance:\n\n• **Grievance Report Karne ke liye:** "Citizen Services" mein jakar photo upload karein.\n• **Dustbin Track karne ke liye:** "Smart Bins Map" par live ultrasonic level check karein.\n• **Recycling Rules:** 🟢 Green = Geela khana/peels, 🔵 Blue = Sukha plastic/paper, 🔴 Red = Chemicals/medicine.\n\nAap upar diye gaye options mein se select kar sakte hain ya apna vishay likhein!`,
    chips: [
      { label: '🚨 Report Waste Issue', action: 'report_issue' },
      { label: '🗑️ Live Smart Bins Map', action: 'goto_bins' },
      { label: '🧠 Waste Segregation Quiz', action: 'play_quiz' },
      { label: '🚛 Staff Route Console', action: 'goto_staff' }
    ]
  };
}

exports.handleAIChat = async (req, res) => {
  try {
    const { message, userRole = 'citizen' } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message query is required.' });
    }

    const trimmedQuery = message.trim();

    // 1. Try calling live free LLM API with strict 3.5s timeout
    try {
      const prompt = `You are EcoBin, a smart, polite Swachh Bharat AI assistant. Help the citizen with their waste management, recycling, dustbin, or sanitation query. Answer in crisp Hinglish (or Hindi/English matching the user) in 3-5 sentences with clear bullet points. User query: "${trimmedQuery}"`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const llmUrl = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai`;
      const llmRes = await fetch(llmUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (llmRes.ok) {
        const textResponse = await llmRes.text();
        if (textResponse && textResponse.trim().length > 10) {
          // LLM responded successfully!
          const localCheck = getLocalKnowledgeResponse(trimmedQuery);
          return res.status(200).json({
            success: true,
            reply: textResponse.trim(),
            chips: localCheck.chips || [
              { label: '🚨 Report Waste Issue', action: 'report_issue' },
              { label: '🗑️ Live Smart Bins Map', action: 'goto_bins' }
            ],
            source: 'llm',
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (llmErr) {
      // LLM timed out or had connection glitch - smoothly fall back to our local knowledge engine
      console.log('LLM API fallback to local NLP engine:', llmErr.message);
    }

    // 2. Local Knowledge Engine (Always Instant, 100% Guaranteed)
    const localResult = getLocalKnowledgeResponse(trimmedQuery);
    return res.status(200).json({
      success: true,
      reply: localResult.reply,
      chips: localResult.chips,
      source: 'local_nlp',
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ success: false, message: 'AI Chat processing failed.', error: err.message });
  }
};
