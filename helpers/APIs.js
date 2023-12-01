const axios = require("axios");
const { BadRequestError } = require("../expressError");

async function getDrugInfo(drug) {
  try {
    // Convert the drug name to lowercase and then encode it for the URL
    const encodedDrug = encodeURIComponent(drug.toLowerCase());

    // Make the API call
    const res = await axios.get(
      `https://api.fda.gov/drug/label.json?search=description:${encodedDrug}&limit=1`
    );

    // Assuming the API returns an array and you're interested in the first item
    if (res.data.results && res.data.results.length > 0) {
      return res.data.results[0];
    } else {
      throw new BadRequestError("Drug information not found");
    }
  } catch (error) {
    // Handle errors, possibly logging them and re-throwing a user-friendly error
    console.error("Error fetching drug information:", error);
    throw new BadRequestError("Error fetching drug information");
  }
}

module.exports = { getDrugInfo };
