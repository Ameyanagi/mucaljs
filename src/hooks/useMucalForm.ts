import { useReducer, useCallback, useEffect } from 'react'
import { loadFromStorage, saveToStorage } from './useLocalStorage'
import { calcEdgeStep, calcAbsorption, calcXRange, getEdgeEnergy } from '../mucalc'
import type { EdgeType } from '../lib/mucalc'

// Chart.js dataset type
interface ChartDataset {
  label: string
  data: number[]
  borderColor: string
  backgroundColor: string
  pointRadius: number
  borderWidth: number
}

interface ChartData {
  labels: number[]
  datasets: ChartDataset[]
}

// Form state type
export interface MucalFormState {
  atom: string
  diluent: string
  sample: string
  mass: number
  edge: EdgeType
  area: number
  diameter: number
  angle: number
  x_minmax: [number, number]
  x_step: number
  targetedgestep: number
  plotflag: boolean
  // Calculated results (not persisted)
  samplemass: number
  diluentmass: number
  xrange: number[] | null
  chartData: ChartData | null
  csvdata: (string | number)[][] | null
}

// Default form values
const DEFAULT_STATE: MucalFormState = {
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
] as const

// Action types
type Action =
  | { type: 'SET_FIELD'; field: keyof MucalFormState; value: unknown }
  | { type: 'SET_MULTIPLE'; values: Partial<MucalFormState> }
  | { type: 'SET_RESULTS'; results: Partial<MucalFormState> }
  | { type: 'RESET_ALL' }

function formReducer(state: MucalFormState, action: Action): MucalFormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'SET_MULTIPLE':
      return { ...state, ...action.values }
    case 'SET_RESULTS':
      return { ...state, ...action.results }
    case 'RESET_ALL':
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
  const initialState: MucalFormState = {
    ...DEFAULT_STATE,
    ...loadFromStorage(
      PERSISTED_KEYS.reduce((acc, key) => {
        acc[key] = DEFAULT_STATE[key]
        return acc
      }, {} as Record<string, unknown>)
    ) as Partial<MucalFormState>
  }

  const [state, dispatch] = useReducer(formReducer, initialState)

  // Save to localStorage when persisted values change
  useEffect(() => {
    const valuesToSave = PERSISTED_KEYS.reduce((acc, key) => {
      acc[key] = state[key]
      return acc
    }, {} as Record<string, unknown>)
    saveToStorage(valuesToSave)
  }, [state.atom, state.diluent, state.sample, state.mass, state.edge,
      state.area, state.diameter, state.angle, state.x_minmax, state.x_step,
      state.targetedgestep, state.plotflag])

  // Field setters
  const setField = useCallback(<K extends keyof MucalFormState>(field: K, value: MucalFormState[K]) => {
    dispatch({ type: 'SET_FIELD', field, value })
  }, [])

  const setMultiple = useCallback((values: Partial<MucalFormState>) => {
    dispatch({ type: 'SET_MULTIPLE', values })
  }, [])

  // Geometry calculations
  const calcAreaFromDiameter = useCallback((diameter: number, angle: number) => {
    const area = diameter * diameter * Math.PI / 4 * Math.cos(angle * Math.PI / 180)
    setField('area', area)
    return area
  }, [setField])

  const calcDiameterFromArea = useCallback((area: number, angle: number) => {
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

    const csvdata: (string | number)[][] = [["energy [keV]", "sample [abs]", "diluent [abs]", "total [abs]"]]
    const sampleAbs: number[] = []
    const diluentAbs: number[] = []
    const totalAbs: number[] = []

    for (let i = 0; i < xRange.length; i++) {
      const sAbs = calcAbsorption(sample, xRange[i], area) * sampleWeight
      const dAbs = calcAbsorption(diluent, xRange[i], area) * diluentWeight
      const tAbs = sAbs + dAbs

      sampleAbs.push(sAbs)
      diluentAbs.push(dAbs)
      totalAbs.push(tAbs)
      csvdata.push([xRange[i], sAbs, dAbs, tAbs])
    }

    const chartData: ChartData = {
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
      type: 'SET_RESULTS',
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
    dispatch({ type: 'RESET_ALL' })
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
