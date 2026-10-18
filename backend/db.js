const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, 'campus_clubs.db');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Read and execute the database schema
const schema = fs.readFileSync(
    path.join(__dirname, 'schema.sql'),
    'utf8'
);

db.exec(schema);

// Insert 10 sample clubs if the table is empty
const count = db.prepare(
    'SELECT COUNT(*) AS total FROM clubs'
).get();

if (count.total === 0) {
    const insertClub = db.prepare(`
        INSERT INTO clubs
        (name, description, category, president, meeting_day, contact_email)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const clubs = [
        ['Computer Science Club', 'Promotes programming and technology.', 'Technology', 'John Banda', 'Monday', 'csclub@example.com'],
        ['Debate Club', 'Develops public speaking and critical thinking.', 'Academic', 'Mary Phiri', 'Tuesday', 'debate@example.com'],
        ['Drama Club', 'Organises drama and theatre performances.', 'Arts', 'Peter Zulu', 'Wednesday', 'drama@example.com'],
        ['Environmental Club', 'Promotes environmental conservation.', 'Environment', 'Grace Tembo', 'Thursday', 'environment@example.com'],
        ['Business Club', 'Encourages entrepreneurship and business skills.', 'Business', 'David Mwila', 'Friday', 'business@example.com'],
        ['Music Club', 'Organises musical activities and performances.', 'Music', 'Ruth Chanda', 'Monday', 'music@example.com'],
        ['Sports Club', 'Coordinates student sports activities.', 'Sports', 'James Phiri', 'Tuesday', 'sports@example.com'],
        ['Reading Club', 'Encourages reading and discussion of books.', 'Literature', 'Esther Banda', 'Wednesday', 'reading@example.com'],
        ['Photography Club', 'Develops photography and editing skills.', 'Arts', 'Michael Bwalya', 'Thursday', 'photo@example.com'],
        ['Robotics Club', 'Explores robotics and automation.', 'Technology', 'Linda Zulu', 'Friday', 'robotics@example.com']
    ];

    const insertMany = db.transaction((items) => {
        for (const club of items) {
            insertClub.run(...club);
        }
    });

    insertMany(clubs);

    console.log('10 sample campus clubs inserted successfully.');
}

console.log('SQLite database is ready.');

module.exports = db;