import Controller from "./controller.js";


/**
 * Generic semi-abstract tab controller class which cannot be
 * instantiated, and is intended as a superclass for concrete
 * tab controller subclasses. It realizes a border layout with
 * quick access to HTML elements for center, top, bottom, left
 * and right portions, and the tab control associated with the
 * controller instance. Instances will dispatch an "activated"
 * event after the active state changes from false to true;
 * they'll also dispatch a "deactivated" event after the
 * active state changes from true to false.
 * @see Controller
 */
export default class TabController extends Controller {
	#active;
	#tabControlStyleClass;


	/**
	 * Initializes a new instance.
	 * @param tabControlStyleClass the style class of the tab control associated with this instance
	 * @throws {InternalError} if there is an attempt to instantiate this class
	 * @throws {ReferenceError} if the given argument is null or undefined
	 * @throws {TypeError} if the given argument is not a string
	 */
	constructor (tabControlStyleClass) {
		super();
		if (this.constructor === TabController) throw new InternalError("abstract classes cannot be instantiated!");
		if (tabControlStyleClass == null) throw new ReferenceError();
		if (typeof tabControlStyleClass != "string") throw new TypeError(tabControlStyleClass);

		this.#active = false;
		this.#tabControlStyleClass = tabControlStyleClass;

		const tabControls = this.top ? this.top.querySelectorAll("nav.tabs>*") : [];
		for (const tabControl of tabControls) {
			const active = tabControl === this.tabControl;
			tabControl.addEventListener("click", event => this.active = active);
		}

		this.addEventListener("activated", event => {
			for (const tabControl of tabControls)
				if (tabControl === this.tabControl) tabControl.classList.add("active");
				else tabControl.classList.remove("active");
		});
	}


	/**
	 * Returns the activity.
	 * @return the activity state
	 */
	get active () {
		return this.#active;
	}


	/**
	 * Sets the activity.
	 * @param value the activity state
	 * @throws {TypeError} if the given argument is not a boolean 
	 */
	set active (value) {
		if (typeof value !== "boolean") throw new TypeError();

		let event = null;
		if (!this.active && value) event = new Event("activated");
		if (this.active && !value) event = new Event("deactivated");

		this.#active = value;
		if (event) this.dispatchEvent(event);
	}


	/**
	 * Returns the tab control.
	 * @return the tab controller's associated control element, or null for none
	 */
	get tabControl () {
		return this.top ? this.top.querySelector("nav.tabs>*." + this.#tabControlStyleClass) : null;
	}
}
