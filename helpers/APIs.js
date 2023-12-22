const axios = require("axios");
const { BadRequestError } = require("../expressError");
require("dotenv").config();
const drugAPI = process.env.DRUG_API_KEY;
const NewsAPI = require("newsapi");

const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

// const OpenAI = require("openai");

//*****FOR OPEN AI RUNNING FUNCTIONS****Now replaced with chatWidget tools@ oai-widget.com**///
// const openai = new OpenAI(process.env.OPENAI_API_KEY);

async function getNews() {
  try {
    // To query top headlines
    // All options passed to topHeadlines are optional, but you need to include at least one of them
    const response = newsapi.v2.everything({
      q: "drug OR medication OR pill OR pharma OR medical",
      language: "en",
      searchIn: "title",
      sortBy: "publishedAt",
    });
    return response;
  } catch (error) {
    return next(error);
  }
}

async function getDrugList(drug) {
  try {
    const baseUrl = `https://api.fda.gov/drug/label.json?api_key=${drugAPI}&search=openfda.`;
    const encodedDrug = encodeURIComponent(drug);

    // Try searching for generic_name with .exact
    let url = `${baseUrl}generic_name.exact:${encodedDrug}&limit=100`;
    try {
      let res = await axios.get(url);
      if (res.data && res.data.results && res.data.results.length > 0) {
        return res.data.results;
      }
    } catch (error) {
      console.error("Error in generic_name search:", error);
    }

    // Try searching for brand_name without .exact
    url = `${baseUrl}brand_name:${encodedDrug}&limit=100`;
    try {
      let res = await axios.get(url);
      if (res.data && res.data.results && res.data.results.length > 0) {
        return res.data.results;
      }
    } catch (error) {
      console.error("Error in brand_name search:", error);
    }

    throw new Error("Drug information not found");
  } catch (error) {
    console.error("Error in getDrugInfo function:", error);
    throw new BadRequestError(
      "Error fetching drug information, please check spelling and try again"
    );
  }
}

//****************OPEN AI RUNNING FUNCTIONS****Now replaced with chatWidget tools@ oai-widget.com**///

// async function createDrugInteractionAssistant() {
//   try {
//     const response = await axios.post(
//       "https://api.openai.com/v1/assistants",
//       {
//         instructions: `You are a drug interaction checker. Check for all drug interaction detected from a list from medication. Respond in pattern in 3 categories
//           drug pair detected,severity,management`,
//         name: "Drug interaction checker",
//         tools: [{ type: "code_interpreter" }],
//         model: "gpt-4",
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//           "OpenAI-Beta": "assistants=v1",
//         },
//       }
//     );

//     console.log("Assistant Created:", response.data.id);
//     return response.data.id;
//   } catch (error) {
//     console.error("Error fetching drug information:", error);
//     throw new BadRequestError("Error fetching drug information");
//   }
// }

// async function createThread() {
//   const emptyThread = await openai.beta.threads.create();

//   return emptyThread.id;
// }

// async function addMessageToThread(threadId, { role, content }) {
//   const threadMessages = await openai.beta.threads.messages.create(
//     (thread_id = threadId),
//     {
//       role,
//       content,
//     }
//   );

//   return threadMessages;
// }

// async function runAssistant(threadId, assistantId) {
//   const run = await openai.beta.threads.runs.create((thread_id = threadId), {
//     assistant_id: assistantId,
//   });

//   return run.id;
// }

// async function getAssistantResponse(threadId, runId) {
//   let runStatus;

//   while (true) {
//     const run = await openai.beta.threads.runs.retrieve(threadId, runId);

//     runStatus = run.status;
//     console.log(runStatus);

//     if (runStatus === "completed") {
//       const messages = await openai.beta.threads.messages.list(threadId);
//       return messages.data;
//     } else if (
//       runStatus === "failed" ||
//       runStatus === "expired" ||
//       runStatus === "cancelled"
//     ) {
//       // Handle actual error states
//       throw new Error(`Run ended with status: ${runStatus}`);
//     }

//     // Wait for a short period before checking the status again
//     await new Promise((resolve) => setTimeout(resolve, 2000));
//   }
// }

module.exports = {
  getNews,
  getDrugList,

  // createDrugInteractionAssistant,
  // createThread,
  // addMessageToThread,
  // runAssistant,
  // getAssistantResponse,
};
