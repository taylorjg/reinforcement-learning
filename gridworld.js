const range = n => Array.from(Array(n).keys())

const S = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] // {1,2,...,14}
const TERMINAL_STATE = 99
const S_PLUS = [...S, TERMINAL_STATE]
const A = range(4) // {up, down, right, left}
const V = new Map(S_PLUS.map(s => [s, 0]))
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

const probabilityNextStateReward = (s, a) => {
  if (s === TERMINAL_STATE) {
    return { p: 1, s2: s, r: 0 }
  }
  const [x1, y1] = stateToGridCoords(s)
  const [x2, y2] = moveTo(x1, y1, a)
  if (gridCoordsAreOffGrid(x2, y2)) {
    return { p: 1, s2: s, r: -1 }
  }
  const s2 = gridCoordsAreTerminal(x2, y2) ? TERMINAL_STATE : gridCoordsToState(x2, y2)
  return { p: 1, s2, r: -1 }
}

const dumpV = (V, k, precision = 2) => {
  const significantDigits = v => Number(v.toPrecision(precision))
  const copyOfV = new Map(V)
  copyOfV.forEach((v, s) => copyOfV.set(s, significantDigits(v)))
  console.log(`k: ${k}; V:`, copyOfV)
}

const evaluatePolicy = () => {
  let k = 0
  dumpV(V, k)
  const copyOfV = new Map(V)
  for (; ;) {
    let delta = 0
    S.forEach(s => {
      const vOld = V.get(s)
      let vNew = 0
      A.forEach(a => {
        // probability of taking action a in state s under equiprobable random policy
        const pi_a_s = 1 / A.length
        const { p, s2, r } = probabilityNextStateReward(s, a)
        const discountedReward = r + GAMMA * V.get(s2)
        vNew += pi_a_s * p * discountedReward
      })
      copyOfV.set(s, vNew)
      delta = Math.max(delta, Math.abs(vOld - vNew))
    })
    copyOfV.forEach((v, s) => V.set(s, v))
    k += 1
    dumpV(V, k)
    if (delta < THETA) break
  }
}

const main = () => {
  evaluatePolicy()
}

main()
