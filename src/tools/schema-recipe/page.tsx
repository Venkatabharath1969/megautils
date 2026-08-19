'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton, ClearButton } from '@/components/tool-page'

export default function SchemaRecipeTool() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [author, setAuthor] = useState('')
  const [prepTime, setPrepTime] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [totalTime, setTotalTime] = useState('')
  const [servings, setServings] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [category, setCategory] = useState('')
  const [ratingValue, setRatingValue] = useState('')
  const [reviewCount, setReviewCount] = useState('')
  const [calories, setCalories] = useState('')
  const [diets, setDiets] = useState<string[]>([])
  const [ingredients, setIngredients] = useState<string[]>([''])
  const [instructions, setInstructions] = useState<string[]>([''])

  const output = useMemo(() => {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
    }
    if (name) schema.name = name
    if (description) schema.description = description
    if (image) schema.image = image
    if (author) schema.author = { '@type': 'Person', name: author }
    if (prepTime) schema.prepTime = prepTime
    if (cookTime) schema.cookTime = cookTime
    if (totalTime) schema.totalTime = totalTime
    if (servings) schema.recipeYield = servings
    if (cuisine) schema.recipeCuisine = cuisine
    if (category) schema.recipeCategory = category
    if (calories) schema.nutrition = { '@type': 'NutritionInformation', calories: `${calories} calories` }
    if (diets.length > 0) schema.suitableForDiet = diets.map(d => `https://schema.org/${d}`)

    const validIngredients = ingredients.filter(i => i.trim())
    if (validIngredients.length > 0) schema.recipeIngredient = validIngredients

    const validInstructions = instructions.filter(i => i.trim())
    if (validInstructions.length > 0) {
      schema.recipeInstructions = validInstructions.map((text, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        text,
      }))
    }

    if (ratingValue && reviewCount) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue,
        reviewCount,
      }
    }

    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`
  }, [name, description, image, author, prepTime, cookTime, totalTime, servings, cuisine, category, ratingValue, reviewCount, calories, diets, ingredients, instructions])

  const clear = () => {
    setName(''); setDescription(''); setImage(''); setAuthor('')
    setPrepTime(''); setCookTime(''); setTotalTime(''); setServings('')
    setCuisine(''); setCategory(''); setRatingValue(''); setReviewCount('')
    setCalories(''); setDiets([]); setIngredients(['']); setInstructions([''])
  }

  const inputClass = 'w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <ToolPage
      title="Recipe Schema Generator"
      description="Generate Recipe JSON-LD structured data for rich results in Google Search."
      category="seo"
      categoryLabel="SEO Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Recipe Schema Generator is a free browser-based tool that lets you generate Recipe JSON-LD structured data with ingredients, instructions, nutrition, and cooking times. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Fill in the required fields with your page or content information.</li>
            <li>Configure optional settings to match your specific SEO needs.</li>
            <li>Review the generated output, preview, or analysis results.</li>
            <li>Copy the generated code or export the results for use on your website.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when getting recipe rich snippets in search results with images, ratings, and cooking details. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this SEO tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Validate generated markup using Google Rich Results Test before deploying to your site.</li>
            <li>Keep meta titles under 60 characters and descriptions under 160 characters for optimal display in search results.</li>
            <li>Update structured data whenever your page content changes significantly.</li>
            <li>Test how your pages appear in search results using the preview features provided.</li>
            <li>All SEO analysis runs in your browser — your website data stays private.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is Recipe schema markup?', answer: 'Recipe schema is JSON-LD structured data that describes a recipe with its ingredients, instructions, cook time, and nutrition info. It enables Google to display recipe cards with images and ratings in search results.' },
        { question: 'What time format should I use for prep and cook time?', answer: 'Use ISO 8601 duration format. For example, PT15M means 15 minutes, PT1H means 1 hour, and PT1H30M means 1 hour and 30 minutes.' },
        { question: 'Does Recipe schema guarantee a recipe carousel in Google?', answer: 'No. Adding Recipe schema makes your page eligible for rich results like recipe carousels, but Google determines which pages to feature based on content quality, images, and other factors.' },
        { question: 'What fields are required for Recipe rich results?', answer: 'Google requires the recipe name and at least two of the following: image, author, datePublished, description, prepTime, or totalTime. Including all fields maximizes your chances of rich results.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recipe Details</h2>
            <ClearButton onClear={clear} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Recipe Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Chocolate Chip Cookies" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="A delicious recipe for..." rows={2} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Author</label>
              <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Chef Jane" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input type="url" value={image} onChange={e => setImage(e.target.value)} placeholder="https://example.com/photo.jpg" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Prep Time</label>
              <input type="text" value={prepTime} onChange={e => setPrepTime(e.target.value)} placeholder="PT15M" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cook Time</label>
              <input type="text" value={cookTime} onChange={e => setCookTime(e.target.value)} placeholder="PT30M" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Time</label>
              <input type="text" value={totalTime} onChange={e => setTotalTime(e.target.value)} placeholder="PT45M" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Servings</label>
              <input type="text" value={servings} onChange={e => setServings(e.target.value)} placeholder="4 servings" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cuisine</label>
              <input type="text" value={cuisine} onChange={e => setCuisine(e.target.value)} placeholder="American" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Dessert" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
              <input type="number" min="1" max="5" step="0.1" value={ratingValue} onChange={e => setRatingValue(e.target.value)} placeholder="4.8" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Review Count</label>
              <input type="number" min="0" value={reviewCount} onChange={e => setReviewCount(e.target.value)} placeholder="250" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Calories</label>
              <input type="number" min="0" value={calories} onChange={e => setCalories(e.target.value)} placeholder="350" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Suitable for Diet</label>
            <div className="flex flex-wrap gap-2">
              {['GlutenFreeDiet', 'VeganDiet', 'VegetarianDiet', 'LowCalorieDiet', 'DiabeticDiet', 'HalalDiet', 'KosherDiet', 'LowFatDiet'].map(diet => (
                <label key={diet} className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input type="checkbox" checked={diets.includes(diet)} onChange={e => { if (e.target.checked) setDiets([...diets, diet]); else setDiets(diets.filter(d => d !== diet)) }} className="rounded border-input" />
                  {diet.replace('Diet', '')}
                </label>
              ))}
            </div>
          </div>

          <h3 className="text-sm font-semibold pt-2">Ingredients</h3>
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" value={ing} onChange={e => { const u = [...ingredients]; u[i] = e.target.value; setIngredients(u) }} placeholder={`Ingredient ${i + 1}`} className={inputClass} />
              {ingredients.length > 1 && (
                <button onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))} className="text-xs text-red-500 hover:text-red-700 shrink-0 px-2">Remove</button>
              )}
            </div>
          ))}
          <button onClick={() => setIngredients([...ingredients, ''])} className="w-full px-3 py-1.5 rounded-lg border-2 border-dashed border-border text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">+ Add Ingredient</button>

          <h3 className="text-sm font-semibold pt-2">Instructions</h3>
          {instructions.map((step, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-xs font-bold text-muted-foreground pt-3 shrink-0">{i + 1}.</span>
              <textarea value={step} onChange={e => { const u = [...instructions]; u[i] = e.target.value; setInstructions(u) }} placeholder={`Step ${i + 1}`} rows={2} className={inputClass} />
              {instructions.length > 1 && (
                <button onClick={() => setInstructions(instructions.filter((_, j) => j !== i))} className="text-xs text-red-500 hover:text-red-700 shrink-0 px-2">Remove</button>
              )}
            </div>
          ))}
          <button onClick={() => setInstructions([...instructions, ''])} className="w-full px-3 py-1.5 rounded-lg border-2 border-dashed border-border text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">+ Add Step</button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Generated JSON-LD</span>
            <CopyButton text={output} />
          </div>
          <pre className="w-full rounded-lg border border-input bg-tool-bg p-3 text-xs font-mono overflow-auto whitespace-pre-wrap min-h-[300px]">{output}</pre>
        </div>
      </div>
    </ToolPage>
  )
}
