import { supabase } from "../lib/supabase";

export interface DiseaseData {
  id: string;
  name: string;
  severity: "Low" | "Medium" | "High";
  category: string;
  description: string;
  affectedCrops: string[];
  image_url: string;
  quickStats?: {
    severity: { level: string; score: string };
    transmission: { level: string; score: string };
    treatment: { level: string; score: string };
    impact: { level: string; score: string };
  };
  symptoms: Array<{
    title: string;
    description: string;
    severity: "critical" | "high" | "moderate" | "low";
    icon: string;
  }>;
  causes: Array<{
    title: string;
    description: string;
  }>;
  prevention: Array<{
    title: string;
    description: string;
    icon: string;
    difficulty?: string;
  }>;
  treatments: Array<{
    title: string;
    description: string;
    icon: string;
    effectiveness: string;
  }>;
}

export const categories = ["All", "Fungal", "Bacterial", "Viral", "Pest"];

// Cache for diseases data
let diseasesCache: DiseaseData[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch all diseases from Supabase database
 */
export async function getAllDiseases(): Promise<DiseaseData[]> {
  // Check cache first
  if (diseasesCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    return diseasesCache;
  }

  try {
    const { data, error } = await supabase
      .from('disease_data')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching diseases:', error);
      return [];
    }

    // Transform the data to match our interface
    const transformedData: DiseaseData[] = data.map(disease => ({
      id: disease.id,
      name: disease.name,
      severity: disease.severity,
      category: disease.category,
      description: disease.description,
      affectedCrops: Array.isArray(disease.affected_crops) 
        ? disease.affected_crops 
        : JSON.parse(disease.affected_crops || '[]'),
      image_url: disease.image_url,
      quickStats: disease.quick_stats,
      symptoms: disease.symptoms || [],
      causes: disease.causes || [],
      prevention: disease.prevention || [],
      treatments: disease.treatments || []
    }));

    // Update cache
    diseasesCache = transformedData;
    cacheTimestamp = Date.now();

    return transformedData;
  } catch (error) {
    console.error('Error in getAllDiseases:', error);
    return [];
  }
}

/**
 * Get a specific disease by ID
 */
export async function getDiseaseById(id: string): Promise<DiseaseData | null> {
  try {
    const { data, error } = await supabase
      .from('disease_data')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching disease by ID:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Transform the data to match our interface
    return {
      id: data.id,
      name: data.name,
      severity: data.severity,
      category: data.category,
      description: data.description,
      affectedCrops: Array.isArray(data.affected_crops) 
        ? data.affected_crops 
        : JSON.parse(data.affected_crops || '[]'),
      image_url: data.image_url,
      quickStats: data.quick_stats,
      symptoms: data.symptoms || [],
      causes: data.causes || [],
      prevention: data.prevention || [],
      treatments: data.treatments || []
    };
  } catch (error) {
    console.error('Error in getDiseaseById:', error);
    return null;
  }
}

/**
 * Search diseases by name or description
 */
export async function searchDiseases(query: string): Promise<DiseaseData[]> {
  try {
    const { data, error } = await supabase
      .from('disease_data')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name');

    if (error) {
      console.error('Error searching diseases:', error);
      return [];
    }

    // Transform the data to match our interface
    return data.map(disease => ({
      id: disease.id,
      name: disease.name,
      severity: disease.severity,
      category: disease.category,
      description: disease.description,
      affectedCrops: Array.isArray(disease.affected_crops) 
        ? disease.affected_crops 
        : JSON.parse(disease.affected_crops || '[]'),
      image_url: disease.image_url,
      quickStats: disease.quick_stats,
      symptoms: disease.symptoms || [],
      causes: disease.causes || [],
      prevention: disease.prevention || [],
      treatments: disease.treatments || []
    }));
  } catch (error) {
    console.error('Error in searchDiseases:', error);
    return [];
  }
}

/**
 * Get diseases by category
 */
export async function getDiseasesByCategory(category: string): Promise<DiseaseData[]> {
  if (category === "All") {
    return getAllDiseases();
  }

  try {
    const { data, error } = await supabase
      .from('disease_data')
      .select('*')
      .ilike('category', `%${category}%`) // Changed from .eq to .ilike for substring matching
      .order('name');

    if (error) {
      console.error('Error fetching diseases by category:', error);
      return [];
    }

    // Transform the data to match our interface
    return data.map(disease => ({
      id: disease.id,
      name: disease.name,
      severity: disease.severity,
      category: disease.category,
      description: disease.description,
      affectedCrops: Array.isArray(disease.affected_crops) 
        ? disease.affected_crops 
        : JSON.parse(disease.affected_crops || '[]'),
      image_url: disease.image_url,
      quickStats: disease.quick_stats,
      symptoms: disease.symptoms || [],
      causes: disease.causes || [],
      prevention: disease.prevention || [],
      treatments: disease.treatments || []
    }));
  } catch (error) {
    console.error('Error in getDiseasesByCategory:', error);
    return [];
  }
}

/**
 * Clear the diseases cache (useful for refreshing data)
 */
export function clearDiseasesCache(): void {
  diseasesCache = null;
  cacheTimestamp = null;
}