const axios = require("axios");
const { BadRequestError } = require("../expressError");
const NewsAPI = require("newsapi");
const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);

async function getNews() {
  try {
    // To query top headlines
    // All options passed to topHeadlines are optional, but you need to include at least one of them
    const response = newsapi.v2.topHeadlines({
      q: "drug",
      category: "health",
      language: "en",
      country: "us",
    });
    return response;
  } catch (error) {
    return next(error);
  }
}

async function getDrugInfo(drug) {
  try {
    const baseUrl = "https://api.fda.gov/drug/label.json?search=openfda.";
    const encodedDrug = encodeURIComponent(drug); // URL encode the drug name
    const types = ["brand_name", "generic_name"];

    for (let type of types) {
      const url = `${baseUrl}${type}:${encodedDrug}&limit=1`;
      console.log(`Searching for ${type}: ${url}`); // Log the URL for debugging
      const res = await axios.get(url);

      if (res.data && res.data.results && res.data.results.length > 0) {
        return res.data.results[0];
      }
    }

    throw new Error("Drug information not found");
  } catch (error) {
    // Handle errors, possibly logging them and re-throwing a user-friendly error
    console.error("Error fetching drug information:", error);
    throw new BadRequestError("Error fetching drug information");
  }
}

//****************************************************************************OPEN AI RUNNING FUNCTIONS

async function createDrugInteractionAssistant() {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/assistants",
      {
        instructions: `You are a drug interaction checker. Check for all drug interaction detected from a list from medication. Respond in pattern in 3 categories
          drug pair detected,severity,management`,
        name: "Drug interaction checker",
        tools: [{ type: "code_interpreter" }],
        model: "gpt-4",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v1",
        },
      }
    );

    console.log("Assistant Created:", response.data.id);
    return response.data.id;
  } catch (error) {
    console.error("Error fetching drug information:", error);
    throw new BadRequestError("Error fetching drug information");
  }
}

async function createThread() {
  const emptyThread = await openai.beta.threads.create();

  return emptyThread.id;
}

async function addMessageToThread(threadId, { role, content }) {
  const threadMessages = await openai.beta.threads.messages.create(
    (thread_id = threadId),
    {
      role,
      content,
    }
  );

  return threadMessages;
}

async function runAssistant(threadId, assistantId) {
  const run = await openai.beta.threads.runs.create((thread_id = threadId), {
    assistant_id: assistantId,
  });

  return run.id;
}

async function getAssistantResponse(threadId, runId) {
  let runStatus;

  while (true) {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);

    runStatus = run.status;
    console.log(runStatus);

    if (runStatus === "completed") {
      const messages = await openai.beta.threads.messages.list(threadId);
      return messages.data;
    } else if (
      runStatus === "failed" ||
      runStatus === "expired" ||
      runStatus === "cancelled"
    ) {
      // Handle actual error states
      throw new Error(`Run ended with status: ${runStatus}`);
    }

    // Wait for a short period before checking the status again
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

module.exports = {
  getNews,
  getDrugInfo,
  createDrugInteractionAssistant,
  createThread,
  addMessageToThread,
  runAssistant,
  getAssistantResponse,
};
