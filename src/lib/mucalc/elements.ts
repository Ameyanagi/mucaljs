/**
 * Element data for MuCal.js
 * Contains element symbols and mappings for periodic table UI
 */

/** Complete list of element symbols (Z = 1 to 103) */
export const ELEMENTS = [
  "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne",
  "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca",
  "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn",
  "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y", "Zr",
  "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn",
  "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd",
  "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb",
  "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg",
  "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th",
  "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm",
  "Md", "No", "Lr"
] as const

export type ElementSymbol = typeof ELEMENTS[number]

/** Element symbol to atomic number (Z) mapping */
export const ELEMENT_TO_Z: Record<ElementSymbol, number> = Object.fromEntries(
  ELEMENTS.map((el, i) => [el, i])
) as Record<ElementSymbol, number>

/** Available absorption edges */
export const EDGES = ["K", "L1", "L2", "L3", "M"] as const

export type EdgeType = typeof EDGES[number]

/** Edge labels for UI display */
export const EDGE_LABELS: Record<EdgeType, string> = {
  K: "K edge",
  L1: "L1 edge",
  L2: "L2 edge",
  L3: "L3 edge",
  M: "M edge"
}

/** Elements with missing data (Z values) */
export const MISSING_DATA_Z = [83, 84, 86, 87, 88, 90, 92] as const

/**
 * Check if an element has data available
 * @param symbol - Element symbol
 * @returns True if data is available
 */
export function hasElementData(symbol: ElementSymbol): boolean {
  const z = ELEMENT_TO_Z[symbol]
  return z !== undefined && !MISSING_DATA_Z.includes(z as typeof MISSING_DATA_Z[number])
}
