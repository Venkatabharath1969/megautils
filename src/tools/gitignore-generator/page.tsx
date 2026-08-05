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

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.map((p) => (
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
