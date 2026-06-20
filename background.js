// Background service worker for LinkedIn AI Comment Generator

// In-memory cache for generated comments: key is post text hash/identifier, value is comment
const commentCache = new Map();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateComment") {
    handleCommentGeneration(request)
      .then(comment => sendResponse({ success: true, comment }))
      .catch(error => sendResponse({ success: false, error: error.message || String(error) }));
    return true; // Keep message channel open for asynchronous response
  }
});

async function handleCommentGeneration({ postText, tone, customInstructions }) {
  // Try to load Groq API key from storage
  const storage = await chrome.storage.local.get(["groqApiKey", "defaultModel"]);
  const apiKey = storage.groqApiKey;
  
  if (!apiKey) {
    throw new Error("Groq API Key is not configured. Please open the extension settings to set your API Key.");
  }

  const model = storage.defaultModel || "llama-3.1-8b-instant";

  // Create a unique key for caching based on post text and tone
  const cacheKey = `${hashString(postText)}_${tone}_${hashString(customInstructions || "")}`;
  if (commentCache.has(cacheKey)) {
    console.log("Serving comment from cache");
    return commentCache.get(cacheKey);
  }

  // System Prompt for good LinkedIn comment generation
  const systemPrompt = `You are a professional LinkedIn networking expert.
Your goal is to write a single, high-quality, engaging, and value-adding comment for a LinkedIn post.

Tone rules:
- "insightful": Add professional insight, share a complementary point of view, or highlight a key takeaway.
- "supportive": Offer warm encouragement, validate the poster's viewpoint, and show appreciation.
- "constructive": Offer a polite, constructive, alternative perspective or mention a nuance they might have missed.
- "funny": Add light-hearted, polite professional humor without being offensive or unprofessional.
- "questioning": Write a thoughtful, engaging question that invites dialogue and furthers the discussion.

General rules:
1. Output ONLY the raw comment text. Do NOT wrap in quotes, do NOT include explanations, do NOT add introductory text (like "Here is a comment:").
2. Write between 1 and 3 short, punchy sentences. Make it readable and visually clean.
3. Avoid generic expressions like "Great post!", "Congrats!", "Spot on!", or "Thanks for sharing." Make it unique and context-aware.
4. Emojis can be used sparingly and only if they match the tone, but do not overuse them.
5. Do NOT include hashtags unless requested.
${customInstructions ? `Additional Context/Instructions for the Commentator: ${customInstructions}` : ""}`;

  const prompt = `Post Content:\n"""\n${postText}\n"""\n\nGenerate the comment using the "${tone}" tone:`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after");
        const retryMsg = retryAfter ? ` in ${retryAfter}s` : "";
        throw new Error(`Rate limit exceeded (429). Please try again${retryMsg}.`);
      }
      const errBody = await response.json().catch(() => ({}));
      const errMsg = errBody?.error?.message || `HTTP ${response.status} ${response.statusText}`;
      throw new Error(errMsg);
    }

    const data = await response.json();
    let comment = data.choices?.[0]?.message?.content || "";
    
    // Clean up any stray wrapping quotes that some LLMs add
    comment = comment.trim();
    if (comment.startsWith('"') && comment.endsWith('"')) {
      comment = comment.slice(1, -1);
    }
    if (comment.startsWith("'") && comment.endsWith("'")) {
      comment = comment.slice(1, -1);
    }
    comment = comment.trim();

    if (!comment) {
      throw new Error("The AI returned an empty response.");
    }

    // Save in cache
    commentCache.set(cacheKey, comment);
    return comment;
  } catch (error) {
    console.error("Groq API error:", error);
    throw error;
  }
}

// Simple string hashing function for caching
function hashString(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(16);
}
