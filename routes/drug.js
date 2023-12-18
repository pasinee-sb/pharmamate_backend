"use strict";
const express = require("express");
const router = new express.Router();
const axios = require("axios");
const parseString = require("xml2js").parseString;

router.get("/:setId", async (req, res) => {
  try {
    console.log(req.params.setId);
    const xmlResponse = await axios.get(
      `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${req.params.setId}.xml`
    );
    const xmlData = xmlResponse.data;

    parseString(xmlData, (err, result) => {
      if (err) {
        res.status(500).send("Error parsing XML");
      } else {
        res.json(result);
      }
    });
  } catch (error) {
    res.status(500).send("Error fetching XML");
  }
});

module.exports = router;
