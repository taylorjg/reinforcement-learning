const range = n => Array.from(Array(n).keys())
const inc = a => a + 1
const mul = (a, b) => a * b
const factorial = n => range(n).map(inc).reduce(mul, 1)

const poissonProbability = (n, lambda) => {
  const numerator = Math.pow(lambda, n)
  const denominator = factorial(n)
  return numerator / denominator * Math.exp(-lambda)
}

const makeState = (noc1, noc2) => `${noc1}:${noc2}`
const parseState = s => s.split(':').map(Number)

const REQUEST_LAMBDA_LOCATION_1 = 3
const REQUEST_LAMBDA_LOCATION_2 = 4
const RETURN_LAMBDA_LOCATION_1 = 3
const RETURN_LAMBDA_LOCATION_2 = 2
const GAMMA = 0.9
const NUMBERS_OF_CARS = range(21)
const S = NUMBERS_OF_CARS.flatMap(noc1 => NUMBERS_OF_CARS.map(noc2 => makeState(noc1, noc2)))
const A = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]
const V = new Map(S.map(s => [s, 0]))

const PS1 = NUMBERS_OF_CARS.map(n => poissonProbability(n, REQUEST_LAMBDA_LOCATION_1))
const PS2 = NUMBERS_OF_CARS.map(n => poissonProbability(n, REQUEST_LAMBDA_LOCATION_2))
const PS3 = NUMBERS_OF_CARS.map(n => poissonProbability(n, RETURN_LAMBDA_LOCATION_1))
const PS4 = NUMBERS_OF_CARS.map(n => poissonProbability(n, RETURN_LAMBDA_LOCATION_2))

// { p, s2, r }
const probabilityNextStateReward = (s, a) => {
  const [noc1, noc2] = parseState(s)
  let carsRented = 0
  let carsMoved = Math.abs(a)
  let noc1New = noc1
  let noc2New = noc2
  const requestProbs1 = PS1.slice(noc1)
  const requestProbs2 = PS2.slice(noc2)
  const returnProbs1 = PS3.slice()
  const returnProbs2 = PS4.slice()
  const s2 = makeState(noc1New, noc2New)
  const r = carsRented * 10 - carsMoved * 2
}

const main = () => {
}

main()
