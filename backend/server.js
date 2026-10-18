const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Campus Club Manager API'
    });
});

// 1. GET all clubs
app.get('/api/clubs', (req, res) => {
    try {
        const clubs = db.prepare(
            'SELECT * FROM clubs ORDER BY id'
        ).all();

        res.json(clubs);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to retrieve clubs'
        });
    }
});

// 2. GET one club
app.get('/api/clubs/:id', (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                error: 'Invalid club ID'
            });
        }

        const club = db.prepare(
            'SELECT * FROM clubs WHERE id = ?'
        ).get(id);

        if (!club) {
            return res.status(404).json({
                error: 'Club not found'
            });
        }

        res.json(club);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to retrieve club'
        });
    }
});

// 3. POST - Create a new club
app.post('/api/clubs', (req, res) => {
    try {
        const {
            name,
            description,
            category,
            president,
            meeting_day,
            contact_email
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                error: 'Club name is required'
            });
        }

        const result = db.prepare(`
            INSERT INTO clubs
            (name, description, category, president, meeting_day, contact_email)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            name.trim(),
            description || '',
            category || '',
            president || '',
            meeting_day || '',
            contact_email || ''
        );

        const newClub = db.prepare(
            'SELECT * FROM clubs WHERE id = ?'
        ).get(result.lastInsertRowid);

        res.status(201).json(newClub);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to create club'
        });
    }
});

// 4. PUT - Update a club
app.put('/api/clubs/:id', (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                error: 'Invalid club ID'
            });
        }

        const {
            name,
            description,
            category,
            president,
            meeting_day,
            contact_email
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                error: 'Club name is required'
            });
        }

        const result = db.prepare(`
            UPDATE clubs
            SET name = ?,
                description = ?,
                category = ?,
                president = ?,
                meeting_day = ?,
                contact_email = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            name.trim(),
            description || '',
            category || '',
            president || '',
            meeting_day || '',
            contact_email || '',
            id
        );

        if (result.changes === 0) {
            return res.status(404).json({
                error: 'Club not found'
            });
        }

        const updatedClub = db.prepare(
            'SELECT * FROM clubs WHERE id = ?'
        ).get(id);

        res.json(updatedClub);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to update club'
        });
    }
});

// 5. DELETE a club
app.delete('/api/clubs/:id', (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                error: 'Invalid club ID'
            });
        }

        const result = db.prepare(
            'DELETE FROM clubs WHERE id = ?'
        ).run(id);

        if (result.changes === 0) {
            return res.status(404).json({
                error: 'Club not found'
            });
        }

        res.json({
            message: 'Club deleted successfully',
            id: id
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to delete club'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Campus Club Manager API running at http://localhost:${PORT}`);
});