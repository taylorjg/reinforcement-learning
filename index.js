const range = n => Array.from(Array(n).keys())
const inc = a => a + 1
const mul = (a, b) => a * b
const factorial = n => range(n).map(inc).reduce(mul, 1)

const poissonProbability = (n, lambda) => {
  const numerator = Math.pow(lambda, n)
  const denominator = factorial(n)
  return numerator / denominator * Math.exp(-lambda)
}

const REQUEST_LAMBDA_LOCATION_1 = 3
const REQUEST_LAMBDA_LOCATION_2 = 4
const RETURN_LAMBDA_LOCATION_1 = 3
const RETURN_LAMBDA_LOCATION_2 = 2
const GAMMA = 0.9
const NUMBERS_OF_CARS = range(21)

// const showProbability = (n, lambda) => {
//   const p = poissonProbability(n, lambda)
//   console.log(`Probability of ${n} when lambda is ${lambda}: ${p}`)
// }

const ps1 = NUMBERS_OF_CARS.map(n => poissonProbability(n, REQUEST_LAMBDA_LOCATION_1))
const ps2 = NUMBERS_OF_CARS.map(n => poissonProbability(n, REQUEST_LAMBDA_LOCATION_2))
const ps3 = NUMBERS_OF_CARS.map(n => poissonProbability(n, RETURN_LAMBDA_LOCATION_1))
const ps4 = NUMBERS_OF_CARS.map(n => poissonProbability(n, RETURN_LAMBDA_LOCATION_2))

const main = () => {
}

main()
