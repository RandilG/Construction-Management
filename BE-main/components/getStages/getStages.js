const connection = require('../../services/connection');

module.exports = function getStages(req, res) {
    const sql = `SELECT * FROM stages ORDER BY sequence_number`;
    
    connection.query(sql, (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        
        return res.status(200).json(result);
    });
};