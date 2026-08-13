export interface Unit {
  id: string        // e.g., "cm"
  name: string      // e.g., "Centimeters"
  symbol: string    // e.g., "cm"
  toBase: number    // multiplication factor to convert to base unit
}

export interface UnitCategory {
  id: string
  name: string
  baseUnit: string   // the base unit for this category
  units: Unit[]
  popularValues: number[]
}

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    name: 'Length',
    baseUnit: 'meters',
    units: [
      { id: 'mm', name: 'Millimeters', symbol: 'mm', toBase: 0.001 },
      { id: 'cm', name: 'Centimeters', symbol: 'cm', toBase: 0.01 },
      { id: 'm', name: 'Meters', symbol: 'm', toBase: 1 },
      { id: 'km', name: 'Kilometers', symbol: 'km', toBase: 1000 },
      { id: 'in', name: 'Inches', symbol: 'in', toBase: 0.0254 },
      { id: 'ft', name: 'Feet', symbol: 'ft', toBase: 0.3048 },
      { id: 'yd', name: 'Yards', symbol: 'yd', toBase: 0.9144 },
      { id: 'mi', name: 'Miles', symbol: 'mi', toBase: 1609.344 },
    ],
    popularValues: [1, 5, 10, 15, 20, 25, 50, 100],
  },
  {
    id: 'weight',
    name: 'Weight',
    baseUnit: 'kilograms',
    units: [
      { id: 'mg', name: 'Milligrams', symbol: 'mg', toBase: 0.000001 },
      { id: 'g', name: 'Grams', symbol: 'g', toBase: 0.001 },
      { id: 'kg', name: 'Kilograms', symbol: 'kg', toBase: 1 },
      { id: 'lb', name: 'Pounds', symbol: 'lb', toBase: 0.453592 },
      { id: 'oz', name: 'Ounces', symbol: 'oz', toBase: 0.0283495 },
      { id: 'ton', name: 'Metric Tons', symbol: 't', toBase: 1000 },
      { id: 'st', name: 'Stones', symbol: 'st', toBase: 6.35029 },
    ],
    popularValues: [1, 5, 10, 25, 50, 100],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    baseUnit: 'celsius',
    units: [
      { id: 'c', name: 'Celsius', symbol: '\u00b0C', toBase: 1 },
      { id: 'f', name: 'Fahrenheit', symbol: '\u00b0F', toBase: 1 },
      { id: 'k', name: 'Kelvin', symbol: 'K', toBase: 1 },
    ],
    popularValues: [0, 20, 32, 37, 100, 212, 350, 400],
  },
  {
    id: 'volume',
    name: 'Volume',
    baseUnit: 'liters',
    units: [
      { id: 'ml', name: 'Milliliters', symbol: 'mL', toBase: 0.001 },
      { id: 'l', name: 'Liters', symbol: 'L', toBase: 1 },
      { id: 'gal', name: 'Gallons (US)', symbol: 'gal', toBase: 3.78541 },
      { id: 'qt', name: 'Quarts', symbol: 'qt', toBase: 0.946353 },
      { id: 'pt', name: 'Pints', symbol: 'pt', toBase: 0.473176 },
      { id: 'cup', name: 'Cups', symbol: 'cup', toBase: 0.236588 },
      { id: 'floz', name: 'Fluid Ounces', symbol: 'fl oz', toBase: 0.0295735 },
      { id: 'tbsp', name: 'Tablespoons', symbol: 'tbsp', toBase: 0.0147868 },
    ],
    popularValues: [1, 5, 10, 50, 100, 250, 500, 1000],
  },
  {
    id: 'speed',
    name: 'Speed',
    baseUnit: 'meters per second',
    units: [
      { id: 'ms', name: 'Meters/Second', symbol: 'm/s', toBase: 1 },
      { id: 'kmh', name: 'Kilometers/Hour', symbol: 'km/h', toBase: 0.277778 },
      { id: 'mph', name: 'Miles/Hour', symbol: 'mph', toBase: 0.44704 },
      { id: 'knot', name: 'Knots', symbol: 'kn', toBase: 0.514444 },
    ],
    popularValues: [1, 10, 30, 50, 60, 100, 120, 200],
  },
  {
    id: 'data',
    name: 'Data Storage',
    baseUnit: 'bytes',
    units: [
      { id: 'b', name: 'Bytes', symbol: 'B', toBase: 1 },
      { id: 'kb', name: 'Kilobytes', symbol: 'KB', toBase: 1024 },
      { id: 'mb', name: 'Megabytes', symbol: 'MB', toBase: 1048576 },
      { id: 'gb', name: 'Gigabytes', symbol: 'GB', toBase: 1073741824 },
      { id: 'tb', name: 'Terabytes', symbol: 'TB', toBase: 1099511627776 },
    ],
    popularValues: [1, 10, 100, 256, 500, 1024],
  },
]

// Temperature needs special conversion (not linear)
export function convert(value: number, from: Unit, to: Unit, categoryId: string): number {
  if (categoryId === 'temperature') {
    return convertTemperature(value, from.id, to.id)
  }
  const baseValue = value * from.toBase
  return baseValue / to.toBase
}

function convertTemperature(value: number, fromId: string, toId: string): number {
  // Convert to Celsius first
  let celsius: number
  if (fromId === 'c') celsius = value
  else if (fromId === 'f') celsius = (value - 32) * 5 / 9
  else celsius = value - 273.15 // Kelvin

  // Convert from Celsius to target
  if (toId === 'c') return celsius
  if (toId === 'f') return celsius * 9 / 5 + 32
  return celsius + 273.15 // Kelvin
}

// Generate all conversion pairs for a category
export function getAllPairs(category: UnitCategory): { from: Unit; to: Unit }[] {
  const pairs: { from: Unit; to: Unit }[] = []
  for (const from of category.units) {
    for (const to of category.units) {
      if (from.id !== to.id) pairs.push({ from, to })
    }
  }
  return pairs
}

// Get all pairs across all categories
export function getAllConversionPairs(): { category: UnitCategory; from: Unit; to: Unit }[] {
  return UNIT_CATEGORIES.flatMap(cat =>
    getAllPairs(cat).map(pair => ({ category: cat, ...pair }))
  )
}

// Format a number for display - handles very small and very large numbers
export function formatResult(value: number): string {
  if (value === 0) return '0'
  const abs = Math.abs(value)
  if (abs < 0.001 || abs >= 1e12) return value.toExponential(4)
  if (Number.isInteger(value)) return value.toString()
  // Use up to 6 significant digits
  const formatted = value.toPrecision(6)
  // Remove trailing zeros after decimal
  return parseFloat(formatted).toString()
}
