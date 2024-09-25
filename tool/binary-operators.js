/**
 * Mathematical singleton providing binary operator functions.
 */
export default {
	"+":   (left, right) => left + right,
	"-":   (left, right) => left - right,
	"*":   (left, right) => left * right,
	"/":   (left, right) => left / right,
	"%":   (left, right) => left % right,
	"**":  (left, right) => left ** right,
	"//":  (left, right) => left ** (1 / right),
	"log": (left, right) => Math.log(left) / Math.log(right),
	"<<":  (left, right) => left << right,
	">>":  (left, right) => left >> right
}
