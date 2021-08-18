"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "Software Engineer",
    salary: 100000,
    equity: 0.001,
    company_handle: "c1",
  };

  test("ok for admin", async function () {
    const result = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(result.statusCode).toBe(201);
    expect(result.body).toEqual({
      id: expect.any(Number),
      ...newJob,
      equity: "0.001",
    });
  });

  test("no for user who's not admin", async function () {
    const result = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(result.statusCode).toBe(401);
  });

  test("bad request for missing data", async function () {
    const result = await request(app)
      .post("/jobs")
      .send({ salary: 100 })
      .set("authorization", `Bearer ${adminToken}`);
    expect(result.statusCode).toBe(400);
  });

  test("bad request for invalid data", async function () {
    const result = await request(app)
      .post("/jobs")
      .send({ title: 123123 })
      .set("authorization", `Bearer ${adminToken}`);
    expect(result.statusCode).toBe(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: 1,
          title: "j1",
          salary: 1,
          equity: "0.001",
          company_handle: "c1",
        },
        {
          id: 2,
          title: "j2",
          salary: 2,
          equity: "0.002",
          company_handle: "c2",
        },
        {
          id: 3,
          title: "j3",
          salary: 3,
          equity: "0.003",
          company_handle: "c3",
        },
      ],
    });
  });

    test("ok with filter", async function () {
      const resp = await request(app).get("/jobs?title=j1");
      expect(resp.body).toEqual({
        jobs: [
          {
            id: 1,
            title: "j1",
            salary: 1,
            equity: "0.001",
            company_handle: "c1",
          },
        ],
      });
    });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
      id: 1,
      title: "j1",
      salary: 1,
      equity: "0.001",
      company_handle: "c1",
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "J1-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      id: 1,
      title: "J1-new",
      salary: 1,
      equity: "0.001",
      company_handle: "c1",
    });
  });
  test("unauth for user who's not admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "J1-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "J1-new",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({
        title: "no job",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on company_handle change attempt", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        company_handle: "c3",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        salary: "Not a salary"
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});


/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
    test("works for admin", async function () {
      const resp = await request(app)
          .delete(`/jobs/3`)
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toBe(200);
    });
    test("unauth for user who's not admin", async function () {
      const resp = await request(app)
          .delete(`/jobs/3`)
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("unauth for anon", async function () {
      const resp = await request(app)
          .delete(`/jobs/3`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("not found for no such job", async function () {
      const resp = await request(app)
          .delete(`/jobs/0`)
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(404);
    });
  });