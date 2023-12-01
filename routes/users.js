"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const MedicationHistory = require("../models/medicationHistory");
const medicationHistoryNewSchema = require("../schemas/medicationHistoryNew.json");
const medicationHistoryUpdateSchema = require("../schemas/medicationHistoryUpdate.json");

const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();

/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: admin
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

/** GET / => { users: [ {username}, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET /[username] => { user }
 *
 * Returns { username,isAdmin, medication_history, health_journals}
 *   where medication_history is { id, username, drug_name,status,start_date, stop_date}
 *         where health_journals  is { username, journals}
 *
 * Authorization required: admin or same user-as-:username
 **/

router.get(
  "/:username",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const user = await User.get(req.params.username);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.patch(
  "/:username",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, userUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const user = await User.update(req.params.username, req.body);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.delete(
  "/:username",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      await User.remove(req.params.username);
      return res.json({ deleted: req.params.username });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET /[username]/med_history => { user.medication_history }
 *
 * Returns  medication_history: [{ id, username, drug_name,status,start_date, stop_date},{...}] 

 * Authorization required: admin or same user-as-:username
 **/

router.get(
  "/:username/med_history",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const medication_history = await MedicationHistory.findAll({
        username: req.params.username,
      });
      if (medication_history.length === 0) {
        // Assuming findAll returns an empty array if no records are found
        return res
          .status(404)
          .json({ error: "User not found or no medication history" });
      }
      return res.json({ medication_history });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET /[username]/med_history/[id] => {.medication_history }
 *
 * Returns  medication_history: { id, username, drug_name,status,start_date, stop_date}

 * Authorization required: admin or same user-as-:username
 **/

router.get(
  "/:username/med_history/:id",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const medication_history = await MedicationHistory.get(req.params.id);
      if (!medication_history) {
        // Assuming findAll returns an empty array if no records are found
        return res
          .status(404)
          .json({ error: "User not found or no medication history" });
      }
      return res.json({ medication_history });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /[username]/med_history => { medication_history:{ id, username, drug_name,status,start_date, stop_date} }
 *
 * Returns  medication_history: { id, username, drug_name,status,start_date, stop_date},{...}] 

 * Authorization required: admin or same user-as-:username
 **/

router.post(
  "/:username/med_history",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const { drugName, status, startDate, stopDate } = req.body;
      const username = req.params.username;
      const validator = jsonschema.validate(
        { username, drugName, status, startDate, stopDate },
        medicationHistoryNewSchema
      );
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }
      const medication_history = await MedicationHistory.create({
        username,
        drugName,
        status,
        startDate,
        stopDate,
      });
      return res.status(201).json({ medication_history });
    } catch (err) {
      return next(err);
    }
  }
);

router.patch(
  "/:username/med_history/:id",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const { status, startDate, stopDate } = req.body;
      const { username, id } = req.params;

      const validator = jsonschema.validate(
        { status, startDate, stopDate },
        medicationHistoryUpdateSchema
      );
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const medication_history = await MedicationHistory.update(id, {
        status,
        start_date: startDate,
        stop_date: stopDate,
      });
      return res.status(201).json({ medication_history });
    } catch (err) {
      return next(err);
    }
  }
);

router.delete(
  "/:username/med_history/:id",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const { username, id } = req.params;
      await MedicationHistory.remove(id);
      return res.json({ deleted: id });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
