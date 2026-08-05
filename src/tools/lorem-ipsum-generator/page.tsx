'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
  'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
  'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
  'explicabo', 'nemo', 'ipsam', 'voluptas', 'aspernatur', 'aut', 'odit', 'fugit',
  'consequuntur', 'magni', 'dolores', 'eos', 'ratione', 'sequi', 'nesciunt',
  'neque', 'porro', 'quisquam', 'nihil', 'impedit', 'quo', 'minus', 'quod',
  'maxime', 'placeat', 'facere', 'possimus', 'assumenda', 'repellendus',
  'temporibus', 'quibusdam', 'illum', 'fugiat', 'blanditiis', 'praesentium',
  'voluptatum', 'deleniti', 'atque', 'corrupti', 'quos', 'quas', 'molestias',
  'excepturi', 'obcaecati', 'cupiditate', 'provident', 'similique', 'mollitia',
  'animi', 'sapiente', 'delectus', 'rerum', 'hic', 'tenetur',
]

function randomWord(): string {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]
}

function generateSentence(minWords = 5, maxWords = 15): string {
  const count = minWords + Math.floor(Math.random() * (maxWords - minWords + 1))
  const words: string[] = []
  for (let i = 0; i < count; i++) words.push(randomWord())
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
  return words.join(' ') + '.'
}

function generateParagraph(minSentences = 3, maxSentences = 7): string {
  const count = minSentences + Math.floor(Math.random() * (maxSentences - minSentences + 1))
  const sentences: string[] = []
  for (let i = 0; i < count; i++) sentences.push(generateSentence())
  return sentences.join(' ')
}

type GenType = 'paragraphs' | 'sentences' | 'words'

export default function LoremIpsumGeneratorTool() {
  const [genType, setGenType] = useState<GenType>('paragraphs')
  const [count, setCount] = useState(3)
  const [output, setOutput] = useState('')

  const generate = () => {
    const clamped = Math.max(1, Math.min(100, count))
    switch (genType) {
      case 'paragraphs': {
        const paragraphs: string[] = []
        for (let i = 0; i < clamped; i++) paragraphs.push(generateParagraph())
        setOutput(paragraphs.join('\n\n'))
        break
      }
      case 'sentences': {
        const sentences: string[] = []
        for (let i = 0; i < clamped; i++) sentences.push(generateSentence())
        setOutput(sentences.join(' '))
        break
      }
      case 'words': {
        const words: string[] = []
        for (let i = 0; i < clamped; i++) words.push(randomWord())
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
        setOutput(words.join(' ') + '.')
        break
      }
    }
  }

  const types: { value: GenType; label: string }[] = [
    { value: 'paragraphs', label: 'Paragraphs' },
    { value: 'sentences', label: 'Sentences' },
    { value: 'words', label: 'Words' },
  ]

  return (
    <ToolPage
      title="Lorem Ipsum Generator"
      description="Generate placeholder Lorem Ipsum text by paragraphs, sentences, or words."
      category="text"
      categoryLabel="Text Tools"
      faqs={[
        { question: 'What is Lorem Ipsum and why is it used?', answer: 'Lorem Ipsum is scrambled Latin-derived placeholder text used by designers and developers to fill layouts, allowing them to focus on visual design without being distracted by readable content.' },
        { question: 'Can I generate a specific number of words or sentences?', answer: 'Yes, choose between paragraphs, sentences, or words mode and set the exact count you need, from 1 up to 100 units of your chosen type.' },
        { question: 'Is Lorem Ipsum real Latin?', answer: 'It is derived from a 1st-century BC text by Cicero ("De Finibus Bonorum et Malorum"), but the words have been altered and scrambled so it is not proper Latin.' },
        { question: 'Why not just use random English text as placeholder?', answer: 'Readable English content draws attention to the words themselves instead of the layout. Lorem Ipsum has a natural distribution of letters and word lengths that mimics real text without being distracting.' },
      ]}
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-2">
          {types.map((t) => (
            <button key={t.value} onClick={() => setGenType(t.value)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${genType === t.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Count:</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            className="w-20 px-3 py-1.5 text-sm rounded-md border border-input bg-tool-bg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button onClick={generate} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Generate
        </button>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Generated Text</span>
        <div className="flex gap-1.5">
          {output && <CopyButton text={output} />}
          {output && <ClearButton onClear={() => setOutput('')} />}
        </div>
      </div>
      <ToolTextarea value={output} readOnly placeholder="Click Generate to create Lorem Ipsum text..." rows={12} />
    </ToolPage>
  )
}
