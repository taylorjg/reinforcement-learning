const range = n => Array.from(Array(n).keys())
const noop = () => { }

const S = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] // {1,2,...,14}
const TERMINAL_STATE = 99
const S_PLUS = [...S, TERMINAL_STATE]
const A = range(4) // {up, down, right, left}
const GAMMA = 1
const THETA = 0.03

const moveTo = (x, y, a) => {
  switch (a) {
    case 0: return [x, y - 1] // up
    case 1: return [x, y + 1] // down
    case 2: return [x + 1, y] // right
    case 3: return [x - 1, y] // left
  }
}

const gridCoordsAreOffGrid = (x, y) => (x < 0 || y < 0 || x > 3 || y > 3)
const gridCoordsAreTerminal = (x, y) => (x === 0 && y === 0) || (x === 3 && y === 3)
const stateToGridCoords = s => [s % 4, Math.floor(s / 4)]
const gridCoordsToState = (x, y) => y * 4 + x

const nextStatesAndRewardsProbabilities = (s, a) => {
  if (s === TERMINAL_STATE) {
    return Array.of({ p: 1, s2: s, r: 0 })
  }
  const [x1, y1] = stateToGridCoords(s)
  const [x2, y2] = moveTo(x1, y1, a)
  if (gridCoordsAreOffGrid(x2, y2)) {
    return Array.of({ p: 1, s2: s, r: -1 })
  }
  const s2 = gridCoordsAreTerminal(x2, y2) ? TERMINAL_STATE : gridCoordsToState(x2, y2)
  return Array.of({ p: 1, s2, r: -1 })
}

const dumpStateValueFunction = (svf, label, precision = 2) => {
  const significantDigits = v => Number(v.toPrecision(precision))
  const svfCopy = new Map(svf)
  svfCopy.forEach((v, s) => svfCopy.set(s, significantDigits(v)))
  label ? console.log(label, svfCopy) : console.log(svfCopy)
}

const evaluatePolicy = (pi, svf, cb = noop) => {
  let k = 0
  let svfPrevious = svf
  for (; ;) {
    const svfNext = new Map(svfPrevious)
    let delta = 0
    S.forEach(s => {
      const vOld = svfPrevious.get(s)
      let vNew = 0
      A.forEach(a => {
        const actionProb = pi(s, a)
        for (const { p, s2, r } of nextStatesAndRewardsProbabilities(s, a)) {
          const discountedReturn = r + GAMMA * svfPrevious.get(s2)
          vNew += actionProb * p * discountedReturn
        }
      })
      svfNext.set(s, vNew)
      delta = Math.max(delta, Math.abs(vOld - vNew))
    })
    k += 1
    cb(svfNext, k)
    if (delta < THETA) return svfNext
    svfPrevious = svfNext
  }
}

const createInitialStateValueFunction = () =>
  new Map(S_PLUS.map(s => [s, 0]))

const createInitialPolicy = () => {
  // Return the probability of taking action 'a' in state 's'
  return (_s, _a) => 1 / A.length
}

const main = () => {
  const verbose = process.argv.length === 3 && process.argv[2] === '--verbose'
  const svf = createInitialStateValueFunction()
  const pi = createInitialPolicy()
  if (verbose) {
    const cb = (svf, k) => dumpStateValueFunction(svf, `k: ${k}; V:`)
    evaluatePolicy(pi, svf, cb)
  } else {
    const svf2 = evaluatePolicy(pi, svf)
    dumpStateValueFunction(svf2)
  }
}

main()
