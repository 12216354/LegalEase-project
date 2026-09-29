import { CONFIG } from './config.js';

export interface ValidatedTextResult {
  valid: boolean;
  error?: string;
  cleanText: string;
}

export function validateTextInput(
  input: unknown,
  fieldName = 'text',
  maxLength = CONFIG.MAX_INPUT_LENGTH
): ValidatedTextResult {
  if (input === undefined || input === null) {
    return {
      valid: false,
      error: `Field '${fieldName}' is required and cannot be empty.`,
      cleanText: '',
    };
  }

  if (typeof input !== 'string') {
    return {
      valid: false,
      error: `Field '${fieldName}' must be a string.`,
      cleanText: '',
    };
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return {
      valid: false,
      error: `Field '${fieldName}' cannot be empty or only whitespace.`,
      cleanText: '',
    };
  }

  if (trimmed.length > maxLength) {
    return {
      valid: false,
      error: `Field '${fieldName}' exceeds the maximum allowed length of ${maxLength.toLocaleString()} characters (received ${trimmed.length.toLocaleString()}).`,
      cleanText: trimmed,
    };
  }

  return {
    valid: true,
    cleanText: trimmed,
  };
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface QuizValidationResult {
  valid: boolean;
  error?: string;
  quiz?: {
    questions: QuizQuestion[];
  };
}

export function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  // Strip markdown code fences if present (e.g. ```json ... ``` or ``` ...)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
  }
  return cleaned.trim();
}

export function validateQuizStructure(data: unknown): QuizValidationResult {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Quiz response must be an object with a "questions" array.' };
  }

  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.questions)) {
    return { valid: false, error: 'Quiz data must contain a "questions" array.' };
  }

  const questions = obj.questions;
  if (questions.length !== 3) {
    return {
      valid: false,
      error: `Quiz must contain EXACTLY 3 questions, but received ${questions.length}.`,
    };
  }

  const validatedQuestions: QuizQuestion[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q || typeof q !== 'object') {
      return { valid: false, error: `Question #${i + 1} is not a valid object.` };
    }

    const questionText = typeof q.question === 'string' ? q.question.trim() : '';
    if (!questionText) {
      return { valid: false, error: `Question #${i + 1} has an empty or invalid "question" text.` };
    }

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      return {
        valid: false,
        error: `Question #${i + 1} must have EXACTLY 4 options, received ${Array.isArray(q.options) ? q.options.length : 'none'}.`,
      };
    }

    const options: string[] = [];
    for (let j = 0; j < q.options.length; j++) {
      const opt = q.options[j];
      if (typeof opt !== 'string' || !opt.trim()) {
        return { valid: false, error: `Question #${i + 1}, option #${j + 1} cannot be empty.` };
      }
      options.push(opt.trim());
    }

    const rawAnswer = typeof q.answer === 'string' ? q.answer.trim() : '';
    if (!rawAnswer) {
      return { valid: false, error: `Question #${i + 1} has an empty "answer".` };
    }

    // Determine canonical answer matching one of the options
    let resolvedAnswer = '';
    const exactMatch = options.find((opt) => opt.toLowerCase() === rawAnswer.toLowerCase());
    if (exactMatch) {
      resolvedAnswer = exactMatch;
    } else {
      // Check if answer is provided as "A", "B", "C", "D" or "Option A"
      const letterMatch = rawAnswer.match(/^(?:option\s+)?([A-D])(?:[).:\s]|$)/i);
      if (letterMatch) {
        const index = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
        if (index >= 0 && index < options.length) {
          resolvedAnswer = options[index];
        }
      } else {
        // Check if any option starts with or contains the answer
        const partialMatch = options.find(
          (opt) =>
            opt.toLowerCase().includes(rawAnswer.toLowerCase()) ||
            rawAnswer.toLowerCase().includes(opt.toLowerCase())
        );
        if (partialMatch) {
          resolvedAnswer = partialMatch;
        }
      }
    }

    if (!resolvedAnswer) {
      return {
        valid: false,
        error: `Question #${i + 1} answer "${rawAnswer}" does not match any of the 4 options: [${options.join(', ')}].`,
      };
    }

    const explanation =
      typeof q.explanation === 'string' && q.explanation.trim()
        ? q.explanation.trim()
        : 'Correct answer based on key principles of the topic.';

    validatedQuestions.push({
      question: questionText,
      options,
      answer: resolvedAnswer,
      explanation,
    });
  }

  return {
    valid: true,
    quiz: {
      questions: validatedQuestions,
    },
  };
}
