
'use server';

/**
 * @fileOverview AI-powered design optimization flow.
 *
 * This file defines a Genkit flow that analyzes a system architecture based on
 * simulation metrics and suggests potential improvements for better performance
 * and resilience. It serves as an AI assistant to the user, providing actionable
 * feedback on their designs.
 *
 * @exports optimizeDesign - The main function to trigger the design optimization flow.
 * @exports OptimizeDesignInput - The Zod schema type for the flow's input.
 * @exports OptimizeDesignOutput - The Zod schema type for the flow's output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Defines the input schema for the design optimization flow.
 * This structure is used to provide the AI with the necessary context about the system.
 */
const OptimizeDesignInputSchema = z.object({
  systemArchitecture: z
    .string()
    .describe('A detailed text description of the system architecture, including all components (e.g., services, databases, load balancers) and their connections.'),
  performanceMetrics: z
    .string()
    .describe(
      'A summary of key performance metrics from a simulation of the system architecture. This should include data like average latency, requests per second (throughput), and error rates.'
    ),
  resilienceMetrics: z
    .string()
    .describe('A summary of resilience metrics from a simulation, such as results from fault injection tests, chaos engineering experiments, or uptime statistics.'),
});

export type OptimizeDesignInput = z.infer<typeof OptimizeDesignInputSchema>;

/**
 * Defines the output schema for the design optimization flow.
 * This ensures the AI returns data in a structured, predictable format.
 */
const OptimizeDesignOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'A clear, actionable list of optimization suggestions based on the provided data. The output should be formatted in Markdown for readability.'
    ),
});

export type OptimizeDesignOutput = z.infer<typeof OptimizeDesignOutputSchema>;

/**
 * The main server action to trigger the design optimization flow.
 * This function is called from the client-side components.
 *
 * @param {OptimizeDesignInput} input - The input data for the design optimization flow.
 * @returns {Promise<OptimizeDesignOutput>} A promise that resolves with the optimization suggestions.
 */
export async function optimizeDesign(input: OptimizeDesignInput): Promise<
  OptimizeDesignOutput
> {
  return optimizeDesignFlow(input);
}

/**
 * Defines the prompt for the AI model.
 * This template instructs the AI on its role, the context it will receive,
 * and the kind of output it should generate. Handlebars syntax `{{...}}` is used for templating.
 */
const optimizeDesignPrompt = ai.definePrompt({
  name: 'optimizeDesignPrompt',
  input: {schema: OptimizeDesignInputSchema},
  output: {schema: OptimizeDesignOutputSchema},
  prompt: `You are an expert AI Design Assistant for distributed systems. Your task is to analyze a system architecture and its simulation results to provide clear, actionable suggestions for optimization.

  Carefully analyze the provided system architecture description, performance metrics, and resilience metrics.
  Based on this data, suggest concrete improvements to enhance performance, resilience, and cost-effectiveness.

  System Architecture:
  {{systemArchitecture}}

  Performance Metrics:
  {{performanceMetrics}}

  Resilience Metrics:
  {{resilienceMetrics}}

  Based on this information, what specific steps can be taken to optimize the system? Your suggestions should be practical and well-explained. Consider aspects such as:
  *   Load balancing strategies (e.g., Round Robin, Least Connections)
  *   Caching mechanisms (e.g., introducing a cache, changing eviction policies)
  *   Database optimizations (e.g., read replicas, connection pooling)
  *   Redundancy and High Availability (e.g., adding more instances)
  *   Fault tolerance patterns (e.g., Circuit Breaker, Retries with exponential backoff)
  *   Asynchronous Communication (e.g., using a message queue for decoupling)

  Return your suggestions in a well-organized, easy-to-understand format. Use markdown for formatting, including headers, bullet points, and code blocks where appropriate.
  `,
});

/**
 * Defines the Genkit flow for optimizing a system design.
 * This flow orchestrates the call to the AI model using the defined prompt.
 */
const optimizeDesignFlow = ai.defineFlow(
  {
    name: 'optimizeDesignFlow',
    inputSchema: OptimizeDesignInputSchema,
    outputSchema: OptimizeDesignOutputSchema,
  },
  async (input) => {
    // Execute the prompt with the given input.
    const {output} = await optimizeDesignPrompt(input);
    // Return the structured output from the AI model.
    return output!;
  }
);
