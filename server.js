const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // Import body-parser module
const { Pool } = require('pg');
const app = express();
const port = 3000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Shambhu@13',
  port: 5432,
});

// Use cors middleware to enable CORS
app.use(cors());

// Parse application/x-www-form-urlencoded and application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/api/data', (req, res) => {
  // Fetch data from database or perform any backend logic
  const responseData = { message: 'Hello from the backend!' };
  res.json(responseData);
});

app.get('/api/getMaintenance', async (req, res) => {
  try {
    // Query the database to get maintenance data
    const queryResult = await pool.query('SELECT * FROM maintenance_table');

    // Extract the rows from the query result
    const maintenanceData = queryResult.rows;

    // Send the maintenance data as the response
    res.json(maintenanceData);
  } catch (error) {
    console.error('Error fetching maintenance data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/payMaintenance', async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: 'Request body is missing' });
  }

  const { flatname, maintenance } = req.body;

  try {
    const client = await pool.connect();
    const queryTextSelect = 'SELECT maintenance FROM maintenance_table WHERE flatname = $1';
    const selectResult = await client.query(queryTextSelect, [flatname]);

    if (selectResult.rows.length === 0) {
      return res.status(404).json({ message: 'No matching record found' });
    }

    const currentMaintenance = selectResult.rows[0].maintenance;
    const newMaintenance = currentMaintenance - maintenance;

    const queryTextUpdate = 'UPDATE maintenance_table SET maintenance = $1 WHERE flatname = $2';
    const updateResult = await client.query(queryTextUpdate, [newMaintenance, flatname]);

    if (updateResult.rowCount > 0) {
      // Successfully updated the maintenance record
      res.json({ message: 'Maintenance updated successfully' });
    } else {
      // No matching record found
      res.status(404).json({ message: 'No matching record found' });
    }

    client.release();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
