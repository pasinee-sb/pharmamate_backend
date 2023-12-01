"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const HealthJournals = require("./healthJournals.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testHealthJournalIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  let newHealthJournal = {
    username: "u1",
    journal: "hello",
  };

  test("works", async function () {
    let health_journal = await HealthJournals.create(newHealthJournal);
    expect(health_journal).toEqual({
      username: "u1",
      journal: "hello",
    });
  });
});

// /************************************** get */

describe("get", function () {
  test("works", async function () {
    let health_journal = await HealthJournals.get("u1");
    expect(health_journal).toEqual({
      username: "u1",
      journal: "I feel fine today",
    });
  });

  test("not found if no such job", async function () {
    try {
      await HealthJournals.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// /************************************** update */

describe("update", function () {
  let updateData = {
    username: "u1",
    journal: "I am sick today",
  };
  test("works", async function () {
    let health_journal = await HealthJournals.update("u1", updateData);
    expect(health_journal).toEqual({
      username: "u1",
      journal: "I am sick today",
    });
  });

  test("not found if no such journal", async function () {
    try {
      await HealthJournals.update(0, {
        journal: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await HealthJournals.update("u1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await HealthJournals.remove("u1");
    const res = await db.query(
      "SELECT journal FROM health_journals WHERE username=$1",
      ["u1"]
    );
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such journal", async function () {
    try {
      await HealthJournals.remove("nonexistentUsername");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
