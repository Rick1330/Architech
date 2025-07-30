'use server'

import { optimizeDesign } from '@/ai/flows/design-optimization';
import type { OptimizeDesignInput, OptimizeDesignOutput } from '@/ai/flows/design-optimization';

export async function getDesignSuggestions(input: OptimizeDesignInput): Promise<OptimizeDesignOutput> {
  try {
    const result = await optimizeDesign(input);
    return result;
  } catch (error) {
    console.error("Error in getDesignSuggestions action:", error);
    return { suggestions: "An error occurred while generating suggestions. Please check the server logs." };
  }
}
