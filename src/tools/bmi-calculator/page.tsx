'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

type HeightUnit = 'cm' | 'ftin'
type WeightUnit = 'kg' | 'lb'

function getBMICategory(bmi: number): { label: string; color: string; bgColor: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/30' }
  if (bmi < 25) return { label: 'Normal weight', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500/10 border-green-500/30' }
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-500/10 border-yellow-500/30' }
  return { label: 'Obese', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500/10 border-red-500/30' }
}

export default function BMICalculatorTool() {
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm')
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg')
  const [heightCm, setHeightCm] = useState('170')
  const [feet, setFeet] = useState('5')
  const [inches, setInches] = useState('7')
  const [weight, setWeight] = useState('70')

  const result = useMemo(() => {
    let heightM: number
    if (heightUnit === 'cm') {
      heightM = parseFloat(heightCm) / 100
    } else {
      const ft = parseFloat(feet) || 0
      const inc = parseFloat(inches) || 0
      heightM = (ft * 12 + inc) * 0.0254
    }

    let weightKg: number
    if (weightUnit === 'kg') {
      weightKg = parseFloat(weight)
    } else {
      weightKg = parseFloat(weight) * 0.45359237
    }

    if (isNaN(heightM) || isNaN(weightKg) || heightM <= 0 || weightKg <= 0) return null

    const bmi = weightKg / (heightM * heightM)
    const category = getBMICategory(bmi)

    // Healthy weight range for this height
    const minHealthy = 18.5 * heightM * heightM
    const maxHealthy = 24.9 * heightM * heightM

    return { bmi, category, minHealthy, maxHealthy, heightM, weightKg }
  }, [heightUnit, weightUnit, heightCm, feet, inches, weight])

  const categories = [
    { label: 'Underweight', range: '< 18.5', color: 'bg-blue-500' },
    { label: 'Normal', range: '18.5 - 24.9', color: 'bg-green-500' },
    { label: 'Overweight', range: '25 - 29.9', color: 'bg-yellow-500' },
    { label: 'Obese', range: '\u2265 30', color: 'bg-red-500' },
  ]

  return (
    <ToolPage
      title="BMI Calculator"
      description="Calculate your Body Mass Index. Supports metric (cm/kg) and imperial (ft-in/lb) units."
      category="math"
      categoryLabel="Math & Science"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          {/* Height */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium">Height</label>
              <div className="flex gap-1">
                <button
                  onClick={() => setHeightUnit('cm')}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${heightUnit === 'cm' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                >cm</button>
                <button
                  onClick={() => setHeightUnit('ftin')}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${heightUnit === 'ftin' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                >ft / in</button>
              </div>
            </div>
            {heightUnit === 'cm' ? (
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="Height in cm"
                min={0}
                className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input type="number" value={feet} onChange={(e) => setFeet(e.target.value)} min={0} placeholder="Feet" className="w-full h-10 px-3 pr-8 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">ft</span>
                </div>
                <div className="relative">
                  <input type="number" value={inches} onChange={(e) => setInches(e.target.value)} min={0} max={11} placeholder="Inches" className="w-full h-10 px-3 pr-8 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">in</span>
                </div>
              </div>
            )}
          </div>

          {/* Weight */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium">Weight</label>
              <div className="flex gap-1">
                <button
                  onClick={() => setWeightUnit('kg')}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${weightUnit === 'kg' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                >kg</button>
                <button
                  onClick={() => setWeightUnit('lb')}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${weightUnit === 'lb' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                >lb</button>
              </div>
            </div>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={weightUnit === 'kg' ? 'Weight in kg' : 'Weight in lb'}
              min={0}
              className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <>
              <div className={`p-5 rounded-xl border ${result.category.bgColor}`}>
                <div className="text-sm text-muted-foreground mb-1">Your BMI</div>
                <div className={`text-4xl font-bold ${result.category.color}`}>
                  {result.bmi.toFixed(1)}
                </div>
                <div className={`text-lg font-semibold mt-1 ${result.category.color}`}>
                  {result.category.label}
                </div>
              </div>

              {/* BMI Scale */}
              <div className="p-4 rounded-xl border border-border">
                <div className="text-sm font-medium mb-3">BMI Scale</div>
                <div className="w-full h-4 rounded-full overflow-hidden flex">
                  <div className="bg-blue-500 h-full" style={{ width: '18.5%' }} />
                  <div className="bg-green-500 h-full" style={{ width: '6.4%' }} />
                  <div className="bg-yellow-500 h-full" style={{ width: '5%' }} />
                  <div className="bg-red-500 h-full flex-1" />
                </div>
                <div className="relative h-6 mt-1">
                  <div
                    className="absolute -translate-x-1/2 text-xs font-bold"
                    style={{ left: `${Math.min(Math.max((result.bmi / 40) * 100, 2), 98)}%` }}
                  >
                    {'\u25B2'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {categories.map((c) => (
                    <div key={c.label} className="flex items-center gap-2 text-xs">
                      <span className={`w-3 h-3 rounded-sm ${c.color}`} />
                      <span>{c.label}: {c.range}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Healthy range */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border text-sm">
                <div className="font-medium mb-1">Healthy Weight Range</div>
                <div className="text-muted-foreground">
                  For your height ({(result.heightM * 100).toFixed(0)} cm), a healthy weight is{' '}
                  <span className="font-semibold text-foreground">
                    {result.minHealthy.toFixed(1)} kg - {result.maxHealthy.toFixed(1)} kg
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-5 rounded-xl border border-border bg-muted/30 text-center text-muted-foreground">
              Enter your height and weight to calculate BMI
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  )
}
