/* ============================================================
   NexusAI Frontend AI
   ============================================================ */

const AI_CONFIG = {
  model: "llama-3.3-70b-versatile",
  apiKey: "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"
};


// Ask API key once
if (!AI_CONFIG.apiKey) {

  /* 🔥 CHANGED */
  const key = prompt("Enter GROQ API Key");

  if (key) {

    /* 🔥 CHANGED */
    localStorage.setItem("GROQ_API_KEY", key);
  }
}


// MAIN FUNCTION
async function getAIResponse(userText) {

  try {

    const apiKey = AI_CONFIG.apiKey;

    // no key
    if (!apiKey) {
      return "❌ No API Key Found";
    }

    // request
    const response = await fetch(

      /* 🔥 CHANGED */
      "https://api.groq.com/openai/v1/chat/completions",

      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },

        body: JSON.stringify({

          model: AI_CONFIG.model,

          messages: [
            {
              role: "system",
              content:
                "You are NexusAI, a powerful AI assistant like ChatGPT. Give detailed answers and code."
            },
            {
              role: "user",
              content: userText
            }
          ],

          max_tokens: 1000,
          temperature: 0.7

        })
      }
    );

    // response json
    const data = await response.json();

    console.log(data);

    // api error
    if (data.error) {
      return "❌ " + data.error.message;
    }

    // success
    return data.choices[0].message.content;

  } catch (error) {

    console.error(error);

    /* 🔥 CHANGED */
    return "❌ Failed to connect GROQ API";
  }
}
