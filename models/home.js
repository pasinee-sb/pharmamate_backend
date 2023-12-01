"use strict";

const db = require("../db");
// const axios = require("axios");

// models/home.js
class Home {
  static async getDrugNames() {
    try {
      const response = await axios.get(
        "https://dailymed.nlm.nih.gov/dailymed/services/v2/drugnames.json",
        {
          params: {
            pagesize: 5,
            page: 3,
          },
        }
      );

      return response.data; // Return the data
    } catch (error) {
      throw error; // Throw the error to be handled by the route
    }
  }
}

module.exports = Home;
