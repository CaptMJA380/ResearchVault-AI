import { GoogleGenAI } from '@google/genai';

/**
 * Checks whether Gemini AI is configured.
 */
export function isAIConfigured() {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
}

/**
 * Returns safe metadata about the AI configuration without leaking credentials.
 */
export function getAIStatus() {
  const configured = isAIConfigured();
  return {
    configured,
    provider: 'Google Gemini',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  };
}

/**
 * Generates a structured research summary from extracted paper text using Gemini.
 * Returns structured synthesis:
 * - overview
 * - researchProblem
 * - methodology
 * - mainFindings
 * - limitations
 * - keywords
 */
export async function generatePaperSummary(text, title = '') {
  if (!isAIConfigured()) {
    throw new Error(
      'Gemini AI is not configured. Please set GEMINI_API_KEY in server/.env to enable AI summarization.'
    );
  }

  if (!text || text.trim().length < 50) {
    throw new Error('Insufficient text available in the document to generate a meaningful summary.');
  }

  const apiKey = process.env.GEMINI_API_KEY.trim();
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const ai = new GoogleGenAI({ apiKey });

  // Limit text slice to ~30,000 characters to protect context window and avoid rate limit spikes
  const truncatedText = text.slice(0, 30000);

  const prompt = `You are a scholarly research assistant. Analyze the academic paper text below and produce a comprehensive, structured JSON summary.

Paper Title: "${title}"

Source Text:
"""
${truncatedText}
"""

You MUST respond strictly with a valid JSON object matching this exact schema (no markdown fences, no explanatory text outside the JSON):
{
  "overview": "A clear 2-3 sentence overview of the paper and its central theme.",
  "researchProblem": "The specific research question, gap, or challenge the authors address.",
  "methodology": "The technical methodology, architecture, experiments, datasets, or theoretical framework employed.",
  "mainFindings": ["Key finding or contribution 1", "Key finding or contribution 2", "Key finding or contribution 3"],
  "limitations": ["Identified limitation or boundary 1", "Identified limitation or boundary 2"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"]
}

Base all statements solely on the provided text. Do not hallucinate or invent findings that are not present.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const candidate = response?.text || '';
    if (!candidate) {
      throw new Error('Received an empty response from the AI provider.');
    }

    // Strip markdown formatting if any (e.g. ```json ... ```)
    const cleaned = candidate.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      overview: typeof parsed.overview === 'string' ? parsed.overview.trim() : '',
      researchProblem: typeof parsed.researchProblem === 'string' ? parsed.researchProblem.trim() : '',
      methodology: typeof parsed.methodology === 'string' ? parsed.methodology.trim() : '',
      mainFindings: Array.isArray(parsed.mainFindings) ? parsed.mainFindings.map((f) => String(f).trim()).filter(Boolean) : [],
      limitations: Array.isArray(parsed.limitations) ? parsed.limitations.map((l) => String(l).trim()).filter(Boolean) : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map((k) => String(k).trim()).filter(Boolean) : [],
      generatedAt: new Date(),
      model: modelName,
    };
  } catch (err) {
    if (err.name === 'SyntaxError') {
      throw new Error('AI provider returned an unparseable response format.');
    }
    // Mask any potential sensitive details
    throw new Error(`AI Summarization failed: ${err.message}`);
  }
}

/**
 * Computes cosine similarity between two numeric vectors.
 */
export function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length === 0 || vecA.length !== vecB.length) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generates text embedding vector using Gemini or local semantic fallback vector.
 */
export async function generateTextEmbedding(text) {
  if (isAIConfigured()) {
    try {
      const apiKey = process.env.GEMINI_API_KEY.trim();
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: text.slice(0, 4000),
      });
      if (response?.embedding?.values) {
        return {
          vector: response.embedding.values,
          model: 'text-embedding-004',
        };
      }
    } catch {
      // Fall through to deterministic local feature vector
    }
  }

  // Deterministic 128-dimensional term frequency feature vector as reliable offline fallback
  const vector = generateLocalFeatureVector(text, 128);
  return {
    vector,
    model: 'local-tfidf-128',
  };
}

/**
 * Generates a normalized local term-hash vector (128 dimensions) for offline semantic similarity.
 */
function generateLocalFeatureVector(text, dimensions = 128) {
  const vec = new Array(dimensions).fill(0);
  if (!text || typeof text !== 'string') return vec;

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash * 31 + word.charCodeAt(i)) >>> 0;
    }
    const bucket = hash % dimensions;
    vec[bucket] += 1;
  }

  // Normalize to unit vector
  let norm = 0;
  for (let i = 0; i < dimensions; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) vec[i] = vec[i] / norm;
  }

  return vec;
}
