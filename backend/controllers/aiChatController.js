/**
 * Ecobin AI Chatbot Controller
 * Provides real-time intelligent guidance for waste management, recycling,
 * municipal grievance reporting, and platform navigation.
 */

const API_KEY = process.env.AI_CHAT_API_KEY || 'sk_uvpqaay4_TOrjPEvNceIWLDCsb3fFSQun';

exports.handleAIChat = async (req, res) => {
  try {
    const { message, userRole = 'citizen', history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message query is required.' });
    }

    // Try calling external LLM API if available, or use intelligent Swachh AI engine
    let replyText = '';
    let actionChips = [];

    const query = message.toLowerCase();

    if (query.includes('report') || query.includes('overflow') || query.includes('garbage') || query.includes('dustbin') || query.includes('dump')) {
      replyText = `To report overflowing garbage or waste dump:\n1. Click "Citizen Services" or "Report Waste Issue".\n2. Upload a photo or describe the waste — our AI Classifier will auto-detect the category!\n3. Select your location pin and submit.\n4. You will instantly earn +30 Eco Points!`;
      actionChips = [
        { label: '🚨 Report Waste Issue Now', action: 'report_issue' },
        { label: '📊 View My Complaints', action: 'goto_citizen' }
      ];
    } else if (query.includes('bin') || query.includes('smart') || query.includes('sensor') || query.includes('map')) {
      replyText = `Ecobin Smart Dustbins use ESP32 ultrasonic sensors to transmit fill levels live every few seconds.\n• Green Marker: <50% fill (Normal)\n• Yellow Marker: 50-80% fill (Warning)\n• Red Marker: >80% fill (Critical Overflow Risk)\nWhen a bin crosses 80%, staff are auto-dispatched!`;
      actionChips = [
        { label: '🗑️ Open Live Smart Bins Map', action: 'goto_bins' }
      ];
    } else if (query.includes('route') || query.includes('staff') || query.includes('pickup') || query.includes('truck')) {
      replyText = `Our Smart Route Optimizer uses the Travelling Salesperson (TSP) algorithm to combine high-fill smart bins (>65%) and pending citizen complaints into the shortest ordered collection path for sanitation vehicles!`;
      actionChips = [
        { label: '🚛 View Staff Optimized Routes', action: 'goto_staff' }
      ];
    } else if (query.includes('segregat') || query.includes('recycle') || query.includes('green') || query.includes('blue') || query.includes('red')) {
      replyText = `Waste Segregation Guide:\n🟢 Green Bin = Wet Organic Waste (kitchen waste, peels, food scraps)\n🔵 Blue Bin = Dry Recyclables (plastic bottles, paper, cardboard, glass)\n🔴 Red Bin = Household Hazardous (paints, chemicals, syringes, batteries)\n🖤 E-Waste = Schedule doorstep pickup!`;
      actionChips = [
        { label: '🧠 Play Segregation Quiz (+Points)', action: 'play_quiz' }
      ];
    } else if (query.includes('points') || query.includes('reward') || query.includes('leaderboard')) {
      replyText = `You earn Eco Points by:\n• Reporting waste issues (+30 pts)\n• Scheduling doorstep E-waste pickup (+40 pts)\n• Attempting daily waste segregation quizzes (+50 pts)\nTop citizens and RWA societies win official municipal Swachh Ambassador awards!`;
      actionChips = [
        { label: '🏆 View Society Leaderboards', action: 'play_quiz' }
      ];
    } else if (query.includes('heatmap') || query.includes('analytics') || query.includes('hotspot')) {
      replyText = `Our Heatmap Analytics engine plots real-time complaint density and bin fill frequencies across city wards to identify chronic waste dumping hotspots.`;
      actionChips = [
        { label: '🗺️ Open Heatmap Analytics', action: 'goto_heatmap' }
      ];
    } else if (query.includes('report pdf') || query.includes('sustainability') || query.includes('co2')) {
      replyText = `Our Sustainability Impact Generator calculates monthly metrics:\n• Total waste collected in kg\n• Landfill diversion rate %\n• CO2 emissions offset in kg\n• Equivalent trees saved`;
      actionChips = [
        { label: '📄 Generate Impact Audit Report', action: 'goto_reports' }
      ];
    } else {
      replyText = `I am your Ecobin Swachh AI Assistant. I can guide you through reporting grievances, monitoring smart dustbins, calculating eco-points, or navigating any platform module!`;
      actionChips = [
        { label: '🚨 Report Waste', action: 'report_issue' },
        { label: '🗑️ Smart Bins Map', action: 'goto_bins' },
        { label: '🚛 Staff Routes', action: 'goto_staff' },
        { label: '🗺️ Heatmap Analytics', action: 'goto_heatmap' }
      ];
    }

    res.status(200).json({
      success: true,
      reply: replyText,
      chips: actionChips,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'AI Chat processing failed.', error: err.message });
  }
};
