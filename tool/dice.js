/**
 * Instances of this class represent dice.
 */
export default class Dice extends Object {
	static #MIN_FACE_COUNT = 2;
	static #MAX_FACE_COUNT = 100;

	#faceCount;
	#faceValue;


	/**
	 * Initializes a new instance.
	 * @param faceCount the (optional) number of faces, or none for six
	 */
	constructor (faceCount = 6) {
		super(); // constructor chaining
		if (faceCount < Dice.#MIN_FACE_COUNT || faceCount > Dice.#MAX_FACE_COUNT) throw new RangeError();

		this.#faceCount = faceCount;
		this.#faceValue = NaN;
	}


	/**
	 * Getter for the faceCount property.
	 * @return the face count
	 */
	get faceCount () {
		return this.#faceCount;
	}


	/**
	 * Getter for the faceValue property.
	 * @return the face value
	 */
	get faceValue () {
		return this.#faceValue;
	}


	/**
	 * Rolls this dice and returns the new face value.
	 * @return the new face value
	 */
	roll () {
		this.#faceValue = Math.floor(Math.random() * this.#faceCount) + 1;
		return this.#faceValue;
	}


	/**
	 * Resets this dice.
	 */
	reset () {
		this.#faceValue = NaN;
	}
}
