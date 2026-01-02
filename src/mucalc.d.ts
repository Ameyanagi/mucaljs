/**
 * Type declarations for mucalc.js
 * X-ray absorption cross section calculator
 */

/**
 * Get atomic number from element symbol
 */
export function getZ(symbol: string): number

/**
 * Calculate X-ray absorption cross sections using MUCAL algorithm
 */
export function mucal(
  element: string,
  energy: number
): {
  photo: number
  coherent: number
  incoherent: number
  total: number
}

/**
 * Calculate energy range for absorption spectrum
 */
export function calcXRange(
  mode: string,
  start: number,
  end: number,
  step: number
): number[]

/**
 * Calculate absorption for a compound at a given energy
 */
export function calcAbsorption(
  formula: string,
  energy: number,
  area: number
): number

/**
 * Calculate edge step for a compound
 */
export function calcEdgeStep(
  formula: string,
  atom: string,
  edge: string,
  step: number,
  area: number
): number

/**
 * Get edge energy for an element
 */
export function getEdgeEnergy(atom: string, edge: string): number
