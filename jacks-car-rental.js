const range = n => Array.from(Array(n).keys())
const mul = (a, b) => a * b
const inc = a => a + 1
const factorial = n => range(n).map(inc).reduce(mul, 1)
const zipWithIndex = xs => xs.map((x, index) => [x, index])
const clamp = (min, max, value) => Math.min(max, Math.max(min, value))

const poissonProbability = (n, lambda) => {
  const numerator = Math.pow(lambda, n)
  const denominator = factorial(n)
  return numerator / denominator * Math.exp(-lambda)
}

const EXPECTED_RENTAL_REQUESTS_LOCATION_1 = 3
const EXPECTED_RENTAL_REQUESTS_LOCATION_2 = 4
const EXPECTED_RENTAL_RETURNS_LOCATION_1 = 3
const EXPECTED_RENTAL_RETURNS_LOCATION_2 = 2

const NUMBERS_OF_CARS = range(21)

const makePoissonDistribution = lambda =>
  zipWithIndex(NUMBERS_OF_CARS.map(n => poissonProbability(n, lambda)))
    .filter(([p]) => p > 0.001)

const PS1 = makePoissonDistribution(EXPECTED_RENTAL_REQUESTS_LOCATION_1)
const PS2 = makePoissonDistribution(EXPECTED_RENTAL_REQUESTS_LOCATION_2)
const PS3 = makePoissonDistribution(EXPECTED_RENTAL_RETURNS_LOCATION_1)
const PS4 = makePoissonDistribution(EXPECTED_RENTAL_RETURNS_LOCATION_2)

const makeState = (noc1, noc2) => `${noc1}:${noc2}`
const parseState = s => s.split(':').map(Number)

const S = NUMBERS_OF_CARS.flatMap(noc1 =>
  NUMBERS_OF_CARS.map(noc2 =>
    makeState(noc1, noc2)))
const A = range(11).map(a => a - 5) // [-5, -4, ..., 4, 5]

const GAMMA = 0.9
const THETA = 1

const nextStatesAndRewardsProbabilities = (s, a) => {
  const carsMoved = Math.abs(a)
  const [noc1, noc2] = parseState(s)
  const results = []
  for (const [p1, requested1] of PS1) {
    for (const [p2, requested2] of PS2) {
      for (const [p3, returned1] of PS3) {
        for (const [p4, returned2] of PS4) {
          const rented1 = Math.min(noc1 - a, requested1)
          const rented2 = Math.min(noc2 + a, requested2)
          const noc1New = clamp(0, 20, noc1 - a - rented1 + returned1)
          const noc2New = clamp(0, 20, noc2 + a - rented2 + returned2)
          const p = p1 * p2 * p3 * p4
          const s2 = makeState(noc1New, noc2New)
          const carsRented = rented1 + rented2
          const r = carsRented * 10 - carsMoved * 2
          results.push({ p, s2, r })
        }
      }
    }
  }
  return results
}

const evaluatePolicy = (pi, svf, verbose) => {
  let k = 0
  let svfPrevious = svf
  for (; ;) {
    const svfNext = new Map()
    let delta = 0
    S.forEach(s => {
      const vOld = svfPrevious.get(s)
      let vNew = 0
      const a = pi(s)
      const xs = nextStatesAndRewardsProbabilities(s, a)
      for (const { p, s2, r } of xs) {
        const discountedReturn = r + GAMMA * svfPrevious.get(s2)
        vNew += p * discountedReturn
      }
      svfNext.set(s, vNew)
      delta = Math.max(delta, Math.abs(vOld - vNew))
    })
    k += 1
    verbose && console.log(`[evaluatePolicy] k: ${k}; delta: ${delta}`)
    if (delta < THETA) return svfNext
    svfPrevious = svfNext
  }
}

const improvePolicy = (pi, svf) => {
  const m = new Map()
  let stable = true
  S.forEach(s => {
    const aOld = pi(s)
    let aMax
    let vMax = Number.NEGATIVE_INFINITY
    A.forEach(a => {
      let v = 0
      for (const { p, s2, r } of nextStatesAndRewardsProbabilities(s, a)) {
        const discountedReturn = r + GAMMA * svf.get(s2)
        v += p * discountedReturn
      }
      if (v > vMax) {
        aMax = a
        vMax = v
      }
    })
    m.set(s, aMax)
    if (aMax !== aOld) {
      stable = false
    }
  })
  return [s => m.get(s), stable]
}

const dumpPolicy = pi => {
  for (const noc1 of NUMBERS_OF_CARS.slice().reverse()) {
    const bits = [`${noc1}:`.padEnd(4)]
    for (const noc2 of NUMBERS_OF_CARS) {
      const s = makeState(noc1, noc2)
      const a = pi(s)
      bits.push(`${a}`.padStart(3))
    }
    console.log(bits.join(' '))
  }
  const lastLineBits = ['    ']
  for (const noc2 of NUMBERS_OF_CARS) {
    lastLineBits.push(`${noc2}`.padStart(3))
  }
  console.log()
  console.log(lastLineBits.join(' '))
  console.log()
}

const createInitialPolicy = () => {
  return _s => 0
}

const createInitialStateValueFunction = () =>
  new Map(S.map(s => [s, 0]))

const main = () => {
  const verbose = process.argv.length === 3 && process.argv[2] === '--verbose'
  let pi = createInitialPolicy()
  let svf = createInitialStateValueFunction()
  for (; ;) {
    svf = evaluatePolicy(pi, svf, verbose)
    const [pi2, stable] = improvePolicy(pi, svf)
    if (stable) break
    pi = pi2
    dumpPolicy(pi)
  }
}

main()
