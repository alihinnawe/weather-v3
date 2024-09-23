import TabController from "../../../tool/tab-controller.js";
import BINARY_OPERATORS from "../../../tool/binary-operators.js";


/**
 * The calculator application tab controller type.
 */
class CalculatorTabController extends TabController {

	/**
	 * Initializes a new instance.
	 */
	constructor () {
		super("calculator");

		// register controller event listeners
		this.addEventListener("activated", event => this.processActivated());
	}


	// get/set accessors
	get calculatorSection () { return this.center.querySelector("section.calculator"); }
	get copyButton () { return this.calculatorSection.querySelector("div.control>button.copy"); }
	get resetButton () { return this.calculatorSection.querySelector("div.control>button.reset"); }
	get leftOperandInput () { return this.calculatorSection.querySelector("div.main>input.operand.left"); }
	get rightOperandInput () { return this.calculatorSection.querySelector("div.main>input.operand.right"); }
	get resultOutput () { return this.calculatorSection.querySelector("div.main>output.result"); }
	get addButton () { return this.calculatorSection.querySelector("div.main>span.operator button.add"); }
	get subButton () { return this.calculatorSection.querySelector("div.main>span.operator button.sub"); }
	get mulButton () { return this.calculatorSection.querySelector("div.main>span.operator button.mul"); }
	get divButton () { return this.calculatorSection.querySelector("div.main>span.operator button.div"); }
	get modButton () { return this.calculatorSection.querySelector("div.main>span.operator button.mod"); }
	get powerButton () { return this.calculatorSection.querySelector("div.main>span.operator button.power"); }
	get rootButton () { return this.calculatorSection.querySelector("div.main>span.operator button.root"); }
	get logButton () { return this.calculatorSection.querySelector("div.main>span.operator button.log"); }


	/**
	 * Handles activating this tab controller.
	 */
	async processActivated () {
		// Remove content of center article
		this.center.innerHTML = "";

		// insert primary tab section into center article
		const calculatorSectionTemplate = document.querySelector("head>template.calculator");
		this.center.append(calculatorSectionTemplate.content.firstElementChild.cloneNode(true));
		this.resultOutput.value = "0";

		// register event listeners
		this.addButton.addEventListener("click", event => this.processCalculation("+"));
		this.subButton.addEventListener("click", event => this.processCalculation("-"));
		this.mulButton.addEventListener("click", event => this.processCalculation("*"));
		this.divButton.addEventListener("click", event => this.processCalculation("/"));
		this.modButton.addEventListener("click", event => this.processCalculation("%"));
		this.powerButton.addEventListener("click", event => this.processCalculation("**"));
		this.rootButton.addEventListener("click", event => this.processCalculation("//"));
		this.logButton.addEventListener("click", event => this.processCalculation("log"));
		this.copyButton.addEventListener("click", event => this.processCopy());
		this.resetButton.addEventListener("click", event => this.processReset());
	}


	/**
	 * Displays the result of a single calculation.
	 * @param operatorSymbol the operator symbol
	 */
	async processCalculation (operatorSymbol) {
		this.messageOutput.classList.remove("success", "failure");
		try {
			const leftOperand = window.parseFloat(this.leftOperandInput.value);
			const rightOperand = window.parseFloat(this.rightOperandInput.value);
			const binaryOperator = BINARY_OPERATORS[operatorSymbol];
			if (!binaryOperator) throw new RangeError("illegal operator symbol: " + operatorSymbol);

			this.resultOutput.value = binaryOperator(leftOperand, rightOperand).toString();
			this.messageOutput.value = "ok";
			this.messageOutput.classList.add("success");
		} catch (error) {
			this.messageOutput.value = error.message;
			this.messageOutput.classList.add("failure");
		}
	}


	/**
	 * Copyies the last result into the first operand input.
	 */
	async processCopy () {
		this.leftOperandInput.value = this.resultOutput.value.trim() || "0";
		this.messageOutput.value = "";
		this.messageOutput.classList.remove("success", "failure");
	}


	/**
	 * Resets the calculator.
	 */
	async processReset () {
		this.leftOperandInput.value = "0";
		this.rightOperandInput.value = "0";
		this.resultOutput.value = "0";
		this.messageOutput.value = "";
		this.messageOutput.classList.remove("success", "failure");
	}
}



/**
 * Register a listener for the window's "load" event.
 */
window.addEventListener("load", event => {
	const controller = new CalculatorTabController();
	console.log(controller);
});
