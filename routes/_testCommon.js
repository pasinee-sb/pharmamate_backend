"use strict";

const db = require("../db.js");
const User = require("../models/user");
const MedicationHistory = require("../models/medicationHistory.js");
const HealthJournals = require("../models/healthJournals.js");

const { createToken } = require("../helpers/tokens");

const testMedHistoryIds = [];
const testHealthJournalIds = [];

async function commonBeforeAll() {
  await db.query("DELETE FROM medication_history");
  await db.query("DELETE FROM health_journals");
  await db.query("DELETE FROM users");

  await User.register({
    username: "u1",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    password: "password3",
    isAdmin: false,
  });

  // await User.applyToJob("u1", testJobIds[0]);
  const resultMedHistory = await db.query(`
  INSERT INTO medication_history(username, drug_name, status, start_date, stop_date)
  VALUES   ('u1', 'aspirin', 'active', '2023-01-01', NULL)
  RETURNING id`);

  testMedHistoryIds.splice(0, 0, ...resultMedHistory.rows.map((r) => r.id));
  const resultHealthJournal = await db.query(
    `
        INSERT INTO health_journals(username, journal)
        VALUES ('u1', 'I feel fine today')
        RETURNING journal`
  );
  testHealthJournalIds.splice(
    0,
    0,
    ...resultHealthJournal.rows.map((r) => r.journal)
  );

  // testJobIds[1] = (await Job.create(
  //     { title: "J2", salary: 2, equity: "0.2", companyHandle: "c1" })).id;
  // testJobIds[2] = (await Job.create(
  //     { title: "J3", salary: 3, /* equity null */ companyHandle: "c1" })).id;
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testMedHistoryIds,
  u1Token,
  u2Token,
  adminToken,
};
