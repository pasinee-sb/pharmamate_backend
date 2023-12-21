"use strict";

const express = require("express");
const router = new express.Router();

const { getNews, getDrugList } = require("../helpers/APIs");
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
    const drugList = await getDrugList(req.query.drug);

    return res.json({ response: drugList });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
