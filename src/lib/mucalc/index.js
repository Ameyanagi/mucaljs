/**
 * MuCal.js - X-ray absorption cross section calculator
 *
 * A JavaScript implementation of the MUCAL program for estimating
 * X-ray absorption cross sections for XAS sample preparation.
 *
 * @module mucalc
 */

// Re-export calculation functions from the main module
export {
  getZ,
  mucal,
  calcXRange,
  calcAbsorption,
  calcEdgeStep,
  getEdgeEnergy
} from '../../mucalc'

// Export element data for UI components
export {
  ELEMENTS,
  ELEMENT_TO_Z,
  EDGES,
  EDGE_LABELS,
  MISSING_DATA_Z,
  hasElementData
} from './elements'
