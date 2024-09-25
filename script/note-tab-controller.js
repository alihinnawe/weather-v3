import TabController from "../../../tool/tab-controller.js";

/**
 * The notes application tab controller type.
 */
class NoteTabController extends TabController {

    todayDateInput;
    todayTimeInput;

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

	async newNotice() {

		const noteTbodyTemplate = document.querySelector("template.note-row");
		if (noteTbodyTemplate) {
			const noteTbodyOverview = noteTbodyTemplate.content.firstElementChild.cloneNode(true);
			this.tableNote.append(noteTbodyOverview);

			const nowDate = new Date();
			const date = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1).toString().padStart(2, '0') + '-' + nowDate.getDate().toString().padStart(2, '0');
			const time = nowDate.getHours().toString().padStart(2, '0') + ':' + nowDate.getMinutes().toString().padStart(2, '0');	
			const tableBodyDate = this.tableNote.querySelector("tr:last-child td input.date");	
			const tableBodyTime = this.tableNote.querySelector("tr:last-child td input.time");

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
