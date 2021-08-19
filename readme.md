# Jobly Backend

This is a job searching API using Node, Express, PostgreSQL.

Used JWT(Json Web Token) to authenticate/authorize the user. 

To run this:

    node server.js
    
To run the tests:

    jest -i

##**Overview**

**Models**:
<Br> The ORM(Object Relational Mapping) model layers for an each route. 

**Routes**:
<br> All routes except auth have GET, POST, PATCH, DELETE basic routes.
<br> They use json schema to verify the incoming data.
<p><ins>Highlight features</ins>
<ul>
<li> auth: 
	<ul> 
		<li> login / register route</li>
	</ul>
</li>
<li>companies: 
	<ul> 
		<li> GET /companies can filter on provided search filters </li>
		<li> GET /companies/:handle returns company data with jobs for the company </li>
	</ul>
</li>
<li>users: 
	<ul> 
		<li> GET /users/:username returns user data with jobs user applied</li>
		<li> POST /:username/jobs/:id user can apply for a job</li>
	</ul>
</li>
<li> jobs: 
	<ul> 
		<li> GET /jobs can filter on provided search filters</li>
	</ul>
</li>

</ul>


**Data flow chart**
<br><span style="color:red">red arrow</span> indicates it's an authenticate/authorize related flow
![Data flow chart](flowChart/jobly_backend.png?raw=true "Data flow chart")