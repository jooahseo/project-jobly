# Jobly Backend

This is a job searching API using Node, Express, PostgreSQL.

Used JWT(Json Web Token) to authenticate/authorize the user. 

To run this:

    node server.js
    
To run the tests:

    jest -i

**Data flow chart**
<br><span style="color:red">red arrow</span> indicates it's authenticate/authorize related flow
![Data flow chart](flowChart/jobly_backend.png?raw=true "Data flow chart")