"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");

const MedicationHistory = require("./medicationHistory.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testMedHistoryIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  let newMedicationHistory = {
    username: "u1",
    drugName: "quetiapine",
    status: "active",
    startDate: "2022-05-08",
    stopDate: null,
  };

  test("works", async function () {
    let medication_history = await MedicationHistory.create(
      newMedicationHistory
    );

    // Convert startDate to a string if it's a Date object
    const startDateStr =
      medication_history.startDate instanceof Date
        ? medication_history.startDate.toISOString()
        : medication_history.startDate;

    // Extract just the date part for comparison
    const receivedDate = startDateStr.split("T")[0];

    expect({
      ...medication_history,
      startDate: receivedDate, // use just the date part for comparison
    }).toEqual({
      ...newMedicationHistory,
      startDate: "2022-05-08", // expected date part
      id: expect.any(Number),
    });
  });
});

// /************************************** get */

describe("get", function () {
  test("works", async function () {
    let medication_history = await MedicationHistory.get(testMedHistoryIds[0]);

    // Convert start_date to a string if it's a Date object
    const startDateStr =
      medication_history.start_date instanceof Date
        ? medication_history.start_date.toISOString()
        : medication_history.start_date;

    // Extract just the date part for comparison
    const receivedDate = startDateStr.split("T")[0];

    expect({
      ...medication_history,
      start_date: receivedDate, // use just the date part for comparison
    }).toEqual({
      username: "u1",
      drug_name: "aspirin",
      status: "active",
      start_date: "2023-01-01", // expected date part
      stop_date: null,
      id: expect.any(Number),
    });
  });

  test("not found if no such medication history", async function () {
    try {
      await MedicationHistory.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// // /************************************** update */

describe("update", function () {
  test("works", async function () {
    let updateData = {
      status: "inactive",
      stop_date: new Date("2023-01-02").toISOString(),
    };

    let updatedMedicationHistory = await MedicationHistory.update(
      testMedHistoryIds[0],
      updateData
    );

    // Convert Date objects to strings (if they are Date objects)
    const startDateStr =
      updatedMedicationHistory.startDate instanceof Date
        ? updatedMedicationHistory.startDate.toISOString()
        : updatedMedicationHistory.startDate;
    const stopDateStr =
      updatedMedicationHistory.stopDate instanceof Date
        ? updatedMedicationHistory.stopDate.toISOString()
        : updatedMedicationHistory.stopDate;

    // Extract just the date part for comparison
    const receivedStartDate = startDateStr.split("T")[0];
    const receivedStopDate = stopDateStr.split("T")[0];

    const expectedStartDate = "2023-01-01";
    const expectedStopDate = "2023-01-02";

    expect({
      ...updatedMedicationHistory,
      startDate: receivedStartDate,
      stopDate: receivedStopDate,
    }).toEqual({
      id: testMedHistoryIds[0],
      username: "u1",
      drugName: "aspirin",
      status: "inactive",
      startDate: expectedStartDate,
      stopDate: expectedStopDate,
    });
  });
  test("not found if no such journal", async function () {
    try {
      await MedicationHistory.update(2, {
        status: "active",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await MedicationHistory.update(testMedHistoryIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// // /************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await MedicationHistory.remove(testMedHistoryIds[0]);
    const res = await db.query(
      "SELECT id FROM medication_history WHERE id=$1",
      [testMedHistoryIds[0]]
    );
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such medication history", async function () {
    try {
      await MedicationHistory.remove(5);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
