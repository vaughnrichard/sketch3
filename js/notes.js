/* This file deals with notes */

class note {
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

function findNotes(energyData) {
    let notesArray = null;

    let inNote = false;

    

    return notesArray
}