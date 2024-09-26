import TabController from "../../../tool/tab-controller.js";

/**
 * The notes application tab controller type.
 */
class NoteTabController extends TabController {

    todayDateInput;
    todayTimeInput;
	notes;

    /**
     * Initializes a new instance.
     */
    constructor() {
        super("notes");

        // Register controller event listeners
        this.addEventListener("activated", event => this.processActivated());
    }

    // Get/set accessors
    get newButton() {
        return this.center.querySelector("section.note>div.control>button.new");
    }

    get tableNote() {
        return this.center.querySelector("section.note>div.notes>table>tbody");
    }

    async processActivated() {
        // Clear the center article
        this.center.innerHTML = "";
        this.messageOutput.value = "";

        // Clone the note section template and append it to the center
        const noteSectionTemplate = document.querySelector("template.note");
        const noteSectionOverview = noteSectionTemplate.content.firstElementChild.cloneNode(true);
        this.center.append(noteSectionOverview);

        // Call the method to set event listeners after the DOM has updated
        this.setButtonEventListeners();
    }

    setButtonEventListeners() {
        const button = this.newButton;
        if (button) {
            button.addEventListener("click", () => this.newNotice());
        } else {
            console.error("New button not found!");
        }
    }
	
	removeButtonEventListener() {
		const tableBodyInputText = this.tableNote.querySelector("tr:first-child td input.note-input");

		if (tableBodyInputText) {
			tableBodyInputText.addEventListener('input', () => {
				// Get all the note-input fields in the table
				const allNoteInputs = Array.from(this.tableNote.querySelectorAll('input.note-input'));

				// Find the index of the current input
				const index = allNoteInputs.indexOf(tableBodyInputText);

				if (tableBodyInputText.value.trim() === "") {
					// If input is empty, remove the corresponding row using the index
					const rowToRemove = this.tableNote.querySelectorAll('tr')[index];
					if (rowToRemove) {
						rowToRemove.remove(); // Remove the row based on the index
					}
				}
			});
		}
	}


	// CREATE AN INSTANCE VARIABLE FOR THE ROW RECORD AS AN ARRAY OF OBJECTS.
	async newNotice1() {

		const noteTbodyTemplate = document.querySelector("template.note-row");
		if (noteTbodyTemplate) {
			const noteTbodyOverview = noteTbodyTemplate.content.firstElementChild.cloneNode(true);
			this.tableNote.prepend(noteTbodyOverview);

			const nowDate = new Date();
			const date = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1).toString().padStart(2, '0') + '-' + nowDate.getDate().toString().padStart(2, '0');
			const time = nowDate.getHours().toString().padStart(2, '0') + ':' + nowDate.getMinutes().toString().padStart(2, '0');	
			const tableBodyDate = this.tableNote.querySelector("tr:first-child td input.date");	
			const tableBodyTime = this.tableNote.querySelector("tr:first-child td input.time");
			const tableBodyInputText = this.tableNote.querySelector("tr:first-child td input.note-input");

			if (tableBodyDate) {
				tableBodyDate.value = date;
			} else {
				console.error("Date input not found!");
			}

			if (tableBodyTime) {
				tableBodyTime.value = time;
			} else {
				console.error("Time input not found!");
			}
			
			        // Add event listener to check for empty input
			if (tableBodyInputText) {
				tableBodyInputText.addEventListener('input', () => {
					if (tableBodyInputText.value.trim() === "") {
						// If input is empty, remove the row
						const row = tableBodyInputText.closest('tr'); // Get the closest row
						if (row) {
							row.remove(); // Remove the row
						}
					}
				});
			}
			
			
		} else {
			console.error("Note row template not found!");
		}
	}
	async newNotice() {
		let notes = [];
		const noteTbodyTemplate = document.querySelector("template.note-row");
		if (noteTbodyTemplate) {
			const noteTbodyOverview = noteTbodyTemplate.content.firstElementChild.cloneNode(true);
			this.tableNote.prepend(noteTbodyOverview);

			const nowDate = new Date();
			const date = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1).toString().padStart(2, '0') + '-' + nowDate.getDate().toString().padStart(2, '0');
			const time = nowDate.getHours().toString().padStart(2, '0') + ':' + nowDate.getMinutes().toString().padStart(2, '0');    
			const tableBodyDate = this.tableNote.querySelector("tr:first-child td input.date");    
			const tableBodyTime = this.tableNote.querySelector("tr:first-child td input.time");
			const tableBodyInputText = this.tableNote.querySelector("tr:first-child td input.note-input");

			if (tableBodyDate) {
				tableBodyDate.value = date;
			} else {
				console.error("Date input not found!");
			}

			if (tableBodyTime) {
				tableBodyTime.value = time;
			} else {
				console.error("Time input not found!");
			}
			
			tableBodyInputText.addEventListener('input', () => {
				// Get all the note-input fields in the table
				const allNoteInputs = Array.from(this.tableNote.querySelectorAll('input.note-input'));
                console.log("allNoteInputs",allNoteInputs);
				// Find the index of the current input
				const index = allNoteInputs.indexOf(tableBodyInputText);
				console.log("indexxxxxxxx",index);
				notes.push(allNoteInputs[index].value);
				
				if(notes) {
					notes =[];
					notes.push(allNoteInputs[index].value);
				}
				//notes.push({index:index,tableBodyDate:tableBodyDate.value,tableBodyTime:tableBodyTime.value,tableBodyInputText:tableBodyInputText.value});
				//console.log("notes array",notes[notes.length -1]);
				console.log("notesssssss",notes);
			});
			
			
			this.removeButtonEventListener();


		} else {
			console.error("Note row template not found!");
		}
	}

}

/**
 * Register a listener for the window's "load" event.
 */
window.addEventListener("load", () => {
    const controller = new NoteTabController();
    console.log(controller);
});