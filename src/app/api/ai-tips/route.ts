import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { income, expense, daysLeft, goals } = await req.json();

    const prompt = `Ти фінансовий помічник. Дай 3 короткі поради українською мовою на основі даних:
- Доходи цього місяця: ${income} грн
- Витрати цього місяця: ${expense} грн
- Залишок: ${income - expense} грн
- Днів до кінця місяця: ${daysLeft}
- Цілі: ${goals || "немає"}

Відповідь ТІЛЬКИ у форматі JSON масиву без зайвого тексту:
[{"icon":"💡","title":"Назва поради","text":"Текст поради 1-2 речення","color":"#1EB788"},...]
Використовуй різні іконки та кольори: #1EB788 (зелений), #EF9F27 (жовтий), #E24B4A (червоний), #378ADD (синій).`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "[]";
    const clean = text.replace(/```json|```/g, "").trim();
    const tips = JSON.parse(clean);

    return NextResponse.json({ tips });
  } catch {
    return NextResponse.json({ tips: [] }, { status: 500 });
  }
}