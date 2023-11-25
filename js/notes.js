/* This file deals with notes */

class Note {
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.type = null;
        this.meta = null;
    }

    updateType(type) {
        this.type = type;
    }

    updateMeta(data) {
        this.meta = data;
    }

}

function findNotes(parsedNoteArray) {
    let notesArray = new Array(Note);

    let inNote = false;
    let currentNote = null;

    for (let i = 0; i < parsedNoteArray.length; i++) {
        if (parsedNoteArray[i] == 1) {
            if (!inNote) {
                currentNote = new Note(i, null);
                inNote = true;
            }
        }

        else {
            if (inNote) {
                currentNote.end = i;
                notesArray.push(currentNote);

                inNote = false;
                currentNote = null;
            }
        }
    }

    if (currentNote != null) {
        currentNote.end = parsedNoteArray.length - 1;
        notesArray.push(currentNote);
    }
    

    return notesArray;
}

export { Note, findNotes }