const express = require("express");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8000;

app.use(express.json());

const notesPath = path.join(__dirname, 'notes.json')

app.get("/notes", (req, res) => {
    try{
        const data = fs.readFileSync(notesPath, 'utf-8');
        const notes = JSON.parse(data);
        res.status(200).json(notes);
    }
    catch(err) {
        res.json([]);
    }
});

app.get("/UploadForm.html", (req, res) =>{
    res.sendFile(path.join(__dirname, 'static', 'UploadForm.html'));
});

const fileStorage = multer.diskStorage({
    destination: './',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({storage: fileStorage});

app.post("/upload", upload.single('note_name'), (req, res) => {
    const note_name = req.body.note_name;
    const note = req.body.note;
    if(note_name === undefined && note === undefined)
    {
        res.send("name and text is required");
        return;
    }
    
    try {
        const data = fs.readFileSync(notesPath, 'utf-8');
        const notes = JSON.parse(data);

        const doesNoteExist = notes.find((note) => note.name === note_name);

        if(doesNoteExist) {
            res.status(400).send('Note with such a name already exists!');
        }
        else {
            notes.push({name: note_name, text: note});
            fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2));
            res.status(201).send('Note has been uploaded successfully');
        }
    }
    catch(err) {
        const notes = [{name: note_name, text: note}];
        fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2));
        res.status(201).send('Note has been created successfully');
    }
});

app.get("/notes/:note_name", (req, res) => {
    const note_name = req.params.note_name;

    try {
        const data = fs.readFileSync(notesPath, 'utf-8');
        const notes = JSON.parse(data);

        const note = notes.find((note) => note.name === note_name);

        if(note) {
            res.status(200).json(note.text);
        }
        else {
            res.status(404).send("Note was not found");
        }
    }
    catch(err) {
        res.status(500).send("Internal server error")
    }
});

app.put("/notes/:note_name", (req, res) => {
    const note_name = req.params.note_name;
    const new_text = req.body.text;

    try {
        const data = fs.readFileSync(notesPath, 'utf-8');
        const notes = JSON.parse(data);

        const noteIndex = notes.findIndex((note) => note.name === note_name);

        if(noteIndex === -1) {
            res.status(404).send("Note was not found");
        }
        else {
            notes[noteIndex].text = new_text;
            fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2));
            res.status(204).send();
        }
    }
    catch(err) {
        res.status(500).send("Internal server error");
    }
})

app.delete("/notes/:note_name", (req, res) => {
    const note_name = req.params.note_name;

    try {
        const data = fs.readFileSync(notesPath, 'utf-8');
        const notes = JSON.parse(data);

        const noteIndex = notes.findIndex((note) => note.name === note_name);

        if(noteIndex === -1) {
            res.status(404).send("Note was not found");
        }
        else {
            notes.splice(noteIndex, 1);
            fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2));
            res.status(200).send("Note was successfully deleted");
        }
    }
    catch(err) {
        res.status(500).send("Internal server error");
    }
})

app.listen(port, () => {
    console.log('Server is listening on port: ' + port);
})

app.get("/", (req, res) => {
    res.send("Server is running");
})



