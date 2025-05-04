import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { message: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create a more specific prompt for website generation
    const websitePrompt = `
      Create a complete, standalone HTML website based on this description: "${prompt}"
      
      Requirements:
      1. Include all necessary HTML, CSS, and JavaScript in a single file
      2. Use modern, responsive design
      3. Include proper meta tags and viewport settings
      4. Use semantic HTML5 elements
      5. Include basic styling for all elements
      6. Make sure the website is functional and interactive
      7. Use a clean, modern design
      8. Include comments for better code understanding
      
      Return only the complete HTML code, nothing else.
    `;

    const result = await model.generateContent(websitePrompt);
    const response = await result.response;
    const generatedCode = response.text();

    // Clean up the response to ensure it's valid HTML
    const cleanCode = generatedCode
      .replace(/```html/g, '')
      .replace(/```/g, '')
      .trim();

    return NextResponse.json(
      { code: cleanCode },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating website:', error);
    return NextResponse.json(
      { message: 'Failed to generate website' },
      { status: 500 }
    );
  }
} 