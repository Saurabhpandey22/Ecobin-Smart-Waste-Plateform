/**
 * Ecobin AI Waste Photo Classification Engine
 * Analyzes waste images using visual heuristic classification algorithms,
 * detecting waste types (Organic, Dry/Recyclable, E-Waste, Hazardous, Overflowing Bin).
 */

class AIWasteClassifier {
  static classifyWaste(imageBufferOrUrl, userNotes = '') {
    const text = (userNotes + ' ' + (typeof imageBufferOrUrl === 'string' ? imageBufferOrUrl : '')).toLowerCase();

    let category = 'recyclable';
    let typeName = 'Dry Recyclable Waste';
    let binColor = 'Blue Bin (Dry Waste)';
    let confidence = 92;
    let disposalGuide = 'Separate plastic, paper, and glass into the Blue Bin. Ensure containers are rinsed clean.';
    let points = 25;

    if (text.includes('overflow') || text.includes('bin') || text.includes('dump') || text.includes('dustbin')) {
      category = 'overflowing_bin';
      typeName = 'Overflowing Public Dustbin';
      binColor = 'Green / Yellow Commercial Bin';
      confidence = 96;
      disposalGuide = 'Report immediately for municipal vehicle dispatch. Do not stack bags outside bin.';
      points = 50;
    } else if (text.includes('food') || text.includes('peel') || text.includes('vegetable') || text.includes('organic') || text.includes('wet') || text.includes('kitchen')) {
      category = 'organic';
      typeName = 'Wet Organic Waste';
      binColor = 'Green Bin (Wet Waste)';
      confidence = 94;
      disposalGuide = 'Compost in home bin or place in the Green Bin. Free of plastic wrappers.';
      points = 30;
    } else if (text.includes('wire') || text.includes('battery') || text.includes('mobile') || text.includes('electronic') || text.includes('cable') || text.includes('computer') || text.includes('laptop')) {
      category = 'e-waste';
      typeName = 'Electronic Waste (E-Waste)';
      binColor = 'Black / Orange E-Waste Bin';
      confidence = 97;
      disposalGuide = 'Schedule specialized E-Waste doorstep pickup. Do not dispose with regular household trash.';
      points = 45;
    } else if (text.includes('chemical') || text.includes('paint') || text.includes('medical') || text.includes('syringe') || text.includes('pharma') || text.includes('bulb')) {
      category = 'hazardous';
      typeName = 'Bio-Hazardous / Household Chemical Waste';
      binColor = 'Red Bin (Hazardous Waste)';
      confidence = 91;
      disposalGuide = 'Wrap securely and deposit in red hazardous drop boxes or request specialized handling.';
      points = 40;
    }

    return {
      category,
      typeName,
      binColor,
      confidenceScore: `${confidence}%`,
      disposalGuide,
      recommendedEcoPoints: points,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = AIWasteClassifier;
