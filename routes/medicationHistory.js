"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");

const MedicationHistory = require("../models/medicationHistory");
const medicationHistoryNewSchema = require("../schemas/medicationHistoryNew.json");
const medicationHistoryUpdateSchema = require("../schemas/medicationHistoryUpdate.json");
const {
  createDrugInteractionAssistant,
  createThread,
  addMessageToThread,
  runAssistant,
  getAssistantResponse,
} = require("../helpers/APIs");

const router = express.Router();

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
/** POST /[username]/med_history/:id => { status,start_date, stop_date} 
   *
   * Returns  medication_history: { id, username, drug_name,status,start_date, stop_date},{...}] 
  
   * Authorization required: admin or same user-as-:username
   **/
router.put(
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

//** For use with OPEN AI assistants API==> this function and route is now replaced with chatBot widget on the frontend */

// router.post(
//   "/:username/med_history/drug_interaction",
//   ensureCorrectUserOrAdmin,
//   async (req, res) => {
//     try {
//       //input {"role":"user",
//       //  "content":"amlodipine colchicine"
//       // } =>  {
//       // 	"drug_interaction": "The drug pair is Amlodipine and Colchicine.\n\nSeverity: Moderate\n\nManagement: Monitor for signs and symptoms of toxicity such as vomiting, diarrhea, and numbness or tingling in the fingers and toes. If you are taking these medications together, your doctor may want to adjust the dose of your colchicine. \n\nPlease discuss this with your physician."
//       // }

//       //create user session
//       const userSessions = new Map();
//       const { role, content } = req.body;
//       const { username } = req.params;

//       //Function to associate current user to newly created assistantID and threadID to ensure the response goes back to the right user

//       async function startUserSession(username) {
//         const assistantId = await createDrugInteractionAssistant();
//         const threadId = await createThread();
//         userSessions.set(username, { assistantId, threadId });
//       }

//       // Function to retrieve user's assistantId and threadId
//       function getUserSession(username) {
//         return userSessions.get(username);
//       }
//       await startUserSession(username);
//       const { assistantId, threadId } = getUserSession(username);
//       await addMessageToThread(threadId, { role, content });

//       const runId = await runAssistant(threadId, assistantId);
//       const response = await getAssistantResponse(threadId, runId);

//       return res.json({ drug_interaction: response[0].content[0].text.value });
//     } catch (error) {
//       console.error("Error:", error);
//       res.status(500).send("Error processing drug interaction check");
//     }
//   }
// );

module.exports = router;
