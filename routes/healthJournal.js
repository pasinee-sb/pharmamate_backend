"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");

const HealthJournals = require("../models/healthJournals.js");
const HealthJournalNewSchema = require("../schemas/healthJournalNew.json");
const healthJournalUpdateSchema = require("../schemas/healthJournalUpdate.json");

const router = express.Router();

/** GET /[username]/health_journal => { health_journal}
 *
 * Returns  health_journal: { username, journal}

 * Authorization required: admin or same user-as-:username
 **/

router.get(
  "/:username/health_journal",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const health_journal = await HealthJournals.get(req.params.username);
      if (health_journal.length === 0) {
        // Assuming findAll returns an empty array if no records are found
        return res
          .status(404)
          .json({ error: "User not found or no medication history" });
      }
      return res.json({ health_journal });
    } catch (err) {
      return next(err);
    }
  }
);

// /** POST /[username]/med_history => { medication_history:{ id, username, drug_name,status,start_date, stop_date} }
//    *
//    * Returns  medication_history: { id, username, drug_name,status,start_date, stop_date},{...}]

//    * Authorization required: admin or same user-as-:username
//    **/

router.post(
  "/:username/health_journal",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const { journal } = req.body;
      const username = req.params.username;
      const validator = jsonschema.validate(
        { username, journal },
        HealthJournalNewSchema
      );
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }
      const health_journal = await HealthJournals.create({ username, journal });
      return res.status(201).json({ health_journal });
    } catch (err) {
      return next(err);
    }
  }
);

router.patch(
  "/:username/health_journal",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const { journal } = req.body;

      const validator = jsonschema.validate(
        { journal },
        healthJournalUpdateSchema
      );
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const health_journal = await HealthJournals.update(req.params.username, {
        journal,
      });
      return res.status(201).json({ health_journal });
    } catch (err) {
      return next(err);
    }
  }
);

router.delete(
  "/:username/health_journal",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const { username } = req.params;
      await HealthJournals.remove(username);
      return res.json({ deleted: "Journal deleted" });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
