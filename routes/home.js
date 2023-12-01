"use strict";

// const jsonschema = require("jsonschema");
const express = require("express");
const router = new express.Router();
// const axios = require("axios");
const NewsAPI = require("newsapi");
const newsapi = new NewsAPI("370419ad6389479cb205b4300eb10c4d");
// ref : https://github.com/bzarras/newsapi
// https://newsapi.org/docs/endpoints/everything

const Home = require("../models/home");

// routes/home.js
router.get("/", async function (req, res, next) {
  try {
    // To query top headlines
    // All options passed to topHeadlines are optional, but you need to include at least one of them
    newsapi.v2
      .topHeadlines({
        q: "drug",
        category: "health",
        language: "en",
        country: "us",
      })
      .then((response) => {
        console.log(response);
        return res.json(response);
      });

    // const drugNames = await Home.getDrugNames();
    // return res.json(drugNames); // Send the data in response
  } catch (err) {
    next(err); // Pass errors to error handler
  }
});

module.exports = router;
