// app/api/ai-enhance/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.text !== "string") {
      return NextResponse.json({ error: "Invalid request. Text is required." }, { status: 400 });
    }

    const text = body.text.trim();
    if (!text) {
      return NextResponse.json({ error: "Please enter some text first." }, { status: 400 });
    }

    const type = body.type === "work_done" ? "work_done" : "remarks";
    const allowedLanguages = ["en", "hi", "mr"];
    const lang = allowedLanguages.includes(body.lang) ? body.lang : "en";

    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) {
      console.error("GROQ_API_KEY is missing from environment variables.");
      return NextResponse.json(
        { error: "GROQ_API_KEY is missing. Please add GROQ_API_KEY to your .env.local file." },
        { status: 500 }
      );
    }

    const languageMap: Record<string, string> = {
      en: "formal professional technical English",
      hi: "formal professional technical Hindi written in Devanagari script",
      mr: "formal professional technical Marathi written in Devanagari script",
    };

    const outputLanguage = languageMap[lang] || "formal professional technical English";
    const fieldContext = type === "work_done" ? "Work Description / Completed Service" : "Technical Remarks / Recommendations";

    const systemPrompt = `You are a certified senior CCTV and Digital Security Systems Engineer.

Your task is to convert rough, informal, short, or technician-written notes into professional technical wording.

OUTPUT LANGUAGE:
${outputLanguage}

FIELD CONTEXT:
${fieldContext}

IMPORTANT:
The technician's original note is the ONLY source of truth.

STRICT RULES:
1. Preserve the exact meaning of the original technician note.
2. Improve grammar, clarity, professionalism, and technical wording.
3. Do NOT invent information.
4. Do NOT assume information that is not written in the technician note.
5. Do NOT add any repair, replacement, testing, inspection, troubleshooting, installation, configuration, or result unless it is explicitly mentioned.
6. Do NOT say that an issue was resolved, repaired, restored, tested, replaced, or verified unless the original note clearly says so.
7. Preserve all technical facts exactly:
   - Camera numbers
   - DVR numbers
   - NVR numbers
   - Device names
   - Quantities
   - Faults
   - Cable details
   - Connector details
   - Power supply details
   - Network details
   - Battery details
   - Actions performed
8. Do NOT change technical components (e.g. BNC stays BNC, DVR stays DVR, NVR stays NVR, SMPS stays SMPS, PoE stays PoE, CMOS battery stays CMOS battery).
9. Use professional CCTV terminology where appropriate: CCTV, Camera, Video Feed, Video Signal, DVR, NVR, BNC Connector, SMPS, Power Supply, CMOS Battery, PoE, LAN, Network Connection, Cable, Adapter, Power Surge, Recording, Playback, Storage, Hard Disk, Video Transmission.
10. Do NOT add recommendations unless the original technician note contains a recommendation.
11. Do NOT change numbers, quantities, camera IDs, or device IDs.
12. If the original note is very short, keep the answer short.
13. Normally return ONE professional sentence. Return TWO sentences only when necessary for clarity.
14. Do NOT create bullet points.
15. Do NOT create headings.
16. Do NOT use markdown.
17. Do NOT use quotation marks.
18. Do NOT add explanations.
19. Do NOT write phrases such as: "Here is the improved version", "The technician stated", "According to the note", "Professional version".
20. Return ONLY the final polished technical sentence.

EXAMPLES:
Input: camera 4 video nahi aa raha tha connector loose tha
Good: Camera 4 video feed was unavailable due to a loose connector.
Bad: Camera 4 video feed was restored after replacing the connector and testing the cable.
Reason: The original note did not mention replacement or testing.

Input: DVR CMOS battery changed
Good: The DVR CMOS battery was replaced.
Bad: The DVR CMOS battery was replaced and the system settings were verified.
Reason: Settings verification was not mentioned.

Input: camera 5 ka cable check kiya
Good: The cable connection of Camera 5 was checked.
Bad: The cable connection of Camera 5 was repaired and tested successfully.
Reason: Repair and successful testing were not mentioned.

FINAL RULE: Improve the language, NOT the facts.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 30000);

    let response: Response;
    try {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
          reasoning_effort: "low",
          temperature: 0.15,
          max_tokens: 300,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("Groq API Error:", JSON.stringify(data, null, 2));
      const groqMessage = data?.error?.message || `Groq API request failed with status ${response.status}.`;

      if (data?.error?.code === "model_not_found" || response.status === 404) {
        return NextResponse.json(
          { error: "The selected Groq model is not available for this API key/project. Please check Groq model permissions.", details: groqMessage },
          { status: 404 }
        );
      }
      if (response.status === 401) {
        return NextResponse.json({ error: "Groq API key is invalid or expired.", details: groqMessage }, { status: 401 });
      }
      if (response.status === 403) {
        return NextResponse.json({ error: "Your Groq API key/project does not have permission to use this model.", details: groqMessage }, { status: 403 });
      }
      if (response.status === 429) {
        return NextResponse.json({ error: "Groq API rate limit reached. Please try again shortly.", details: groqMessage }, { status: 429 });
      }

      return NextResponse.json({ error: groqMessage }, { status: response.status >= 400 ? response.status : 500 });
    }

    let polishedText = data?.choices?.[0]?.message?.content?.trim() || "";

    polishedText = polishedText
      .replace(/^["']+|["']+$/g, "")
      .replace(/\*\*/g, "")
      .replace(/^[-•]\s*/gm, "")
      .replace(/^#+\s*/gm, "")
      .trim();

    if (!polishedText) {
      polishedText = text;
    }

    return NextResponse.json({ polishedText }, { status: 200 });
  } catch (error: unknown) {
    console.error("AI Enhance Route Exception:", error);

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "AI request timed out. Please try again." }, { status: 504 });
    }

    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}