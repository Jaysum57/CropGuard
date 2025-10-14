import { diseaseCache } from "../lib/diseaseCache";
import { supabase } from "../lib/supabase";

export interface DiseaseData {
  id: string;
  name: string;
  severity: "Low" | "Medium" | "High";
  category: string;
  description: string;
  affectedCrops: string[];
  image: string;  // Changed to string for image_url
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

const transformDiseaseData = (data: any): DiseaseData => ({
  id: data.id,
  name: data.name,
  severity: data.severity as "Low" | "Medium" | "High",
  category: data.category,
  description: data.description,
  image: data.image_url,
  affectedCrops: data.affected_crops || [],
  quickStats: data.quick_stats,
  symptoms: data.symptoms || [],
  causes: data.causes || [],
  prevention: data.prevention || [],
  treatments: data.treatments || []
});

export const getAllDiseases = async (category?: string): Promise<DiseaseData[]> => {
  try {
    // Check cache first (only for "All" category or no category)
    if (!category || category === "All") {
      const cachedDiseases = diseaseCache.getAllDiseases();
      if (cachedDiseases) {
        console.log('Using cached disease data');
        return cachedDiseases;
      }
    }

    console.log('Fetching diseases from database');
    let query = supabase
      .from('disease_data')
      .select('*');
    
    // If category is provided and not "All", filter by category
    if (category && category !== "All") {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching diseases:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    const transformedData = data.map(transformDiseaseData);
    
    // Cache the results (only for "All" category or no category)
    if (!category || category === "All") {
      diseaseCache.setAllDiseases(transformedData);
    }

    return transformedData;
  } catch (error) {
    console.error('Error in getAllDiseases:', error);
    return [];
  }
};

export const getDiseaseById = async (id: string): Promise<DiseaseData | null> => {
  try {
    // Check cache first
    const cachedDisease = diseaseCache.getDisease<DiseaseData>(id);
    if (cachedDisease) {
      console.log(`Using cached disease data for ${id}`);
      return cachedDisease;
    }

    console.log(`Fetching disease ${id} from database`);
    const { data, error } = await supabase
      .from('disease_data')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching disease:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    const transformedData = transformDiseaseData(data);
    
    // Cache the result
    diseaseCache.setDisease(transformedData);

    return transformedData;
  } catch (error) {
    console.error('Error in getDiseaseById:', error);
    return null;
  }
};

/**
 * Clear all cached disease data
 * Useful when you need to force refresh from database
 */
export const clearDiseaseCache = () => {
  diseaseCache.clear();
  console.log('Disease cache cleared');
};

/**
 * Get cache statistics for debugging
 */
export const getCacheStats = () => {
  return diseaseCache.getStats();
};

