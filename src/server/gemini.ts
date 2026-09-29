import { GoogleGenAI, Type } from '@google/genai';
import { CONFIG } from './config.js';
import { cleanJsonString, validateQuizStructure, QuizQuestion } from './validators.js';

let aiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!CONFIG.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }

  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: CONFIG.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export function isGeminiConfigured(): boolean {
  return Boolean(CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
}

/**
 * Resilient content generator that handles transient 503 high-demand surges
 * by gracefully retrying and falling back to alternative valid flash tier models.
 */
async function generateSafeContent(
  options: Parameters<GoogleGenAI['models']['generateContent']>[0]
) {
  const ai = getGeminiClient();
  const modelsToAttempt = [
    options.model || CONFIG.GEMINI_MODEL,
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
  ];

  let lastError: unknown;
  for (const modelCandidate of modelsToAttempt) {
    try {
      const result = await ai.models.generateContent({
        ...options,
        model: modelCandidate,
      });
      return result;
    } catch (err: unknown) {
      lastError = err;
      const errStr = err instanceof Error ? err.message : JSON.stringify(err);
      const isTransient =
        errStr.includes('503') ||
        errStr.includes('high demand') ||
        errStr.includes('UNAVAILABLE') ||
        errStr.includes('RESOURCE_EXHAUSTED') ||
        errStr.includes('spikes in demand');

      if (isTransient) {
        console.warn(`[EduGenie AI] Model ${modelCandidate} transient surge. Attempting fallback...`);
        await new Promise((resolve) => setTimeout(resolve, 600));
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

/**
 * 1. Q&A Service
 */
export async function askQuestion(questionText: string): Promise<string> {
  const prompt = `You are EduGenie, an AI-powered educational assistant designed to help students understand concepts clearly and learn effectively.

Answer the student's educational question clearly and accurately.

Question:
${questionText}

Requirements:
- Explain in simple language.
- Give examples where useful.
- Use bullet points when appropriate.
- Mention important details.
- Do not invent information.
- If the question is ambiguous, clearly state what is unclear.
- Maintain a supportive, encouraging, and educational tone.`;

  const response = await generateSafeContent({
    model: CONFIG.GEMINI_MODEL,
    contents: prompt,
    config: {
      temperature: 0.4,
    },
  });

  const answer = response.text?.trim() || '';
  if (!answer) {
    throw new Error('EduGenie was unable to generate an answer. Please try again.');
  }
  return answer;
}

export interface ExplanationResult {
  answer: string;
  sections: {
    definition: string;
    coreConcept: string;
    stepByStep: string[];
    practicalExample: string;
    importantPoints: string[];
    commonMistakes: string[];
    quickRecap: string;
  };
}

/**
 * 2. Concept Explanation Service
 */
export async function explainConcept(
  topic: string,
  level = 'beginner',
  preference = 'simple'
): Promise<ExplanationResult> {
  const prompt = `You are EduGenie, an expert educational tutor.

Explain the following topic:

Topic:
${topic}

Student level:
${level}

Explanation preference:
${preference}

Provide an educational explanation structured into EXACTLY these 7 sections:
1. Simple Definition: A 1-2 sentence crystal clear definition suited for a ${level} learner.
2. Core Concept: The foundational principle explained clearly.
3. Step-by-Step Explanation: An array of sequential steps breaking the concept down logically.
4. Practical Example: A vivid real-world example or scenario illustrating this concept in action.
5. Important Points: A list of key takeaways, rules, or formulas.
6. Common Mistakes: Frequent student misunderstandings or pitfalls and how to avoid them.
7. Quick Recap: A high-impact 2-sentence summary for rapid memory retention.

Return ONLY a JSON object adhering to this schema.`;

  const response = await generateSafeContent({
    model: CONFIG.GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          definition: { type: Type.STRING },
          coreConcept: { type: Type.STRING },
          stepByStep: { type: Type.ARRAY, items: { type: Type.STRING } },
          practicalExample: { type: Type.STRING },
          importantPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
          quickRecap: { type: Type.STRING },
        },
        required: [
          'definition',
          'coreConcept',
          'stepByStep',
          'practicalExample',
          'importantPoints',
          'commonMistakes',
          'quickRecap',
        ],
      },
    },
  });

  const rawJson = cleanJsonString(response.text || '{}');
  try {
    const parsed = JSON.parse(rawJson);
    const sections = {
      definition: String(parsed.definition || ''),
      coreConcept: String(parsed.coreConcept || ''),
      stepByStep: Array.isArray(parsed.stepByStep)
        ? parsed.stepByStep.map((s: string) => String(s))
        : [],
      practicalExample: String(parsed.practicalExample || ''),
      importantPoints: Array.isArray(parsed.importantPoints)
        ? parsed.importantPoints.map((p: string) => String(p))
        : [],
      commonMistakes: Array.isArray(parsed.commonMistakes)
        ? parsed.commonMistakes.map((m: string) => String(m))
        : [],
      quickRecap: String(parsed.quickRecap || ''),
    };

    // Build formatted markdown representation as well
    const formattedAnswer = `### 1. Simple Definition
${sections.definition}

### 2. Core Concept
${sections.coreConcept}

### 3. Step-by-Step Explanation
${sections.stepByStep.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

### 4. Practical Example
${sections.practicalExample}

### 5. Important Points
${sections.importantPoints.map((p: string) => `- ${p}`).join('\n')}

### 6. Common Mistakes & Pitfalls
${sections.commonMistakes.map((m: string) => `• ${m}`).join('\n')}

### 7. Quick Recap
${sections.quickRecap}`;

    return {
      answer: formattedAnswer,
      sections,
    };
  } catch (err) {
    throw new Error('Failed to parse structured concept explanation from AI.');
  }
}

/**
 * 3. Quiz Generation Service
 * Enforces EXACTLY 3 questions, each with EXACTLY 4 options, and one correct answer.
 */
export async function generateQuiz(
  topic: string,
  difficulty = 'medium'
): Promise<{ questions: QuizQuestion[] }> {
  const prompt = `You are EduGenie's quiz generator.

Generate EXACTLY 3 multiple-choice questions about:

Topic:
${topic}

Difficulty:
${difficulty}

Rules:
- Exactly 3 questions.
- Exactly 4 options per question.
- Only one correct answer.
- The "answer" field must be the EXACT string of one of the 4 options.
- Include a short, educational explanation for why that answer is correct.
- Return ONLY valid JSON adhering strictly to the schema.`;

  const response = await generateSafeContent({
    model: CONFIG.GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                answer: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ['question', 'options', 'answer', 'explanation'],
            },
          },
        },
        required: ['questions'],
      },
    },
  });

  const rawJson = cleanJsonString(response.text || '{}');
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (parseError) {
    throw new Error('AI returned an invalid JSON format for the quiz. Please try again.');
  }

  const validation = validateQuizStructure(parsed);
  if (!validation.valid || !validation.quiz) {
    throw new Error(validation.error || 'Quiz generated did not satisfy the strict 3-question schema.');
  }

  return validation.quiz;
}

export interface SummaryResult {
  summary: string;
  sections: {
    mainIdea: string;
    keyPoints: string[];
    importantTerms: Array<{ term: string; definition: string }>;
    importantFacts: string[];
    quickRevision: string;
  };
}

/**
 * 4. Summarization Service
 */
export async function summarizeText(
  textToSummarize: string,
  lengthPreference = 'medium'
): Promise<SummaryResult> {
  const prompt = `You are EduGenie, an expert educational summarizer.

Summarize the following educational material.
Desired summary depth: ${lengthPreference}.

Text:
${textToSummarize}

Provide:
1. mainIdea: The single core thesis or takeaway of the text.
2. keyPoints: Array of concise, high-value bullet points summarizing the content.
3. importantTerms: Array of objects with { term: string, definition: string } for key vocabulary.
4. importantFacts: Array of essential facts, numbers, dates, or formulas.
5. quickRevision: A rapid 2-3 sentence revision summary optimal for studying before a test.

Requirements:
- Do not change the original meaning.
- Remove unnecessary repetition.
- Keep important technical information and context.
- Return ONLY valid JSON adhering to the schema.`;

  const response = await generateSafeContent({
    model: CONFIG.GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mainIdea: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          importantTerms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                definition: { type: Type.STRING },
              },
              required: ['term', 'definition'],
            },
          },
          importantFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
          quickRevision: { type: Type.STRING },
        },
        required: ['mainIdea', 'keyPoints', 'importantTerms', 'importantFacts', 'quickRevision'],
      },
    },
  });

  const rawJson = cleanJsonString(response.text || '{}');
  try {
    const parsed = JSON.parse(rawJson);
    const sections = {
      mainIdea: String(parsed.mainIdea || ''),
      keyPoints: Array.isArray(parsed.keyPoints)
        ? parsed.keyPoints.map((kp: string) => String(kp))
        : [],
      importantTerms: Array.isArray(parsed.importantTerms)
        ? parsed.importantTerms.map((t: Record<string, unknown>) => ({
            term: String(t?.term || ''),
            definition: String(t?.definition || ''),
          }))
        : [],
      importantFacts: Array.isArray(parsed.importantFacts)
        ? parsed.importantFacts.map((f: string) => String(f))
        : [],
      quickRevision: String(parsed.quickRevision || ''),
    };

    const formattedSummary = `### Main Idea
${sections.mainIdea}

### Key Points
${sections.keyPoints.map((kp: string) => `• ${kp}`).join('\n')}

### Important Terms
${sections.importantTerms.map((t: { term: string; definition: string }) => `**${t.term}**: ${t.definition}`).join('\n')}

### Important Facts
${sections.importantFacts.map((f: string) => `- ${f}`).join('\n')}

### Quick Revision Summary
${sections.quickRevision}`;

    return {
      summary: formattedSummary,
      sections,
    };
  } catch (err) {
    throw new Error('Failed to parse structured summary from AI.');
  }
}

export interface LearningRecommendation {
  stage: string;
  topicName: string;
  whyItMatters: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedLearningTime: string;
  suggestedNextTopic: string;
  keyLearningObjectives?: string[];
}

/**
 * 5. Learning Recommendations Service
 */
export async function getLearningRecommendations(
  topic: string,
  level = 'beginner',
  goal = 'skill development',
  studyTime = '30 minutes/day'
): Promise<{ recommendations: LearningRecommendation[] }> {
  const prompt = `You are EduGenie, a personalized AI learning path architect.

Student topic:
${topic}

Knowledge level:
${level}

Learning goal:
${goal}

Available study time:
${studyTime}

Create a structured learning path from basic to advanced.
Organize the path logically through these stages (or relevant subset):
1. Prerequisites
2. Fundamentals
3. Core Concepts
4. Practical Examples & Applications
5. Intermediate Topics
6. Advanced Topics
7. Practice & Projects
8. Revision & Mastery

For each topic include:
- stage: The curriculum stage (e.g., "1. Prerequisites", "2. Fundamentals", etc.)
- topicName: Precise name of the topic or concept
- whyItMatters: Clear explanation of why this topic is essential for their goal
- difficulty: One of "Beginner", "Intermediate", or "Advanced"
- estimatedLearningTime: Estimated hours/days adjusted for their ${studyTime} schedule
- suggestedNextTopic: The logical follow-up topic
- keyLearningObjectives: Array of 2-3 tangible skills or concepts mastered here

Return ONLY valid JSON adhering to the schema.`;

  const response = await generateSafeContent({
    model: CONFIG.GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stage: { type: Type.STRING },
                topicName: { type: Type.STRING },
                whyItMatters: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                estimatedLearningTime: { type: Type.STRING },
                suggestedNextTopic: { type: Type.STRING },
                keyLearningObjectives: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'stage',
                'topicName',
                'whyItMatters',
                'difficulty',
                'estimatedLearningTime',
                'suggestedNextTopic',
              ],
            },
          },
        },
        required: ['recommendations'],
      },
    },
  });

  const rawJson = cleanJsonString(response.text || '{}');
  try {
    const parsed = JSON.parse(rawJson);
    const recs = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
    const formatted = recs.map((r: Record<string, unknown>, idx: number) => {
      let diff: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
      const dStr = String(r.difficulty || '').toLowerCase();
      if (dStr.includes('adv')) diff = 'Advanced';
      else if (dStr.includes('inter')) diff = 'Intermediate';

      return {
        stage: String(r.stage || `Stage ${idx + 1}`),
        topicName: String(r.topicName || ''),
        whyItMatters: String(r.whyItMatters || ''),
        difficulty: diff,
        estimatedLearningTime: String(r.estimatedLearningTime || '1-2 hours'),
        suggestedNextTopic: String(r.suggestedNextTopic || 'Next curriculum milestone'),
        keyLearningObjectives: Array.isArray(r.keyLearningObjectives)
          ? r.keyLearningObjectives.map(String)
          : [],
      };
    });

    return { recommendations: formatted };
  } catch (err) {
    throw new Error('Failed to parse learning recommendations from AI.');
  }
}
