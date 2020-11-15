const range = n => Array.from(Array(n).keys())
const add = (a, b) => a + b
const mul = (a, b) => a * b
const inc = a => a + 1
const factorial = n => range(n).map(inc).reduce(mul, 1)
const sum = xs => xs.reduce(add, 0)
const zipWithIndex = xs => xs.map((x, index) => [x, index])
const clamp = (min, max, value) => Math.min(max, Math.max(min, value))

const makeState = (noc1, noc2) => `${noc1}:${noc2}`
const parseState = s => s.split(':').map(Number)

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
const S = NUMBERS_OF_CARS.flatMap(noc1 =>
  NUMBERS_OF_CARS.map(noc2 =>
    makeState(noc1, noc2)))

const makePoissonDistribution = lambda =>
  zipWithIndex(NUMBERS_OF_CARS.map(n => poissonProbability(n, lambda)))
    .filter(([p]) => p > 1e-3)

const PS1 = makePoissonDistribution(EXPECTED_RENTAL_REQUESTS_LOCATION_1)
const PS2 = makePoissonDistribution(EXPECTED_RENTAL_REQUESTS_LOCATION_2)
const PS3 = makePoissonDistribution(EXPECTED_RENTAL_RETURNS_LOCATION_1)
const PS4 = makePoissonDistribution(EXPECTED_RENTAL_RETURNS_LOCATION_2)

const A = range(11).map(a => a - 5) // [-5, -4, ..., 4, 5]
const V = new Map(S.map(s => [s, 0]))

const GAMMA = 0.9
const THETA = 0.1

const probabilitiesNextStatesRewards = (s, a) => {
  const moved1to2 = a > 0 ? a : 0
  const moved2to1 = a < 0 ? -a : 0
  const carsMoved = Math.abs(a)
  const [noc1, noc2] = parseState(s)
  const results = []
  for (const [p1, requested1] of PS1) {
    for (const [p2, requested2] of PS2) {
      for (const [p3, returned1] of PS3) {
        for (const [p4, returned2] of PS4) {
          const noc1New = clamp(0, 20, noc1 - requested1 + returned1 - moved1to2 + moved2to1)
          const noc2New = clamp(0, 20, noc2 - requested2 + returned2 - moved2to1 + moved1to2)
          const p = p1 * p2 * p3 * p4
          const s2 = makeState(noc1New, noc2New)
          const rented1 = Math.min(noc1, requested1)
          const rented2 = Math.min(noc2, requested2)
          const carsRented = rented1 + rented2
          const r = carsRented * 10 - carsMoved * 2
          results.push({ p, s2, r })
        }
      }
    }
  }
  return results
}

const evaluatePolicy = pi => {
  let k = 0
  console.log(`[evaluatePolicy] k: ${k}`)
  const copyOfV = new Map(V)
  for (; ;) {
    let delta = 0
    S.forEach(s => {
      const vOld = V.get(s)
      let vNew = 0
      const a = pi(s)
      const xs = probabilitiesNextStatesRewards(s, a)
      for (const { p, s2, r } of xs) {
        const discountedReturn = r + GAMMA * V.get(s2)
        vNew += p * discountedReturn
      }
      copyOfV.set(s, vNew)
      delta = Math.max(delta, Math.abs(vOld - vNew))
    })
    copyOfV.forEach((v, s) => V.set(s, v))
    k += 1
    console.log(`[evaluatePolicy] k: ${k}; delta: ${delta}`)
    if (delta < THETA) break
  }
}

const createInitialPolicy = () => {
  const m = new Map(S.map(s => [s, 0]))
  return s => m.get(s)
}

const improvePolicy = pi => {
  const m = new Map()
  let stable = true
  S.forEach(s => {
    const aOld = pi(s)
    let aMax
    let vMax = Number.NEGATIVE_INFINITY
    A.forEach(a => {
      let v = 0
      const xs = probabilitiesNextStatesRewards(s, a)
      for (const { p, s2, r } of xs) {
        const discountedReturn = r + GAMMA * V.get(s2)
        v += p * discountedReturn
      }
      if (v > vMax) {
        aMax = a
        vMax = v
      }
    })
    m.set(s, aMax)
    console.log({ s, aOld, aMax, vMax })
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
}

const main = () => {
  const pi1 = createInitialPolicy()
  evaluatePolicy(pi1)
  const [pi2, stable] = improvePolicy(pi1)
  dumpPolicy(pi2)
  console.log(`stable: ${stable}`)
}

main()
