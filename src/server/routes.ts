import { Router, Request, Response } from 'express';
import { CONFIG } from './config.js';
import { validateTextInput } from './validators.js';
import {
  askQuestion,
  explainConcept,
  generateQuiz,
  summarizeText,
  getLearningRecommendations,
  isGeminiConfigured,
} from './gemini.js';

export const apiRouter = Router();

// Health check endpoint (GET /health and GET /api/health)
apiRouter.get(['/health', '/api/health'], (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: CONFIG.APP_NAME,
    version: CONFIG.APP_VERSION,
    gemini_configured: isGeminiConfigured(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * A. POST /qa and /api/qa
 * Body: { text: string }
 */
apiRouter.post(['/qa', '/api/qa'], async (req: Request, res: Response) => {
  try {
    const inputValidation = validateTextInput(req.body?.text, 'text');
    if (!inputValidation.valid) {
      return res.status(400).json({ error: inputValidation.error });
    }

    const answer = await askQuestion(inputValidation.cleanText);
    return res.status(200).json({ answer });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown server error.';
    console.error('[EduGenie QA Error]:', msg);
    return res.status(500).json({
      error: 'Something went wrong while generating your answer. Please try again.',
      details: process.env.NODE_ENV === 'development' ? msg : undefined,
    });
  }
});

/**
 * B. POST /explain and /api/explain
 * Body: { text: string, level?: string, preference?: string }
 */
apiRouter.post(['/explain', '/api/explain'], async (req: Request, res: Response) => {
  try {
    const inputValidation = validateTextInput(req.body?.text, 'text');
    if (!inputValidation.valid) {
      return res.status(400).json({ error: inputValidation.error });
    }

    const level = typeof req.body?.level === 'string' ? req.body.level.trim() : 'beginner';
    const preference =
      typeof req.body?.preference === 'string' ? req.body.preference.trim() : 'simple';

    const result = await explainConcept(inputValidation.cleanText, level, preference);
    return res.status(200).json({
      answer: result.answer,
      sections: result.sections,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown server error.';
    console.error('[EduGenie Explain Error]:', msg);
    return res.status(500).json({
      error: 'Something went wrong while generating the concept explanation. Please try again.',
      details: process.env.NODE_ENV === 'development' ? msg : undefined,
    });
  }
});

/**
 * C. POST /quiz and /api/quiz
 * Body: { text: string, difficulty?: string }
 */
apiRouter.post(['/quiz', '/api/quiz'], async (req: Request, res: Response) => {
  try {
    const inputValidation = validateTextInput(req.body?.text, 'text');
    if (!inputValidation.valid) {
      return res.status(400).json({ error: inputValidation.error });
    }

    const difficulty =
      typeof req.body?.difficulty === 'string' ? req.body.difficulty.trim() : 'medium';

    const quiz = await generateQuiz(inputValidation.cleanText, difficulty);
    return res.status(200).json({
      questions: quiz.questions,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown server error.';
    console.error('[EduGenie Quiz Error]:', msg);
    return res.status(500).json({
      error: 'Failed to generate a valid quiz. Please try again with a more specific topic.',
      details: process.env.NODE_ENV === 'development' ? msg : undefined,
    });
  }
});

/**
 * D. POST /summarize and /api/summarize
 * Body: { text: string, length?: string }
 */
apiRouter.post(['/summarize', '/api/summarize'], async (req: Request, res: Response) => {
  try {
    const inputValidation = validateTextInput(req.body?.text, 'text');
    if (!inputValidation.valid) {
      return res.status(400).json({ error: inputValidation.error });
    }

    const summaryLength =
      typeof req.body?.length === 'string' ? req.body.length.trim() : 'medium';

    const result = await summarizeText(inputValidation.cleanText, summaryLength);
    return res.status(200).json({
      summary: result.summary,
      sections: result.sections,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown server error.';
    console.error('[EduGenie Summarize Error]:', msg);
    return res.status(500).json({
      error: 'Something went wrong while summarizing your study material. Please try again.',
      details: process.env.NODE_ENV === 'development' ? msg : undefined,
    });
  }
});

/**
 * E. POST /learn/recommendations and /api/learn/recommendations and /recommendations
 * Body: { topic: string, level?: string, goal?: string, study_time?: string }
 */
apiRouter.post(
  ['/learn/recommendations', '/api/learn/recommendations', '/recommendations', '/api/recommendations'],
  async (req: Request, res: Response) => {
    try {
      // Support both "topic" or "text" for flexibility
      const topicRaw = req.body?.topic ?? req.body?.text;
      const inputValidation = validateTextInput(topicRaw, 'topic');
      if (!inputValidation.valid) {
        return res.status(400).json({ error: inputValidation.error });
      }

      const level = typeof req.body?.level === 'string' ? req.body.level.trim() : 'beginner';
      const goal =
        typeof req.body?.goal === 'string' ? req.body.goal.trim() : 'skill development';
      const studyTime =
        typeof req.body?.study_time === 'string'
          ? req.body.study_time.trim()
          : typeof req.body?.studyTime === 'string'
          ? req.body.studyTime.trim()
          : '30 minutes/day';

      const result = await getLearningRecommendations(
        inputValidation.cleanText,
        level,
        goal,
        studyTime
      );
      return res.status(200).json({
        recommendations: result.recommendations,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown server error.';
      console.error('[EduGenie Recommendations Error]:', msg);
      return res.status(500).json({
        error: 'Something went wrong while creating your learning path. Please try again.',
        details: process.env.NODE_ENV === 'development' ? msg : undefined,
      });
    }
  }
);
