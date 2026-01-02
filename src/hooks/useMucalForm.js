import { useReducer, useCallback, useEffect } from 'react'
import { loadFromStorage, saveToStorage } from './useLocalStorage'
import { calcEdgeStep, calcAbsorption, calcXRange, getEdgeEnergy } from '../mucalc'

// Default form values
const DEFAULT_STATE = {
  atom: "Ru",
  diluent: "BN",
  sample: "Ru",
  mass: 0.15,
  edge: "K",
  area: 0.938559020685955,
  diameter: 1.3,
  angle: 45,
  x_minmax: [-200, 1000],
  x_step: 1,
  targetedgestep: 1,
  plotflag: true,
  // Calculated results (not persisted)
  samplemass: 0,
  diluentmass: 0,
  xrange: null,
  chartData: null,
  csvdata: null,
}

// Persisted keys
const PERSISTED_KEYS = [
  'atom', 'diluent', 'sample', 'mass', 'edge',
  'area', 'diameter', 'angle', 'x_minmax', 'x_step',
  'targetedgestep', 'plotflag'
]

// Action types
const ACTIONS = {
  SET_FIELD: 'SET_FIELD',
  SET_MULTIPLE: 'SET_MULTIPLE',
  SET_RESULTS: 'SET_RESULTS',
  RESET_ALL: 'RESET_ALL',
}

function formReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_FIELD:
      return { ...state, [action.field]: action.value }
    case ACTIONS.SET_MULTIPLE:
      return { ...state, ...action.values }
    case ACTIONS.SET_RESULTS:
      return { ...state, ...action.results }
    case ACTIONS.RESET_ALL:
      return { ...DEFAULT_STATE }
    default:
      return state
  }
}

/**
 * Custom hook for managing MuCal form state with localStorage persistence
 */
export function useMucalForm() {
  // Initialize state from localStorage
  const initialState = {
    ...DEFAULT_STATE,
    ...loadFromStorage(
      PERSISTED_KEYS.reduce((acc, key) => {
        acc[key] = DEFAULT_STATE[key]
        return acc
      }, {})
    )
  }

  const [state, dispatch] = useReducer(formReducer, initialState)

  // Save to localStorage when persisted values change
  useEffect(() => {
    const valuesToSave = PERSISTED_KEYS.reduce((acc, key) => {
      acc[key] = state[key]
      return acc
    }, {})
    saveToStorage(valuesToSave)
  }, [state.atom, state.diluent, state.sample, state.mass, state.edge,
      state.area, state.diameter, state.angle, state.x_minmax, state.x_step,
      state.targetedgestep, state.plotflag])

  // Field setters
  const setField = useCallback((field, value) => {
    dispatch({ type: ACTIONS.SET_FIELD, field, value })
  }, [])

  const setMultiple = useCallback((values) => {
    dispatch({ type: ACTIONS.SET_MULTIPLE, values })
  }, [])

  // Geometry calculations
  const calcAreaFromDiameter = useCallback((diameter, angle) => {
    const area = diameter * diameter * Math.PI / 4 * Math.cos(angle * Math.PI / 180)
    setField('area', area)
    return area
  }, [setField])

  const calcDiameterFromArea = useCallback((area, angle) => {
    const diameter = Math.sqrt(area * 4 / Math.PI / Math.cos(angle * Math.PI / 180))
    setField('diameter', diameter)
    return diameter
  }, [setField])

  // Calculate sample weights
  const calcSampleWeight = useCallback(() => {
    const { sample, diluent, atom, edge, x_step, area, mass, targetedgestep } = state

    const sampleEdge = calcEdgeStep(sample, atom, edge, x_step / 1000, area)
    const diluentEdge = calcEdgeStep(diluent, atom, edge, x_step / 1000, area)

    const sampleWeight = (targetedgestep - diluentEdge * mass) / (sampleEdge - diluentEdge)
    const diluentWeight = (-targetedgestep + sampleEdge * mass) / (sampleEdge - diluentEdge)

    return { sampleWeight, diluentWeight }
  }, [state])

  // Calculate absorption data
  const calcAbsorptionData = useCallback(() => {
    const { sample, diluent, atom, edge, x_step, area, x_minmax } = state
    const { sampleWeight, diluentWeight } = calcSampleWeight()

    const edgeEnergy = getEdgeEnergy(atom, edge)
    const xRange = calcXRange('atom', edgeEnergy + x_minmax[0] / 1000, edgeEnergy + x_minmax[1] / 1000, x_step / 1000)

    const csvdata = [["energy [keV]", "sample [abs]", "diluent [abs]", "total [abs]"]]
    const sampleAbs = []
    const diluentAbs = []
    const totalAbs = []

    for (let i = 0; i < xRange.length; i++) {
      const sAbs = calcAbsorption(sample, xRange[i], area) * sampleWeight
      const dAbs = calcAbsorption(diluent, xRange[i], area) * diluentWeight
      const tAbs = sAbs + dAbs

      sampleAbs.push(sAbs)
      diluentAbs.push(dAbs)
      totalAbs.push(tAbs)
      csvdata.push([xRange[i], sAbs, dAbs, tAbs])
    }

    const chartData = {
      labels: xRange,
      datasets: [
        {
          label: "sample",
          data: sampleAbs,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: "diluent",
          data: diluentAbs,
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: "total",
          data: totalAbs,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgb(75, 192, 192)',
          pointRadius: 0,
          borderWidth: 2,
        }
      ],
    }

    dispatch({
      type: ACTIONS.SET_RESULTS,
      results: {
        samplemass: sampleWeight,
        diluentmass: diluentWeight,
        xrange: xRange,
        chartData,
        csvdata,
      }
    })

    return { sampleWeight, diluentWeight, chartData, csvdata }
  }, [state, calcSampleWeight])

  // Reset all values
  const resetAll = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_ALL })
  }, [])

  return {
    state,
    setField,
    setMultiple,
    calcAreaFromDiameter,
    calcDiameterFromArea,
    calcAbsorptionData,
    resetAll,
  }
}
