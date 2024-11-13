const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const fs = require('fs');

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// In-memory storage for call logs
let callLogs = [];

// Home route
app.get('/', (req, res) => {
    res.send('Hello, this is the call logging app!');
});

// Log call route
app.post('/log-call', (req, res) => {
    const { name, date, duration, natureOfCall, email } = req.body;

    if (!name || !date || !duration || !natureOfCall || !email) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const newCallLog = {
        name,
        date,
        duration,
        natureOfCall,
        email
    };

    callLogs.push(newCallLog);
    res.json({ message: 'Call logged successfully' });
});

// Export call logs to Excel
app.get('/export', (req, res) => {
    // Create a worksheet
    const ws = xlsx.utils.json_to_sheet(callLogs);

    // Create a workbook and add the worksheet
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Call Logs');

    // Write the file to disk (temporary location)
    const filePath = 'call-logs.xlsx';
    xlsx.writeFile(wb, filePath);

    // Send the file as a response
    res.download(filePath, (err) => {
        if (err) {
            console.error('Error sending the file:', err);
            res.status(500).send('Error exporting the file');
        } else {
            // Clean up the temporary file after download
            fs.unlinkSync(filePath);
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
