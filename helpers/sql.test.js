const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFilterGet } = require("./sql");

describe("Test sqlForPartialUpdate function", function () {
  test("Turn JSON data into proper set columns and values", function () {
    const data = {
        firstName: "John",
        isAdmin: true
    };
    const jsToSql = {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    };
    const result = sqlForPartialUpdate(data,jsToSql);
    expect(result).toEqual({
        setCols: '"first_name"=$1, "is_admin"=$2',
        values: ["John", true]
    })
  });
});

describe("Test sqlForFilterGet function", function () {
  test("Use Parameters to construct the query and values for WHERE", function () {
    const name = "JOO";
    const minEmployees = 0;
    const maxEmployees = 100;

    const result = sqlForFilterGet(name, minEmployees, maxEmployees);
    expect(result).toEqual({
        whereCol: `LOWER(name) LIKE LOWER($1) AND num_employees >= $2 AND num_employees <= $3`,
        values: ["%JOO%", 0, 100]
    })
  });
  test("Invalid minEmployees and maxEmployees", function () {
    const name = undefined;
    const minEmployees = 200;
    const maxEmployees = 100;

    expect(function(){ sqlForFilterGet(name, minEmployees, maxEmployees)}).toThrow();
    // you must wrap the code in function, otherwise the error will not be caught.
  });
});
