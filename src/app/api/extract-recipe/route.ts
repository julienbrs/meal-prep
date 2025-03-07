import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { recipeText } = await req.json();
    console.log("recipetext:", recipeText)

    if (!recipeText) {
      return NextResponse.json(
        { error: "Missing recipe text" },
        { status: 400 }
      );
    }

    const prompt = `
      Analyze the following recipe and extract the following details in valid JSON format:
      - name: (recipe name)
      - category: (one of: breakfast, lunch, dinner, snack)
      - preparationTime: (duration in minutes)
      - ingredients: (array of objects { name, amount, unit })
      - instructions: (array of step-by-step instructions)

      Recipe:
      "${recipeText}"

      Return only a **valid JSON response** without any additional text.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a culinary assistant specialized in extracting structured recipe data.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    const extractedData = JSON.parse(
      response.choices[0].message.content || "{}"
    );
    console.log("exctractedData:", extractedData);

    return NextResponse.json({ success: true, data: extractedData });
  } catch (error) {
    console.error("Error extracting recipe:", error);
    return NextResponse.json(
      { error: "Failed to extract recipe" },
      { status: 500 }
    );
  }
}
