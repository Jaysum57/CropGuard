import { images } from "./DiseaseImages";

export interface DiseaseData {
  id: string;
  name: string;
  severity: "Low" | "Medium" | "High";
  category: string;
  description: string;
  affectedCrops: string[];
  image: any;
  quickStats?: {
    severity: { level: string; score: string };
    transmission: { level: string; score: string };
    treatment: { level: string; score: string };
    impact: { level: string; score: string };
  };
  symptoms: Array<{
    title: string;
    description: string;
    severity?: "critical" | "high" | "moderate" | "low";
    icon?: string;
  }>;
  causes?: Array<{
    title: string;
    description: string;
  }>;
  prevention?: Array<{
    title: string;
    description: string;
    icon: string;
    difficulty?: string;
  }>;
  treatments?: Array<{
    title: string;
    description: string;
    icon: string;
    effectiveness: string;
  }>;
}

export const categories = ["All", "Fungal", "Bacterial", "Viral", "Pest"];

export const diseaseDatabase: Record<string, DiseaseData> = {
  scab: {
    id: "scab",
    name: "Scab",
    severity: "Medium",
    category: "Fungal",
    description: "A fungal disease that causes dark, rough lesions on leaves, fruit, or stems, reducing quality and yield.",
    affectedCrops: ["Apple", "Pear", "Potato", "Cucumber"],
    image: images.scab,
    quickStats: {
      severity: { level: "Medium", score: "6/10" },
      transmission: { level: "Medium", score: "5/10" },
      treatment: { level: "Medium", score: "6/10" },
      impact: { level: "Medium", score: "7/10" },
    },
    symptoms: [
      {
        title: "Dark Lesions",
        description: "Olive-green to brown spots appear on leaves, fruit, and twigs.",
        severity: "high",
        icon: "bug-outline",
      },
      {
        title: "Scabby Fruit",
        description: "Fruit develops corky, scab-like spots, often causing deformation.",
        severity: "critical",
        icon: "alert-circle-outline",
      },
      {
        title: "Leaf Puckering",
        description: "Infected leaves may become twisted or puckered.",
        severity: "moderate",
        icon: "leaf-outline",
      },
    ],
    causes: [
      {
        title: "Fungus",
        description: "Caused by the fungus *Venturia inaequalis* (on apples) which overwinters in fallen leaves.",
      },
      {
        title: "Cool, Wet Weather",
        description: "The fungus thrives and releases spores during cool, wet spring weather.",
      },
    ],
    prevention: [
      {
        title: "Sanitation",
        description: "Rake and destroy fallen leaves in autumn to reduce fungal spores.",
        icon: "trash-outline",
        difficulty: "Easy",
      },
      {
        title: "Resistant Varieties",
        description: "Plant apple and pear varieties that are resistant to scab.",
        icon: "shield-checkmark-outline",
        difficulty: "Medium",
      },
      {
        title: "Proper Pruning",
        description: "Prune trees to improve air circulation, which helps leaves dry faster.",
        icon: "cut-outline",
        difficulty: "Medium",
      },
    ],
    treatments: [
      {
        title: "Fungicide Sprays",
        description: "Apply fungicides containing sulfur or copper before and during infection periods.",
        icon: "medical-outline",
        effectiveness: "High",
      },
      {
        title: "Remove Infected Parts",
        description: "Prune out infected twigs and remove heavily spotted leaves.",
        icon: "cut-outline",
        effectiveness: "Low",
      },
    ],
  },
  black_rot: {
    id: "black_rot",
    name: "Black Rot",
    severity: "High",
    category: "Fungal/Bacterial Disease",
    description: "Leads to dark, sunken lesions and the rotting of fruit and leaves, which can devastate a crop.",
    affectedCrops: ["Apple", "Grape", "Cabbage", "Sweet Potato"],
    image: images.black_rot,
    quickStats: {
      severity: { level: "High", score: "8/10" },
      transmission: { level: "Fast", score: "8/10" },
      treatment: { level: "Low", score: "4/10" },
      impact: { level: "Severe", score: "9/10" },
    },
    symptoms: [
      {
        title: "Fruit Rot",
        description: "Small, light-colored spots on fruit enlarge, turn black, and become sunken. Grapes shrivel into hard, black 'mummies'.",
        severity: "critical",
        icon: "alert-circle-outline",
      },
      {
        title: "Leaf Spots",
        description: "Circular, brown spots on leaves develop dark borders and tiny black dots (fruiting bodies) in the center.",
        severity: "high",
        icon: "leaf-outline",
      },
      {
        title: "Stem Lesions",
        description: "Dark, elongated lesions can appear on stems and canes, potentially girdling them.",
        severity: "moderate",
        icon: "trending-down-outline",
      },
    ],
    causes: [
      {
        title: "Fungus/Bacteria",
        description: "Caused by the fungus *Guignardia bidwellii* on grapes and bacteria like *Xanthomonas* on cabbage.",
      },
      {
        title: "Warm, Humid Conditions",
        description: "The disease spreads rapidly during periods of warm, rainy, and humid weather.",
      },
      {
        title: "Infected Debris",
        description: "Spores and bacteria overwinter on infected plant debris, mummified fruit, and cane lesions.",
      },
    ],
    prevention: [
      {
        title: "Sanitation",
        description: "Remove and destroy all mummified fruit, infected leaves, and pruned canes.",
        icon: "trash-outline",
        difficulty: "Easy",
      },
      {
        title: "Improve Airflow",
        description: "Proper pruning and training of vines or plants improves air circulation and speeds drying.",
        icon: "sunny-outline",
        difficulty: "Medium",
      },
      {
        title: "Crop Rotation",
        description: "For vegetables like cabbage, rotate crops to avoid planting in infested soil.",
        icon: "sync-outline",
        difficulty: "Medium",
      },
    ],
    treatments: [
      {
        title: "Preventive Fungicides",
        description: "Apply fungicides regularly, starting early in the season before symptoms appear.",
        icon: "medical-outline",
        effectiveness: "High",
      },
      {
        title: "Remove Infected Fruit",
        description: "Consistently remove any fruit showing early signs of infection to reduce spore load.",
        icon: "cut-outline",
        effectiveness: "Moderate",
      },
    ],
  },
  rust: {
    id: "rust",
    name: "Rust Disease",
    severity: "High",
    category: "Fungal Disease",
    description: "A fungal disease that causes reddish-brown or orange pustules on plant leaves, weakening the plant and reducing crop yields.",
    affectedCrops: ["Wheat", "Corn", "Coffee", "Beans", "Roses", "Apple Trees"],
    image: images.rust,
    quickStats: {
      severity: { level: "High", score: "8/10" },
      transmission: { level: "Fast", score: "9/10" },
      treatment: { level: "Medium", score: "6/10" },
      impact: { level: "Severe", score: "9/10" },
    },
    symptoms: [
      {
        title: "Orange Pustules",
        description: "Small, raised, orange or reddish-brown spots on leaf undersides",
        severity: "critical",
        icon: "alert-circle-outline",
      },
      {
        title: "Leaf Yellowing",
        description: "Leaves turn yellow and may drop prematurely",
        severity: "high",
        icon: "leaf-outline",
      },
      {
        title: "Growth Stunting",
        description: "Plants show reduced growth and vigor",
        severity: "moderate",
        icon: "trending-down-outline",
      },
      {
        title: "Yield Reduction",
        description: "Significant decrease in crop production",
        severity: "critical",
        icon: "bar-chart-outline",
      },
    ],
    causes: [
      {
        title: "Fungus Spores",
        description: "Caused by various fungi (e.g., *Puccinia* species), which spread through tiny airborne spores.",
      },
      {
        title: "Warm, Humid Weather",
        description: "Thrives in wet, warm conditions, especially after rain or heavy watering.",
      },
    ],
    prevention: [
      {
        title: "Plant Spacing",
        description: "Ensure adequate spacing between plants for proper air circulation.",
        icon: "resize-outline",
        difficulty: "Easy",
      },
      {
        title: "Water Management",
        description: "Water at the soil level to avoid wetting leaves, which helps spores germinate.",
        icon: "water-outline",
        difficulty: "Easy",
      },
      {
        title: "Resistant Varieties",
        description: "Choose rust-resistant plant varieties when available.",
        icon: "shield-checkmark-outline",
        difficulty: "Medium",
      },
    ],
    treatments: [
      {
        title: "Apply Fungicides",
        description: "Spray fungicides with copper or sulfur when you see the first signs.",
        icon: "medical-outline",
        effectiveness: "High",
      },
      {
        title: "Use Natural Sprays",
        description: "Neem oil or baking soda spray can help control rust naturally.",
        icon: "leaf-outline",
        effectiveness: "Moderate",
      },
      {
        title: "Remove Affected Leaves",
        description: "Cut off and throw away sick leaves. Do not put them in compost.",
        icon: "cut-outline",
        effectiveness: "Moderate",
      },
    ],
  },
  powdery_mildew: {
    id: "powdery_mildew",
    name: "Powdery Mildew",
    severity: "Medium",
    category: "Fungal Disease",
    description: "A common fungal disease forming white, powdery spots on leaf surfaces, leading to yellowing and deformation.",
    affectedCrops: ["Grape", "Cucumber", "Tomato", "Rose", "Squash"],
    image: images.powdery_mildew,
    quickStats: {
      severity: { level: "Medium", score: "6/10" },
      transmission: { level: "Fast", score: "9/10" },
      treatment: { level: "High", score: "7/10" },
      impact: { level: "Medium", score: "6/10" },
    },
    symptoms: [
      {
        title: "White Powdery Patches",
        description: "Distinctive white, flour-like patches on leaves, stems, and sometimes fruit.",
        severity: "critical",
        icon: "alert-circle-outline",
      },
      {
        title: "Leaf Yellowing & Distortion",
        description: "Leaves may yellow, dry out, and become twisted or distorted.",
        severity: "moderate",
        icon: "leaf-outline",
      },
      {
        title: "Stunted Growth",
        description: "Heavy infections can reduce photosynthesis, leading to stunted plant growth and reduced yields.",
        severity: "high",
        icon: "trending-down-outline",
      },
    ],
    causes: [
      {
        title: "Fungus Spores",
        description: "Caused by various species of fungi that thrive in specific conditions.",
      },
      {
        title: "High Humidity & Dry Leaves",
        description: "Unlike many fungi, it favors high humidity but doesn't require wet leaves to establish, spreading easily in dry weather.",
      },
    ],
    prevention: [
      {
        title: "Good Air Circulation",
        description: "Properly space plants and prune them to promote airflow, which reduces humidity around leaves.",
        icon: "sunny-outline",
        difficulty: "Easy",
      },
      {
        title: "Resistant Varieties",
        description: "Select plant varieties that are known to be resistant to powdery mildew.",
        icon: "shield-checkmark-outline",
        difficulty: "Medium",
      },
      {
        title: "Sunlight",
        description: "Plant in areas with adequate sunlight, as shade can encourage fungal growth.",
        icon: "sunny-outline",
        difficulty: "Easy",
      },
    ],
    treatments: [
      {
        title: "Fungicides",
        description: "Apply horticultural oils, neem oil, sulfur, or potassium bicarbonate-based fungicides.",
        icon: "medical-outline",
        effectiveness: "High",
      },
      {
        title: "Milk Spray",
        description: "A diluted milk solution (1 part milk to 9 parts water) can be effective as a preventative spray.",
        icon: "leaf-outline",
        effectiveness: "Moderate",
      },
      {
        title: "Remove Infected Leaves",
        description: "Prune and dispose of heavily infected leaves to reduce the spread of spores.",
        icon: "cut-outline",
        effectiveness: "Moderate",
      },
    ],
  },
  gray_leaf_spot: {
    id: "gray_leaf_spot",
    name: "Gray Leaf Spot",
    severity: "Medium",
    category: "Fungal Disease",
    description: "A fungal disease that creates rectangular gray or tan spots on leaves, reducing photosynthesis and potentially harming yield.",
    affectedCrops: ["Corn", "Tomato", "Turfgrass", "Pepper"],
    image: images.gray_leaf_spot,
    quickStats: {
      severity: { level: "Medium", score: "7/10" },
      transmission: { level: "Medium", score: "6/10" },
      treatment: { level: "Medium", score: "6/10" },
      impact: { level: "High", score: "8/10" },
    },
    symptoms: [
      {
        title: "Rectangular Lesions",
        description: "On corn, it creates distinct, long, rectangular, gray-to-tan spots that are limited by leaf veins.",
        severity: "critical",
        icon: "square-outline",
      },
      {
        title: "Small Dark Spots",
        description: "On tomatoes, it starts as small, dark spots that enlarge and develop a grayish center.",
        severity: "high",
        icon: "leaf-outline",
      },
      {
        title: "Leaf Blight",
        description: "In severe cases, lesions merge, causing the entire leaf to die, which significantly reduces plant energy.",
        severity: "critical",
        icon: "alert-circle-outline",
      },
    ],
    causes: [
      {
        title: "Fungus",
        description: "Caused by fungi like *Cercospora zeae-maydis* on corn and *Stemphylium* species on tomatoes.",
      },
      {
        title: "Warm and Humid Weather",
        description: "Extended periods of high humidity and warm temperatures create ideal conditions for infection.",
      },
      {
        title: "Crop Debris",
        description: "The fungus overwinters in infected residue from the previous crop.",
      },
    ],
    prevention: [
      {
        title: "Crop Rotation",
        description: "Rotate crops with non-host plants to break the disease cycle.",
        icon: "sync-outline",
        difficulty: "Medium",
      },
      {
        title: "Residue Management",
        description: "Till under or remove crop debris after harvest to reduce fungal survival.",
        icon: "trash-outline",
        difficulty: "Medium",
      },
      {
        title: "Resistant Hybrids",
        description: "Plant corn hybrids or tomato varieties with known resistance to the disease.",
        icon: "shield-checkmark-outline",
        difficulty: "Medium",
      },
    ],
    treatments: [
      {
        title: "Foliar Fungicides",
        description: "Application of appropriate fungicides can be effective, especially when applied preventatively or at first sign.",
        icon: "medical-outline",
        effectiveness: "High",
      },
      {
        title: "Improve Airflow",
        description: "Proper spacing helps reduce humidity and leaf wetness, slowing the disease's spread.",
        icon: "sunny-outline",
        effectiveness: "Moderate",
      },
    ],
  },
  citrus_greening: {
    id: "citrus_greening",
    name: "Citrus Greening (HLB)",
    severity: "High",
    category: "Bacterial Disease",
    description: "A devastating bacterial disease spread by psyllids, causing yellow shoots, misshapen fruit, and eventual tree death. There is no cure.",
    affectedCrops: ["Citrus trees", "Orange", "Lemon", "Lime", "Grapefruit"],
    image: images.citrus_greening,
    quickStats: {
      severity: { level: "Critical", score: "10/10" },
      transmission: { level: "Fast", score: "9/10" },
      treatment: { level: "None", score: "1/10" },
      impact: { level: "Devastating", score: "10/10" },
    },
    symptoms: [
      {
        title: "Blotchy Mottling",
        description: "Asymmetrical yellowing of leaves (blotchy mottling) is a key diagnostic symptom.",
        severity: "critical",
        icon: "alert-circle-outline",
      },
      {
        title: "Misshapen Fruit",
        description: "Fruit is often small, lopsided, and fails to ripen, remaining green. The taste is bitter and salty.",
        severity: "critical",
        icon: "close-circle-outline",
      },
      {
        title: "Twig Dieback",
        description: "The tree shows gradual decline with yellowing shoots and twig dieback, eventually leading to death.",
        severity: "high",
        icon: "trending-down-outline",
      },
    ],
    causes: [
      {
        title: "Bacteria",
        description: "Caused by the bacterium *Candidatus Liberibacter asiaticus* which colonizes the plant's vascular system (phloem).",
      },
      {
        title: "Insect Vector",
        description: "The disease is transmitted by the Asian citrus psyllid, a tiny insect that feeds on citrus leaves.",
      },
    ],
    prevention: [
      {
        title: "Control Psyllids",
        description: "Aggressively manage psyllid populations using targeted insecticides and monitoring.",
        icon: "bug-outline",
        difficulty: "Hard",
      },
      {
        title: "Remove Infected Trees",
        description: "Promptly remove and destroy infected trees to eliminate the bacterial source and prevent spread.",
        icon: "trash-outline",
        difficulty: "Medium",
      },
      {
        title: "Use Certified Plants",
        description: "Only plant trees that come from certified, disease-free nurseries.",
        icon: "shield-checkmark-outline",
        difficulty: "Easy",
      },
    ],
    treatments: [
      {
        title: "No Cure Available",
        description: "There is currently no cure for citrus greening. Management focuses on preventing new infections and supporting tree health.",
        icon: "close-circle-outline",
        effectiveness: "None",
      },
      {
        title: "Enhanced Nutrition",
        description: "Providing optimal nutrition can help infected trees remain productive for a longer period, but will not stop the decline.",
        icon: "leaf-outline",
        effectiveness: "Low",
      },
    ],
  },
  bacterial_spot: {
    id: "bacterial_spot",
    name: "Bacterial Spot",
    severity: "Medium",
    category: "Bacterial Disease",
    description: "Caused by *Xanthomonas* bacteria, this disease forms dark, water-soaked lesions on leaves and fruit, thriving in wet conditions.",
    affectedCrops: ["Tomato", "Pepper", "Peach", "Plum"],
    image: images.bacterial_spot,
    quickStats: {
      severity: { level: "Medium", score: "7/10" },
      transmission: { level: "Fast", score: "8/10" },
      treatment: { level: "Low", score: "4/10" },
      impact: { level: "Medium", score: "7/10" },
    },
    symptoms: [
      {
        title: "Water-Soaked Lesions",
        description: "Small, dark, water-soaked spots appear on leaves, which may turn greasy and develop holes.",
        severity: "high",
        icon: "water-outline",
      },
      {
        title: "Scabby Fruit Spots",
        description: "Raised, scab-like spots form on fruit, which can crack and allow secondary infections.",
        severity: "critical",
        icon: "alert-circle-outline",
      },
      {
        title: "Leaf Yellowing and Drop",
        description: "Infected leaves often turn yellow and fall off, reducing the plant's ability to produce fruit.",
        severity: "moderate",
        icon: "leaf-outline",
      },
    ],
    causes: [
      {
        title: "Xanthomonas Bacteria",
        description: "Caused by several species of *Xanthomonas* bacteria that survive in seeds and plant debris.",
      },
      {
        title: "Splashing Water",
        description: "Bacteria spread from plant to plant through splashing rain or overhead irrigation.",
      },
      {
        title: "Warm, Wet Weather",
        description: "The disease is most severe during periods of high humidity and rainfall.",
      },
    ],
    prevention: [
      {
        title: "Use Clean Seed",
        description: "Start with certified disease-free seeds or transplants.",
        icon: "shield-checkmark-outline",
        difficulty: "Easy",
      },
      {
        title: "Crop Rotation",
        description: "Avoid planting susceptible crops in the same location for at least one year.",
        icon: "sync-outline",
        difficulty: "Medium",
      },
      {
        title: "Avoid Wet Foliage",
        description: "Water at the base of plants and avoid working with plants when they are wet to prevent spreading bacteria.",
        icon: "water-outline",
        difficulty: "Easy",
      },
    ],
    treatments: [
      {
        title: "Copper-Based Bactericides",
        description: "Regular application of copper sprays can help suppress the disease but will not cure it. Best used preventatively.",
        icon: "medical-outline",
        effectiveness: "Low-Moderate",
      },
      {
        title: "Sanitation",
        description: "Remove and destroy heavily infected plants and debris to reduce bacterial load.",
        icon: "trash-outline",
        effectiveness: "Low",
      },
    ],
  },
  early_blight: {
    id: "early_blight",
    name: "Early Blight",
    severity: "Medium",
    category: "Fungal Disease",
    description: "Fungal disease causing brown spots with concentric rings on lower leaves; leads to leaf drop and can reduce yield.",
    affectedCrops: ["Tomato", "Potato", "Eggplant"],
    image: images.early_blight,
    quickStats: {
      severity: { level: "Medium", score: "7/10" },
      transmission: { level: "Medium", score: "6/10" },
      treatment: { level: "Medium", score: "6/10" },
      impact: { level: "Medium", score: "7/10" },
    },
    symptoms: [
      {
        title: "Target-Like Spots",
        description: "Dark brown to black spots with concentric rings, resembling a target, appear on lower, older leaves.",
        severity: "critical",
        icon: "ellipse-outline",
      },
      {
        title: "Yellow Halo",
        description: "A yellow halo often surrounds the dark spots.",
        severity: "moderate",
        icon: "leaf-outline",
      },
      {
        title: "Stem Lesions",
        description: "Similar dark, sunken lesions can form on stems, sometimes girdling and killing young plants ('collar rot').",
        severity: "high",
        icon: "trending-down-outline",
      },
    ],
    causes: [
      {
        title: "Fungus",
        description: "Caused by the fungus *Alternaria solani*, which overwinters in soil and infected plant debris.",
      },
      {
        title: "Stressed Plants",
        description: "The disease is more severe on plants that are stressed by poor nutrition, drought, or other pests.",
      },
    ],
    prevention: [
      {
        title: "Crop Rotation",
        description: "Rotate with non-susceptible crops for at least two years.",
        icon: "sync-outline",
        difficulty: "Medium",
      },
      {
        title: "Mulching",
        description: "Apply a layer of mulch around the base of plants to prevent fungal spores from splashing up from the soil.",
        icon: "document-outline",
        difficulty: "Easy",
      },
      {
        title: "Sanitation",
        description: "Remove and dispose of infected leaves and plant debris at the end of the season.",
        icon: "trash-outline",
        difficulty: "Easy",
      },
    ],
    treatments: [
      {
        title: "Fungicides",
        description: "Apply fungicides containing copper or chlorothalonil, especially during periods of high humidity.",
        icon: "medical-outline",
        effectiveness: "High",
      },
      {
        title: "Remove Lower Leaves",
        description: "Prune the lowest 12 inches of leaves to improve air circulation and reduce initial infection.",
        icon: "cut-outline",
        effectiveness: "Moderate",
      },
    ],
  },
  late_blight: {
    id: "late_blight",
    name: "Late Blight",
    severity: "High",
    category: "Fungal-like (Oomycete)",
    description: "A fast-spreading and highly destructive disease causing dark, water-soaked lesions on leaves, stems, and fruit.",
    affectedCrops: ["Potato", "Tomato"],
    image: images.late_blight,
    quickStats: {
      severity: { level: "Critical", score: "10/10" },
      transmission: { level: "Very Fast", score: "10/10" },
      treatment: { level: "Low", score: "3/10" },
      impact: { level: "Devastating", score: "10/10" },
    },
    symptoms: [
      {
        title: "Water-Soaked Lesions",
        description: "Large, dark green to black water-soaked spots appear on leaves, often with a fuzzy white mold on the underside in humid conditions.",
        severity: "critical",
        icon: "water-outline",
      },
      {
        title: "Rapid Blight",
        description: "The disease can spread extremely quickly, turning entire leaves and stems black and killing the plant within days.",
        severity: "critical",
        icon: "flash-outline",
      },
      {
        title: "Tuber/Fruit Rot",
        description: "Causes a firm, reddish-brown rot in potato tubers and greasy, blotchy lesions on tomato fruit.",
        severity: "critical",
        icon: "alert-circle-outline",
      },
    ],
    causes: [
      {
        title: "Water Mold",
        description: "Caused by the oomycete *Phytophthora infestans*, which spreads rapidly via airborne spores.",
      },
      {
        title: "Cool, Moist Weather",
        description: "Thrives in cool, wet conditions (60-70°F / 15-21°C with high humidity), allowing for explosive spread.",
      },
    ],
    prevention: [
      {
        title: "Certified Seed",
        description: "Plant only certified disease-free seed potatoes and healthy tomato transplants.",
        icon: "shield-checkmark-outline",
        difficulty: "Easy",
      },
      {
        title: "Preventive Fungicides",
        description: "In high-risk areas, a strict schedule of preventative fungicide application is essential.",
        icon: "medical-outline",
        difficulty: "Hard",
      },
      {
        title: "Destroy Volunteers",
        description: "Remove and destroy any 'volunteer' potato or tomato plants that grow from the previous season.",
        icon: "trash-outline",
        difficulty: "Easy",
      },
    ],
    treatments: [
      {
        title: "Fungicides",
        description: "Once infection starts, it is extremely difficult to control. Specific fungicides must be applied immediately and repeatedly.",
        icon: "medical-outline",
        effectiveness: "Low-Moderate",
      },
      {
        title: "Destroy Infected Plants",
        description: "Remove and destroy infected plants immediately to try and prevent spread to healthy plants.",
        icon: "flame-outline",
        effectiveness: "Low",
      },
    ],
  },
  leaf_scorch: {
    id: "leaf_scorch",
    name: "Leaf Scorch",
    severity: "Low",
    category: "Environmental/Bacterial",
    description: "Caused by bacteria or environmental stress (like drought), leading to leaf browning from the edges inward.",
    affectedCrops: ["Grape", "Olive", "Coffee", "Elm", "Oak", "Maple"],
    image: images.leaf_scorch,
    quickStats: {
      severity: { level: "Variable", score: "5/10" },
      transmission: { level: "Variable", score: "4/10" },
      treatment: { level: "Low", score: "3/10" },
      impact: { level: "Medium", score: "6/10" },
    },
    symptoms: [
      {
        title: "Marginal Browning",
        description: "Browning, yellowing, or drying of tissue along the edges and between the veins of leaves.",
        severity: "high",
        icon: "leaf-outline",
      },
      {
        title: "Distinct Border",
        description: "Often, a clear line or a yellow halo separates the dead tissue from the healthy green tissue.",
        severity: "moderate",
        icon: "ellipse-outline",
      },
      {
        title: "Premature Leaf Drop",
        description: "In severe cases, scorched leaves may drop prematurely, weakening the tree or plant.",
        severity: "high",
        icon: "trending-down-outline",
      },
    ],
    causes: [
      {
        title: "Environmental Stress",
        description: "Insufficient water (drought), high winds, nutrient deficiency, or root damage can prevent leaves from getting enough water.",
      },
      {
        title: "Bacterial Infection",
        description: "The bacterium *Xylella fastidiosa* clogs the plant's water-conducting tissues (xylem), causing scorch symptoms.",
      },
    ],
    prevention: [
      {
        title: "Proper Watering",
        description: "Ensure plants receive adequate and consistent water, especially during hot, dry periods. Use mulch to conserve soil moisture.",
        icon: "water-outline",
        difficulty: "Easy",
      },
      {
        title: "Manage Insect Vectors",
        description: "For bacterial scorch, control insects like leafhoppers that spread the bacteria.",
        icon: "bug-outline",
        difficulty: "Hard",
      },
      {
        title: "Proper Nutrition",
        description: "Maintain plant health with appropriate fertilization to avoid nutrient-related stress.",
        icon: "leaf-outline",
        difficulty: "Medium",
      },
    ],
    treatments: [
      {
        title: "Correct Stress",
        description: "For environmental scorch, identify and fix the underlying issue (e.g., improve watering, provide windbreak).",
        icon: "build-outline",
        effectiveness: "High",
      },
      {
        title: "Prune Infected Limbs",
        description: "For bacterial scorch, pruning out symptomatic limbs can sometimes slow the disease's progression. There is no cure.",
        icon: "cut-outline",
        effectiveness: "Low",
      },
    ],
  },
  leaf_mold: {
    id: "leaf_mold",
    name: "Leaf Mold",
    severity: "Low",
    category: "Fungal Disease",
    description: "A fungal disease common on tomatoes grown in high humidity, producing olive-green mold on the underside of leaves.",
    affectedCrops: ["Tomato"],
    image: images.leaf_mold,
    quickStats: {
      severity: { level: "Low", score: "4/10" },
      transmission: { level: "Medium", score: "6/10" },
      treatment: { level: "High", score: "7/10" },
      impact: { level: "Low", score: "4/10" },
    },
    symptoms: [
      {
        title: "Yellow Spots on Top",
        description: "Pale greenish-yellow spots with indefinite borders appear on the upper surfaces of leaves.",
        severity: "moderate",
        icon: "ellipse-outline",
      },
      {
        title: "Olive-Green Mold Underneath",
        description: "Velvety, olive-green to brownish mold grows on the undersides of leaves, corresponding to the yellow spots on top.",
        severity: "critical",
        icon: "bug-outline",
      },
      {
        title: "Leaf Wilting",
        description: "Infected leaves eventually turn yellow, wilt, and drop off the plant.",
        severity: "high",
        icon: "leaf-outline",
      },
    ],
    causes: [
      {
        title: "Fungus",
        description: "Caused by the fungus *Passalora fulva* (formerly *Fulvia fulva*).",
      },
      {
        title: "High Humidity",
        description: "The disease thrives in very high relative humidity (above 85%), making it a common problem in greenhouses.",
      },
    ],
    prevention: [
      {
        title: "Improve Air Circulation",
        description: "Space plants far apart, prune lower leaves, and use fans in greenhouses to reduce humidity.",
        icon: "sunny-outline",
        difficulty: "Easy",
      },
      {
        title: "Avoid Wetting Leaves",
        description: "Water at the base of the plant to keep foliage dry.",
        icon: "water-outline",
        difficulty: "Easy",
      },
      {
        title: "Resistant Varieties",
        description: "Choose tomato varieties that are resistant to leaf mold.",
        icon: "shield-checkmark-outline",
        difficulty: "Medium",
      },
    ],
    treatments: [
      {
        title: "Fungicides",
        description: "Apply fungicides, including copper-based products, when conditions are favorable for the disease.",
        icon: "medical-outline",
        effectiveness: "High",
      },
      {
        title: "Remove Infected Leaves",
        description: "Promptly remove and destroy infected leaves to reduce the amount of fungal spores.",
        icon: "cut-outline",
        effectiveness: "Moderate",
      },
    ],
  },
  leaf_spot: {
    id: "leaf_spot",
    name: "Leaf Spot",
    severity: "Low",
    category: "Fungal/Bacterial Disease",
    description: "A general term for spots on leaves caused by various fungi or bacteria; can reduce photosynthesis but is often not severe.",
    affectedCrops: ["Strawberry", "Banana", "Bean", "Maize", "Many others"],
    image: images.leaf_spot,
    quickStats: {
      severity: { level: "Low", score: "4/10" },
      transmission: { level: "Medium", score: "5/10" },
      treatment: { level: "Medium", score: "6/10" },
      impact: { level: "Low", score: "5/10" },
    },
    symptoms: [
      {
        title: "Spots on Leaves",
        description: "Appearance of spots that can be brown, black, or tan, sometimes with a dark or colored border.",
        severity: "moderate",
        icon: "ellipse-outline",
      },
      {
        title: "Shot Hole",
        description: "The center of the spots may dry up and fall out, leaving a 'shot hole' appearance.",
        severity: "low",
        icon: "leaf-outline",
      },
      {
        title: "Minor Defoliation",
        description: "In heavier infections, some leaves may turn yellow and drop.",
        severity: "moderate",
        icon: "trending-down-outline",
      },
    ],
    causes: [
      {
        title: "Numerous Pathogens",
        description: "Caused by a wide variety of fungi (e.g., *Septoria*, *Cercospora*) and bacteria.",
      },
      {
        title: "Wet Conditions",
        description: "Most leaf spot diseases are favored by wet weather and splashing water, which spreads the pathogens.",
      },
    ],
    prevention: [
      {
        title: "Good Sanitation",
        description: "Clean up and dispose of fallen leaves and plant debris to reduce overwintering pathogens.",
        icon: "trash-outline",
        difficulty: "Easy",
      },
      {
        title: "Improve Airflow",
        description: "Properly space and prune plants to allow leaves to dry quickly.",
        icon: "sunny-outline",
        difficulty: "Easy",
      },
      {
        title: "Water at Soil Level",
        description: "Avoid overhead irrigation to prevent splashing spores onto leaves.",
        icon: "water-outline",
        difficulty: "Easy",
      },
    ],
    treatments: [
      {
        title: "Fungicides/Bactericides",
        description: "If the infection is severe, copper or other appropriate fungicides can be applied.",
        icon: "medical-outline",
        effectiveness: "Moderate",
      },
      {
        title: "Remove Infected Leaves",
        description: "For light infections, simply removing the affected leaves can be sufficient to control spread.",
        icon: "cut-outline",
        effectiveness: "High",
      },
    ],
  },
  spider_mite: {
    id: "spider_mite",
    name: "Two-Spotted Spider Mite",
    severity: "Medium",
    category: "Pest",
    description: "A common pest that sucks sap from leaves, causing yellow speckles, webbing, and potential plant death in heavy infestations.",
    affectedCrops: ["Tomato", "Bean", "Strawberry", "Cucumber", "Houseplants"],
    image: images.two_spotted_spider_mite,
    quickStats: {
      severity: { level: "High", score: "8/10" },
      transmission: { level: "Very Fast", score: "9/10" },
      treatment: { level: "Medium", score: "6/10" },
      impact: { level: "High", score: "8/10" },
    },
    symptoms: [
      {
        title: "Leaf Stippling",
        description: "Tiny yellow or white speckles appear on the upper surface of leaves where mites have been feeding.",
        severity: "high",
        icon: "ellipse-outline",
      },
      {
        title: "Fine Webbing",
        description: "Delicate, silky webs are visible on the undersides of leaves and between stems, a classic sign of spider mites.",
        severity: "critical",
        icon: "git-merge-outline",
      },
      {
        title: "Bronzing and Leaf Drop",
        description: "Heavily infested leaves may turn yellow or bronze, become dry, and fall off the plant.",
        severity: "critical",
        icon: "leaf-outline",
      },
    ],
    causes: [
      {
        title: "Arachnid Pest",
        description: "Caused by the tiny arachnid *Tetranychus urticae*, which is difficult to see with the naked eye.",
      },
      {
        title: "Hot, Dry Conditions",
        description: "Spider mite populations explode in hot, dry, and dusty environments. They reproduce very quickly.",
      },
    ],
    prevention: [
      {
        title: "Increase Humidity",
        description: "Mites dislike high humidity. Regularly misting plants can deter them.",
        icon: "water-outline",
        difficulty: "Easy",
      },
      {
        title: "Regular Inspection",
        description: "Frequently check the undersides of leaves for webbing or stippling to catch infestations early.",
        icon: "eye-outline",
        difficulty: "Easy",
      },
      {
        title: "Keep Plants Watered",
        description: "Drought-stressed plants are more susceptible to spider mites.",
        icon: "leaf-outline",
        difficulty: "Easy",
      },
    ],
    treatments: [
      {
        title: "Strong Water Spray",
        description: "Physically dislodge mites from plants with a strong jet of water, focusing on leaf undersides.",
        icon: "water-outline",
        effectiveness: "Moderate",
      },
      {
        title: "Insecticidal Soaps/Oils",
        description: "Apply horticultural oil, neem oil, or insecticidal soap, ensuring complete coverage of the plant.",
        icon: "medical-outline",
        effectiveness: "High",
      },
      {
        title: "Predatory Mites",
        description: "Introduce beneficial predatory mites that feed on spider mites for biological control.",
        icon: "bug-outline",
        effectiveness: "High",
      },
    ],
  },
  target_spot: {
    id: "target_spot",
    name: "Target Spot",
    severity: "Medium",
    category: "Fungal Disease",
    description: "A fungal disease forming circular lesions with concentric rings like a target pattern, affecting leaves, stems, and fruit.",
    affectedCrops: ["Tomato", "Cotton", "Soybean", "Pepper"],
    image: images.target_spot,
    quickStats: {
      severity: { level: "Medium", score: "6/10" },
      transmission: { level: "Medium", score: "6/10" },
      treatment: { level: "Medium", score: "6/10" },
      impact: { level: "Medium", score: "7/10" },
    },
    symptoms: [
      {
        title: "Concentric Ring Lesions",
        description: "Distinctive spots with alternating light and dark concentric rings, resembling a bullseye, appear on leaves.",
        severity: "critical",
        icon: "ellipse-outline",
      },
      {
        title: "Small, Dark Pits on Fruit",
        description: "On tomatoes and peppers, the disease can cause small, pitted, dark lesions on the fruit itself.",
        severity: "high",
        icon: "alert-circle-outline",
      },
      {
        title: "Leaf Yellowing",
        description: "The area around the spots may turn yellow, and heavily infected leaves may drop.",
        severity: "moderate",
        icon: "leaf-outline",
      },
    ],
    causes: [
      {
        title: "Fungus",
        description: "Caused by the fungus *Corynespora cassiicola*.",
      },
      {
        title: "Warm, Humid Weather",
        description: "The disease is favored by prolonged periods of high humidity and warm temperatures.",
      },
    ],
    prevention: [
      {
        title: "Improve Air Circulation",
        description: "Stake, prune, and properly space plants to promote airflow and reduce leaf wetness.",
        icon: "sunny-outline",
        difficulty: "Easy",
      },
      {
        title: "Crop Rotation",
        description: "Rotate crops with non-susceptible plants to break the disease cycle in the soil.",
        icon: "sync-outline",
        difficulty: "Medium",
      },
      {
        title: "Avoid Overhead Watering",
        description: "Use drip irrigation or soaker hoses to keep foliage dry.",
        icon: "water-outline",
        difficulty: "Easy",
      },
    ],
    treatments: [
      {
        title: "Apply Fungicides",
        description: "Application of appropriate fungicides can effectively manage the disease, especially when started early.",
        icon: "medical-outline",
        effectiveness: "High",
      },
      {
        title: "Remove Debris",
        description: "Clean up and destroy infected plant debris at the end of the season to reduce fungal spores.",
        icon: "trash-outline",
        effectiveness: "Moderate",
      },
    ],
  },
  mosaic_virus: {
    id: "mosaic_virus",
    name: "Mosaic Virus",
    severity: "High",
    category: "Viral Disease",
    description: "A viral disease causing mottled, distorted leaves with light and dark green patches. It is easily spread and has no cure.",
    affectedCrops: ["Tobacco", "Cucumber", "Tomato", "Pepper", "Squash"],
    image: images.mosaic_virus,
    quickStats: {
      severity: { level: "High", score: "8/10" },
      transmission: { level: "Very Fast", score: "9/10" },
      treatment: { level: "None", score: "1/10" },
      impact: { level: "High", score: "8/10" },
    },
    symptoms: [
      {
        title: "Leaf Mottling",
        description: "A characteristic mosaic pattern of light green, yellow, and dark green patches on the leaves.",
        severity: "critical",
        icon: "leaf-outline",
      },
      {
        title: "Distorted Growth",
        description: "Leaves may be curled, puckered, or otherwise deformed. The overall plant is often stunted.",
        severity: "high",
        icon: "trending-down-outline",
      },
      {
        title: "Reduced Yield",
        description: "Infected plants produce fewer and lower quality fruits, which may also show mottling or bumps.",
        severity: "critical",
        icon: "bar-chart-outline",
      },
    ],
    causes: [
      {
        title: "Plant Viruses",
        description: "Caused by numerous viruses, such as Tobacco Mosaic Virus (TMV) and Cucumber Mosaic Virus (CMV).",
      },
      {
        title: "Mechanical Transmission",
        description: "The virus spreads easily on contaminated hands, tools, and clothing.",
      },
      {
        title: "Insect Vectors",
        description: "Pests like aphids can transmit the virus from an infected plant to a healthy one as they feed.",
      },
    ],
    prevention: [
      {
        title: "Wash Hands and Tools",
        description: "Thoroughly wash hands with soap and water and disinfect tools between working on different plants.",
        icon: "hand-left-outline",
        difficulty: "Easy",
      },
      {
        title: "Control Insect Pests",
        description: "Manage aphid populations to prevent the spread of the virus.",
        icon: "bug-outline",
        difficulty: "Medium",
      },
      {
        title: "Remove Infected Plants",
        description: "Immediately remove and destroy any plant showing symptoms to prevent it from infecting others.",
        icon: "trash-outline",
        difficulty: "Easy",
      },
    ],
    treatments: [
      {
        title: "No Cure",
        description: "There is no treatment for viral diseases in plants. Prevention is the only method of control.",
        icon: "close-circle-outline",
        effectiveness: "None",
      },
    ],
  },
  leaf_curl_virus: {
    id: "leaf_curl_virus",
    name: "Leaf Curl Virus",
    severity: "High",
    category: "Viral Disease",
    description: "A severe viral infection, typically spread by whiteflies, leading to curling, yellowing, and stunted leaf growth.",
    affectedCrops: ["Tomato", "Chili", "Cotton", "Papaya"],
    image: images.leaf_curl_virus,
    quickStats: {
      severity: { level: "High", score: "9/10" },
      transmission: { level: "Fast", score: "9/10" },
      treatment: { level: "None", score: "1/10" },
      impact: { level: "Severe", score: "9/10" },
    },
    symptoms: [
      {
        title: "Upward Leaf Curling",
        description: "Leaves, especially younger ones, curl strongly upwards, becoming thickened and brittle.",
        severity: "critical",
        icon: "trending-up-outline",
      },
      {
        title: "Vein Clearing & Yellowing",
        description: "The veins of the leaves may turn yellow, and the overall leaf may become pale or yellow.",
        severity: "high",
        icon: "leaf-outline",
      },
      {
        title: "Severe Stunting",
        description: "The entire plant is severely stunted, with shortened internodes, leading to a bushy but unproductive plant.",
        severity: "critical",
        icon: "resize-outline",
      },
    ],
    causes: [
      {
        title: "Geminiviruses",
        description: "Caused by a group of viruses called geminiviruses.",
      },
      {
        title: "Whitefly Vector",
        description: "The primary method of transmission is through the feeding of the silverleaf whitefly (*Bemisia tabaci*).",
      },
    ],
    prevention: [
      {
        title: "Control Whiteflies",
        description: "Use yellow sticky traps, insecticidal soaps, or reflective mulch to manage whitefly populations.",
        icon: "bug-outline",
        difficulty: "Hard",
      },
      {
        title: "Use Resistant Varieties",
        description: "Plant tomato or chili varieties that have been bred for resistance to leaf curl virus.",
        icon: "shield-checkmark-outline",
        difficulty: "Medium",
      },
      {
        title: "Remove Infected Plants",
        description: "Promptly identify, remove, and destroy infected plants to reduce the source of the virus.",
        icon: "trash-outline",
        difficulty: "Easy",
      },
    ],
    treatments: [
      {
        title: "No Cure",
        description: "There is no chemical treatment that can cure a plant once it is infected with a virus. All efforts must focus on prevention.",
        icon: "close-circle-outline",
        effectiveness: "None",
      },
    ],
  },
};

export const getDiseaseById = (id: string): DiseaseData | null => {
  return diseaseDatabase[id] || null;
};

export const getDiseaseNameAndDescription = (id: string): { name: string; description: string } | null => {
  const disease = diseaseDatabase[id];
  if (!disease) {
    return null;
  }
  return {
    name: disease.name,
    description: disease.description
  };
};

export const getAllDiseases = (): DiseaseData[] => {
  return Object.values(diseaseDatabase);
};