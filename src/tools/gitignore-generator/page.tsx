'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

interface Preset {
  id: string
  name: string
  patterns: string[]
}

const PRESETS: Preset[] = [
  {
    id: 'node', name: 'Node.js', patterns: [
      'node_modules/', 'npm-debug.log*', 'yarn-debug.log*', 'yarn-error.log*',
      '.npm', '.yarn/cache', '.yarn/unplugged', '.pnp.*', 'package-lock.json',
      '.env', '.env.local', '.env.*.local',
    ]
  },
  {
    id: 'react', name: 'React', patterns: [
      'node_modules/', 'build/', '.env.local', '.env.development.local',
      '.env.test.local', '.env.production.local', 'npm-debug.log*', 'yarn-debug.log*',
    ]
  },
  {
    id: 'nextjs', name: 'Next.js', patterns: [
      '.next/', 'out/', 'node_modules/', '.env*.local', 'npm-debug.log*',
      'yarn-debug.log*', 'yarn-error.log*', '.vercel', '*.tsbuildinfo', 'next-env.d.ts',
    ]
  },
  {
    id: 'python', name: 'Python', patterns: [
      '__pycache__/', '*.py[cod]', '*$py.class', '*.so', '.Python', 'build/', 'develop-eggs/',
      'dist/', 'downloads/', 'eggs/', '.eggs/', 'lib/', 'lib64/', 'parts/', 'sdist/',
      'var/', 'wheels/', '*.egg-info/', '.installed.cfg', '*.egg', 'venv/', '.venv/',
      '.env', 'pip-log.txt', '.pytest_cache/',
    ]
  },
  {
    id: 'java', name: 'Java', patterns: [
      '*.class', '*.log', '*.jar', '*.war', '*.nar', '*.ear', '*.zip', '*.tar.gz',
      '*.rar', 'hs_err_pid*', '.idea/', '*.iml', '.gradle/', 'build/', 'target/',
      '.settings/', '.project', '.classpath', 'bin/',
    ]
  },
  {
    id: 'go', name: 'Go', patterns: [
      '*.exe', '*.exe~', '*.dll', '*.so', '*.dylib', '*.test', '*.out',
      'go.work', 'vendor/',
    ]
  },
  {
    id: 'rust', name: 'Rust', patterns: [
      '/target/', 'Cargo.lock', '**/*.rs.bk',
    ]
  },
  {
    id: 'csharp', name: 'C# / .NET', patterns: [
      'bin/', 'obj/', '*.suo', '*.user', '*.userosscache', '*.sln.docstates',
      '.vs/', '[Dd]ebug/', '[Rr]elease/', 'packages/', '*.nupkg',
    ]
  },
  {
    id: 'macos', name: 'macOS', patterns: [
      '.DS_Store', '.AppleDouble', '.LSOverride', '._*', '.Spotlight-V100',
      '.Trashes', 'Icon\r',
    ]
  },
  {
    id: 'windows', name: 'Windows', patterns: [
      'Thumbs.db', 'Thumbs.db:encryptable', 'ehthumbs.db', 'ehthumbs_vista.db',
      '*.stackdump', '[Dd]esktop.ini', '$RECYCLE.BIN/',
    ]
  },
  {
    id: 'linux', name: 'Linux', patterns: [
      '*~', '.fuse_hidden*', '.directory', '.Trash-*', '.nfs*',
    ]
  },
  {
    id: 'vscode', name: 'VS Code', patterns: [
      '.vscode/*', '!.vscode/settings.json', '!.vscode/tasks.json',
      '!.vscode/launch.json', '!.vscode/extensions.json', '*.code-workspace',
      '.history/',
    ]
  },
  {
    id: 'jetbrains', name: 'JetBrains', patterns: [
      '.idea/', '*.iml', '*.iws', '*.ipr', 'out/', '.idea_modules/',
      'cmake-build-*/',
    ]
  },
  {
    id: 'env', name: 'Environment Files', patterns: [
      '.env', '.env.local', '.env.development.local', '.env.test.local',
      '.env.production.local', '.env.*',
    ]
  },
  {
    id: 'docker', name: 'Docker', patterns: [
      'docker-compose*.yml', '.dockerignore', 'Dockerfile*',
    ]
  },
]

export default function GitignoreGeneratorTool() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [customPatterns, setCustomPatterns] = useState('')
  const [presetSearch, setPresetSearch] = useState('')

  const output = useMemo(() => {
    if (selected.size === 0 && !customPatterns.trim()) return ''

    const sections: string[] = []
    const sortedPresets = PRESETS.filter((p) => selected.has(p.id))

    for (const preset of sortedPresets) {
      sections.push(`# ${preset.name}`)
      sections.push(preset.patterns.join('\n'))
      sections.push('')
    }

    if (customPatterns.trim()) {
      sections.push('# Custom')
      sections.push(customPatterns.trim())
      sections.push('')
    }

    return sections.join('\n').trim()
  }, [selected, customPatterns])

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const clear = () => {
    setSelected(new Set())
    setCustomPatterns('')
  }

  return (
    <ToolPage
      title=".gitignore Generator"
      description="Generate .gitignore files from common presets for any project type"
      category="generators"
      categoryLabel="Generators"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>.gitignore Generator is a free browser-based tool that lets you generate .gitignore files for various programming languages, frameworks, and IDEs with commonly used patterns. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Configure the generation parameters — type, format, quantity, and any constraints.</li>
            <li>Click <strong>Generate</strong> to produce your output.</li>
            <li>Review the generated content and regenerate if needed.</li>
            <li>Copy individual items or download the full set for immediate use.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when setting up new projects to exclude build artifacts, dependencies, IDE files, and other non-essential files from Git. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this development tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Generated values use cryptographically secure random sources when security-sensitive (passwords, UUIDs).</li>
            <li>Click Generate multiple times to produce different variations until you find what you need.</li>
            <li>Customize format options to match the exact requirements of your project or platform.</li>
            <li>Copy individual items or generate in bulk depending on the tool capabilities.</li>
            <li>All generation happens in your browser — nothing is stored on any server.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is a .gitignore file?', answer: 'A .gitignore file tells Git which files and directories to exclude from version control. It prevents build artifacts, dependencies, environment files, and OS-specific files from being committed to your repository.' },
        { question: 'Can I combine multiple presets?', answer: 'Yes. Select as many presets as you need, and they will be combined into a single .gitignore file with labeled sections. This is useful for projects that use multiple technologies or target multiple operating systems.' },
        { question: 'Where should I place the .gitignore file?', answer: 'Place it in the root directory of your Git repository. Git reads the .gitignore file from the project root and applies the patterns to all files and subdirectories.' },
        { question: 'Does .gitignore remove files already tracked by Git?', answer: 'No. The .gitignore file only prevents untracked files from being added. To stop tracking a file that is already committed, run "git rm --cached filename" and then commit the change.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Presets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Select Presets</span>
            <ClearButton onClear={clear} />
          </div>

          <input type="text" value={presetSearch} onChange={e => setPresetSearch(e.target.value)} placeholder="Search presets..." className="w-full h-9 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.filter(p => !presetSearch.trim() || p.name.toLowerCase().includes(presetSearch.toLowerCase()) || p.patterns.some(pat => pat.toLowerCase().includes(presetSearch.toLowerCase()))).map((p) => (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  selected.has(p.id)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground border border-border hover:bg-muted'
                }`}
              >
                {p.name}
                <span className="block text-xs opacity-70">{p.patterns.length} rules</span>
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Custom Patterns</label>
            <textarea
              value={customPatterns}
              onChange={(e) => setCustomPatterns(e.target.value)}
              placeholder="Add custom patterns, one per line..."
              rows={4}
              className="tool-textarea w-full rounded-lg border border-input bg-tool-bg p-3 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground text-sm"
            />
          </div>
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">.gitignore Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename=".gitignore" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly placeholder="Select presets to generate .gitignore..." rows={20} />
        </div>
      </div>
    </ToolPage>
  )
}
