const express = require("express");
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// ROUTE 1 : Fetch all notes using GET request: /api/notes/fetchallnotes. Login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    // made one foreign key relation in Note model by adding user id part so that there is a relation between them
    // We are fetching all the notes for a user
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server error");
  }
});

// ROUTE 2 : Add a note using POST request: /api/notes/addnote. Login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "title must be at least 3 characters").isLength({ min: 3 }),
    body("description", "Description must be at least 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const errors = validationResult(req);
      // if there are errors, return bad request and the errors
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Note({
        user: req.user.id,
        title,
        description,
        tag,
      });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server error");
    }
  }
);

// ROUTE 3 : Update an existing note using PUT request: /api/notes/updatenote/:id. Login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    let newNote = {};
    // adding fields to newNote based on their presence (which one are given by the user in req.body)
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    // find the note to be updated by the id given in path params /updatenote/:id
    let note = await Note.findById(req.params.id);

    // check the presence of that note
    if (!note) {
      res.status(404).send("Not Found");
    }

    // check if the user is accessing his own note only, and not someone else's note
    if (req.user.id !== note.user.toString()) {
      res.status(401).send("Not Allowed");
    }

    // now we are sure that the user is accessing his own note and the note exists, so will update the note with newNote
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server error");
  }
});

// ROUTE 4 : Delete an existing note using DELETE request: /api/notes/deletenote/:id. Login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {

    // find the note to be deleted by the id given in path params /deletenote/:id
    let note = await Note.findById(req.params.id);

    // check the presence of that note
    if (!note) {
      res.status(404).send("Not Found");
    }

    // check if the user is accessing his own note only, and not someone else's note
    if (req.user.id !== note.user.toString()) {
      res.status(401).send("Not Allowed");
    }

    // now we are sure that the user is accessing his own note and the note exists, so will delete the note
    note = await Note.findByIdAndDelete(
      req.params.id
    );
    res.json({ "Success" : "Note has been successfully deleted", note });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server error");
  }
});

module.exports = router;
