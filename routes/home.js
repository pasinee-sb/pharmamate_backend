"use strict";

const express = require("express");
const router = new express.Router();

const {
  getNews,
  getDrugList,
  getDrugAutoComplete,
} = require("../helpers/APIs");

// routes/home.js

router.get("/", async function (req, res, next) {
  try {
    const response = await getNews();
    return res.json(response);
  } catch (err) {
    next(err); // Pass errors to error handler
  }
});

//route get   /autocomplete?searchValue=<searchValue>

router.get("/autocomplete", async function (req, res, next) {
  try {
    const drugList = await getDrugAutoComplete(req.query.searchValue);

    return res.json({ response: drugList });
  } catch (error) {
    next(error);
  }
});

//route get   /search?drug=<drugname>

router.get("/search", async function (req, res, next) {
  try {
    const drugList = await getDrugList(req.query.drug);

    return res.json({ response: drugList });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
