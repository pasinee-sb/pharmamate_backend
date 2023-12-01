"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");
const MedicationHistory = require("../models/medicationHistory.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testMedHistoryIds,
  testHealthJournalIds,
  u1Token,
  u2Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /users */

describe("POST /users", function () {
  test("works for admins: create non-admin", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        password: "password-new",
        isAdmin: false,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "u-new",
        isAdmin: false,
      },
      token: expect.any(String),
    });
  });

  test("works for admins: create admin", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        password: "password-new",
        isAdmin: true,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "u-new",
        isAdmin: true,
      },
      token: expect.any(String),
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        password: "password-new",
        isAdmin: true,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).post("/users").send({
      username: "u-new",
      password: "password-new",
      isAdmin: true,
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /users */

describe("GET /users", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      users: [
        {
          username: "u1",
          isAdmin: false,
        },
        {
          username: "u2",
          isAdmin: false,
        },
        {
          username: "u3",
          isAdmin: false,
        },
      ],
    });
  });

  test("unauth for non-admin users", async function () {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get("/users");
    expect(resp.statusCode).toEqual(401);
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE users CASCADE");
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /users/:username */

describe("GET /users/:username", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .get(`/users/u1`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        isAdmin: false,
        health_journal: ["I feel fine today"],
        medication_history: [testMedHistoryIds[0]],
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .get(`/users/u1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        isAdmin: false,
        health_journal: ["I feel fine today"],
        medication_history: [testMedHistoryIds[0]],
      },
    });
  });

  test("unauth for other users", async function () {
    const resp = await request(app)
      .get(`/users/u1`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
      .get(`/users/nope`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /users/:username */

describe("PATCH /users/:username", () => {
  test("works: can set new password", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        password: "new-password",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        isAdmin: false,
      },
    });
    const isSuccessful = await User.authenticate("u1", "new-password");
    expect(isSuccessful).toBeTruthy();
  });
});

/************************************** DELETE /users/:username */

describe("DELETE /users/:username", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/users/u1`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: "u1" });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .delete(`/users/u1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "u1" });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
      .delete(`/users/u1`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
      .delete(`/users/nope`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** GET /users/:username/med_history*/

describe("GET /users/:username/med_history", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .get(`/users/u1/med_history`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      medication_history: [
        {
          id: testMedHistoryIds[0],
          username: "u1",
          drug_name: "aspirin",
          status: "active",
          start_date: "2023-01-01T05:00:00.000Z",
          stop_date: null,
        },
      ],
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .get(`/users/u1/med_history`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      medication_history: [
        {
          id: testMedHistoryIds[0],
          username: "u1",
          drug_name: "aspirin",
          status: "active",
          start_date: "2023-01-01T05:00:00.000Z",
          stop_date: null,
        },
      ],
    });
  });

  test("unauth for other users", async function () {
    const resp = await request(app)
      .get(`/users/u1/med_history`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get(`/users/u1/med_history`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
      .get(`/users/nope/med_history`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** GET /users/:username/med_history/:id  */

describe("GET /users/:username/med_history/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .get(`/users/u1/med_history/${testMedHistoryIds[0]}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      medication_history: {
        id: testMedHistoryIds[0],
        username: "u1",
        drug_name: "aspirin",
        status: "active",
        start_date: "2023-01-01T05:00:00.000Z",
        stop_date: null,
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .get(`/users/u1/med_history/${testMedHistoryIds[0]}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      medication_history: {
        id: testMedHistoryIds[0],
        username: "u1",
        drug_name: "aspirin",
        status: "active",
        start_date: "2023-01-01T05:00:00.000Z",
        stop_date: null,
      },
    });
  });
});

/************************************** POST /users/:username/med_history */

describe("POST /users/:username/med_history", function () {
  const newMedHistoryData = {
    drugName: "ibuprofen",
    status: "active",
    startDate: "2023-02-01",
    stopDate: null,
  };

  test("works for admin", async function () {
    const resp = await request(app)
      .post("/users/u1/med_history")
      .send(newMedHistoryData)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      medication_history: {
        id: expect.any(Number),
        username: "u1",
        drugName: "ibuprofen",
        status: "active",
        startDate: expect.any(String),
        stopDate: null,
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .post("/users/u1/med_history")
      .send(newMedHistoryData)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      medication_history: expect.any(Object), // Replace with expected object
    });
  });

  test("unauthorized for different user", async function () {
    const resp = await request(app)
      .post("/users/u2/med_history")
      .send(newMedHistoryData)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/users/u1/med_history")
      .send({ ...newMedHistoryData, status: "invalidStatus" }) // Invalid status
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});
