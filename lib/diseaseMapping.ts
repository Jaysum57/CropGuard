/**
 * Disease Mapping Configuration
 * 
 * This file maps model prediction names to database disease IDs.
 * 
 * When adding a new disease:
 * 1. Add the disease ID to your Supabase disease_data table
 * 2. Add mapping entries here for all possible model prediction variations
 * 3. The system will automatically handle routing and lookups
 */

// Type for the mapping structure
export interface DiseaseMapping {
  [predictionName: string]: string | null; // null means "healthy" - no disease
}

/**
 * Maps model prediction names to database disease IDs
 * 
 * Key: The exact prediction name from the model (without plant name)
 * Value: The disease_id in the Supabase disease_data table (or null for healthy)
 */
export const DISEASE_MAPPING: DiseaseMapping = {
  // Apple diseases
  "Apple_scab": "scab",
  "Apple scab": "scab", // Space variant
  "Black_rot": "black_rot",
  "Black rot": "black_rot", // Space variant
  "Cedar_apple_rust": "rust",
  "Cedar apple rust": "rust", // Space variant
  "healthy": null,
  
  // Blueberry
  // (no diseases, only healthy)
  
  // Cherry
  "Powdery_mildew": "powdery_mildew",
  "Powdery mildew": "powdery_mildew", // Space variant
  
  // Corn (maize)
  "Cercospora_leaf_spot Gray_leaf_spot": "gray_leaf_spot",
  "Cercospora leaf spot Gray leaf spot": "gray_leaf_spot", // Space variant
  "Common_rust_": "rust",
  "Common rust": "rust", // Space variant
  "Northern_Leaf_Blight": "late_blight", // Mapped to late_blight as similar disease
  "Northern Leaf Blight": "late_blight", // Alternative format (with spaces)
  
  // Grape
  "Esca_(Black_Measles)": "black_rot", // Mapped to black_rot (fungal disease)
  "Leaf_blight_(Isariopsis_Leaf_Spot)": "leaf_spot",
  
  // Orange
  "Haunglongbing_(Citrus_greening)": "citrus_greening",
  
  // Peach
  "Bacterial_spot": "bacterial_spot",
  "Bacterial spot": "bacterial_spot", // Space variant
  
  // Pepper
  // Uses "Bacterial_spot" mapping above
  
  // Potato
  "Early_blight": "early_blight",
  "Early blight": "early_blight", // Space variant
  "Early Blight": "early_blight", // Capital B variant
  "Late_blight": "late_blight",
  "Late blight": "late_blight", // Space variant
  "Late Blight": "late_blight", // Capital B variant
  
  // Raspberry
  // (no diseases, only healthy)
  
  // Soybean
  // (no diseases, only healthy)
  
  // Squash
  // Uses "Powdery_mildew" mapping above
  
  // Strawberry
  "Leaf_scorch": "leaf_scorch",
  "Leaf scorch": "leaf_scorch", // Space variant
  
  // Tomato
  "Leaf_Mold": "leaf_mold",
  "Leaf Mold": "leaf_mold", // Space variant
  "Septoria_leaf_spot": "leaf_spot",
  "Septoria leaf spot": "leaf_spot", // Space variant
  "Spider_mites Two-spotted_spider_mite": "spider_mite",
  "Spider mites Two-spotted spider mite": "spider_mite", // Space variant
  "Target_Spot": "target_spot",
  "Target Spot": "target_spot", // Space variant
  "Tomato_mosaic_virus": "mosaic_virus",
  "Tomato mosaic virus": "mosaic_virus", // Space variant
  "Tomato_Yellow_Leaf_Curl_Virus": "leaf_curl_virus",
  "Tomato Yellow Leaf Curl Virus": "leaf_curl_virus", // Space variant
};

/**
 * Extracts the disease name from a full model prediction string
 * 
 * Examples:
 * - "Apple___Apple_scab" -> "Apple_scab"
 * - "Tomato___healthy" -> "healthy"
 * - "Corn_(maize)___Common_rust_" -> "Common_rust_"
 * - "Corn(Maize) Northern Leaf Blight" -> "Northern Leaf Blight" (handles space separator)
 * - "Tomato - Early blight" -> "Early blight" (handles hyphen separator - from formatted display)
 * 
 * @param predictionName - The full prediction name from the model
 * @returns The disease portion without the plant name
 */
export function extractDiseaseName(predictionName: string): string {
  console.log('🔍 [MAPPING] Input prediction:', predictionName);
  
  // Quick check: if prediction contains "healthy" (case-insensitive), return "healthy"
  if (predictionName.toLowerCase().includes('healthy')) {
    console.log('🔍 [MAPPING] Detected "healthy" in prediction, returning "healthy"');
    return 'healthy';
  }
  
  // Try splitting by '___' (three underscores) first - this is the expected format
  let parts = predictionName.split('___');
  
  // If no ___ found, try alternative formats
  if (parts.length === 1) {
    // Check for hyphen separator (e.g., "Tomato - Early blight") - from formatted display names
    if (predictionName.includes(' - ')) {
      parts = predictionName.split(' - ');
      console.log('🔍 [MAPPING] Used hyphen separator extraction');
    }
    // Check if it matches pattern like "Corn(maize)DiseaseName" - parenthesis without space
    else if (predictionName.match(/^[^)]+\)(.+)$/)) {
      const match = predictionName.match(/^[^)]+\)(.+)$/);
      if (match && match[1]) {
        parts = ['plant', match[1].trim()]; // Trim to remove leading/trailing spaces
        console.log('🔍 [MAPPING] Used parenthesis (no space) extraction pattern');
      }
    }
    // Check if it matches pattern like "Corn(Maize) Disease Name" or "Plant Disease Name"
    else {
      // Look for closing parenthesis followed by space, or just plant name followed by space
      const match = predictionName.match(/^[^)]+\)\s+(.+)$/) || // Pattern: PlantName(...) DiseaseName
                    predictionName.match(/^[A-Z][a-z]+\s+(.+)$/); // Pattern: PlantName DiseaseName
      
      if (match && match[1]) {
        parts = ['plant', match[1].trim()]; // Trim to remove leading/trailing spaces
        console.log('🔍 [MAPPING] Used alternative extraction pattern');
      }
    }
  }
  
  // Return the disease part (second part), or the whole string if no separator found
  // Always trim the result to handle any leading/trailing spaces
  const extracted = (parts.length > 1 ? parts[1] : predictionName).trim();
  
  console.log('🔍 [MAPPING] Extracted disease name:', extracted);
  
  return extracted;
}

/**
 * Maps a model prediction to a database disease ID
 * 
 * @param predictionName - The full prediction name from the model (e.g., "Apple___Apple_scab")
 * @returns The disease_id from the database, or null if healthy/not found
 */
export function mapPredictionToDiseaseId(predictionName: string): string | null {
  // Extract just the disease portion
  const diseaseName = extractDiseaseName(predictionName);
  
  // Look up in mapping (exact match first)
  let diseaseId = DISEASE_MAPPING[diseaseName];
  
  console.log('🗺️ [MAPPING] Looking up:', diseaseName);
  
  // If no exact match, try case-insensitive lookup
  if (diseaseId === undefined) {
    const lowerCaseName = diseaseName.toLowerCase();
    const matchingKey = Object.keys(DISEASE_MAPPING).find(
      key => key.toLowerCase() === lowerCaseName
    );
    
    if (matchingKey) {
      diseaseId = DISEASE_MAPPING[matchingKey];
      console.log('🗺️ [MAPPING] Found via case-insensitive match:', matchingKey, '→', diseaseId);
    }
  }
  
  console.log('🗺️ [MAPPING] Found disease ID:', diseaseId !== undefined ? diseaseId : 'NOT FOUND');
  
  if (diseaseId === undefined) {
    console.warn('⚠️ [MAPPING] No mapping found for:', diseaseName);
    console.warn('⚠️ [MAPPING] Full prediction was:', predictionName);
    console.warn('⚠️ [MAPPING] Trying to match (case-insensitive)...');
    
    // Show similar keys for debugging
    const similarKeys = Object.keys(DISEASE_MAPPING).filter(key => 
      key.toLowerCase().includes(diseaseName.toLowerCase().split(' ')[0]) ||
      diseaseName.toLowerCase().includes(key.toLowerCase().split(' ')[0])
    );
    
    if (similarKeys.length > 0) {
      console.warn('⚠️ [MAPPING] Similar keys found:', similarKeys.join(', '));
    } else {
      console.warn('⚠️ [MAPPING] First 10 available keys:', Object.keys(DISEASE_MAPPING).slice(0, 10).join(', '), '...');
    }
  }
  
  // Return the mapped ID, or null if not found (treat as healthy)
  return diseaseId !== undefined ? diseaseId : null;
}

/**
 * Checks if a prediction indicates a healthy plant
 * 
 * @param predictionName - The full prediction name from the model
 * @returns true if the prediction is for a healthy plant
 */
export function isHealthyPrediction(predictionName: string): boolean {
  const diseaseId = mapPredictionToDiseaseId(predictionName);
  return diseaseId === null;
}

/**
 * Gets a user-friendly display name for a prediction (full name with plant)
 * 
 * @param predictionName - The full prediction name from the model
 * @returns A formatted, readable name
 */
export function getDisplayName(predictionName: string): string {
  return predictionName
    .replace(/___/g, ' - ')        // Replace ___ with separator
    .replace(/_/g, ' ')              // Replace _ with spaces
    .replace(/\(.*?\)/g, '')         // Remove parentheses content
    .replace(/\s+/g, ' ')            // Clean up multiple spaces
    .trim()
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
}

/**
 * Gets only the disease name portion, formatted for display
 * Example: "Apple___Apple_scab" -> "Apple Scab"
 *          "Tomato___Early_blight" -> "Early Blight"
 *          "Corn___healthy" -> "Healthy"
 * 
 * @param predictionName - The full prediction name from the model
 * @returns Just the disease name, formatted and capitalized
 */
export function getDiseaseDisplayName(predictionName: string): string {
  const diseaseName = extractDiseaseName(predictionName);
  
  return diseaseName
    .replace(/_/g, ' ')              // Replace _ with spaces
    .replace(/\(.*?\)/g, '')         // Remove parentheses content
    .replace(/\s+/g, ' ')            // Clean up multiple spaces
    .trim()
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
}

/**
 * Helper to get routing information for a prediction
 * 
 * @param predictionName - The full prediction name from the model
 * @returns Object with diseaseId, isRoutable flag, and disease name only (without plant name)
 */
export function getRoutingInfo(predictionName: string): {
  diseaseId: string | null;
  isRoutable: boolean;
  displayName: string;
} {
  console.log('📍 [ROUTING] Getting routing info for:', predictionName);
  
  const diseaseId = mapPredictionToDiseaseId(predictionName);
  const displayName = getDiseaseDisplayName(predictionName); // Use disease name only
  
  const routingInfo = {
    diseaseId,
    isRoutable: diseaseId !== null, // Only routable if there's a disease ID
    displayName,
  };
  
  console.log('📍 [ROUTING] Result:', routingInfo);
  
  return routingInfo;
}
