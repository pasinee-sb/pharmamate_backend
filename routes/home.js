"use strict";

const express = require("express");
const router = new express.Router();

const { getNews, getDrugInfo } = require("../helpers/APIs");
const axios = require("axios");

// routes/home.js
router.get("/", async function (req, res, next) {
  try {
    const response = await getNews();
    return res.json(response);
  } catch (err) {
    next(err); // Pass errors to error handler
  }
});

router.get("/search", async function (req, res, next) {
  try {
    const drugInfo = await getDrugInfo(req.query.drug);
    // const {
    //   contraindications,
    //   indications_and_usage,
    //   openfda,
    //   drug_interactions,
    // } = response;

    // //may extract these things later in the frontend, in openfda=> generic_name
    // console.log({
    //   contraindications,
    //   indications_and_usage,
    //   openfda,
    //   drug_interactions,
    // });

    return res.json({ response: drugInfo });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
