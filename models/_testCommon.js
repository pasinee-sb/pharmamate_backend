const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testMedHistoryIds = [];
const testHealthJournalIds = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM medication_history");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");

  await db.query(
    `
        INSERT INTO users(username,
                          password
                    )
        VALUES ('u1', $1),
               ('u2', $2)
        RETURNING username`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
    ]
  );

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

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testMedHistoryIds,
  testHealthJournalIds,
};
