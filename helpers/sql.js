const { BadRequestError } = require("../expressError");

/** Function to construct the SET part of the sql query call
 *
 * Example:
 * dataToUpdate = { firstName: "John", isAdmin: true }
 * Returns {setCols: '"first_name"=$1, "is_admin"=$2', values: ["John", true]}
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql={}) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/** Function to construct the FILTER part of the sql query call 
 * For company model only
 *
 * Example:
 * name= "Joo", minEmployees = 100, maxEmployees = 200
 * Returns {
 *  whereCol: "LOWER(name) LIKE LOWER($1) AND
 *             num_employees >= $2 AND
 *             num_employees <= $3"
 *  values: ["%Joo%", 100, 200]
 * }
 */

function sqlFilterGetComp(name, minEmployees, maxEmployees) {
  if (minEmployees > maxEmployees) {
    throw new BadRequestError(
      "minEmployees cannot be greater than maxEmployees"
    );
  }
  const whereCol = [];
  const values = [];
  let idx = 1;
  if (name) {
    whereCol.push(`LOWER(name) LIKE LOWER($${idx})`);
    values.push(`%${name}%`);
    idx++;
  }
  if (minEmployees || minEmployees === 0) {
    whereCol.push(`num_employees >= $${idx}`);
    values.push(minEmployees);
    idx++;
  }
  if (maxEmployees) {
    whereCol.push(`num_employees <= $${idx}`);
    values.push(maxEmployees);
  }
  return {
    whereCol: whereCol.join(" AND "),
    values: values,
  };
}

/** Function to construct the FILTER part of the sql query call 
 * For job model only
 *
 * Example 1:
 * title= "Software", minSalary= 100000, hasEquity=true, company ="amazon"
 * Returns {
 *  whereCol: "LOWER(title) LIKE LOWER($1) AND
 *             salary >= $2 AND
 *             equity > 0 AND
 *             company = $3"
 *  values: ["%Software%", 100000, "amazon"]
 * }
 * 
 * Example 2:
 * title= "Software", hasEquity=false
 * Returns {
 *  whereCol: "LOWER(title) LIKE LOWER($1) AND
 *             (equity = 0 OR equity IS NULL)"
 *  values: ["%Software%"]
 * }
 */

function sqlFilterGetJob(title, minSalary, hasEquity, company) {
  const whereCol = [];
  const values = [];
  let idx = 1;
  if (title) {
    whereCol.push(`LOWER(title) LIKE LOWER($${idx})`);
    values.push(`%${title}%`);
    idx++;
  }
  if (minSalary || minSalary === 0) {
    whereCol.push(`salary >= $${idx}`);
    values.push(minSalary);
    idx++;
  }
  if (hasEquity === "true") {
    whereCol.push("equity > 0");
  }
  if(company){
    whereCol.push(`company_handle = $${idx}`);
    values.push(company)
  }
  return {
    whereCol: whereCol.join(" AND "),
    values: values,
  };
}

module.exports = { sqlForPartialUpdate, sqlFilterGetComp, sqlFilterGetJob};
