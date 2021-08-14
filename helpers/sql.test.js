const { sqlForPartialUpdate } = require("./sql");

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
