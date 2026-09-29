import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  APP_NAME: process.env.APP_NAME || 'EduGenie',
  APP_VERSION: process.env.APP_VERSION || '1.0.0',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  MAX_INPUT_LENGTH: parseInt(process.env.MAX_INPUT_LENGTH || '12000', 10),
  PORT: parseInt(process.env.PORT || '3000', 10),
};
