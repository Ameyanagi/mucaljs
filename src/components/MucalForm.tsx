import React from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectOption } from './ui/select'
import { Checkbox } from './ui/checkbox'
import { ElementSelector } from './ElementSelector'
import { LineChart } from './LineChart'
import { Download, RotateCcw, Calculator } from 'lucide-react'
import { EDGES, EDGE_LABELS } from '@/lib/mucalc'
import type { MucalFormState } from '@/hooks/useMucalForm'
import type { EdgeType } from '@/lib/mucalc'

function downloadCSV(data: (string | number)[][], filename: string) {
  const csvContent = data.map(row => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

interface FormRowProps {
  label: string
  htmlFor?: string
  children: React.ReactNode
  unit?: string
}

function FormRow({ label, htmlFor, children, unit }: FormRowProps) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Label htmlFor={htmlFor} className="w-28 text-right shrink-0 text-xs">{label}</Label>
      {children}
      {unit && <span className="text-muted-foreground text-xs">{unit}</span>}
    </div>
  )
}

interface MucalFormHandlers {
  setField: <K extends keyof MucalFormState>(field: K, value: MucalFormState[K]) => void
  setMultiple: (values: Partial<MucalFormState>) => void
  calcAreaFromDiameter: (diameter: number, angle: number) => number
  calcDiameterFromArea: (area: number, angle: number) => number
  calcAbsorptionData: () => void
  resetAll: () => void
}

interface MucalFormProps {
  state: MucalFormState
  handlers: MucalFormHandlers
}

export function MucalForm({ state, handlers }: MucalFormProps) {
  const { setField, calcAreaFromDiameter, calcDiameterFromArea, calcAbsorptionData, resetAll } = handlers

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    calcAbsorptionData()
  }

  const handlePlotChange = (checked: boolean) => {
    setField('plotflag', checked)
    if (checked) calcAbsorptionData()
  }

  const handleDiameterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value) || 0
    setField('diameter', v)
    calcAreaFromDiameter(v, state.angle)
  }

  const handleAngleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value) || 0
    setField('angle', v)
    calcAreaFromDiameter(state.diameter, v)
  }

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value) || 0
    setField('area', v)
    calcDiameterFromArea(v, state.angle)
  }

  const handleCSVDownload = () => {
    if (state.csvdata) {
      const filename = `${state.sample}_${state.samplemass.toFixed(4)}g_${state.diluent}_${state.diluentmass.toFixed(4)}g_absorption.csv`
      downloadCSV(state.csvdata, filename)
    }
  }

  const showWarning = state.samplemass < 0 || state.diluentmass < 0

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Card className="p-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-0">
          {/* Left Column - Sample Info & Geometry */}
          <div className="space-y-1.5">
            <h2 className="font-semibold text-xs mb-1.5 border-b pb-1">Sample Information</h2>
            <FormRow label="Sample formula" htmlFor="sample">
              <Input id="sample" type="text" placeholder="e.g. Ru2O3" value={state.sample}
                onChange={(e) => setField('sample', e.target.value)} className="h-7 w-24 text-sm" autoFocus />
            </FormRow>
            <FormRow label="Diluent formula" htmlFor="diluent">
              <Input id="diluent" type="text" placeholder="e.g. BN" value={state.diluent}
                onChange={(e) => setField('diluent', e.target.value)} className="h-7 w-24 text-sm" />
            </FormRow>
            <FormRow label="Total mass" htmlFor="mass" unit="g">
              <Input id="mass" type="number" step="any" min="0" value={state.mass}
                onChange={(e) => setField('mass', parseFloat(e.target.value) || 0)} className="h-7 w-16 text-sm" />
            </FormRow>

            <h2 className="font-semibold text-xs mb-1.5 mt-3 border-b pb-1">Pellet Geometry</h2>
            <FormRow label="Area" htmlFor="area" unit="cm²">
              <Input id="area" type="number" step="any" min="0" value={state.area}
                onChange={handleAreaChange} className="h-7 w-24 text-sm" />
            </FormRow>
            <FormRow label="Diameter" htmlFor="diameter" unit="cm">
              <Input id="diameter" type="number" step="any" min="0" value={state.diameter}
                onChange={handleDiameterChange} className="h-7 w-16 text-sm" />
            </FormRow>
            <FormRow label="Angle" htmlFor="angle" unit="deg">
              <Input id="angle" type="number" step="any" min="0" max="90" value={state.angle}
                onChange={handleAngleChange} className="h-7 w-16 text-sm" />
            </FormRow>
          </div>

          {/* Right Column - Calculation Settings */}
          <div className="space-y-1.5">
            <h2 className="font-semibold text-xs mb-1.5 border-b pb-1">Calculation Settings</h2>
            <div className="flex items-center gap-1.5 text-sm">
              <Label className="w-28 text-right shrink-0 text-xs">Element & Edge</Label>
              <ElementSelector id="atom" value={state.atom}
                onChange={(e) => setField('atom', e.target.value)} className="h-7 w-14 text-sm" />
              <Select id="edge" value={state.edge}
                onChange={(e) => setField('edge', e.target.value as EdgeType)} className="h-7 w-20 text-sm">
                {EDGES.map((edge) => (
                  <SelectOption key={edge} value={edge}>{EDGE_LABELS[edge]}</SelectOption>
                ))}
              </Select>
            </div>
            <FormRow label="Target edge step" htmlFor="targetedgestep">
              <Input id="targetedgestep" type="number" step="any" value={state.targetedgestep}
                onChange={(e) => setField('targetedgestep', parseFloat(e.target.value) || 0)} className="h-7 w-16 text-sm" />
            </FormRow>
            <div className="flex items-center gap-1.5 text-sm">
              <Label className="w-28 text-right shrink-0 text-xs">Energy range</Label>
              <Input type="number" step="1" value={state.x_minmax[0]}
                onChange={(e) => setField('x_minmax', [parseFloat(e.target.value) || 0, state.x_minmax[1]])}
                className="h-7 w-14 text-sm" aria-label="Min energy" />
              <span className="text-xs text-muted-foreground">to</span>
              <Input type="number" step="1" value={state.x_minmax[1]}
                onChange={(e) => setField('x_minmax', [state.x_minmax[0], parseFloat(e.target.value) || 0])}
                className="h-7 w-14 text-sm" aria-label="Max energy" />
              <span className="text-xs text-muted-foreground">eV</span>
            </div>
            <FormRow label="Energy step" htmlFor="x_step" unit="eV">
              <Input id="x_step" type="number" step="0.1" min="0" value={state.x_step}
                onChange={(e) => setField('x_step', parseFloat(e.target.value) || 0)} className="h-7 w-16 text-sm" />
            </FormRow>
            <div className="flex items-center gap-1.5 text-sm">
              <Label htmlFor="plotflag" className="w-28 text-right shrink-0 text-xs">Show chart</Label>
              <Checkbox id="plotflag" checked={state.plotflag} onCheckedChange={handlePlotChange} />
            </div>

            {/* Results inline */}
            {state.samplemass > 0 && (
              <div className={`mt-3 pt-2 border-t ${showWarning ? "text-destructive" : ""}`}>
                <h2 className="font-semibold text-xs mb-1">Results</h2>
                {showWarning && (
                  <p className="text-destructive text-xs mb-1">Not suitable for edge step {state.targetedgestep}</p>
                )}
                <div className="text-xs space-y-0.5">
                  <div><span className="text-muted-foreground">Sample:</span> <strong>{state.samplemass.toFixed(4)} g</strong></div>
                  <div><span className="text-muted-foreground">Diluent:</span> <strong>{state.diluentmass.toFixed(4)} g</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 justify-center mt-3 pt-2 border-t">
          <Button type="submit" size="sm" className="gap-1 h-7 text-xs">
            <Calculator className="h-3 w-3" /> Calculate
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={resetAll} className="gap-1 h-7 text-xs">
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
          {state.csvdata && (
            <Button type="button" variant="outline" size="sm" onClick={handleCSVDownload} className="gap-1 h-7 text-xs">
              <Download className="h-3 w-3" /> CSV
            </Button>
          )}
        </div>
      </Card>

      {/* Chart */}
      {state.plotflag && state.chartData && <LineChart chartData={state.chartData} />}
    </form>
  )
}

export default MucalForm
