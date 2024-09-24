import TabController from "../../../tool/tab-controller.js";

/**
 * The notes application tab controller type.
 */
class NoteTabController extends TabController {

    /**
     * Initializes a new instance.
     */
    constructor() {
        super("notes");

        // Register controller event listeners
		this.addEventListener("activated", event => this.processActivated());

		// register controller event listeners
    }

    // Get/set accessors
	get newButton (){
		return document.querySelector("head>template.note>div.control>button.new");
	}
	
	get todayDate () {
		return document.querySelector(".date");

	}
	
	get todayTime () {
		return document.querySelector(".time");

}


    async processActivated() {
        // Remove content of center article
        this.center.innerHTML = "";
        this.messageOutput.value = "";

        const noteSectionTemplate = document.querySelector("template.note");
        const noteSectionOverview = noteSectionTemplate.content.firstElementChild.cloneNode(true);
        this.center.append(noteSectionOverview); 

        const todayDateInput = this.todayDate; 
		const todayTimeInput = this.todayTime;
        if (todayDateInput) {
            let nowDate = new Date();
            let date = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1).toString().padStart(2, '0') + '-' + nowDate.getDate().toString().padStart(2, '0');
            todayDateInput.value = date; 
            console.log(todayDateInput.value);
        } else {
            console.error("Date input not found!");
        }
		
		if(todayTimeInput) {
			let nowTime = new Date();
			let time = nowTime.getHours().toString().padStart(2, '0') + ':' + nowTime.getMinutes().toString().padStart(2, '0');
			todayTimeInput.value = time; 
		}
		
		else {
        console.error("Time input not found!");
		}
    }
}

/**
 * Register a listener for the window's "load" event.
 */
window.addEventListener("load", event => {
    const controller = new NoteTabController();
    console.log(controller);
});
