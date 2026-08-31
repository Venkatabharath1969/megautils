'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

type Gender = 'male' | 'female'
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'extreme'
type UnitSystem = 'metric' | 'imperial'
type MacroPreset = 'balanced' | 'lowCarb' | 'highProtein'

const ACTIVITY_LEVELS: { key: ActivityLevel; label: string; description: string; multiplier: number }[] = [
  { key: 'sedentary', label: 'Sedentary', description: 'Little or no exercise, desk job', multiplier: 1.2 },
  { key: 'light', label: 'Lightly Active', description: 'Light exercise 1-3 days/week', multiplier: 1.375 },
  { key: 'moderate', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week', multiplier: 1.55 },
  { key: 'active', label: 'Very Active', description: 'Hard exercise 6-7 days/week', multiplier: 1.725 },
  { key: 'extreme', label: 'Extra Active', description: 'Very hard exercise, physical job', multiplier: 1.9 },
]

const MACRO_PRESETS: { key: MacroPreset; label: string; protein: number; carbs: number; fat: number }[] = [
  { key: 'balanced', label: 'Balanced', protein: 0.3, carbs: 0.4, fat: 0.3 },
  { key: 'lowCarb', label: 'Low Carb', protein: 0.4, carbs: 0.2, fat: 0.4 },
  { key: 'highProtein', label: 'High Protein', protein: 0.4, carbs: 0.35, fat: 0.25 },
]

const CALORIE_TARGETS = [
  { label: 'Maintenance', offset: 0, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500/10 border-green-500/30' },
  { label: 'Mild Weight Loss', offset: -250, color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-500/10 border-yellow-500/30' },
  { label: 'Weight Loss', offset: -500, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/30' },
  { label: 'Extreme Weight Loss', offset: -1000, color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500/10 border-red-500/30' },
]

export default function CalorieCalculatorTool() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric')
  const [gender, setGender] = useState<Gender>('male')
  const [age, setAge] = useState('25')
  const [heightCm, setHeightCm] = useState('175')
  const [feet, setFeet] = useState('5')
  const [inches, setInches] = useState('9')
  const [weightKg, setWeightKg] = useState('70')
  const [weightLb, setWeightLb] = useState('154')
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate')
  const [macroPreset, setMacroPreset] = useState<MacroPreset>('balanced')

  const result = useMemo(() => {
    const ageVal = parseInt(age)
    if (isNaN(ageVal) || ageVal <= 0 || ageVal > 120) return null

    let heightCmVal: number
    let weightKgVal: number

    if (unitSystem === 'metric') {
      heightCmVal = parseFloat(heightCm)
      weightKgVal = parseFloat(weightKg)
    } else {
      const ft = parseFloat(feet) || 0
      const inc = parseFloat(inches) || 0
      heightCmVal = (ft * 12 + inc) * 2.54
      weightKgVal = parseFloat(weightLb) * 0.45359237
    }

    if (isNaN(heightCmVal) || isNaN(weightKgVal) || heightCmVal <= 0 || weightKgVal <= 0) return null

    // Mifflin-St Jeor Formula
    const bmr = gender === 'male'
      ? 10 * weightKgVal + 6.25 * heightCmVal - 5 * ageVal + 5
      : 10 * weightKgVal + 6.25 * heightCmVal - 5 * ageVal - 161

    const activity = ACTIVITY_LEVELS.find(a => a.key === activityLevel)!
    const tdee = bmr * activity.multiplier

    const macro = MACRO_PRESETS.find(m => m.key === macroPreset)!

    const targets = CALORIE_TARGETS.map(t => {
      const calories = Math.round(tdee + t.offset)
      const safeCal = Math.max(calories, gender === 'male' ? 1500 : 1200)
      return {
        ...t,
        calories: safeCal,
        protein: Math.round((safeCal * macro.protein) / 4),
        carbs: Math.round((safeCal * macro.carbs) / 4),
        fat: Math.round((safeCal * macro.fat) / 9),
      }
    })

    return { bmr: Math.round(bmr), tdee: Math.round(tdee), targets, heightCmVal, weightKgVal }
  }, [unitSystem, gender, age, heightCm, feet, inches, weightKg, weightLb, activityLevel, macroPreset])

  return (
    <ToolPage
      title="Calorie Calculator"
      description="Calculate your BMR, TDEE, and daily calorie needs using the Mifflin-St Jeor formula. Get macronutrient breakdowns for different goals."
      category="math"
      categoryLabel="Math & Science"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>The Calorie Calculator computes your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) using the Mifflin-St Jeor equation, which is widely regarded as the most accurate formula for estimating caloric needs. It provides calorie targets for maintenance, mild weight loss, weight loss, and extreme weight loss, along with macronutrient breakdowns. All calculations run locally in your browser — no data is uploaded or stored.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Choose your unit system — Metric (cm/kg) or Imperial (ft-in/lb).</li>
            <li>Select your gender and enter your age.</li>
            <li>Enter your height and weight in the selected unit system.</li>
            <li>Choose your activity level from Sedentary to Extra Active.</li>
            <li>View your BMR, TDEE, and calorie targets for different goals.</li>
            <li>Select a macro ratio (Balanced, Low Carb, or High Protein) to see the protein, carbs, and fat breakdown for each calorie target.</li>
          </ol>

          <h2>Understanding the Formulas</h2>
          <ul>
            <li><strong>BMR (Basal Metabolic Rate)</strong>: The number of calories your body burns at complete rest to maintain basic life functions like breathing and circulation.</li>
            <li><strong>TDEE (Total Daily Energy Expenditure)</strong>: Your BMR multiplied by an activity factor, representing the total calories you burn in a day including exercise and daily activities.</li>
            <li><strong>Mifflin-St Jeor Formula</strong>: Male: 10 x weight(kg) + 6.25 x height(cm) - 5 x age + 5. Female: 10 x weight(kg) + 6.25 x height(cm) - 5 x age - 161.</li>
          </ul>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>These are estimates — individual metabolism can vary by 5-15%. Use the numbers as a starting point and adjust based on actual results over 2-4 weeks.</li>
            <li>Do not drop calories below 1,500/day for men or 1,200/day for women without medical supervision. The calculator enforces these minimums.</li>
            <li>A deficit of 500 calories per day leads to approximately 1 pound (0.45 kg) of weight loss per week.</li>
            <li>Choose your activity level honestly — overestimating leads to higher calorie targets and slower progress.</li>
            <li>The High Protein macro preset is ideal for those doing strength training and wanting to preserve or build muscle.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is the most accurate calorie formula?', answer: 'The Mifflin-St Jeor equation is considered the most accurate for estimating BMR. Published in 1990, it is recommended by the Academy of Nutrition and Dietetics and performs better than the older Harris-Benedict equation in validation studies.' },
        { question: 'What is the difference between BMR and TDEE?', answer: 'BMR (Basal Metabolic Rate) is the calories your body burns at complete rest. TDEE (Total Daily Energy Expenditure) includes your BMR plus calories burned through daily activity and exercise. TDEE is what you should base your diet on.' },
        { question: 'How much of a calorie deficit is safe?', answer: 'A deficit of 250-500 calories per day is generally considered safe and sustainable, leading to 0.5-1 pound of weight loss per week. Extreme deficits (1,000+ cal) should only be followed short-term and with medical guidance.' },
        { question: 'Should I eat back exercise calories?', answer: 'If your TDEE already accounts for your exercise via the activity multiplier, you do not need to eat back exercise calories separately. Only add extra food if your exercise exceeds what the activity level describes.' },
        { question: 'How do I choose the right activity level?', answer: 'Sedentary: desk job, minimal movement. Lightly Active: walking, light exercise 1-3 days. Moderately Active: gym 3-5 days. Very Active: intense exercise 6-7 days. Extra Active: physical labor or two-a-day training.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          {/* Unit system toggle */}
          <div className="flex gap-1">
            <button
              onClick={() => setUnitSystem('metric')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                unitSystem === 'metric' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'
              }`}
            >Metric (cm/kg)</button>
            <button
              onClick={() => setUnitSystem('imperial')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                unitSystem === 'imperial' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'
              }`}
            >Imperial (ft-in/lb)</button>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Gender</label>
            <div className="flex gap-2">
              <button
                onClick={() => setGender('male')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  gender === 'male' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'
                }`}
              >Male</button>
              <button
                onClick={() => setGender('female')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  gender === 'female' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'
                }`}
              >Female</button>
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Age</label>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="Enter your age"
              min={1}
              max={120}
              className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Height</label>
            {unitSystem === 'metric' ? (
              <div className="relative">
                <input
                  type="number"
                  value={heightCm}
                  onChange={e => setHeightCm(e.target.value)}
                  placeholder="Height in cm"
                  min={0}
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">cm</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input type="number" value={feet} onChange={e => setFeet(e.target.value)} min={0} placeholder="Feet" className="w-full h-10 px-3 pr-8 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">ft</span>
                </div>
                <div className="relative">
                  <input type="number" value={inches} onChange={e => setInches(e.target.value)} min={0} max={11} placeholder="Inches" className="w-full h-10 px-3 pr-8 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">in</span>
                </div>
              </div>
            )}
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Weight</label>
            <div className="relative">
              {unitSystem === 'metric' ? (
                <>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={e => setWeightKg(e.target.value)}
                    placeholder="Weight in kg"
                    min={0}
                    className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">kg</span>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    value={weightLb}
                    onChange={e => setWeightLb(e.target.value)}
                    placeholder="Weight in lb"
                    min={0}
                    className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">lb</span>
                </>
              )}
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Activity Level</label>
            <div className="space-y-2">
              {ACTIVITY_LEVELS.map(a => (
                <button
                  key={a.key}
                  onClick={() => setActivityLevel(a.key)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    activityLevel === a.key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80'
                  }`}
                >
                  <div className="font-medium">{a.label}</div>
                  <div className={`text-xs ${activityLevel === a.key ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{a.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* BMR & TDEE */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
                  <div className="text-sm text-muted-foreground mb-1">BMR</div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{result.bmr.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">cal/day</div>
                </div>
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                  <div className="text-sm text-muted-foreground mb-1">TDEE</div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{result.tdee.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">cal/day</div>
                </div>
              </div>

              {/* Calorie Targets */}
              <div className="space-y-3">
                <div className="text-sm font-medium">Daily Calorie Targets</div>
                {result.targets.map(t => (
                  <div key={t.label} className={`p-4 rounded-xl border ${t.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className={`font-semibold ${t.color}`}>{t.label}</div>
                        <div className="text-xs text-muted-foreground">{t.offset === 0 ? 'No change' : `${t.offset} cal/day`}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`text-2xl font-bold ${t.color}`}>{t.calories.toLocaleString()}</div>
                        <CopyButton text={t.calories.toString()} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-background/50 text-center">
                        <div className="font-semibold">{t.protein}g</div>
                        <div className="text-muted-foreground">Protein</div>
                      </div>
                      <div className="p-2 rounded-lg bg-background/50 text-center">
                        <div className="font-semibold">{t.carbs}g</div>
                        <div className="text-muted-foreground">Carbs</div>
                      </div>
                      <div className="p-2 rounded-lg bg-background/50 text-center">
                        <div className="font-semibold">{t.fat}g</div>
                        <div className="text-muted-foreground">Fat</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Macro preset selector */}
              <div className="p-4 rounded-xl border border-border">
                <div className="text-sm font-medium mb-2">Macronutrient Ratio</div>
                <div className="flex gap-2">
                  {MACRO_PRESETS.map(m => (
                    <button
                      key={m.key}
                      onClick={() => setMacroPreset(m.key)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        macroPreset === m.key
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground border border-border'
                      }`}
                    >
                      <div>{m.label}</div>
                      <div className={`text-[10px] mt-0.5 ${macroPreset === m.key ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        P:{Math.round(m.protein * 100)}% C:{Math.round(m.carbs * 100)}% F:{Math.round(m.fat * 100)}%
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formula info */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground">
                <div className="font-medium text-foreground mb-1">Formula Used: Mifflin-St Jeor</div>
                <div>Male: 10 &times; weight(kg) + 6.25 &times; height(cm) &minus; 5 &times; age + 5</div>
                <div>Female: 10 &times; weight(kg) + 6.25 &times; height(cm) &minus; 5 &times; age &minus; 161</div>
                <div className="mt-1">Protein: 4 cal/g &middot; Carbs: 4 cal/g &middot; Fat: 9 cal/g</div>
              </div>
            </>
          ) : (
            <div className="p-5 rounded-xl border border-border bg-muted/30 text-center text-muted-foreground">
              Enter your details to calculate BMR, TDEE, and daily calorie targets
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  )
}
