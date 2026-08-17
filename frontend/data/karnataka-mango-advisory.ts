// ============================================================================
// MANGODL — KARNATAKA MANGO VARIETIES & EXACT DISEASE SOLUTIONS ADVISORY
// Comprehensive Pathology, Chemical, Bio-Control & Farming Practices Engine
// ============================================================================

export interface KarnatakaMangoVariety {
  id: string;
  name: string;
  kannadaName: string;
  districts: string[];
  treeType: "UHDP" | "HDP" | "Traditional Spacing" | "Semi-Intensive";
  recommendedSpacing: string;
  season: "Early (March-April)" | "Mid-Season (May-June)" | "Late-Season (June-July)";
  marketType: "Table / Export" | "Pulp Processing" | "Local APMC / Fresh Juice" | "Heirloom / Premium";
  avgBrix: string;
  keyStrengths: string;
  vulnerabilities: {
    disease: string;
    risk: "High" | "Medium" | "Low";
    note: string;
  }[];
  farmingProtocol: {
    pruning: string;
    irrigation: string;
    nutrition: string;
    specialCare: string;
  };
}

export interface DiseaseSolutionProtocol {
  id: string;
  diseaseName: string;
  scientificName: string;
  causalAgent: "Fungal Pathogen" | "Bacterial Pathogen" | "Insect Pest / Curculionid" | "Dipteran Cecidomyiid" | "Epiphytic Fungus / Sucking Insect Symbiosis" | "None (Optimal Physiology)";
  urgency: "Immediate Action Required" | "Moderate Attention" | "Preventative Routine" | "No Treatment Needed";
  visualSymptoms: string[];
  damageMechanism: string;
  karnatakaSeasonality: string;
  
  // 1. Chemical Solutions
  chemicalPesticides: {
    primaryChemical: string;
    tradeNames: string[];
    dosage: string;
    sprayTiming: string;
    rotationChemical: string;
    phi: string; // Pre-Harvest Interval
    cautions: string;
  };

  // 2. Organic & Bio-Control Solutions
  organicSolutions: {
    botanical: string;
    bioAgent: string;
    dosage: string;
    applicationMethod: string;
    indigenousMix: string;
  };

  // 3. Cultural & Farming Practices
  farmingPractices: {
    canopyPruning: string;
    waterManagement: string;
    fieldSanitation: string;
    intercropping: string;
    postHarvestCare: string;
  };

  // 4. Karnataka 10-Variety Susceptibility & Action
  varietyAdvisory: Record<string, {
    riskLevel: "High" | "Medium" | "Low";
    varietySpecificAction: string;
    criticalStage: string;
  }>;
}

// ----------------------------------------------------------------------------
// 10 Major Mango Varieties of Karnataka
// ----------------------------------------------------------------------------
export const KARNATAKA_MANGO_VARIETIES: KarnatakaMangoVariety[] = [
  {
    id: "alphonso",
    name: "Alphonso (Badami / Hapus)",
    kannadaName: "ಬಾದಾಮಿ / ಆಪೂಸ್",
    districts: ["Dharwad", "Belagavi", "Uttara Kannada", "Haveri", "Shivamogga"],
    treeType: "HDP",
    recommendedSpacing: "5m × 5m or 6m × 6m (278-400 trees/ha)",
    season: "Mid-Season (May-June)",
    marketType: "Table / Export",
    avgBrix: "19 - 22° Brix",
    keyStrengths: "Exquisite saffron aroma, global export demand, rich golden flesh",
    vulnerabilities: [
      { disease: "Anthracnose", risk: "High", note: "Susceptible on young panicles and fruit shoulders during pre-monsoon showers." },
      { disease: "Die Back", risk: "High", note: "Pruned branches prone to Lasiodiplodia infection in heavy rain zones." },
      { disease: "Powdery Mildew", risk: "Medium", note: "Attacks during dry cold mornings in February." },
    ],
    farmingProtocol: {
      pruning: "Post-harvest center opening in July to maximize sunlight penetration into the interior canopy.",
      irrigation: "Withhold drip irrigation for 60 days from November to January to induce stress flowering.",
      nutrition: "Apply 1000g N, 500g P2O5, 1000g K2O per 10-year tree in two splits (July and September).",
      specialCare: "Cover developing fruits with paper bags to eliminate spongy tissue and fruit fly oviposition.",
    },
  },
  {
    id: "banganapalli",
    name: "Banganapalli (Benishan / Safeda)",
    kannadaName: "ಬಂಗನಪಲ್ಲಿ / ಬೇನಿಶಾನ್",
    districts: ["Kolar", "Chikkaballapur", "Tumakuru", "Ballari", "Chitradurga"],
    treeType: "Semi-Intensive",
    recommendedSpacing: "7.5m × 7.5m (177 trees/ha)",
    season: "Mid-Season (May-June)",
    marketType: "Table / Export",
    avgBrix: "17 - 20° Brix",
    keyStrengths: "Firm fibreless pulp, large fruit size (350-500g), high domestic commercial volume",
    vulnerabilities: [
      { disease: "Powdery Mildew", risk: "High", note: "Heavy blossom loss if early morning mist occurs during January-February flowering." },
      { disease: "Anthracnose", risk: "Medium", note: "Latent infection causes black spots on ripe fruit." },
      { disease: "Gall Midge", risk: "Medium", note: "Affects vegetative flushes emerging in August-September." },
    ],
    farmingProtocol: {
      pruning: "Light annual pruning to remove intersecting branches and water shoots immediately after harvest.",
      irrigation: "Drip fertigation twice weekly from pea-stage fruit sizing until 15 days before harvest.",
      nutrition: "Foliar spray of 1% Potassium Nitrate (13-0-45) at mustard and pea stage for uniform fruit size.",
      specialCare: "Sulphur dusting at 50% bloom stage protects panicles against powdery mildew epidemics.",
    },
  },
  {
    id: "totapuri",
    name: "Totapuri (Ginimoothi / Bangalore)",
    kannadaName: "ತೋತಾಪುರಿ / ಗಿಣಿಮೂತಿ",
    districts: ["Srinivasapur (Kolar)", "Mulbagal", "Bangarapet", "Chintamani", "Kolar"],
    treeType: "UHDP",
    recommendedSpacing: "3m × 2m or 4m × 2m (1250-1666 trees/ha in UHDP)",
    season: "Mid-Season (May-June)",
    marketType: "Pulp Processing",
    avgBrix: "14 - 16° Brix",
    keyStrengths: "Regular heavy bearer, distinct beak tip, bedrock of Karnataka's mega pulp processing factories",
    vulnerabilities: [
      { disease: "Bacterial Canker", risk: "High", note: "High risk during windy monsoon rains; causes raised corky lesions." },
      { disease: "Cutting Weevil", risk: "High", note: "Weevil severs new tender leaf flushes in August." },
      { disease: "Anthracnose", risk: "Medium", note: "Moderate susceptibility on leaves, robust against blossom blight." },
    ],
    farmingProtocol: {
      pruning: "Rigorous annual topping at 2.5m height and branch hedging in high-density processing orchards.",
      irrigation: "Consistent drip irrigation maintains continuous heavy crop load without fruit drop.",
      nutrition: "High potassium and micronutrient (Boron + Zinc) regimen to maximize pulp-to-stone ratio.",
      specialCare: "Apply Copper Oxychloride post-pruning to seal mechanical wounds against bacterial canker.",
    },
  },
  {
    id: "mallika",
    name: "Mallika (Neelum × Dasheri Hybrid)",
    kannadaName: "ಮಲ್ಲಿಕಾ",
    districts: ["Bengaluru Rural", "Ramanagara", "Tumakuru", "Mandya", "Hassan"],
    treeType: "HDP",
    recommendedSpacing: "5m × 5m (400 trees/ha)",
    season: "Late-Season (June-July)",
    marketType: "Heirloom / Premium",
    avgBrix: "22 - 24° Brix",
    keyStrengths: "Superlative sweetness, rich deep orange pulp, dwarf habit ideal for high density",
    vulnerabilities: [
      { disease: "Sooty Mould", risk: "High", note: "Heavy nectar exudation attracts mango hoppers and black fungal growth." },
      { disease: "Powdery Mildew", risk: "Medium", note: "Dense foliage canopy can trap moisture and harbor spores." },
      { disease: "Anthracnose", risk: "Low", note: "Moderate natural resistance inherited from Neelum parentage." },
    ],
    farmingProtocol: {
      pruning: "Moderate canopy thinning to allow light into the central dome of the tree.",
      irrigation: "Regulated deficit irrigation post-fruit set increases sugar concentration and shelf life.",
      nutrition: "Organic soil drenching with Jeevamrutha and vermicompost enhances carotenoid pigment synthesis.",
      specialCare: "Early hopper control using Metarhizium or Imidacloprid prevents sooty mould outbreaks.",
    },
  },
  {
    id: "raspuri",
    name: "Raspuri (Sweet / Juice King)",
    kannadaName: "ರಸಪೂರಿ / ಸಿಹಿ ಮಾವು",
    districts: ["Ramanagara", "Channapatna", "Bengaluru Urban", "Mysuru", "Mandya"],
    treeType: "Traditional Spacing",
    recommendedSpacing: "9m × 9m or 10m × 10m (100-123 trees/ha)",
    season: "Early (March-April)",
    marketType: "Local APMC / Fresh Juice",
    avgBrix: "18 - 21° Brix",
    keyStrengths: "Iconic juicy texture, unmatched table aroma, early arrival in Bengaluru APMC markets",
    vulnerabilities: [
      { disease: "Anthracnose", risk: "High", note: "Thin delicate skin makes fruits vulnerable to tear-stain lesions." },
      { disease: "Die Back", risk: "High", note: "Vigorous soft wood shoots suffer from Botryodiplodia dieback." },
      { disease: "Gall Midge", risk: "Medium", note: "Tender early-season leaves show wart-like leaf galls." },
    ],
    farmingProtocol: {
      pruning: "Sanitizing prunes in August to clear dead wood, followed immediately by Bordeaux paste application.",
      irrigation: "Light micro-sprinkling during dry hot March winds prevents pre-mature fruit drop.",
      nutrition: "Farm Yard Manure (50kg/tree) + Neem Cake (5kg/tree) applied in root trenches during monsoon.",
      specialCare: "Harvest with 1cm stalk intact using mechanical pole harvesters to prevent sap burn and rot.",
    },
  },
  {
    id: "sindhoora",
    name: "Sindhoora (Sendura / Honey Mango)",
    kannadaName: "ಸಿಂಧೂರ",
    districts: ["Mandya", "Mysuru", "Chamarajanagar", "Ramanagara"],
    treeType: "Semi-Intensive",
    recommendedSpacing: "7m × 7m (204 trees/ha)",
    season: "Early (March-April)",
    marketType: "Table / Export",
    avgBrix: "16 - 19° Brix",
    keyStrengths: "Stunning scarlet red shoulder blush, elongated fruit, high natural tart-sweet balance",
    vulnerabilities: [
      { disease: "Gall Midge", risk: "High", note: "Cecidomyiid flies target early new flush during October-November." },
      { disease: "Powdery Mildew", risk: "Medium", note: "Affects early emergent flower panicles." },
      { disease: "Cutting Weevil", risk: "Medium", note: "Leaf cutter weevils damage young canopy development." },
    ],
    farmingProtocol: {
      pruning: "Light heading back after harvest; clear lower skirts to 1 meter above ground level.",
      irrigation: "Drip irrigation at 40-50 liters/day per adult tree during rapid fruit expansion.",
      nutrition: "Foliar application of Micronutrient mix (Fe, Zn, Mn, Cu, B) @ 2.5g/L during flush development.",
      specialCare: "Yellow sticky traps (15 traps/acre) placed at canopy height to capture midge and thrip vectors.",
    },
  },
  {
    id: "neelum",
    name: "Neelum (Late Season King)",
    kannadaName: "ನೀಲಂ",
    districts: ["Kolar", "Chintamani", "Srinivasapur", "Chikkaballapur", "Tumakuru"],
    treeType: "Semi-Intensive",
    recommendedSpacing: "8m × 8m (156 trees/ha)",
    season: "Late-Season (June-July)",
    marketType: "Local APMC / Fresh Juice",
    avgBrix: "17 - 19° Brix",
    keyStrengths: "Prolific late bearer, thick hardy rind, exceptional transport resilience and keeping quality",
    vulnerabilities: [
      { disease: "Sooty Mould", risk: "High", note: "Late season rain and humidity create heavy honeydew mould coating." },
      { disease: "Bacterial Canker", risk: "High", note: "Monsoon wind lashes fruit against twigs causing canker entry." },
      { disease: "Anthracnose", risk: "Medium", note: "Moderate field tolerance compared to other cultivars." },
    ],
    farmingProtocol: {
      pruning: "Post-harvest pruning in late August immediately followed by copper fungicide spray.",
      irrigation: "Deep soil soaking every 10 days in April-May prevents late-stage fruit splitting.",
      nutrition: "Well-balanced NPK with supplemental calcium nitrate (1%) spray to harden cell walls.",
      specialCare: "Intercrop with leguminous green manures (Sunhemp / Daincha) incorporated in soil in August.",
    },
  },
  {
    id: "amrapali",
    name: "Amrapali (High-Density Dwarf)",
    kannadaName: "ಆಮ್ರಪಾಲಿ",
    districts: ["Mandya", "Hassan", "Davanagere", "Bengaluru Rural"],
    treeType: "UHDP",
    recommendedSpacing: "2.5m × 2.5m or 3m × 3m (1111-1600 trees/ha)",
    season: "Late-Season (June-July)",
    marketType: "Heirloom / Premium",
    avgBrix: "21 - 23° Brix",
    keyStrengths: "Naturally dwarf canopy, dark red flesh, ultra-high tree density per acre",
    vulnerabilities: [
      { disease: "Powdery Mildew", risk: "High", note: "Ultra-dense foliage traps still humid air; requires proactive sulfur sprays." },
      { disease: "Anthracnose", risk: "Medium", note: "Foliar spotting if canopy is unpruned." },
      { disease: "Gall Midge", risk: "Low", note: "Moderate field resistance due to leathery leaf cuticle." },
    ],
    farmingProtocol: {
      pruning: "Annual topping and branch selective removal is mandatory to maintain 2.2m height and 2m spread.",
      irrigation: "Precision drip fertigation through automated timers; water demand is 30% lower than traditional trees.",
      nutrition: "Water-soluble 19:19:19 fertigation delivered weekly from flush to fruit set.",
      specialCare: "Ensure center of every dwarf tree is completely open to direct solar UV rays to sanitize spores.",
    },
  },
  {
    id: "dasheri",
    name: "Dasheri (North Karnataka Fragrant)",
    kannadaName: "ದಸೇರಿ",
    districts: ["Belagavi", "Bagalkote", "Dharwad", "Vijayapura", "Kalaburagi"],
    treeType: "Semi-Intensive",
    recommendedSpacing: "8m × 8m (156 trees/ha)",
    season: "Mid-Season (May-June)",
    marketType: "Table / Export",
    avgBrix: "18 - 21° Brix",
    keyStrengths: "Delightful perfumed sweetness, elongated slender fruit, high demand in Northern Karnataka",
    vulnerabilities: [
      { disease: "Cutting Weevil", risk: "High", note: "Tender flush in North Karnataka black soils heavily targeted by adult weevils." },
      { disease: "Die Back", risk: "High", note: "Calcareous alkaline soils aggravate micronutrient deficiency dieback." },
      { disease: "Anthracnose", risk: "Low", note: "Dry climate of North Karnataka suppresses fungal spore germination." },
    ],
    farmingProtocol: {
      pruning: "Prune weak interior shoots; paint cut stems with copper oxychloride paste.",
      irrigation: "Ring basin or inline drip irrigation with mulch cover to prevent soil cracking in vertisols.",
      nutrition: "Soil application of Ferrous Sulphate and Zinc Sulphate along with FYM to combat lime chlorosis.",
      specialCare: "Deep summer ploughing exposes pupating weevils to high soil temperatures and avian predators.",
    },
  },
  {
    id: "malgoa",
    name: "Malgoa (Malgova Heavy Heirloom)",
    kannadaName: "ಮಲಗೋವಾ",
    districts: ["Ramanagara", "Bengaluru Urban", "Kanakapura", "Chikkaballapur"],
    treeType: "Traditional Spacing",
    recommendedSpacing: "10m × 10m or 12m × 12m (69-100 trees/ha)",
    season: "Late-Season (June-July)",
    marketType: "Heirloom / Premium",
    avgBrix: "18 - 20° Brix",
    keyStrengths: "Giant heritage round fruit (400-800g), velvety rich taste, Karnataka royal heirloom heritage",
    vulnerabilities: [
      { disease: "Anthracnose", risk: "High", note: "Large heavy fruit skin subject to rain splash anthracnose decay." },
      { disease: "Gall Midge", risk: "High", note: "Broad fleshy leaves are preferred oviposition sites for gall midges." },
      { disease: "Die Back", risk: "Medium", note: "Old giant branches need structural pruning to prevent branch death." },
    ],
    farmingProtocol: {
      pruning: "Structural tree surgery on mature trees to remove dead central limbs and diseased wood.",
      irrigation: "Drip system with twin drip lines placed 1.5m and 3m from the tree trunk perimeter.",
      nutrition: "Heavy organic regime: 100kg composted cow manure + 10kg neem cake + 2kg Trichoderma per tree.",
      specialCare: "Bag individual heavy fruits with butter paper bags 4 weeks before harvest to ensure spotless premium skin.",
    },
  },
];

// ----------------------------------------------------------------------------
// Comprehensive Exact Disease Solutions (8 Disease Classes)
// ----------------------------------------------------------------------------
export const DISEASE_SOLUTIONS_MAP: Record<string, DiseaseSolutionProtocol> = {
  "Anthracnose": {
    id: "anthracnose",
    diseaseName: "Anthracnose",
    scientificName: "Colletotrichum gloeosporioides (Penz.)",
    causalAgent: "Fungal Pathogen",
    urgency: "Immediate Action Required",
    visualSymptoms: [
      "Dark brown to black necrotic circular/irregular spots with distinct chlorotic yellow halos on leaves.",
      "Blossom blight: Blackening and withering of open panicles leading to total fruit drop.",
      "Tear-staining pattern on fruit surface caused by spore-laden rainwater washing down from canopy twigs.",
      "Sunken, dark circular lesions on mature fruits that rot during ripening and transit.",
    ],
    damageMechanism: "Pathogen penetrates through leaf stomata and micro-wounds, secreting polygalacturonase enzymes that destroy chlorophyll parenchyma and vascular tissue.",
    karnatakaSeasonality: "Peaks during South-West monsoon (June-August) on foliage, and during pre-monsoon convective showers (April-May) on developing fruit.",
    
    chemicalPesticides: {
      primaryChemical: "Copper Oxychloride 50% WP (Blitox 50) or Carbendazim 12% + Mancozeb 63% WP (Saaf)",
      tradeNames: ["Blitox 50 WP", "Saaf WP", "Antracol 70 WP (Propineb)", "Contaf Plus (Hexaconazole 5% SC)"],
      dosage: "Copper Oxychloride @ 3.0 g/L water OR Carbendazim + Mancozeb @ 2.0 g/L water (Foliar spray: 800-1000 L/ha).",
      sprayTiming: "1st spray at new leaf flush emergence; 2nd spray at panicle emergence before flower opening; 3rd spray at marble fruit size.",
      rotationChemical: "Azoxystrobin 23% SC (Amistar) @ 1.0 ml/L water OR Difenoconazole 25% EC (Score) @ 0.5 ml/L water (alternate to prevent fungal resistance).",
      phi: "14 days pre-harvest safety interval.",
      cautions: "Do NOT spray copper fungicides during peak flower pollination (9:00 AM - 1:00 PM) as it repels honeybees and scorches stigmas.",
    },

    organicSolutions: {
      botanical: "Cold-pressed Neem Oil (10,000 ppm Azadirachtin) @ 3.0 ml/L + 1.0 ml agricultural surfactant / Khadi soap.",
      bioAgent: "Trichoderma viride 1.5% WP @ 5.0 g/L OR Pseudomonas fluorescens 1.0% WP @ 5.0 g/L as prophylactic foliar spray.",
      dosage: "Spray 5 g/L bio-agent solution early morning (6:30 AM - 8:30 AM) when UV index is low.",
      applicationMethod: "Foliar drench covering both upper and lower leaf surfaces, combined with 25 kg/ha FYM enriched with Trichoderma in the root zone.",
      indigenousMix: "Bordeaux Mixture (1:1:100): Dissolve 1 kg Copper Sulphate + 1 kg Quick Lime in 100 L water; filter and spray immediately.",
    },

    farmingPractices: {
      canopyPruning: "Open center canopy pruning in July-August immediately after harvest. Cut all criss-cross, dried twigs 5 cm into healthy green wood.",
      waterManagement: "Switch from flood or overhead sprinkler to inline drip irrigation to keep canopy foliage completely dry.",
      fieldSanitation: "Rake, collect, and burn or deep bury (60 cm) all fallen diseased leaves and mummified panicles before winter bloom.",
      intercropping: "Avoid planting cucurbits, papaya, or beans as intercrops as they act as collateral hosts for Colletotrichum.",
      postHarvestCare: "Hot water dip treatment of harvested mangoes at 52°C for 5 minutes (or 48°C for 10 minutes) eliminates latent quiescent fungal mycelium.",
    },

    varietyAdvisory: {
      "alphonso": { riskLevel: "High", varietySpecificAction: "High vulnerability! Apply 2 proactive Saaf sprays during new flush emergence and pre-bloom in Dharwad/Belagavi.", criticalStage: "Panicle emergence & marble stage" },
      "banganapalli": { riskLevel: "Medium", varietySpecificAction: "Watch for latent tear-stain on developing fruit shoulders in Kolar/Chikkaballapur orchards.", criticalStage: "Fruit sizing (April)" },
      "totapuri": { riskLevel: "Medium", varietySpecificAction: "Tolerant foliage, but spray copper fungicide after post-harvest hedging to seal mechanical cuts.", criticalStage: "Post-harvest vegetative flush" },
      "mallika": { riskLevel: "Low", varietySpecificAction: "Good natural resistance. 1 prophylactic neem spray is usually sufficient in Ramanagara.", criticalStage: "Tender flush" },
      "raspuri": { riskLevel: "High", varietySpecificAction: "Delicate thin fruit skin. Apply Score (Difenoconazole @ 0.5ml/L) 20 days prior to harvest.", criticalStage: "Fruit maturity" },
      "sindhoora": { riskLevel: "Medium", varietySpecificAction: "Spray Bordeaux mixture (1%) on new flush emerging post-monsoon in Mandya.", criticalStage: "October leaf flush" },
      "neelum": { riskLevel: "Medium", varietySpecificAction: "Late season rain requires pre-harvest azoxystrobin spray in June.", criticalStage: "Pre-harvest rain" },
      "amrapali": { riskLevel: "Medium", varietySpecificAction: "Prune dense dwarf centers to allow UV sunlight penetration across all hedgerows.", criticalStage: "Annual pruning" },
      "dasheri": { riskLevel: "Low", varietySpecificAction: "Dry North Karnataka climate limits spread; maintain clean orchard floor.", criticalStage: "Flowering" },
      "malgoa": { riskLevel: "High", varietySpecificAction: "Bag large individual fruits with paper bags in May to completely prevent fruit rot.", criticalStage: "Fruit development" },
    },
  },

  "Bacterial Canker": {
    id: "bacterial_canker",
    diseaseName: "Bacterial Canker / Black Spot",
    scientificName: "Xanthomonas campestris pv. mangiferaeindicae (Patel et al.)",
    causalAgent: "Bacterial Pathogen",
    urgency: "Immediate Action Required",
    visualSymptoms: [
      "Water-soaked, angular, raised polygonal dark brown to black lesions restricted by leaf veins.",
      "Bacterial gummy exudate (ooze) glistening on the lesions under humid conditions.",
      "Star-shaped (stellate) cracking on fruit surfaces with gummy bacterial discharge.",
      "Cankerous, rough, longitudinal dark splits on tender twigs causing branch die-off.",
    ],
    damageMechanism: "Bacteria enter through stomata, lenticels, and wind-blown abrasion wounds, proliferating in the intercellular spaces and causing cell wall dissolution and severe gumming.",
    karnatakaSeasonality: "Highly virulent during high velocity pre-monsoon and monsoon storms with driving rain (May-August) across Kolar and Dharwad belts.",

    chemicalPesticides: {
      primaryChemical: "Streptocycline (Streptomycin Sulphate 90% + Tetracycline Hydrochloride 10%) + Copper Oxychloride 50% WP",
      tradeNames: ["Plantomycin", "Streptocycline", "Bactosan", "Blitox 50 WP", "Kocide 2000 (Copper Hydroxide)"],
      dosage: "Streptocycline @ 0.1 g/L (100 ppm) COMBINED with Copper Oxychloride @ 2.5 g/L water (e.g. 10g Streptocycline + 250g COC per 100 L water).",
      sprayTiming: "Spray immediately after windstorms/hailstorms or mechanical pruning; repeat after 12-14 days if wet weather persists.",
      rotationChemical: "Kasugamycin 3% SL (Kasu-B) @ 2.0 ml/L OR Copper Hydroxide 53.8% DF (Kocide) @ 2.0 g/L water.",
      phi: "21 days pre-harvest safety interval.",
      cautions: "Always dissolve Streptocycline in a small bucket of lukewarm water first before mixing into the large spray tank containing Copper Oxychloride.",
    },

    organicSolutions: {
      botanical: "Garlic bulb extract (5%) + Neem oil (3 ml/L): Crush 500g fresh garlic in 10 L water, filter, and spray for broad-spectrum antibacterial action.",
      bioAgent: "Pseudomonas fluorescens 1% WP (Bio-Cure-B) @ 5.0 g/L as protective biological barrier.",
      dosage: "Spray 5 g/L P. fluorescens in late afternoon (4:30 PM) with 1 ml/L sticking agent.",
      applicationMethod: "Thorough spray wetting all branches and trunk crevices, followed by soil application of 100g P. fluorescens mixed with 10kg compost per tree.",
      indigenousMix: "Panchagavya (3% solution): Mix 3 L filtered Panchagavya in 100 L water; acts as a systemic plant immunity booster.",
    },

    farmingPractices: {
      canopyPruning: "Prune all cankered twigs 10 cm below the visible lesion; disinfect pruning shears with 70% alcohol or 1% sodium hypochlorite between trees.",
      waterManagement: "Establish dense Casuarina equisetifolia or Silver Oak windbreak borders around the orchard to reduce wind abrasion and bacterial splash.",
      fieldSanitation: "Paint trunk and main branch forks with Bordeaux Paste (1 kg Copper Sulphate + 1 kg Lime in 10 L water) twice a year (June and November).",
      intercropping: "Maintain grass cover in orchard alleys during monsoon to prevent muddy soil-bacteria splashing onto low hanging branches.",
      postHarvestCare: "Carefully grade out fruits with any trace of stellate canker before packing to prevent in-box contact spread.",
    },

    varietyAdvisory: {
      "alphonso": { riskLevel: "Medium", varietySpecificAction: "Spray Streptocycline (100 ppm) + COC (2.5g/L) after heavy monsoon squalls in Belagavi.", criticalStage: "Post-cyclonic rains" },
      "banganapalli": { riskLevel: "Medium", varietySpecificAction: "Disinfect pruning cuts immediately; inspect tree trunks for gummy canker lesions.", criticalStage: "Annual pruning" },
      "totapuri": { riskLevel: "High", varietySpecificAction: "High vulnerability in Srinivasapur! Apply 3 prophylactic copper+antibiotic sprays during monsoon.", criticalStage: "Monsoon vegetative flushes" },
      "mallika": { riskLevel: "Low", varietySpecificAction: "Moderate natural resistance. Maintain good windbreak trees on orchard boundaries.", criticalStage: "Windy season" },
      "raspuri": { riskLevel: "Medium", varietySpecificAction: "Protect tender shoots emerging in Ramanagara with organic Pseudomonas sprays.", criticalStage: "August flush" },
      "sindhoora": { riskLevel: "Low", varietySpecificAction: "Low incidence; sanitize pruning tools during canopy maintenance.", criticalStage: "Maintenance" },
      "neelum": { riskLevel: "High", varietySpecificAction: "Late monsoon winds cause fruit lesions. Spray Kasugamycin (2ml/L) 30 days before harvest.", criticalStage: "Fruit sizing in June" },
      "amrapali": { riskLevel: "Medium", varietySpecificAction: "High density canopy requires immediate cut-sterilization after mechanical hedging.", criticalStage: "Hedging/Topping" },
      "dasheri": { riskLevel: "Low", varietySpecificAction: "Dry climate restricts bacterial colonization; focus on balanced nutrition.", criticalStage: "General" },
      "malgoa": { riskLevel: "Medium", varietySpecificAction: "Paint major branch unions with thick Bordeaux paste before monsoon onset.", criticalStage: "Pre-monsoon (May)" },
    },
  },

  "Powdery Mildew": {
    id: "powdery_mildew",
    diseaseName: "Powdery Mildew",
    scientificName: "Oidium mangiferae (Henn.) / Erysiphe cichoracearum",
    causalAgent: "Fungal Pathogen",
    urgency: "Immediate Action Required",
    visualSymptoms: [
      "White, greyish powdery superficial fungal patches on emergent flower panicles, tender leaves, and young fruitlets.",
      "Floral parts turn brown, dry up, curl, and drop off in mass (blossom drop), leaving bare panicle main axes ('naked stalks').",
      "Young infected fruitlets turn purplish-brown, crack, exhibit russeting, and drop before reaching pea size.",
      "Infected tender leaves show curling, distortion, and velvety white mycelial coating on the ventral surface.",
    ],
    damageMechanism: "Superficial ectoparasitic mycelium produces haustoria that tap epidermal cells for nutrients, triggering rapid moisture desiccation and floral abortion.",
    karnatakaSeasonality: "Severe during December to March flowering season, triggered by cool cloudy nights followed by morning mist and dry warm days (20-30°C, RH 60-80%).",

    chemicalPesticides: {
      primaryChemical: "Wettable Sulphur 80% WDG/WP or Hexaconazole 5% SC (Contaf Plus)",
      tradeNames: ["Sulfex 80 WP", "Contaf Plus 5 SC", "Karathane 48 EC (Dinocap)", "Topas 100 EC (Penconazole)", "Nativo 75 WG (Tebuconazole + Trifloxystrobin)"],
      dosage: "Wettable Sulphur @ 3.0 g/L water OR Hexaconazole 5% SC @ 2.0 ml/L water OR Dinocap @ 1.0 ml/L water.",
      sprayTiming: "1st spray: At panicle emergence (10-15 cm length); 2nd spray: At 50% bloom; 3rd spray: At pea-size fruit set.",
      rotationChemical: "Penconazole 10% EC @ 0.5 ml/L OR Nativo 75 WG (Tebuconazole + Trifloxystrobin) @ 0.6 g/L (essential triazole/strobilurin rotation).",
      phi: "14 days pre-harvest safety interval.",
      cautions: "Do NOT spray Wettable Sulphur when daytime ambient temperatures exceed 35°C, as it causes severe phytotoxic leaf scorching.",
    },

    organicSolutions: {
      botanical: "Neem Oil 10,000 ppm @ 3.0 ml/L + Baking Soda (Sodium Bicarbonate) @ 3.0 g/L in water (raises leaf surface pH to 8.2, killing fungal spores).",
      bioAgent: "Ampelomyces quisqualis (hyperparasite of powdery mildew) @ 5.0 g/L OR Bacillus subtilis @ 5.0 g/L.",
      dosage: "Apply Bacillus subtilis @ 5 g/L during late evening.",
      applicationMethod: "Fine mist spray directly targeting emergent flower panicles using mist blowers or battery sprayers.",
      indigenousMix: "Sour Buttermilk (Sour curd/whey) 5% solution: Mix 5 L fermented sour buttermilk in 100 L water; lactic acid bacteria eradicate mildew mycelium.",
    },

    farmingPractices: {
      canopyPruning: "Selective canopy thinning to remove dense interior foliage, allowing maximum morning sun rays to dry mist quickly from panicles.",
      waterManagement: "Strictly avoid overhead irrigation during flowering. Maintain soil moisture through root-zone drip only.",
      fieldSanitation: "Prune and dispose of infected autumn vegetative flushes which serve as overwintering reservoirs for Oidium conidia.",
      intercropping: "Do not plant mustard, peas, or marigold nearby during December-February as they can host overlapping powdery mildew strains.",
      postHarvestCare: "Wash packing house grading tables with potassium silicate solution to eliminate resting spores.",
    },

    varietyAdvisory: {
      "alphonso": { riskLevel: "Medium", varietySpecificAction: "Spray Contaf Plus (2ml/L) at 10cm panicle stage; monitor Dharwad orchards for morning mist.", criticalStage: "Panicle emergence (Jan-Feb)" },
      "banganapalli": { riskLevel: "High", varietySpecificAction: "Extremely susceptible in Kolar! Mandatory 3-spray schedule: Sulphur → Hexaconazole → Dinocap.", criticalStage: "Full bloom & fruit set" },
      "totapuri": { riskLevel: "Medium", varietySpecificAction: "Apply Wettable Sulphur (3g/L) during 50% flowering in Srinivasapur.", criticalStage: "Flowering stage" },
      "mallika": { riskLevel: "Medium", varietySpecificAction: "Ensure canopy ventilation; spray Nativo (0.6g/L) if cloudy weather persists.", criticalStage: "Blossom opening" },
      "raspuri": { riskLevel: "Medium", varietySpecificAction: "Early flowering in Ramanagara requires prompt Sulphur dusting in December.", criticalStage: "December bloom" },
      "sindhoora": { riskLevel: "Medium", varietySpecificAction: "Spray sour buttermilk (5%) or Hexaconazole at first sign of white dust on flower clusters.", criticalStage: "Early panicle" },
      "neelum": { riskLevel: "Low", varietySpecificAction: "Late flowering escapes peak January mist; monitor late panicles in March.", criticalStage: "Late bloom" },
      "amrapali": { riskLevel: "High", varietySpecificAction: "Ultra-dense dwarf canopies trap humidity; apply 2 systemic triazole sprays.", criticalStage: "Hedgerow flowering" },
      "dasheri": { riskLevel: "Medium", varietySpecificAction: "Apply Wettable Sulphur in Belagavi before daytime temperatures hit 34°C.", criticalStage: "February flowering" },
      "malgoa": { riskLevel: "Medium", varietySpecificAction: "Thoroughly spray outer and inner flower panicles with fine-droplet mist nozzle.", criticalStage: "Full panicle bloom" },
    },
  },

  "Die Back": {
    id: "die_back",
    diseaseName: "Die Back / Twig Blight",
    scientificName: "Lasiodiplodia theobromae (Pat.) Griffon & Maubl. / Botryodiplodia",
    causalAgent: "Fungal Pathogen",
    urgency: "Immediate Action Required",
    visualSymptoms: [
      "Drying and withering of twigs and branches progressing downwards from the tip (distal to proximal).",
      "Leaves on affected branches turn brown, curl, dry up, and remain hanging on the tree for weeks without falling.",
      "Vascular browning: Longitudinal brown to black internal discoloration of xylem tissues when twig is split open.",
      "Dark gummy exudate weeping from bark cracks and branch forks; eventual death of entire tree limbs.",
    ],
    damageMechanism: "Vascular pathogen colonizes xylem vessels through harvesting cut wounds, sun-scald cracks, or borer entry holes, blocking sap flow and secreting phytotoxins.",
    karnatakaSeasonality: "Prevalent from October to February following heavy monsoon rains, especially in orchards with unsealed harvest wounds or stem borer infestation.",

    chemicalPesticides: {
      primaryChemical: "Copper Oxychloride 50% WP (Paste on cuts & 3g/L spray) + Carbendazim 50% WP (Bavistin)",
      tradeNames: ["Blitox 50 WP", "Bavistin 50 WP", "Saaf WP", "Tilt 250 EC (Propiconazole)", "Folicur 250 EC (Tebuconazole)"],
      dosage: "Prune into green wood, apply Bordeaux Paste (1:1:10) to cut ends, and spray entire canopy with Carbendazim @ 1.0 g/L + COC @ 2.5 g/L water.",
      sprayTiming: "1st application immediately after post-harvest pruning (July-August); 2nd spray in October post-monsoon.",
      rotationChemical: "Propiconazole 25% EC (Tilt) @ 1.0 ml/L OR Tebuconazole 25.9% EC (Folicur) @ 1.0 ml/L water.",
      phi: "30 days pre-harvest safety interval.",
      cautions: "Never leave flat, jagged, or unsealed cuts during pruning; always make clean 45-degree angle cuts that shed rainwater.",
    },

    organicSolutions: {
      botanical: "Neem Cake slurry with Copper Sulphate: Mix 5 kg Neem Cake + 500 g Copper Sulphate in 20 L water; paint tree trunks.",
      bioAgent: "Trichoderma harzianum @ 10.0 g/L root drench and 5.0 g/L foliar spray.",
      dosage: "Drench tree basin with 10 L of 1% Trichoderma harzianum suspension in composted manure.",
      applicationMethod: "Scrape cankered bark with a sterile knife, disinfect with hydrogen peroxide (3%), and paste with fresh cow dung + Trichoderma bio-paste.",
      indigenousMix: "Bordeaux Paste (1:1:10): Dissolve 1 kg Copper Sulphate in 5 L water; slake 1 kg Quick Lime in 5 L water; combine into a thick brushable paste.",
    },

    farmingPractices: {
      canopyPruning: "Mandatory surgical pruning: Cut affected branches 8-10 cm below the lowest visible margin of brown vascular discoloration.",
      waterManagement: "Ensure adequate drainage in red loamy and black cotton soils; waterlogging suffocates roots and predisposes trees to Lasiodiplodia vascular wilt.",
      fieldSanitation: "Immediately remove and burn pruned dead wood outside orchard perimeter; do not leave pruned branches stacked in the field as fungal incubators.",
      intercropping: "Avoid damaging surface feeder roots with heavy tractor disc harrows; root wounds allow soil-borne pathotypes to enter.",
      postHarvestCare: "Sterilize pruning saws, loppers, and secateurs between trees with spirit or 5% Dettol solution.",
    },

    varietyAdvisory: {
      "alphonso": { riskLevel: "High", varietySpecificAction: "Vulnerable to post-harvest branch dieback in Uttara Kannada/Dharwad; paste all cuts with Bordeaux paste.", criticalStage: "Immediate post-harvest" },
      "banganapalli": { riskLevel: "Medium", varietySpecificAction: "Inspect scaffold branches for longitudinal bark cracks in October in Kolar orchards.", criticalStage: "Post-monsoon (Oct-Nov)" },
      "totapuri": { riskLevel: "Medium", varietySpecificAction: "After mechanical hedging in high density orchards, spray full canopy with Propiconazole (1ml/L).", criticalStage: "Post-topping" },
      "mallika": { riskLevel: "Low", varietySpecificAction: "Robust wood; maintain annual light sanitation pruning.", criticalStage: "Sanitation" },
      "raspuri": { riskLevel: "High", varietySpecificAction: "Soft wood branches easily infected in Ramanagara. Disinfect all harvesting pole hook wounds.", criticalStage: "Post-harvest" },
      "sindhoora": { riskLevel: "Low", varietySpecificAction: "Low incidence; protect lower trunk with white lime-copper wash.", criticalStage: "Pre-monsoon" },
      "neelum": { riskLevel: "Medium", varietySpecificAction: "Clear old dead branches in August; drench root zone with Trichoderma viride.", criticalStage: "Root drenching" },
      "amrapali": { riskLevel: "Medium", varietySpecificAction: "Close spacing requires strict pruning hygiene to prevent intra-row contagion.", criticalStage: "Hedgerow care" },
      "dasheri": { riskLevel: "High", varietySpecificAction: "Zinc & iron deficiency in North Karnataka alkaline soils accelerates dieback; add micronutrients.", criticalStage: "Nutrient management" },
      "malgoa": { riskLevel: "High", varietySpecificAction: "Heritage giant limbs need professional limb surgery and trunk wound sealing.", criticalStage: "Winter tree surgery" },
    },
  },

  "Gall Midge": {
    id: "gall_midge",
    diseaseName: "Gall Midge / Leaf Gall Fly",
    scientificName: "Procontarinia matteiana (Kieffer & Cecconi) / Erosomyia mangiferae",
    causalAgent: "Dipteran Cecidomyiid",
    urgency: "Moderate Attention",
    visualSymptoms: [
      "Numerous tiny, raised, wart-like or pimple-like circular galls (blisters) on the leaf lamina.",
      "Galls initially appear yellowish-green, turning reddish-brown, and finally black with a tiny exit hole in the center.",
      "Severe infestation causes leaf twisting, curling, stunted shoot elongation, and premature leaf drop.",
      "Inflorescence galling: Buds turn into cone-shaped gall masses, causing complete blossom failure.",
    ],
    damageMechanism: "Female midge deposits eggs inside tender leaf mesophyll; hatching larvae secrete growth-altering saliva causing rapid cellular hypertrophy and gall chamber formation.",
    karnatakaSeasonality: "Emerges en masse during active vegetative flushes and panicle emergence (September-November and January-February) across southern Karnataka districts.",

    chemicalPesticides: {
      primaryChemical: "Dimethoate 30% EC (Rogor) or Thiamethoxam 25% WG (Areva / Actara)",
      tradeNames: ["Rogor 30 EC", "Actara 25 WG", "Confidor 17.8 SL (Imidacloprid)", "Profex Super (Profenofos + Cypermethrin)"],
      dosage: "Dimethoate 30% EC @ 1.7 ml/L water OR Thiamethoxam 25% WG @ 0.35 g/L water OR Imidacloprid 17.8% SL @ 0.5 ml/L water.",
      sprayTiming: "1st spray: At emergence of new tender leaf flush (copper stage); 2nd spray: 10 days later to target newly hatched neonate maggots before gall closure.",
      rotationChemical: "Lambda-Cyhalothrin 5% EC (Karate) @ 1.0 ml/L OR Chlorpyrifos 20% EC @ 2.0 ml/L soil rake.",
      phi: "21 days pre-harvest safety interval.",
      cautions: "Systemic insecticides must be sprayed early while leaves are still coppery-pink; once galls harden and turn brown, chemicals cannot penetrate.",
    },

    organicSolutions: {
      botanical: "Neem Seed Kernel Extract (NSKE 5%) or Azadirachtin 10,000 ppm @ 3.0 ml/L + Pongamia (Honge) Oil @ 3.0 ml/L.",
      bioAgent: "Beauveria bassiana (entomopathogenic fungus) @ 5.0 g/L (1×10⁸ CFU/g) OR Metarhizium anisopliae @ 5.0 g/L.",
      dosage: "Spray 5 g/L Beauveria bassiana during evening hours when atmospheric humidity exceeds 70%.",
      applicationMethod: "Foliar spray targeting tender new flushes + soil drenching in the drip line where full-grown maggots drop to pupate.",
      indigenousMix: "Agniastra (5%): Boil 1 kg crushed neem leaves + 500 g tobacco + 500 g hot green chillies + 250 g garlic in 20 L cow urine; dilute 500 ml per 10 L water.",
    },

    farmingPractices: {
      canopyPruning: "Prune and destroy heavily galled terminal twigs before the adult emergence period in September.",
      waterManagement: "Light summer and winter intercultural shallow tilling under tree canopy exposes subterranean pupae to ants, birds, and hot sun.",
      fieldSanitation: "Install Yellow and Blue Sticky Traps (20 traps/acre) placed 1.5 meters above ground level to trap adult gall midges.",
      intercropping: "Grow flowering coriander, fennel, or marigold as border strips to attract parasitoid wasps (Platygaster spp.) that naturally parasitize midge larvae.",
      postHarvestCare: "Rake soil around tree base and apply 50 kg neem cake per acre to destroy pupating populations.",
    },

    varietyAdvisory: {
      "alphonso": { riskLevel: "Medium", varietySpecificAction: "Monitor October new flushes in Dharwad; apply NSKE 5% at coppery-red leaf stage.", criticalStage: "New vegetative flush" },
      "banganapalli": { riskLevel: "Medium", varietySpecificAction: "Spray Imidacloprid (0.5ml/L) when August flush emerges in Kolar/Chikkaballapur.", criticalStage: "August flush" },
      "totapuri": { riskLevel: "Medium", varietySpecificAction: "Inspect tender canopy flushes; install yellow sticky traps in Srinivasapur orchards.", criticalStage: "Flush emergence" },
      "mallika": { riskLevel: "Low", varietySpecificAction: "Low susceptibility; parasitic wasps maintain natural biological equilibrium.", criticalStage: "General" },
      "raspuri": { riskLevel: "Medium", varietySpecificAction: "Apply Beauveria bassiana (5g/L) during humid September evenings in Ramanagara.", criticalStage: "September flush" },
      "sindhoora": { riskLevel: "High", varietySpecificAction: "High vulnerability during early flush! Apply Thiamethoxam @ 0.35g/L in Mandya.", criticalStage: "October-November flush" },
      "neelum": { riskLevel: "Low", varietySpecificAction: "Hardy leathery mature leaves resist midges; protect only tender autumn flushes.", criticalStage: "Autumn flush" },
      "amrapali": { riskLevel: "Low", varietySpecificAction: "Regular hedging removes egg-bearing shoot tips before infestation establishes.", criticalStage: "Post-prune flush" },
      "dasheri": { riskLevel: "Medium", varietySpecificAction: "Rake and solarize soil basins in North Karnataka to kill pupating larvae in soil.", criticalStage: "Soil basin maintenance" },
      "malgoa": { riskLevel: "High", varietySpecificAction: "Broad fleshy leaves attract heavy gall fly egg-laying; spray Neem oil + Agniastra early.", criticalStage: "Flush expansion" },
    },
  },

  "Cutting Weevil": {
    id: "cutting_weevil",
    diseaseName: "Cutting Weevil / Leaf Cutter Weevil",
    scientificName: "Deporaus marginatus (Pascoe) / Curculionidae",
    causalAgent: "Insect Pest / Curculionid",
    urgency: "Moderate Attention",
    visualSymptoms: [
      "Clean, straight, transverse scissor-like cuts across the leaf blade, severing the distal half of tender leaves.",
      "Severed leaf portions littering the ground beneath the canopy like freshly cut confetti.",
      "Remaining leaf stumps with tiny puncture egg-laying slits along the primary midrib.",
      "Total defoliation and bare broomed shoots on newly planted graft saplings and young canopy flushes.",
    ],
    damageMechanism: "Female weevil deposits eggs into leaf midrib tissue, then deliberately cuts through the blade with her snout so the leaf falls to the damp soil, providing optimal humidity for larval development.",
    karnatakaSeasonality: "Peaks during South-West monsoon months (July-October) corresponding with the emergence of tender new vegetative flushes in Karnataka.",

    chemicalPesticides: {
      primaryChemical: "Profenofos 50% EC or Cypermethrin 10% EC or Quinalphos 25% EC",
      tradeNames: ["Carina 50 EC (Profenofos)", "Ekalux 25 EC (Quinalphos)", "Ripcord 10 EC (Cypermethrin)", "Hostathion 40 EC (Triazophos)"],
      dosage: "Profenofos 50% EC @ 2.0 ml/L water OR Quinalphos 25% EC @ 2.0 ml/L water OR Cypermethrin 10% EC @ 1.0 ml/L water.",
      sprayTiming: "Spray at the very first sign of severed leaf tips on new vegetative flushes; repeat after 10-12 days if flush emergence is prolonged.",
      rotationChemical: "Chlorantraniliprole 18.5% SC (Coragen) @ 0.3 ml/L water OR Spinosad 45% SC @ 0.35 ml/L water.",
      phi: "14 days pre-harvest safety interval.",
      cautions: "Target the spray specifically at tender terminal shoots and the soil area directly under the canopy drip line where adults hide.",
    },

    organicSolutions: {
      botanical: "Neem Seed Kernel Extract (NSKE 5%) or Neem Oil 10,000 ppm @ 4.0 ml/L (acts as a potent oviposition deterrent and gustatory feeding repellant).",
      bioAgent: "Beauveria bassiana 1.15% WP @ 6.0 g/L (infects adult weevils upon contact, causing white muscardine disease).",
      dosage: "Foliar spray 6 g/L Beauveria bassiana + 1 g/L jaggery (acts as feeding attractant and spore activator).",
      applicationMethod: "Evening spray covering both canopy shoots and the orchard floor debris.",
      indigenousMix: "Dashaparni Kashaya (10-leaf herbal repellent) @ 30 ml/L water: Potent natural insect repellent brewed with 10 native bitter plants.",
    },

    farmingPractices: {
      canopyPruning: "Synchronize flush emergence across the orchard by uniform post-harvest pruning, shortening the window of vulnerability.",
      waterManagement: "Rake and clear severed leaves from the ground daily and burn them to destroy the developing eggs and grubs inside.",
      fieldSanitation: "Deep basin tilling in summer and post-monsoon exposes overwintering adult weevils buried in the top 5 cm soil.",
      intercropping: "Shake young sapling branches early morning over an inverted umbrella to collect and manually destroy dislodged sluggish adult weevils.",
      postHarvestCare: "Drench tree base soil with 2% neem cake extract to prevent pupal emergence.",
    },

    varietyAdvisory: {
      "alphonso": { riskLevel: "Medium", varietySpecificAction: "Protect young graft plantations in Dharwad/Belagavi with NSKE 5% sprays in August.", criticalStage: "New sapling flushes" },
      "banganapalli": { riskLevel: "Medium", varietySpecificAction: "Spray Profenofos (2ml/L) when July-August vegetative flush starts expanding in Kolar.", criticalStage: "Monsoon flush" },
      "totapuri": { riskLevel: "High", varietySpecificAction: "High incidence in Srinivasapur! Collect and destroy ground-dropped leaf cuttings daily.", criticalStage: "August-September" },
      "mallika": { riskLevel: "Low", varietySpecificAction: "Low damage; regular bio-agent sprays keep weevil numbers under economic threshold.", criticalStage: "General" },
      "raspuri": { riskLevel: "Medium", varietySpecificAction: "Apply Dashaparni Kashaya (3%) on tender flushes in Ramanagara orchards.", criticalStage: "Tender flush" },
      "sindhoora": { riskLevel: "Medium", varietySpecificAction: "Spray Coragen (0.3ml/L) on autumn flush in Mandya to safeguard canopy volume.", criticalStage: "Autumn flush" },
      "neelum": { riskLevel: "Low", varietySpecificAction: "Late flush escapes major weevil peak; shallow till tree basins in October.", criticalStage: "October tilling" },
      "amrapali": { riskLevel: "Low", varietySpecificAction: "Dwarf tree height allows easy hand-collection of adult weevils during morning hours.", criticalStage: "Manual scouting" },
      "dasheri": { riskLevel: "High", varietySpecificAction: "Heavy attack in North Karnataka black soils! Apply Quinalphos (2ml/L) on new shoots.", criticalStage: "August-September flush" },
      "malgoa": { riskLevel: "Low", varietySpecificAction: "Mature trees easily outgrow foliage loss; focus protection on young nursery grafts.", criticalStage: "Nursery stage" },
    },
  },

  "Sooty Mould": {
    id: "sooty_mould",
    diseaseName: "Sooty Mould",
    scientificName: "Meliola mangiferae (Earle) / Capnodium mangiferae",
    causalAgent: "Epiphytic Fungus / Sucking Insect Symbiosis",
    urgency: "Moderate Attention",
    visualSymptoms: [
      "Thick, velvety, black, charcoal-like superficial fungal mat covering upper leaf surfaces, twigs, and fruits.",
      "The black crust can be peeled off like a thin dry skin, revealing intact green leaf tissue underneath.",
      "Leaves turn pale, yellow, and drop prematurely due to complete blockage of sunlight (zero photosynthesis).",
      "Presence of sticky, shiny, sweet honeydew droplets on leaves accompanied by active ant trails.",
    ],
    damageMechanism: "Non-parasitic saprophytic fungus that does NOT penetrate leaf tissue directly; grows exclusively on sugary honeydew excreted by mango hoppers, mealybugs, and scale insects, choking photosynthetic stomata.",
    karnatakaSeasonality: "Severe during January to May following peak mango hopper (Amritodus atkinsoni) and scale insect infestations in humid orchards.",

    chemicalPesticides: {
      primaryChemical: "Imidacloprid 17.8% SL (Confidor) + Starch / Maida Wash",
      tradeNames: ["Confidor 17.8 SL", "Actara 25 WG (Thiamethoxam)", "Tata Mida (Imidacloprid)", "Starch / Maida powder"],
      dosage: "Step 1: Spray Imidacloprid 17.8% SL @ 0.5 ml/L water to eliminate sucking insect vectors. Step 2: 48 hours later, spray Starch / Maida @ 20.0 g/L (2%).",
      sprayTiming: "Apply starch spray during bright sunny mornings (8:00 AM - 11:00 AM); as starch dries under hot sun, it flakes off, carrying the entire black fungal crust with it.",
      rotationChemical: "Clothianidin 50% WDG @ 0.25 g/L OR Acetamiprid 20% SP @ 0.5 g/L + Wettable Sulphur @ 2.0 g/L.",
      phi: "14 days pre-harvest safety interval.",
      cautions: "Never treat Sooty Mould with fungicides alone! Unless the underlying sucking insect pests (hoppers/scales) are killed, the mould will return in days.",
    },

    organicSolutions: {
      botanical: "Neem Oil 10,000 ppm @ 4.0 ml/L + Fish Oil Rosin Soap (FORS) @ 25.0 g/L (suffocates scales, mealybugs, and dissolves honeydew).",
      bioAgent: "Metarhizium anisopliae (green muscardine) @ 5.0 g/L OR Lecanicillium lecanii (Verticillium lecanii) @ 5.0 g/L.",
      dosage: "Spray Lecanicillium lecanii @ 5 g/L + 1 ml liquid soap directly targeting hopper nymphs on panicles and underside of leaves.",
      applicationMethod: "High-pressure power sprayer directed from underneath the canopy upwards into leaf undersides.",
      indigenousMix: "Boiled Maida / Starch Paste (2%): Boil 2 kg flour/starch in 10 L water to make a thin paste; dilute in 90 L water and spray hot/warm.",
    },

    farmingPractices: {
      canopyPruning: "Drastic canopy aeration pruning to eliminate dark, stagnant, high-humidity microclimates where mango hoppers breed.",
      waterManagement: "Avoid excessive nitrogen fertigation; lush soft succulent growth attracts massive hopper populations.",
      fieldSanitation: "Band tree trunks with 30 cm wide slippery plastic grease bands (Grease + Castor Oil) to stop ants from protecting honeydew-secreting scales.",
      intercropping: "Conserve natural predator ladybird beetles (Cryptolaemus montrouzieri) and green lacewings (Chrysoperla carnea).",
      postHarvestCare: "Wipe harvested fruits with warm water and 0.5% neutral soap to restore glowing skin marketability.",
    },

    varietyAdvisory: {
      "alphonso": { riskLevel: "Medium", varietySpecificAction: "Control mango hoppers in Dharwad during January flowering with Imidacloprid (0.5ml/L).", criticalStage: "Pre-flowering" },
      "banganapalli": { riskLevel: "Medium", varietySpecificAction: "Apply Starch 2% spray on black crusted trees in Kolar to peel off mould flakes.", criticalStage: "Fruit sizing" },
      "totapuri": { riskLevel: "Medium", varietySpecificAction: "Monitor scale insects on interior branches; apply Fish Oil Rosin Soap (25g/L).", criticalStage: "Post-harvest" },
      "mallika": { riskLevel: "High", varietySpecificAction: "Dense sweet canopy attracts heavy hopper swarms in Ramanagara! Apply Lecanicillium lecanii.", criticalStage: "Flowering & fruiting" },
      "raspuri": { riskLevel: "Medium", varietySpecificAction: "Clean fruit clusters with water spray before APMC market delivery in Channapatna.", criticalStage: "Pre-harvest" },
      "sindhoora": { riskLevel: "Low", varietySpecificAction: "Low incidence; prune shaded water sprouts from center of tree.", criticalStage: "Canopy pruning" },
      "neelum": { riskLevel: "High", varietySpecificAction: "Late season rain + honeydew = severe sooty crust. Apply Imidacloprid + 2% Starch in May.", criticalStage: "May pre-harvest" },
      "amrapali": { riskLevel: "Medium", varietySpecificAction: "HDP spacing demands continuous hopper scouting along hedgerow edges.", criticalStage: "Hedgerow scouting" },
      "dasheri": { riskLevel: "Low", varietySpecificAction: "Dry climate restricts mould development; manage any localized scale pockets.", criticalStage: "General" },
      "malgoa": { riskLevel: "Medium", varietySpecificAction: "Install grease barrier bands on giant trunks to prevent ant-scale symbiosis.", criticalStage: "Trunk banding" },
    },
  },

  "Healthy": {
    id: "healthy",
    diseaseName: "Healthy / Vigorous Tissue",
    scientificName: "Optimal Mangifera indica L. Physiology",
    causalAgent: "None (Optimal Physiology)",
    urgency: "No Treatment Needed",
    visualSymptoms: [
      "Uniform, deep lustrous green leaf lamina with intact chloroplast cellular structure.",
      "Clean, unblemished leaf margins with zero necrotic lesions, water-soaking, or powdery coatings.",
      "Normal turgid leaf posture, prominent healthy venation, and balanced cuticle development.",
      "High photosynthetic efficiency rating (>94% chlorophyll index).",
    ],
    damageMechanism: "No cellular degradation. Vigorous photosynthetic assimilation and robust active plant systemic acquired resistance (SAR).",
    karnatakaSeasonality: "Maintainable year-round with balanced Karnataka precision agronomy protocols and regular prophylactic bio-monitoring.",

    chemicalPesticides: {
      primaryChemical: "No Chemical Fungicides or Insecticides Required",
      tradeNames: ["Maintain Prophylactic Regimen"],
      dosage: "N/A — Do not apply synthetic chemicals on healthy tissue to protect beneficial predatory insects, pollinators, and natural phyllosphere microflora.",
      sprayTiming: "Continue weekly visual scouting of 10 trees per orchard block.",
      rotationChemical: "Prophylactic Potassium Silicate (Foliar Silica) @ 1.5 g/L to strengthen epidermal cell walls against future fungal penetration.",
      phi: "0 days (Zero residue).",
      cautions: "Over-spraying healthy trees with copper or systemic fungicides can induce chemical toxicity, scorch beneficial mycorrhizae, and create resistant pathogen strains.",
    },

    organicSolutions: {
      botanical: "Prophylactic Neem Oil 3,000 ppm @ 2.0 ml/L monthly spray to maintain insect repellent scent barrier.",
      bioAgent: "Consortium of Pseudomonas fluorescens + Bacillus subtilis + Trichoderma viride @ 3.0 g/L.",
      dosage: "Apply monthly prophylactic bio-agent drench into root-zone drip line.",
      applicationMethod: "Foliar mist in late afternoon + incorporation of 20 kg Vermicompost per tree.",
      indigenousMix: "Jeevamrutha (10% solution): Drench 200 L Jeevamrutha per acre every 21 days to activate soil microbial biodiversity.",
    },

    farmingPractices: {
      canopyPruning: "Maintain ideal 80% light interception canopy architecture; remove dead twigs and water suckers promptly.",
      waterManagement: "Precision drip fertigation matching daily crop evapotranspiration (ETc); maintain soil moisture at 70-80% field capacity.",
      fieldSanitation: "Keep orchard floor weed-free within 1.5m basin perimeter; mulch with dried leaf litter or organic paddy straw.",
      intercropping: "Grow leguminous cover crops (Cowpea, Horsegram, Sunhemp) in alleyways to fix 40-60 kg atmospheric nitrogen per hectare.",
      postHarvestCare: "Post-harvest micronutrient booster: Spray Zinc Sulphate (0.5%) + Boric Acid (0.2%) + Urea (1.0%) to replenish depleted canopy reserves.",
    },

    varietyAdvisory: {
      "alphonso": { riskLevel: "Low", varietySpecificAction: "Excellent health! Maintain post-monsoon center-opening pruning in Dharwad.", criticalStage: "Maintenance" },
      "banganapalli": { riskLevel: "Low", varietySpecificAction: "Continue drip fertigation schedule with 13-0-45 potassium booster at fruit set in Kolar.", criticalStage: "Fruit sizing" },
      "totapuri": { riskLevel: "Low", varietySpecificAction: "Orchard in peak health! Ensure clean border windbreaks in Srinivasapur.", criticalStage: "Maintenance" },
      "mallika": { riskLevel: "Low", varietySpecificAction: "Maintain high organic carbon in soil through vermicompost and Jeevamrutha.", criticalStage: "Soil health" },
      "raspuri": { riskLevel: "Low", varietySpecificAction: "Prime condition for early March harvest in Ramanagara; protect from fruit flies.", criticalStage: "Harvest prep" },
      "sindhoora": { riskLevel: "Low", varietySpecificAction: "Maintain foliar micronutrient balance to maximize scarlet blush formation.", criticalStage: "Color break" },
      "neelum": { riskLevel: "Low", varietySpecificAction: "Continue regular soil mulching in Tumakuru/Kolar orchards.", criticalStage: "Maintenance" },
      "amrapali": { riskLevel: "Low", varietySpecificAction: "High-density hedgerow in top shape; maintain annual mechanical height topping.", criticalStage: "Hedging" },
      "dasheri": { riskLevel: "Low", varietySpecificAction: "Excellent condition in Belagavi; monitor for any seasonal weather shifts.", criticalStage: "Monitoring" },
      "malgoa": { riskLevel: "Low", varietySpecificAction: "Heirloom tree in robust health; maintain organic root-zone drenching.", criticalStage: "Organic nutrition" },
    },
  },
};

// ============================================================================
// MULTI-LINGUAL FARMER-FRIENDLY TRANSLATIONS (KANNADA & HINDI)
// ============================================================================

export interface LocalizedAdvisory {
  diseaseName: string;
  scientificName: string;
  causalAgent: string;
  urgency: string;
  chemicalPesticides: {
    primaryChemical: string;
    tradeNames: string[];
    dosage: string;
    sprayTiming: string;
    rotationChemical: string;
    phi: string;
    cautions: string;
  };
  organicSolutions: {
    botanical: string;
    bioAgent: string;
    dosage: string;
    applicationMethod: string;
    indigenousMix: string;
  };
  farmingPractices: {
    canopyPruning: string;
    waterManagement: string;
    fieldSanitation: string;
    intercropping: string;
    postHarvestCare: string;
  };
  varietyAdvisory: Record<string, { riskLevel: string; varietySpecificAction: string; criticalStage: string }>;
}

export function getLocalizedAdvisory(protocol: DiseaseSolutionProtocol, lang: string): LocalizedAdvisory {
  if (lang === "kn") {
    const knMap: Record<string, LocalizedAdvisory> = {
      "anthracnose": {
        diseaseName: "ಚಿಬ್ಬು ರೋಗ / ಕಪ್ಪು ಕಲೆ ರೋಗ (Anthracnose)",
        scientificName: "ಶಿಲೀಂಧ್ರ ರೋಗಾಣು: Colletotrichum gloeosporioides",
        causalAgent: "ಶಿಲೀಂಧ್ರ ರೋಗಾಣು",
        urgency: "ತಕ್ಷಣ ಸಿಂಪಡಣೆ ಅಗತ್ಯ (Immediate Action)",
        chemicalPesticides: {
          primaryChemical: "ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ 50% WP ಅಥವಾ ಕಾರ್ಬೆಂಡಾಜಿಮ್ + ಮ್ಯಾಂಕೋಜೆಬ್",
          tradeNames: ["ಬ್ಲೈಟಾಕ್ಸ್ 50 (Blitox 50)", "ಸಾಫ್ (Saaf)", "ಫೈಟೋಲಾನ್ (Fytolan)", "ಬ್ಲೂ ಕಾಪರ್ (Blue Copper)"],
          dosage: "3 ಗ್ರಾಂ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ (100 ಲೀಟರ್ ನೀರಿಗೆ 300 ಗ್ರಾಂ) ಅಥವಾ ಸಾಫ್ 2 ಗ್ರಾಂ/ಲೀಟರ್",
          sprayTiming: "ಹೂವು ಬಿಡುವ ಮೊದಲು ಮತ್ತು ಮಳೆಯ ನಂತರ ಬೆಳಿಗ್ಗೆ ಅಥವಾ ಸಂಜೆ ವೇಳೆ ಪೂರ್ಣವಾಗಿ ಸಿಂಪಡಿಸಿ.",
          rotationChemical: "ಹೆಕ್ಸಾಕೊನಾಜೋಲ್ (ಕಾಂಟಾಫ್ ಪ್ಲಸ್ 2 ಮಿ.ಲೀ/ಲೀ) ಅಥವಾ ಅಜಾಕ್ಸಿಸ್ಟ್ರೋಬಿನ್ (ಅಮಿಸ್ಟಾರ್ 1 ಮಿ.ಲೀ/ಲೀ)",
          phi: "ಕಟಾವಿಗೆ 15 ದಿನಗಳ ಮೊದಲು ಸಿಂಪಡಣೆ ನಿಲ್ಲಿಸಿ",
          cautions: "ಹೂ ಬಿಡುವ ಸಮಯದಲ್ಲಿ ತೀವ್ರ ಬಿಸಿಲಿನಲ್ಲಿ ಸಿಂಪಡಿಸಬೇಡಿ. ಕೀಟನಾಶಕಗಳ ಜೊತೆ ಕ್ಷಾರೀಯ ದ್ರಾವಣ ಬೆರೆಸಬೇಡಿ.",
        },
        organicSolutions: {
          botanical: "ಬೇವಿನ ಎಣ್ಣೆ 10,000 ppm (3 ಮಿ.ಲೀ/ಲೀಟರ್) + 1 ಮಿ.ಲೀ ಸಾಬೂನಿನ ದ್ರಾವಣ",
          bioAgent: "ಟ್ರೈಕೋಡರ್ಮ ಹಾರ್ಜಿಯಾನಂ / ವಿರಿಡೆ (5 ಗ್ರಾಂ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ)",
          dosage: "ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 5 ಗ್ರಾಂ ಜೈವಿಕ ಪುಡಿ",
          applicationMethod: "ಎಲೆಗಳ ಮೇಲ್ಭಾಗ ಮತ್ತು ಕೆಳಭಾಗ ಪೂರ್ತಿಯಾಗಿ ನೆನೆಯುವಂತೆ ಸಂಜೆ ವೇಳೆ ಸಿಂಪಡಿಸಿ.",
          indigenousMix: "1% ಬೋರ್ಡೋ ದ್ರಾವಣ (1 ಕೆಜಿ ಮೈಲುತುತ್ತು + 1 ಕೆಜಿ ಸುಣ್ಣ + 100 ಲೀಟರ್ ನೀರು) ಅಥವಾ ಹುಳಿ ಮಜ್ಜಿಗೆ ಸಿಂಪಡಣೆ.",
        },
        farmingPractices: {
          canopyPruning: "ಕಟಾವಿನ ನಂತರ ಜುಲೈ-ಆಗಸ್ಟ್‌ನಲ್ಲಿ ಒಣಗಿದ ಮತ್ತು ಕ್ರಾಸ್ ರೆಂಬೆಗಳನ್ನು ಕತ್ತರಿಸಿ ಸೂರ್ಯನ ಬೆಳಕು ಬೀಳುವಂತೆ ಮಾಡಿ.",
          waterManagement: "ಹೂ ಬಿಡುವ 2 ತಿಂಗಳ ಮೊದಲು ನೀರನ್ನು ನಿಲ್ಲಿಸಿ, ನಂತರ ಕಾಯಿ ಕಟ್ಟಿದ ಮೇಲೆ ಹನಿ ನೀರಾವರಿ ನೀಡಿ.",
          fieldSanitation: "ಉದುರಿದ ಎಲೆ ಮತ್ತು ಕೊಳೆತ ಕಾಯಿಗಳನ್ನು ಆರಿಸಿ ತೋಟದಿಂದ ಹೊರಗೆ ಗುಂಡಿ ತೋಡಿ ಸುಟ್ಟುಹಾಕಿ.",
          intercropping: "ತೋಟದಲ್ಲಿ ಹೆಸರು ಕಾಳು ಅಥವಾ ಅಲಸಂದಿ ಬೆಳೆಯಿರಿ.",
          postHarvestCare: "ಕಟಾವಿನ ನಂತರ 1% ಬೋರ್ಡೋ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ ಗಿಡಗಳಿಗೆ ವಿಶ್ರಾಂತಿ ನೀಡಿ.",
        },
        varietyAdvisory: {
          "alphonso": { riskLevel: "High", varietySpecificAction: "ಧಾರವಾಡ/ಬೆಳಗಾವಿ ಪ್ರದೇಶದಲ್ಲಿ ಹೂ ಬಿಡುವ ಹಂತದಲ್ಲಿ 15 ದಿನಗಳಿಗೊಮ್ಮೆ ಸಾಫ್ ಸಿಂಪಡಿಸಿ.", criticalStage: "ಹೂಗೊಂಚಲು ಹಂತ" },
          "banganapalli": { riskLevel: "High", varietySpecificAction: "ಕೋಲಾರ ಪಟ್ಟಿಯಲ್ಲಿ ಮೋಡ ಕವಿದ ವಾತಾವರಣವಿದ್ದರೆ ಬ್ಲೈಟಾಕ್ಸ್ 3 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.", criticalStage: "ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ" },
          "totapuri": { riskLevel: "Medium", varietySpecificAction: "ಶ್ರೀನಿವಾಸಪುರದಲ್ಲಿ ಕಾಯಿ ಬಟಾಣಿ ಕಾಳಿನ ಗಾತ್ರದಲ್ಲಿದ್ದಾಗ ಮುಂಜಾಗ್ರತಾ ಸಿಂಪಡಣೆ ಮಾಡಿ.", criticalStage: "ಚಿಕ್ಕ ಕಾಯಿ ಹಂತ" },
          "mallika": { riskLevel: "Medium", varietySpecificAction: "ರಾಮನಗರದಲ್ಲಿ ರೆಂಬೆ ಒಣಗದಂತೆ ಬೋರ್ಡೋ ಪೇಸ್ಟ್ ಲೇಪನ ಮಾಡಿ.", criticalStage: "ರೆಂಬೆ ಕತ್ತರಿಸಿದ ನಂತರ" },
          "raspuri": { riskLevel: "High", varietySpecificAction: "ಫೆಬ್ರವರಿ ತಿಂಗಳಲ್ಲಿ ಹೂವು ಕಪ್ಪಾಗದಂತೆ ಮುಂಜಾಗ್ರತಾ ಸಿಂಪಡಣೆ ಅತ್ಯಗತ್ಯ.", criticalStage: "ಹೂ ಅರಳುವ ಸಮಯ" },
          "sindhoora": { riskLevel: "Low", varietySpecificAction: "ರೋಗ ನಿರೋಧಕ ಶಕ್ತಿ ಉತ್ತಮವಾಗಿದೆ, ಸಾಮಾನ್ಯ ಮುಂಜಾಗ್ರತೆ ಸಾಕು.", criticalStage: "ನಿರ್ವಹಣೆ" },
          "neelum": { riskLevel: "Medium", varietySpecificAction: "ತಡವಾದ ಮಳೆಯ ನಂತರ ತಕ್ಷಣ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸಿ.", criticalStage: "ಮಳೆಗಾಲದ ನಂತರ" },
          "amrapali": { riskLevel: "High", varietySpecificAction: "ಸಾಂದ್ರ ಬೇಸಾಯದಲ್ಲಿ ಗಾಳಿಯಾಡಲು ಒಳ ರೆಂಬೆಗಳನ್ನು ಕತ್ತರಿಸಿ.", criticalStage: "ರೆಂಬೆ ಕತ್ತರಿಸುವಿಕೆ" },
          "dasheri": { riskLevel: "High", varietySpecificAction: "ಮಳೆಯ ನಂತರ ಎಲೆಗಳ ಮೇಲೆ ಕಪ್ಪು ಚುಕ್ಕೆ ಕಂಡರೆ ತಕ್ಷಣ ಕಾಂಟಾಫ್ ಸಿಂಪಡಿಸಿ.", criticalStage: "ಹೊಸ ಚಿಗುರು ಹಂತ" },
          "malgoa": { riskLevel: "Medium", varietySpecificAction: "ದೊಡ್ಡ ಮರಗಳ ಒಳಭಾಗಕ್ಕೂ ಔಷಧಿ ತಲುಪುವಂತೆ ಹೈ-ಪ್ರೆಶರ್ ಸ್ಪ್ರೇಯರ್ ಬಳಸಿ.", criticalStage: "ಪೂರ್ಣ ಮರ ಸಿಂಪಡಣೆ" },
        },
      },
      "bacterial_canker": {
        diseaseName: "ಬ್ಯಾಕ್ಟೀರಿಯಾ ಕಪ್ಪು ಚುಕ್ಕೆ ರೋಗ (Bacterial Canker)",
        scientificName: "ಬ್ಯಾಕ್ಟೀರಿಯಾ ರೋಗಾಣು: Xanthomonas citri pv. mangiferaeindicae",
        causalAgent: "ಬ್ಯಾಕ್ಟೀರಿಯಾ ರೋಗಾಣು",
        urgency: "ತಕ್ಷಣ ಸಿಂಪಡಣೆ ಅಗತ್ಯ (Immediate Action)",
        chemicalPesticides: {
          primaryChemical: "ಸ್ಟ್ರೆಪ್ಟೊಸೈಕ್ಲಿನ್ (ಪ್ಲಾಂಟೊಮೈಸಿನ್) + ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್",
          tradeNames: ["ಪ್ಲಾಂಟೊಮೈಸಿನ್ (Plantomycin)", "ಸ್ಟ್ರೆಪ್ಟೊಸೈಕ್ಲಿನ್ (Streptocycline)", "ಬ್ಲೈಟಾಕ್ಸ್ 50 (Blitox 50)"],
          dosage: "ಸ್ಟ್ರೆಪ್ಟೊಸೈಕ್ಲಿನ್ 1 ಗ್ರಾಂ + ಬ್ಲೈಟಾಕ್ಸ್ 25 ಗ್ರಾಂ ಪ್ರತಿ 10 ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.",
          sprayTiming: "ಮಳೆಯ ನಂತರ ಗಾಳಿ ಬೀಸಿದಾಗ ರೋಗ ಹರಡದಂತೆ 10-12 ದಿನಗಳ ಅಂತರದಲ್ಲಿ 2 ಬಾರಿ ಸಿಂಪಡಿಸಿ.",
          rotationChemical: "ಕಾಸುಗಾಮೈಸಿನ್ 3% SL (ಕಾಸು-ಬಿ) 2 ಮಿ.ಲೀ/ಲೀಟರ್",
          phi: "ಕಟಾವಿಗೆ 20 ದಿನಗಳ ಮೊದಲು",
          cautions: "ಕೇವಲ ಆಂಟಿಬಯೋಟಿಕ್ ಮಾತ್ರ ಬಳಸಬೇಡಿ; ಕಾಪರ್ ಜೊತೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸುವುದು ಕಡ್ಡಾಯ.",
        },
        organicSolutions: {
          botanical: "ಬೆಳ್ಳುಳ್ಳಿ + ಹಸಿಮೆಣಸಿನಕಾಯಿ ಕಷಾಯ 5% ಅಥವಾ ಬೇವಿನ ಬೀಜದ ಕಷಾಯ (NSKE 5%)",
          bioAgent: "ಸ್ಯೂಡೋಮೊನಾಸ್ ಫ್ಲೋರೊಸೆನ್ಸ್ (Pseudomonas fluorescens) 10 ಗ್ರಾಂ/ಲೀಟರ್",
          dosage: "ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 10 ಗ್ರಾಂ ಜೈವಿಕ ದ್ರಾವಣ",
          applicationMethod: "ಗಾಯಗಳಾದ ರೆಂಬೆಗಳಿಗೆ ಬೋರ್ಡೋ ಪೇಸ್ಟ್ ಹಚ್ಚಿ ಮತ್ತು ಎಲೆಗಳಿಗೆ ಸಿಂಪಡಿಸಿ.",
          indigenousMix: "ತಾಜಾ ಸಗಣಿ ಮತ್ತು ಗಂಜಲದ ದ್ರಾವಣ (ಜೀವಾಮೃತ) ಸಿಂಪಡಣೆ.",
        },
        farmingPractices: {
          canopyPruning: "ರೋಗ ಪೀಡಿತ ರೆಂಬೆಗಳನ್ನು 5 ಸೆಂ.ಮೀ ಕೆಳಭಾಗದಿಂದ ಕತ್ತರಿಸಿ ಸುಟ್ಟುಹಾಕಿ.",
          waterManagement: "ಮೇಲಿನಿಂದ ಸ್ಪ್ರಿಂಕ್ಲರ್ ನೀರು ಹಾಯಿಸಬೇಡಿ; ಕೇವಲ ಬುಡಕ್ಕೆ ಹನಿ ನೀರು ಕೊಡಿ.",
          fieldSanitation: "ರೆಂಬೆ ಕತ್ತರಿಸುವ ಕತ್ತರಿಯನ್ನು ಡೆಟ್ಟಾಲ್ ಅಥವಾ ಬ್ಲೀಚಿಂಗ್ ಪೌಡರ್ ನೀರಿನಲ್ಲಿ ಅದ್ದಿ ಬಳಸಿ.",
          intercropping: "ತೋಟದ ಸುತ್ತ ಗಾಳಿ ತಡೆ ಗಿಡಗಳನ್ನು (ಸಿಲ್ವರ್ ಓಕ್ / ಕ್ಯಾಸುರಿನಾ) ಬೆಳೆಸಿ.",
          postHarvestCare: "ಕಟಾವಿನ ನಂತರ ಗಿಡಗಳಿಗೆ ತಾಮ್ರದ ಬೋರ್ಡೋ ಪೇಸ್ಟ್ ಲೇಪಿಸಿ.",
        },
        varietyAdvisory: {
          "alphonso": { riskLevel: "High", varietySpecificAction: "ಕರಾವಳಿ ಮತ್ತು ಬೆಳಗಾವಿಯಲ್ಲಿ ಮಳೆಗಾಲದಲ್ಲಿ ಕಡ್ಡಾಯವಾಗಿ ಪ್ಲಾಂಟೊಮೈಸಿನ್ ಸಿಂಪಡಿಸಿ.", criticalStage: "ಮಳೆಗಾಲ" },
          "totapuri": { riskLevel: "High", varietySpecificAction: "ಶ್ರೀನಿವಾಸಪುರದಲ್ಲಿ ಕಾಯಿಗಳ ಮೇಲೆ ಕಪ್ಪು ಕಲೆ ಬಾರದಂತೆ ಕಾಯಿ ಕಟ್ಟಿದ ತಕ್ಷಣ ಸಿಂಪಡಿಸಿ.", criticalStage: "ಕಾಯಿ ಹಂತ" },
          "banganapalli": { riskLevel: "Medium", varietySpecificAction: "ಕೋಲಾರದಲ್ಲಿ ಎಲೆಗಳ ಮೇಲೆ ನಕ್ಷತ್ರಾಕಾರದ ಚುಕ್ಕೆ ಕಂಡರೆ ತಕ್ಷಣ ಔಷಧಿ ಸಿಂಪಡಿಸಿ.", criticalStage: "ಚಿಗುರು ಹಂತ" },
          "mallika": { riskLevel: "Medium", varietySpecificAction: "ಗಾಳಿಯಿಂದ ಎಲೆಗಳು ಹರಿದು ಗಾಯವಾಗದಂತೆ ಗಾಳಿ ತಡೆ ನೆರಳು ಬೆಳೆಸಿ.", criticalStage: "ಗಾಳಿಯ ಸಮಯ" },
          "raspuri": { riskLevel: "High", varietySpecificAction: "ರೋಗ ಪೀಡಿತ ಎಲೆಗಳನ್ನು ತಕ್ಷಣ ಆರಿಸಿ ಸುಟ್ಟುಹಾಕಿ.", criticalStage: "ಆರಂಭಿಕ ಹಂತ" },
          "sindhoora": { riskLevel: "Medium", varietySpecificAction: "ಸಾಮಾನ್ಯ ಮುಂಜಾಗ್ರತಾ ಬೋರ್ಡೋ ಸಿಂಪಡಣೆ ಸಾಕು.", criticalStage: "ನಿರ್ವಹಣೆ" },
          "neelum": { riskLevel: "Low", varietySpecificAction: "ತಡವಾದ ಋತುವಿನಲ್ಲಿ ಬ್ಯಾಕ್ಟೀರಿಯಾ ಹರಡದಂತೆ ಕಣ್ಣಿಡಿ.", criticalStage: "ಕಟಾವು ಪೂರ್ವ" },
          "amrapali": { riskLevel: "High", varietySpecificAction: "ಗಿಡಗಳು ಹತ್ತಿರವಿರುವುದರಿಂದ ರೋಗ ವೇಗವಾಗಿ ಹರಡುತ್ತದೆ; ನಿಯಮಿತ ಸಿಂಪಡಣೆ ಮಾಡಿ.", criticalStage: "ಸಾಂದ್ರ ಬೇಸಾಯ" },
          "dasheri": { riskLevel: "High", varietySpecificAction: "ಉತ್ತರ ಕರ್ನಾಟಕದಲ್ಲಿ ಮಳೆ ಬಿದ್ದ ತಕ್ಷಣ ಔಷಧಿ ಸಿಂಪಡಿಸಿ.", criticalStage: "ಮಳೆಗಾಲ" },
          "malgoa": { riskLevel: "Medium", varietySpecificAction: "ರೆಂಬೆಗಳ ಗಾಯಗಳಿಗೆ ಬೋರ್ಡೋ ಪೇಸ್ಟ್ ಹಚ್ಚಿ.", criticalStage: "ಪ್ರೂನಿಂಗ್ ನಂತರ" },
        },
      },
      "powdery_mildew": {
        diseaseName: "ಬೂದಿ ರೋಗ (Powdery Mildew)",
        scientificName: "ಶಿಲೀಂಧ್ರ ರೋಗಾಣು: Oidium mangiferae",
        causalAgent: "ಶಿಲೀಂಧ್ರ ರೋಗಾಣು",
        urgency: "ತಕ್ಷಣ ಸಿಂಪಡಣೆ ಅಗತ್ಯ (Immediate Action)",
        chemicalPesticides: {
          primaryChemical: "ಕರಗುವ ಗಂಧಕ 80% WP ಅಥವಾ ಹೆಕ್ಸಾಕೊನಾಜೋಲ್ 5% SC",
          tradeNames: ["ಸಲ್ಫೆಕ್ಸ್ (Sulfex)", "ಕಾಂಟಾಫ್ ಪ್ಲಸ್ (Contaf Plus)", "ಬೇಲೆಟಾನ್ (Bayleton)", "ನ್ಯಾಟಿವೋ (Nativo)"],
          dosage: "ಕರಗುವ ಗಂಧಕ 3 ಗ್ರಾಂ/ಲೀಟರ್ ಅಥವಾ ಹೆಕ್ಸಾಕೊನಾಜೋಲ್ 2 ಮಿ.ಲೀ/ಲೀಟರ್",
          sprayTiming: "ಹೂವು ಅರಳುವ ಮುನ್ನ, ಪೂರ್ಣ ಹೂವಿನ ಹಂತದಲ್ಲಿ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟಿದ ನಂತರ ಸಿಂಪಡಿಸಿ.",
          rotationChemical: "ಡೈನೋಕ್ಯಾಪ್ 1 ಮಿ.ಲೀ/ಲೀ ಅಥವಾ ಅಜಾಕ್ಸಿಸ್ಟ್ರೋಬಿನ್ + ಡೈಫೆನೊಕೊನಾಜೋಲ್",
          phi: "14 ದಿನಗಳು",
          cautions: "ತಾಪಮಾನ 35°C ಗಿಂತ ಹೆಚ್ಚಿದ್ದಾಗ ಗಂಧಕ ಸಿಂಪಡಿಸಬೇಡಿ; ಹೂವು ಕರಕಲಾಗುತ್ತದೆ.",
        },
        organicSolutions: {
          botanical: "5% ಹುಳಿ ಮಜ್ಜಿಗೆ ದ್ರಾವಣ (5 ಲೀಟರ್ ಮಜ್ಜಿಗೆ 100 ಲೀಟರ್ ನೀರಿಗೆ)",
          bioAgent: "ಆಂಪೆಲೋಮೈಸಿಸ್ ಕ್ವಿಸ್ಕ್ವಾಲಿಸ್ (Ampelomyces quisqualis) 5 ಗ್ರಾಂ/ಲೀಟರ್",
          dosage: "ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 5 ಗ್ರಾಂ ಜೈವಿಕ ಪುಡಿ",
          applicationMethod: "ಬೆಳಗಿನ ಜಾವ ಇಬ್ಬನಿ ಇರುವಾಗ ಹೂಗೊಂಚಲುಗಳಿಗೆ ಪೂರ್ಣವಾಗಿ ಸಿಂಪಡಿಸಿ.",
          indigenousMix: "ಹಸುವಿನ ಗಂಜಲ 10% + ಬೇವಿನ ಎಣ್ಣೆ 2 ಮಿ.ಲೀ/ಲೀಟರ್ ಮಿಶ್ರಣ.",
        },
        farmingPractices: {
          canopyPruning: "ಮರದ ಒಳಗೆ ಗಾಳಿ ಮತ್ತು ಬಿಸಿಲು ಪ್ರವೇಶಿಸಲು ರೆಂಬೆಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ.",
          waterManagement: "ಹೂ ಬಿಡುವ ಹಂತದಲ್ಲಿ ನೀರು ಕೊಡುವುದನ್ನು ಮಿತಿಗೊಳಿಸಿ.",
          fieldSanitation: "ಬೂದಿ ರೋಗ ಪೀಡಿತ ಒಣ ಹೂಗೊಂಚಲುಗಳನ್ನು ಮುರಿದು ಸುಟ್ಟುಹಾಕಿ.",
          intercropping: "ಹೂ ಬಿಡುವ ಸಮಯದಲ್ಲಿ ತೋಟದಲ್ಲಿ ಧೂಳು ಏಳದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.",
          postHarvestCare: "ಹೂ ಉದುರಿದ ನಂತರ ಪೊಟ್ಯಾಶ್ ಮತ್ತು ಬೋರಾನ್ ಸಿಂಪಡಿಸಿ ಕಾಯಿ ಕಟ್ಟಿರುವುದನ್ನು ಗಟ್ಟಿಗೊಳಿಸಿ.",
        },
        varietyAdvisory: {
          "alphonso": { riskLevel: "High", varietySpecificAction: "ಜನವರಿ-ಫೆಬ್ರವರಿಯಲ್ಲಿ ಹೂ ಬಿಟ್ಟ ತಕ್ಷಣ ಸಲ್ಫೆಕ್ಸ್ ಸಿಂಪಡಿಸುವುದು ಕಡ್ಡಾಯ.", criticalStage: "ಹೂ ಅರಳುವ ಸಮಯ" },
          "mallika": { riskLevel: "High", varietySpecificAction: "ಹೂಗೊಂಚಲು ಉದ್ದವಾಗಿರುವುದರಿಂದ ಬೂದಿ ರೋಗ ಬೇಗ ಆವರಿಸುತ್ತದೆ; 2 ಬಾರಿ ಕಾಂಟಾಫ್ ಸಿಂಪಡಿಸಿ.", criticalStage: "ಪೂರ್ಣ ಹೂ ಹಂತ" },
          "totapuri": { riskLevel: "Low", varietySpecificAction: "ಬೂದಿ ರೋಗಕ್ಕೆ ಉತ್ತಮ ನಿರೋಧಕತೆ ಹೊಂದಿದೆ; ಅಗತ್ಯವಿದ್ದರೆ ಮಾತ್ರ ಗಂಧಕ ಸಿಂಪಡಿಸಿ.", criticalStage: "ಕಾಯಿ ಹಂತ" },
          "banganapalli": { riskLevel: "High", varietySpecificAction: "ಕೋಲಾರ/ಚಿಕ್ಕಬಳ್ಳಾಪುರದಲ್ಲಿ ಹೂ ಉದುರದಂತೆ ತಕ್ಷಣ ಹೆಕ್ಸಾಕೊನಾಜೋಲ್ ಸಿಂಪಡಿಸಿ.", criticalStage: "ಹೂ ಬಿಡುವ ಹಂತ" },
          "raspuri": { riskLevel: "High", varietySpecificAction: "ರಾಮನಗರದಲ್ಲಿ ಮುಂಜಾನೆಯ ಮಂಜು ಹೆಚ್ಚಿದ್ದರೆ ತಕ್ಷಣ ಮಜ್ಜಿಗೆ ಅಥವಾ ಗಂಧಕ ಸಿಂಪಡಿಸಿ.", criticalStage: "ಮಂಜಿನ ಸಮಯ" },
          "sindhoora": { riskLevel: "Medium", varietySpecificAction: "ಹೂಗೊಂಚಲುಗಳಿಗೆ ಮುಂಜಾಗ್ರತಾ ಗಂಧಕ ಸಿಂಪಡಣೆ ಮಾಡಿ.", criticalStage: "ಹೂ ಹಂತ" },
          "neelum": { riskLevel: "High", varietySpecificAction: "ತಡವಾಗಿ ಹೂ ಬಿಡುವಾಗ ಉಷ್ಣಾಂಶ ಹೆಚ್ಚಿದ್ದರೆ ಕಾಂಟಾಫ್ ಪ್ಲಸ್ ಬಳಸಿ.", criticalStage: "ತಡ ಹೂ ಹಂತ" },
          "amrapali": { riskLevel: "High", varietySpecificAction: "ದಟ್ಟ ಮರಗಳಲ್ಲಿ ಬೂದಿ ರೋಗ ನಿಯಂತ್ರಣಕ್ಕೆ ಹೈ-ಪ್ರೆಶರ್ ಸ್ಪ್ರೇ ಮಾಡಿ.", criticalStage: "ಹೂ ಹಂತ" },
          "dasheri": { riskLevel: "High", varietySpecificAction: "ಬೆಳಗಾವಿಯಲ್ಲಿ ಶೀತ ಗಾಳಿ ಬೀಸಿದಾಗ ತಕ್ಷಣ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸಿ.", criticalStage: "ಹೂಗೊಂಚಲು" },
          "malgoa": { riskLevel: "Medium", varietySpecificAction: "ಹೂವು ಕಪ್ಪಾಗಿ ಉದುರದಂತೆ ಸಾವಯವ ಮಜ್ಜಿಗೆ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ.", criticalStage: "ಹೂ ಹಂತ" },
        },
      },
      "die_back": {
        diseaseName: "ತುದಿಯಿಂದ ಒಣಗುವ ರೋಗ / ಡೈ ಬ್ಯಾಕ್ (Die Back)",
        scientificName: "ಶಿಲೀಂಧ್ರ ರೋಗಾಣು: Lasiodiplodia theobromae",
        causalAgent: "ಶಿಲೀಂಧ್ರ ರೋಗಾಣು",
        urgency: "ತಕ್ಷಣ ಸಿಂಪಡಣೆ ಮತ್ತು ರೆಂಬೆ ಕತ್ತರಿಸುವುದು ಅಗತ್ಯ",
        chemicalPesticides: {
          primaryChemical: "ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ 50% WP + ಬೋರ್ಡೋ ಪೇಸ್ಟ್",
          tradeNames: ["ಬ್ಲೈಟಾಕ್ಸ್ 50 (Blitox 50)", "ಸಾಫ್ (Saaf)", "ಕಾರ್ಬೆಂಡಾಜಿಮ್ 50% WP (ಬಾವಿಸ್ಟಿನ್)"],
          dosage: "ಒಣಗಿದ ರೆಂಬೆ ಕತ್ತರಿಸಿ ಬೋರ್ಡೋ ಪೇಸ್ಟ್ (1:1:10) ಹಚ್ಚಿ, ನಂತರ 3 ಗ್ರಾಂ/ಲೀ ಬ್ಲೈಟಾಕ್ಸ್ ಸಿಂಪಡಿಸಿ.",
          sprayTiming: "ರೆಂಬೆ ಕತ್ತರಿಸಿದ ತಕ್ಷಣ ಮತ್ತು ಮಳೆಗಾಲದ ಆರಂಭದಲ್ಲಿ ಸಿಂಪಡಿಸಿ.",
          rotationChemical: "ಥಿಯೋಫನೇಟ್ ಮಿಥೈಲ್ 70% WP (ರೋಕೋ) 1.5 ಗ್ರಾಂ/ಲೀಟರ್",
          phi: "30 ದಿನಗಳು",
          cautions: "ರೆಂಬೆ ಕತ್ತರಿಸಿದ ಜಾಗಕ್ಕೆ ಪೇಸ್ಟ್ ಹಚ್ಚದಿದ್ದರೆ ರೋಗ ಇಡೀ ಮರಕ್ಕೆ ಹರಡುತ್ತದೆ.",
        },
        organicSolutions: {
          botanical: "ಬೇವಿನ ಕಷಾಯ 5% + ಎಕ್ಕೆ ಗಿಡದ ರಸ ಮಿಶ್ರಣ",
          bioAgent: "ಟ್ರೈಕೋಡರ್ಮ ವಿರಿಡೆ + ಸುಡೋಮೊನಾಸ್ ಮಿಶ್ರಣ (ಬುಡಕ್ಕೆ ಸುರಿಯಿರಿ)",
          dosage: "ಪ್ರತಿ ಮರಕ್ಕೆ 50 ಗ್ರಾಂ ಟ್ರೈಕೋಡರ್ಮವನ್ನು 5 ಕೆಜಿ ತಿಪ್ಪೆಗೊಬ್ಬರದಲ್ಲಿ ಬೆರೆಸಿ ಹಾಕಿ.",
          applicationMethod: "ರೆಂಬೆ ಕತ್ತರಿಸಿದ ಗಾಯಕ್ಕೆ ಹಸುವಿನ ಸಗಣಿ ಮತ್ತು ಅರಿಶಿನದ ಪೇಸ್ಟ್ ಲೇಪಿಸಿ.",
          indigenousMix: "ಬೋರ್ಡೋ ಪೇಸ್ಟ್ (1 ಕೆಜಿ ಮೈಲುತುತ್ತು + 1 ಕೆಜಿ ಸುಣ್ಣ + 10 ಲೀಟರ್ ನೀರು).",
        },
        farmingPractices: {
          canopyPruning: "ಒಣಗಿದ ರೆಂಬೆಯನ್ನು ಹಸಿರು ಭಾಗದಿಂದ 5-7 ಸೆಂ.ಮೀ ಕೆಳಕ್ಕೆ ಇಳಿಜಾರಾಗಿ ಕತ್ತರಿಸಿ.",
          waterManagement: "ಬುಡದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಬಸಿಗಾಲುವೆ ಮಾಡಿ; ಬೇರು ಕೊಳೆಯದಂತೆ ಎಚ್ಚರವಹಿಸಿ.",
          fieldSanitation: "ಕತ್ತರಿಸಿದ ಎಲ್ಲಾ ಒಣ ರೆಂಬೆಗಳನ್ನು ತೋಟದಿಂದ ಹೊರಗೆ ತಂದು ಸುಟ್ಟುಹಾಕಿ.",
          intercropping: "ಬುಡದ ಸುತ್ತ ಆಳವಾಗಿ ಉಳುಮೆ ಮಾಡಬೇಡಿ; ಬೇರುಗಳಿಗೆ ಗಾಯವಾಗಬಾರದು.",
          postHarvestCare: "ಮಳೆಗಾಲ ಮುಗಿದ ತಕ್ಷಣ ಮರದ ಕಾಂಡಕ್ಕೆ ಸುಣ್ಣ ಮತ್ತು ಮೈಲುತುತ್ತು ಲೇಪಿಸಿ.",
        },
        varietyAdvisory: {
          "alphonso": { riskLevel: "High", varietySpecificAction: "ಧಾರಾವಾಡದಲ್ಲಿ ರೆಂಬೆ ಕತ್ತರಿಸಿದ ನಂತರ ಕಡ್ಡಾಯವಾಗಿ ಬೋರ್ಡೋ ಪೇಸ್ಟ್ ಹಚ್ಚಿ.", criticalStage: "ಪ್ರೂನಿಂಗ್ ನಂತರ" },
          "totapuri": { riskLevel: "Medium", varietySpecificAction: "ಶ್ರೀನಿವಾಸಪುರದಲ್ಲಿ ಕಟಾವಿನ ನಂತರ ಒಣ ಕಡ್ಡಿಗಳನ್ನು ಆರಿಸಿ ತೆಗೆಯಿರಿ.", criticalStage: "ಕಟಾವಿನ ನಂತರ" },
          "banganapalli": { riskLevel: "High", varietySpecificAction: "ಕಾಂಡ ಕೊರೆಯುವ ಹುಳು ಬಾರದಂತೆ ಕ್ಲೋರೋಪೈರಿಫಾಸ್ ಜೊತೆ ಸಿಂಪಡಿಸಿ.", criticalStage: "ಮಳೆಗಾಲ" },
          "mallika": { riskLevel: "Medium", varietySpecificAction: "ರೆಂಬೆ ಒಣಗದಂತೆ ಬೋರ್ಡೋ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ.", criticalStage: "ನಿರ್ವಹಣೆ" },
          "raspuri": { riskLevel: "High", varietySpecificAction: "ಹಳೆ ಮರಗಳ ಒಣ ರೆಂಬೆಗಳನ್ನು ಕತ್ತರಿಸಿ ಹೊಸ ಚಿಗುರು ಬರುವಂತೆ ಮಾಡಿ.", criticalStage: "ಜುಲೈ-ಆಗಸ್ಟ್" },
          "sindhoora": { riskLevel: "Low", varietySpecificAction: "ಸಾಮಾನ್ಯ ಮುಂಜಾಗ್ರತೆ ಸಾಕು.", criticalStage: "ನಿರ್ವಹಣೆ" },
          "neelum": { riskLevel: "Medium", varietySpecificAction: "ಬುಡಕ್ಕೆ ಟ್ರೈಕೋಡರ್ಮ ಗೊಬ್ಬರ ಹಾಕಿ.", criticalStage: "ಗೊಬ್ಬರ ಹಾಕುವಾಗ" },
          "amrapali": { riskLevel: "High", varietySpecificAction: "ಸಾಂದ್ರ ಮರಗಳಲ್ಲಿ ರೆಂಬೆಗಳು ಪರಸ್ಪರ ತಾಗದಂತೆ ಕತ್ತರಿಸಿ.", criticalStage: "ಪ್ರೂನಿಂಗ್" },
          "dasheri": { riskLevel: "High", varietySpecificAction: "ಉತ್ತರ ಕರ್ನಾಟಕದಲ್ಲಿ ಒಣ ರೆಂಬೆಗಳನ್ನು ಬೇಗ ತೆರವುಗೊಳಿಸಿ.", criticalStage: "ಬೇಸಿಗೆ ಮುನ್ನ" },
          "malgoa": { riskLevel: "Medium", varietySpecificAction: "ದೊಡ್ಡ ಕಾಂಡಗಳಿಗೆ ಬೋರ್ಡೋ ಪೇಸ್ಟ್ ಲೇಪಿಸಿ.", criticalStage: "ಕಾಂಡ ನಿರ್ವಹಣೆ" },
        },
      },
      "sooty_mould": {
        diseaseName: "ಮಸಿ ರೋಗ / ಕಾಡಿಗೆ ರೋಗ (Sooty Mould)",
        scientificName: "ಶಿಲೀಂಧ್ರ + ಹೀರುವ ಕೀಟ: Capnodium mangiferae + Mango Hopper",
        causalAgent: "ಕೀಟಗಳ ಜೇನುತುಪ್ಪದಂತಹ ದ್ರವದ ಮೇಲಿನ ಶಿಲೀಂಧ್ರ",
        urgency: "ಮಧ್ಯಮ ತುರ್ತು — ಜಿಗಿ ಹುಳು (Hopper) ನಿಯಂತ್ರಣ ಮೊದಲು ಮಾಡಿ",
        chemicalPesticides: {
          primaryChemical: "ಮೈದಾ ಗಂಜಿ 2% + ಇಮಿಡಾಕ್ಲೋಪ್ರಿಡ್ 17.8% SL",
          tradeNames: ["ಕಾನ್ಫಿಡಾರ್ (Confidor)", "ರೋಗಾರ್ (Rogor)", "ಮೈದಾ ಗಂಜಿ ವಾಶ್"],
          dosage: "ಇಮಿಡಾಕ್ಲೋಪ್ರಿಡ್ 0.5 ಮಿ.ಲೀ/ಲೀಟರ್ + 20 ಗ್ರಾಂ ಮೈದಾ ಹಿಟ್ಟನ್ನು ಗಂಜಿ ಮಾಡಿ ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ.",
          sprayTiming: "ಬಿಸಿಲಿನ ದಿನಗಳಲ್ಲಿ ಸಿಂಪಡಿಸಿ; ಮೈದಾ ಗಂಜಿ ಒಣಗಿ ಮಸಿಯ ಪದರ ತಾನಾಗಿಯೇ ಕಿತ್ತು ಬೀಳುತ್ತದೆ.",
          rotationChemical: "ಅಸಿಟಾಮಿಪ್ರಿಡ್ 20% SP (ಎಕ್ಕಾ) 0.5 ಗ್ರಾಂ/ಲೀಟರ್",
          phi: "15 ದಿನಗಳು",
          cautions: "ಕೇವಲ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸಿದರೆ ಪ್ರಯೋಜನವಿಲ್ಲ; ಜಿಗಿ ಹುಳು ಮತ್ತು ಹಿಟ್ಟು ತಿಗಣೆ ನಾಶಪಡಿಸುವುದು ಮುಖ್ಯ.",
        },
        organicSolutions: {
          botanical: "ಬೇವಿನ ಎಣ್ಣೆ 10,000 ppm (3 ಮಿ.ಲೀ/ಲೀ) + ಮೀನಿನ ಎಣ್ಣೆ ಸಾಬೂನು (FORS) 5 ಗ್ರಾಂ/ಲೀ",
          bioAgent: "ವರ್ಟಿಸಿಲಿಯಂ ಲೆಕಾನಿ (Verticillium lecanii) 5 ಗ್ರಾಂ/ಲೀಟರ್",
          dosage: "ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 5 ಗ್ರಾಂ ಜೈವಿಕ ಕೀಟನಾಶಕ",
          applicationMethod: "ಜಿಗಿ ಹುಳುಗಳು ಅಡಗಿರುವ ಎಲೆಯ ಕೆಳಭಾಗ ಮತ್ತು ಹೂಗೊಂಚಲುಗಳಿಗೆ ಸಿಂಪಡಿಸಿ.",
          indigenousMix: "2% ಮೈದಾ ಗಂಜಿ ದ್ರಾವಣ (100 ಲೀಟರ್ ನೀರಿಗೆ 2 ಕೆಜಿ ಮೈದಾ ಕುದಿಸಿ ತಯಾರಿಸಿ).",
        },
        farmingPractices: {
          canopyPruning: "ದಟ್ಟ ನೆರಳು ಕಮ್ಮಿ ಮಾಡಿ ಗಾಳಿ ಮತ್ತು ಬಿಸಿಲು ಎಲೆಗಳಿಗೆ ತಾಗುವಂತೆ ಮಾಡಿ.",
          waterManagement: "ಅತಿಯಾದ ಸಾರಜನಕ ಗೊಬ್ಬರ ಹಾಕಬೇಡಿ; ಇದು ಜಿಗಿ ಹುಳುಗಳ ಸಂಖ್ಯೆ ಹೆಚ್ಚಿಸುತ್ತದೆ.",
          fieldSanitation: "ಇರುವೆಗಳು ಜಿಗಿ ಹುಳುಗಳನ್ನು ರಕ್ಷಿಸುವುದರಿಂದ ಮರದ ಬುಡಕ್ಕೆ ಕ್ಲೋರೋಪೈರಿಫಾಸ್ ಪುಡಿ ಉದುರಿಸಿ.",
          intercropping: "ಜಿಗಿ ಹುಳು ಆಕರ್ಷಿಸುವ ಹಳದಿ ಜಿಗುಟು ಬಲೆಗಳನ್ನು (Yellow sticky traps) ಎಕರೆಗೆ 15-20 ಕಟ್ಟಿ.",
          postHarvestCare: "ಕಟಾವಿನ ನಂತರ ಮರಗಳನ್ನು ಪ್ರೆಶರ್ ವಾಶರ್ ನೀರಿನಿಂದ ತೊಳೆದು ಮಸಿ ತೆಗೆಯಿರಿ.",
        },
        varietyAdvisory: {
          "alphonso": { riskLevel: "High", varietySpecificAction: "ಜಿಗಿ ಹುಳು ನಿಯಂತ್ರಣಕ್ಕೆ ಹೂ ಬಿಡುವ ಮೊದಲು ಕಾನ್ಫಿಡಾರ್ ಸಿಂಪಡಿಸಿ.", criticalStage: "ಹೂ ಮೊಗ್ಗು ಹಂತ" },
          "totapuri": { riskLevel: "Medium", varietySpecificAction: "ಮೈದಾ ಗಂಜಿ ಸಿಂಪಡಿಸಿ ಎಲೆಗಳ ಮಸಿ ಪದರ ತೆಗೆಯಿರಿ.", criticalStage: "ಕಾಯಿ ಹಂತ" },
          "banganapalli": { riskLevel: "High", varietySpecificAction: "ಕೋಲಾರದಲ್ಲಿ ಜಿಗಿ ಹುಳುಗಳ ನಿಯಂತ್ರಣಕ್ಕೆ ಹಳದಿ ಜಿಗುಟು ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ.", criticalStage: "ಹೂ ಹಂತ" },
          "mallika": { riskLevel: "Medium", varietySpecificAction: "ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ ರೋಗ ಹರಡದಂತೆ ತಡೆಯಿರಿ.", criticalStage: "ನಿರ್ವಹಣೆ" },
          "raspuri": { riskLevel: "High", varietySpecificAction: "ಹಣ್ಣು ಕಪ್ಪಾಗದಂತೆ ಮೈದಾ ವಾಶ್ ಸಿಂಪಡಣೆ ಮಾಡಿ.", criticalStage: "ಕಟಾವಿಗೆ ಮುನ್ನ" },
          "sindhoora": { riskLevel: "Low", varietySpecificAction: "ಸಾಮಾನ್ಯ ಜಿಗಿ ಹುಳು ನಿಯಂತ್ರಣ ಸಾಕು.", criticalStage: "ನಿರ್ವಹಣೆ" },
          "neelum": { riskLevel: "Medium", varietySpecificAction: "ಹಿಟ್ಟು ತಿಗಣೆ (Mealybug) ನಿಯಂತ್ರಣಕ್ಕೆ ಗಮನ ಕೊಡಿ.", criticalStage: "ತಡ ಋತು" },
          "amrapali": { riskLevel: "High", varietySpecificAction: "ದಟ್ಟ ಗಿಡಗಳಲ್ಲಿ ಜಿಗಿ ಹುಳುಗಳು ಹೆಚ್ಚು; ಲೈಟ್ ಪ್ರೂನಿಂಗ್ ಮಾಡಿ.", criticalStage: "ಪ್ರೂನಿಂಗ್" },
          "dasheri": { riskLevel: "High", varietySpecificAction: "ಚಿಗುರು ಬರುವಾಗ ಜಿಗಿ ಹುಳು ನಿಯಂತ್ರಣ ಕಡ್ಡಾಯ.", criticalStage: "ಹೊಸ ಚಿಗುರು" },
          "malgoa": { riskLevel: "Medium", varietySpecificAction: "ಸಾವಯವ ವರ್ಟಿಸಿಲಿಯಂ ಜೈವಿಕ ಕೀಟನಾಶಕ ಬಳಸಿ.", criticalStage: "ನಿರ್ವಹಣೆ" },
        },
      },
      "healthy": {
        diseaseName: "ಆರೋಗ್ಯಕರ ಗಿಡ / ಎಲೆ (Healthy Tissue)",
        scientificName: "ಆರೋಗ್ಯಕರ ಮಾವಿನ ಗಿಡ (Mangifera indica L.)",
        causalAgent: "ಯಾವುದೇ ರೋಗಾಣುಗಳಿಲ್ಲ",
        urgency: "ಯಾವುದೇ ಔಷಧ ಸಿಂಪಡಣೆ ಅಗತ್ಯವಿಲ್ಲ",
        chemicalPesticides: {
          primaryChemical: "ಯಾವುದೇ ರಾಸಾಯನಿಕ ಕೀಟನಾಶಕ ಅಥವಾ ಶಿಲೀಂಧ್ರನಾಶಕ ಅಗತ್ಯವಿಲ್ಲ",
          tradeNames: ["ಮುಂಜಾಗ್ರತಾ ಪೋಷಕಾಂಶ ನಿರ್ವಹಣೆ ಮುಂದುವರಿಸಿ"],
          dosage: "ಆರೋಗ್ಯಕರ ಎಲೆಗಳಿಗೆ ಅನಗತ್ಯವಾಗಿ ರಾಸಾಯನಿಕ ಸಿಂಪಡಿಸಬೇಡಿ.",
          sprayTiming: "ವಾರಕ್ಕೊಮ್ಮೆ ತೋಟದಲ್ಲಿ ರೋಗ ಲಕ್ಷಣಗಳಿವೆಯೇ ಎಂದು ಕಣ್ಣಾಡಿಸಿ.",
          rotationChemical: "ಮುಂಜಾಗ್ರತೆಯಾಗಿ ಸಿಲಿಕಾನ್ ಅಥವಾ ಪೊಟ್ಯಾಸಿಯಮ್ ಸಿಲಿಕೇಟ್ 1.5 ಗ್ರಾಂ/ಲೀ ಸಿಂಪಡಿಸಬಹುದು.",
          phi: "0 ದಿನಗಳು",
          cautions: "ಅನಗತ್ಯ ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆಯಿಂದ ಉಪಯುಕ್ತ ಪರಾಗಸ್ಪರ್ಶ ಕೀಟಗಳು (ಜೇನುನೊಣಗಳು) ನಾಶವಾಗುತ್ತವೆ.",
        },
        organicSolutions: {
          botanical: "ತಿಂಗಳಿಗೊಮ್ಮೆ 3,000 ppm ಬೇವಿನ ಎಣ್ಣೆ 2 ಮಿ.ಲೀ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ ರಕ್ಷಣೆ ನೀಡಿ.",
          bioAgent: "ಸ್ಯೂಡೋಮೊನಾಸ್ + ಟ್ರೈಕೋಡರ್ಮ ಜೈವಿಕ ಗೊಬ್ಬರ (ಬುಡಕ್ಕೆ ಹಾಕಿ).",
          dosage: "ಪ್ರತಿ ಮರಕ್ಕೆ 20 ಕೆಜಿ ಎರೆಹುಳು ಗೊಬ್ಬರ (ವರ್ಮಿಕಾಂಪೋಸ್ಟ್) ನೀಡಿ.",
          applicationMethod: "ಬುಡದ ಸುತ್ತ ಮಣ್ಣು ಸಡಿಲಗೊಳಿಸಿ ಗೊಬ್ಬರ ಹಾಕಿ ನೀರು ಕೊಡಿ.",
          indigenousMix: "ಪ್ರತಿ 21 ದಿನಗಳಿಗೊಮ್ಮೆ ಎಕರೆಗೆ 200 ಲೀಟರ್ ಜೀವಾಮೃತವನ್ನು ಹನಿ ನೀರಾವರಿ ಮೂಲಕ ಹರಿಸಿ.",
        },
        farmingPractices: {
          canopyPruning: "ಮರಕ್ಕೆ ಶೇ. 80 ರಷ್ಟು ಬಿಸಿಲು ತಾಗುವಂತೆ ಒಣ ರೆಂಬೆಗಳನ್ನು ಮಾತ್ರ ಕತ್ತರಿಸಿ.",
          waterManagement: "ಹನಿ ನೀರಾವರಿ ಮೂಲಕ ಹಿತಮಿತವಾಗಿ ನೀರು ಕೊಡಿ; ತೇವಾಂಶ 70-80% ಇರಲಿ.",
          fieldSanitation: "ಬುಡದ ಸುತ್ತ ಕಳೆ ಕೀಳಿಸಿ ಒಣ ಎಲೆಗಳ ಹೊದಿಕೆ (ಮಲ್ಚಿಂಗ್) ಮಾಡಿ.",
          intercropping: "ಸಾಲುಗಳ ನಡುವೆ ಅಲಸಂದಿ ಅಥವಾ ಹೆಸರು ಬೆಳೆದು ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಹೆಚ್ಚಿಸಿ.",
          postHarvestCare: "ಕಟಾವಿನ ನಂತರ ಜಿಂಕ್ ಸಲ್ಫೇಟ್ (0.5%) + ಬೋರಾನ್ (0.2%) + ಯೂರಿಯಾ (1.0%) ಸಿಂಪಡಿಸಿ ಮರಕ್ಕೆ ಶಕ್ತಿ ನೀಡಿ.",
        },
        varietyAdvisory: {
          "alphonso": { riskLevel: "Low", varietySpecificAction: "ತೋಟ ಅತ್ಯುತ್ತಮ ಸ್ಥಿತಿಯಲ್ಲಿದೆ! ಧಾರವಾಡದಲ್ಲಿ ಮಳೆಗಾಲದ ನಂತರ ಲೈಟ್ ಪ್ರೂನಿಂಗ್ ಮಾಡಿ.", criticalStage: "ನಿರ್ವಹಣೆ" },
          "banganapalli": { riskLevel: "Low", varietySpecificAction: "ಕೋಲಾರದಲ್ಲಿ ಕಾಯಿ ಕಟ್ಟಿದ ನಂತರ 13-0-45 ಪೊಟ್ಯಾಶ್ ಗೊಬ್ಬರ ನೀಡಿ ಕಾಯಿಯ ತೂಕ ಹೆಚ್ಚಿಸಿ.", criticalStage: "ಕಾಯಿ ಬೆಳವಣಿಗೆ" },
          "totapuri": { riskLevel: "Low", varietySpecificAction: "ಶ್ರೀನಿವಾಸಪುರದಲ್ಲಿ ಗಾಳಿ ತಡೆ ಗಿಡಗಳನ್ನು ಸುಸ್ಥಿತಿಯಲ್ಲಿಡಿ.", criticalStage: "ನಿರ್ವಹಣೆ" },
          "mallika": { riskLevel: "Low", varietySpecificAction: "ಮಣ್ಣಿನಲ್ಲಿ ಸಾವಯವ ಅಂಶ ಹೆಚ್ಚಿಸಲು ಜೀವಾಮೃತ ನೀಡಿ.", criticalStage: "ಮಣ್ಣಿನ ಫಲವತ್ತತೆ" },
          "raspuri": { riskLevel: "Low", varietySpecificAction: "ರಾಮನಗರದಲ್ಲಿ ಮಾರ್ಚ್ ಆರಂಭದ ಸುಗ್ಗಿ ಕೊಯ್ಲಿಗೆ ಸಿದ್ಧತೆ ನಡೆಸಿ.", criticalStage: "ಕಟಾವು ತಯಾರಿ" },
          "sindhoora": { riskLevel: "Low", varietySpecificAction: "ಕಾಯಿಗೆ ಸುಂದರ ಕೆಂಪು ಬಣ್ಣ ಬರಲು ಸೂಕ್ಷ್ಮ ಪೋಷಕಾಂಶ ನೀಡಿ.", criticalStage: "ಬಣ್ಣ ಬರುವ ಹಂತ" },
          "neelum": { riskLevel: "Low", varietySpecificAction: "ತುಮಕೂರು/ಕೋಲಾರ ತೋಟಗಳಲ್ಲಿ ನಿಯಮಿತ ಮಲ್ಚಿಂಗ್ ಮಾಡಿ.", criticalStage: "ನಿರ್ವಹಣೆ" },
          "amrapali": { riskLevel: "Low", varietySpecificAction: "ಸಾಂದ್ರ ಗಿಡಗಳ ಎತ್ತರವನ್ನು ಮಿತಿಯಲ್ಲಿಡಲು ಕತ್ತರಿಸುವಿಕೆ ಮಾಡಿ.", criticalStage: "ಹೆಡ್ಜಿಂಗ್" },
          "dasheri": { riskLevel: "Low", varietySpecificAction: "ಬೆಳಗಾವಿಯಲ್ಲಿ ಹವಾಮಾನ ಬದಲಾವಣೆಗಳ ಮೇಲೆ ನಿಗಾ ಇರಿಸಿ.", criticalStage: "ಮೇಲ್ವಿಚಾರಣೆ" },
          "malgoa": { riskLevel: "Low", varietySpecificAction: "ದೊಡ್ಡ ಮರಗಳಿಗೆ ಸಾವಯವ ಗೊಬ್ಬರ ಮತ್ತು ನೀರು ನೀಡಿ.", criticalStage: "ಪೋಷಕಾಂಶ" },
        },
      },
    };

    if (knMap[protocol.id]) {
      return knMap[protocol.id];
    }
  }

  // Fallback to default English protocol structure
  return {
    diseaseName: protocol.diseaseName,
    scientificName: protocol.scientificName,
    causalAgent: protocol.causalAgent,
    urgency: protocol.urgency,
    chemicalPesticides: protocol.chemicalPesticides,
    organicSolutions: protocol.organicSolutions,
    farmingPractices: protocol.farmingPractices,
    varietyAdvisory: protocol.varietyAdvisory,
  };
}
