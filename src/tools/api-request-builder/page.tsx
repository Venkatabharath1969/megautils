'use client'

import { useState, useMemo, useCallback } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'
import { Plus, Trash2 } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
type AuthType = 'none' | 'bearer' | 'basic' | 'apikey'
type CodeLanguage = 'curl' | 'javascript' | 'python' | 'nodejs' | 'php' | 'go'

interface KeyValue {
  id: string
  key: string
  value: string
  enabled: boolean
}

interface RequestConfig {
  method: HttpMethod
  url: string
  headers: KeyValue[]
  queryParams: KeyValue[]
  body: string
  authType: AuthType
  authToken: string
  authUsername: string
  authPassword: string
  apiKeyName: string
  apiKeyValue: string
  apiKeyLocation: 'header' | 'query'
}

// ---------------------------------------------------------------------------
// Code generators
// ---------------------------------------------------------------------------

function getEffectiveHeaders(config: RequestConfig): { key: string; value: string }[] {
  const headers = config.headers
    .filter(h => h.enabled && h.key.trim())
    .map(h => ({ key: h.key.trim(), value: h.value }))

  // Add auth headers
  if (config.authType === 'bearer' && config.authToken) {
    headers.push({ key: 'Authorization', value: `Bearer ${config.authToken}` })
  } else if (config.authType === 'basic' && config.authUsername) {
    const encoded = typeof btoa !== 'undefined'
      ? btoa(`${config.authUsername}:${config.authPassword}`)
      : Buffer.from(`${config.authUsername}:${config.authPassword}`).toString('base64')
    headers.push({ key: 'Authorization', value: `Basic ${encoded}` })
  } else if (config.authType === 'apikey' && config.apiKeyName && config.apiKeyLocation === 'header') {
    headers.push({ key: config.apiKeyName, value: config.apiKeyValue })
  }

  // Add Content-Type for body methods
  if (['POST', 'PUT', 'PATCH'].includes(config.method) && config.body.trim()) {
    if (!headers.some(h => h.key.toLowerCase() === 'content-type')) {
      headers.push({ key: 'Content-Type', value: 'application/json' })
    }
  }

  return headers
}

function buildUrl(config: RequestConfig): string {
  const activeParams = config.queryParams.filter(p => p.enabled && p.key.trim())
  if (activeParams.length === 0) {
    if (config.authType === 'apikey' && config.apiKeyLocation === 'query' && config.apiKeyName) {
      return `${config.url}?${encodeURIComponent(config.apiKeyName)}=${encodeURIComponent(config.apiKeyValue)}`
    }
    return config.url
  }

  const params = activeParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
  if (config.authType === 'apikey' && config.apiKeyLocation === 'query' && config.apiKeyName) {
    params.push(`${encodeURIComponent(config.apiKeyName)}=${encodeURIComponent(config.apiKeyValue)}`)
  }
  return `${config.url}?${params.join('&')}`
}

function generateCurl(config: RequestConfig): string {
  const url = buildUrl(config)
  const headers = getEffectiveHeaders(config)
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(config.method) && config.body.trim()

  let cmd = `curl -X ${config.method}`
  cmd += ` \\\n  '${url}'`
  headers.forEach(h => { cmd += ` \\\n  -H '${h.key}: ${h.value}'` })
  if (hasBody) cmd += ` \\\n  -d '${config.body.trim()}'`
  return cmd
}

function generateFetch(config: RequestConfig): string {
  const url = buildUrl(config)
  const headers = getEffectiveHeaders(config)
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(config.method) && config.body.trim()

  let code = `const response = await fetch('${url}', {\n`
  code += `  method: '${config.method}',\n`

  if (headers.length > 0) {
    code += `  headers: {\n`
    headers.forEach((h, i) => {
      code += `    '${h.key}': '${h.value}'${i < headers.length - 1 ? ',' : ''}\n`
    })
    code += `  },\n`
  }

  if (hasBody) {
    code += `  body: JSON.stringify(${config.body.trim()}),\n`
  }

  code += `});\n\n`
  code += `const data = await response.json();\nconsole.log(data);`
  return code
}

function generatePython(config: RequestConfig): string {
  const url = buildUrl(config)
  const headers = getEffectiveHeaders(config)
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(config.method) && config.body.trim()

  let code = `import requests\n\n`
  code += `url = '${url}'\n`

  if (headers.length > 0) {
    code += `headers = {\n`
    headers.forEach(h => { code += `    '${h.key}': '${h.value}',\n` })
    code += `}\n`
  }

  if (hasBody) {
    code += `payload = ${config.body.trim()}\n`
  }

  code += `\nresponse = requests.${config.method.toLowerCase()}(\n    url`
  if (headers.length > 0) code += `,\n    headers=headers`
  if (hasBody) code += `,\n    json=payload`
  code += `\n)\n\n`
  code += `print(response.status_code)\nprint(response.json())`
  return code
}

function generateAxios(config: RequestConfig): string {
  const url = buildUrl(config)
  const headers = getEffectiveHeaders(config)
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(config.method) && config.body.trim()

  let code = `const axios = require('axios');\n\n`
  code += `const config = {\n`
  code += `  method: '${config.method.toLowerCase()}',\n`
  code += `  url: '${url}',\n`

  if (headers.length > 0) {
    code += `  headers: {\n`
    headers.forEach(h => { code += `    '${h.key}': '${h.value}',\n` })
    code += `  },\n`
  }

  if (hasBody) {
    code += `  data: ${config.body.trim()},\n`
  }

  code += `};\n\n`
  code += `const response = await axios(config);\nconsole.log(response.data);`
  return code
}

function generatePhp(config: RequestConfig): string {
  const url = buildUrl(config)
  const headers = getEffectiveHeaders(config)
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(config.method) && config.body.trim()

  let code = `<?php\n\n`
  code += `$ch = curl_init();\n\n`
  code += `curl_setopt($ch, CURLOPT_URL, '${url}');\n`
  code += `curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n`
  code += `curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${config.method}');\n`

  if (headers.length > 0) {
    code += `\ncurl_setopt($ch, CURLOPT_HTTPHEADER, [\n`
    headers.forEach(h => { code += `    '${h.key}: ${h.value}',\n` })
    code += `]);\n`
  }

  if (hasBody) {
    code += `\ncurl_setopt($ch, CURLOPT_POSTFIELDS, '${config.body.trim().replace(/'/g, "\\'")}');\n`
  }

  code += `\n$response = curl_exec($ch);\n$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);\ncurl_close($ch);\n\n`
  code += `echo "Status: $httpCode\\n";\necho $response;`
  return code
}

function generateGo(config: RequestConfig): string {
  const url = buildUrl(config)
  const headers = getEffectiveHeaders(config)
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(config.method) && config.body.trim()

  let code = `package main\n\nimport (\n\t"fmt"\n\t"io"\n\t"net/http"\n`
  if (hasBody) code += `\t"strings"\n`
  code += `)\n\nfunc main() {\n`

  if (hasBody) {
    code += `\tbody := strings.NewReader(\`${config.body.trim()}\`)\n`
    code += `\treq, err := http.NewRequest("${config.method}", "${url}", body)\n`
  } else {
    code += `\treq, err := http.NewRequest("${config.method}", "${url}", nil)\n`
  }

  code += `\tif err != nil {\n\t\tpanic(err)\n\t}\n\n`

  headers.forEach(h => {
    code += `\treq.Header.Set("${h.key}", "${h.value}")\n`
  })

  code += `\n\tclient := &http.Client{}\n`
  code += `\tresp, err := client.Do(req)\n`
  code += `\tif err != nil {\n\t\tpanic(err)\n\t}\n`
  code += `\tdefer resp.Body.Close()\n\n`
  code += `\tresBody, _ := io.ReadAll(resp.Body)\n`
  code += `\tfmt.Println(resp.StatusCode)\n`
  code += `\tfmt.Println(string(resBody))\n`
  code += `}`
  return code
}

function generateCode(config: RequestConfig, language: CodeLanguage): string {
  switch (language) {
    case 'curl': return generateCurl(config)
    case 'javascript': return generateFetch(config)
    case 'python': return generatePython(config)
    case 'nodejs': return generateAxios(config)
    case 'php': return generatePhp(config)
    case 'go': return generateGo(config)
    default: return ''
  }
}

// ---------------------------------------------------------------------------
// cURL import parser
// ---------------------------------------------------------------------------

function parseCurl(curlCommand: string): Partial<RequestConfig> {
  const result: Partial<RequestConfig> = {
    method: 'GET',
    headers: [],
    queryParams: [],
    body: '',
    authType: 'none',
  }

  const cmd = curlCommand.replace(/\\\n\s*/g, ' ').trim()

  // Method
  const methodMatch = cmd.match(/-X\s+([A-Z]+)/)
  if (methodMatch) result.method = methodMatch[1] as HttpMethod

  // URL
  const urlMatch = cmd.match(/(?:curl\s+)?(?:-X\s+[A-Z]+\s+)?['"]?(https?:\/\/[^\s'"]+)['"]?/)
  if (urlMatch) {
    const fullUrl = urlMatch[1]
    const qIdx = fullUrl.indexOf('?')
    if (qIdx !== -1) {
      result.url = fullUrl.slice(0, qIdx)
      const searchParams = new URLSearchParams(fullUrl.slice(qIdx + 1))
      const params: KeyValue[] = []
      searchParams.forEach((value, key) => {
        params.push({ id: crypto.randomUUID(), key, value, enabled: true })
      })
      result.queryParams = params
    } else {
      result.url = fullUrl
    }
  }

  // Headers
  const headerRegex = /-H\s+['"]([^'"]+)['"]/g
  let hMatch
  const headers: KeyValue[] = []
  while ((hMatch = headerRegex.exec(cmd)) !== null) {
    const colonIdx = hMatch[1].indexOf(':')
    if (colonIdx !== -1) {
      const key = hMatch[1].slice(0, colonIdx).trim()
      const value = hMatch[1].slice(colonIdx + 1).trim()

      // Detect auth headers
      if (key.toLowerCase() === 'authorization') {
        if (value.startsWith('Bearer ')) {
          result.authType = 'bearer'
          result.authToken = value.slice(7)
          continue
        } else if (value.startsWith('Basic ')) {
          result.authType = 'basic'
          try {
            const decoded = atob(value.slice(6))
            const [user, pass] = decoded.split(':')
            result.authUsername = user
            result.authPassword = pass || ''
          } catch {
            result.authToken = value.slice(6)
          }
          continue
        }
      }

      headers.push({ id: crypto.randomUUID(), key, value, enabled: true })
    }
  }
  result.headers = headers

  // Body
  const dataMatch = cmd.match(/-d\s+['"](.+?)['"]/) || cmd.match(/--data\s+['"](.+?)['"]/) || cmd.match(/--data-raw\s+['"](.+?)['"]/)
  if (dataMatch) {
    result.body = dataMatch[1]
    if (!result.method || result.method === 'GET') result.method = 'POST'
  }

  return result
}

// ---------------------------------------------------------------------------
// Key-Value pair editor component
// ---------------------------------------------------------------------------

function KeyValueEditor({ items, onChange, label }: {
  items: KeyValue[]
  onChange: (items: KeyValue[]) => void
  label: string
}) {
  const addItem = () => {
    onChange([...items, { id: crypto.randomUUID(), key: '', value: '', enabled: true }])
  }

  const updateItem = (id: string, field: 'key' | 'value' | 'enabled', val: string | boolean) => {
    onChange(items.map(item =>
      item.id === id ? { ...item, [field]: val } : item
    ))
  }

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium">{label}</label>
        <button
          onClick={addItem}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-border bg-card hover:bg-muted transition-colors"
        >
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground py-2">No {label.toLowerCase()} added yet.</p>
      )}
      <div className="space-y-1.5">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={item.enabled}
              onChange={(e) => updateItem(item.id, 'enabled', e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary shrink-0"
            />
            <input
              type="text"
              value={item.key}
              onChange={(e) => updateItem(item.id, 'key', e.target.value)}
              placeholder="Key"
              className="flex-1 h-8 px-2 rounded-md border border-input bg-tool-bg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <input
              type="text"
              value={item.value}
              onChange={(e) => updateItem(item.id, 'value', e.target.value)}
              placeholder="Value"
              className="flex-1 h-8 px-2 rounded-md border border-input bg-tool-bg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={() => removeItem(item.id)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const LANGUAGES: { id: CodeLanguage; label: string }[] = [
  { id: 'curl', label: 'cURL' },
  { id: 'javascript', label: 'JavaScript (fetch)' },
  { id: 'python', label: 'Python (requests)' },
  { id: 'nodejs', label: 'Node.js (axios)' },
  { id: 'php', label: 'PHP (curl)' },
  { id: 'go', label: 'Go (net/http)' },
]

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30',
  POST: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
  PUT: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30',
  PATCH: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  DELETE: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30',
}

export default function ApiRequestBuilderTool() {
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [url, setUrl] = useState('https://api.example.com/users')
  const [headers, setHeaders] = useState<KeyValue[]>([])
  const [queryParams, setQueryParams] = useState<KeyValue[]>([])
  const [body, setBody] = useState('')
  const [authType, setAuthType] = useState<AuthType>('none')
  const [authToken, setAuthToken] = useState('')
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [apiKeyName, setApiKeyName] = useState('X-API-Key')
  const [apiKeyValue, setApiKeyValue] = useState('')
  const [apiKeyLocation, setApiKeyLocation] = useState<'header' | 'query'>('header')
  const [language, setLanguage] = useState<CodeLanguage>('curl')
  const [curlImport, setCurlImport] = useState('')
  const [showImport, setShowImport] = useState(false)

  const config: RequestConfig = useMemo(() => ({
    method, url, headers, queryParams, body, authType,
    authToken, authUsername, authPassword, apiKeyName, apiKeyValue, apiKeyLocation,
  }), [method, url, headers, queryParams, body, authType, authToken, authUsername, authPassword, apiKeyName, apiKeyValue, apiKeyLocation])

  const generatedCode = useMemo(() => generateCode(config, language), [config, language])
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method)

  const handleImportCurl = useCallback(() => {
    if (!curlImport.trim()) return
    const parsed = parseCurl(curlImport)
    if (parsed.method) setMethod(parsed.method as HttpMethod)
    if (parsed.url) setUrl(parsed.url)
    if (parsed.headers) setHeaders(parsed.headers)
    if (parsed.queryParams) setQueryParams(parsed.queryParams)
    if (parsed.body) setBody(parsed.body)
    if (parsed.authType) {
      setAuthType(parsed.authType)
      if (parsed.authToken) setAuthToken(parsed.authToken)
      if (parsed.authUsername) setAuthUsername(parsed.authUsername)
      if (parsed.authPassword) setAuthPassword(parsed.authPassword)
    }
    setCurlImport('')
    setShowImport(false)
  }, [curlImport])

  return (
    <ToolPage
      title="API Request Builder"
      description="Build API requests visually and generate code in cURL, JavaScript, Python, Node.js, PHP, and Go. Import from cURL commands."
      category="developer"
      categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is the API Request Builder?</h2>
          <p>
            The API Request Builder is a visual tool for composing HTTP API requests and generating ready-to-use code snippets in six popular languages. Instead of manually writing fetch calls, cURL commands, or requests library code, you fill in the method, URL, headers, query parameters, body, and authentication — and the tool instantly generates clean, copy-paste-ready code. It does not execute requests (avoiding CORS issues); it strictly builds the code for you to run in your own environment.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Select the <strong>HTTP method</strong> (GET, POST, PUT, PATCH, DELETE).</li>
            <li>Enter the <strong>API URL</strong> you want to call.</li>
            <li>Add any <strong>headers</strong> or <strong>query parameters</strong> as key-value pairs.</li>
            <li>For POST, PUT, or PATCH requests, enter the <strong>request body</strong> in JSON format.</li>
            <li>Configure <strong>authentication</strong> if needed: Bearer token, Basic auth, or API key.</li>
            <li>Choose your target <strong>language</strong> from the tabs: cURL, JavaScript, Python, Node.js, PHP, or Go.</li>
            <li>Click <strong>Copy</strong> to grab the generated code.</li>
          </ol>

          <h2>Import from cURL</h2>
          <p>
            If you already have a cURL command (from browser DevTools, API documentation, or a colleague), click &ldquo;Import cURL&rdquo; and paste it. The tool will parse the method, URL, headers, body, and authentication and populate all fields automatically.
          </p>

          <h2>Supported Code Languages</h2>
          <ul>
            <li><strong>cURL</strong> — the universal command-line HTTP client.</li>
            <li><strong>JavaScript (fetch)</strong> — native browser and Node.js 18+ fetch API.</li>
            <li><strong>Python (requests)</strong> — the most popular Python HTTP library.</li>
            <li><strong>Node.js (axios)</strong> — widely used Node.js HTTP client with promise support.</li>
            <li><strong>PHP (curl)</strong> — PHP&apos;s built-in cURL extension.</li>
            <li><strong>Go (net/http)</strong> — Go&apos;s standard library HTTP client.</li>
          </ul>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>This tool <strong>does not execute requests</strong> — it only generates code. Run the code in your terminal, browser console, or application.</li>
            <li>Use the <strong>Import cURL</strong> feature to quickly replicate requests from browser DevTools (&ldquo;Copy as cURL&rdquo;).</li>
            <li>Toggle individual headers or query parameters on/off without deleting them.</li>
            <li>All processing happens in your browser — API keys and tokens you enter never leave your device.</li>
            <li>For complex JSON bodies, format them in a JSON formatter first, then paste here.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'Does this tool actually send HTTP requests?', answer: 'No. This tool only generates code snippets. It does not execute any requests, so there are no CORS issues or security concerns. You copy the generated code and run it in your own environment.' },
        { question: 'What languages can I generate code for?', answer: 'The tool generates code in cURL, JavaScript (fetch API), Python (requests library), Node.js (axios), PHP (curl extension), and Go (net/http standard library).' },
        { question: 'How do I import a cURL command?', answer: 'Click "Import cURL" and paste your cURL command. The tool will parse the method, URL, headers, body, and authentication and populate all builder fields automatically.' },
        { question: 'Is my API key or token safe?', answer: 'Yes. All processing happens entirely in your browser. Your API keys, tokens, and request data never leave your device and are never sent to any server.' },
        { question: 'Can I add multiple headers and query parameters?', answer: 'Yes. Click "Add" to add as many key-value pairs as needed. You can also toggle individual pairs on/off or remove them.' },
        { question: 'What authentication methods are supported?', answer: 'The tool supports Bearer token, HTTP Basic authentication (username/password), and API Key (in header or query parameter). Select your auth type from the dropdown.' },
      ]}
    >
      <div className="space-y-5">
        {/* Import cURL */}
        <div>
          <button
            onClick={() => setShowImport(!showImport)}
            className="text-sm text-primary hover:underline font-medium"
          >
            {showImport ? 'Hide Import' : 'Import from cURL'}
          </button>
          {showImport && (
            <div className="mt-2 flex gap-2">
              <textarea
                value={curlImport}
                onChange={(e) => setCurlImport(e.target.value)}
                placeholder={"Paste cURL command here...\ncurl -X GET 'https://api.example.com/data' -H 'Authorization: Bearer token123'"}
                className="flex-1 min-h-[80px] px-3 py-2 rounded-lg border border-input bg-tool-bg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              />
              <button
                onClick={handleImportCurl}
                className="px-4 self-start rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors h-10"
              >
                Import
              </button>
            </div>
          )}
        </div>

        {/* Method + URL */}
        <div className="flex gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
            className={`h-10 px-3 rounded-lg border text-sm font-bold shrink-0 ${METHOD_COLORS[method]}`}
          >
            {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className="flex-1 h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Tabs: Headers, Params, Body, Auth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            {/* Headers */}
            <KeyValueEditor items={headers} onChange={setHeaders} label="Headers" />

            {/* Query Parameters */}
            <KeyValueEditor items={queryParams} onChange={setQueryParams} label="Query Parameters" />
          </div>

          <div className="space-y-4">
            {/* Auth */}
            <div>
              <label className="text-sm font-medium block mb-1.5">Authentication</label>
              <select
                value={authType}
                onChange={(e) => setAuthType(e.target.value as AuthType)}
                className="h-9 px-3 rounded-md border border-input bg-card text-sm w-full mb-2"
              >
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
                <option value="apikey">API Key</option>
              </select>

              {authType === 'bearer' && (
                <input
                  type="text"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder="Enter bearer token"
                  className="w-full h-8 px-2 rounded-md border border-input bg-tool-bg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                />
              )}

              {authType === 'basic' && (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full h-8 px-2 rounded-md border border-input bg-tool-bg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full h-8 px-2 rounded-md border border-input bg-tool-bg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              )}

              {authType === 'apikey' && (
                <div className="space-y-1.5">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={apiKeyName}
                      onChange={(e) => setApiKeyName(e.target.value)}
                      placeholder="Key name (e.g. X-API-Key)"
                      className="flex-1 h-8 px-2 rounded-md border border-input bg-tool-bg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <select
                      value={apiKeyLocation}
                      onChange={(e) => setApiKeyLocation(e.target.value as 'header' | 'query')}
                      className="h-8 px-2 rounded-md border border-input bg-card text-xs"
                    >
                      <option value="header">Header</option>
                      <option value="query">Query Param</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={apiKeyValue}
                    onChange={(e) => setApiKeyValue(e.target.value)}
                    placeholder="API key value"
                    className="w-full h-8 px-2 rounded-md border border-input bg-tool-bg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              )}
            </div>

            {/* Body */}
            {hasBody && (
              <div>
                <label className="text-sm font-medium block mb-1.5">Request Body (JSON)</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={'{\n  "name": "John Doe",\n  "email": "john@example.com"\n}'}
                  rows={6}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-tool-bg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                />
              </div>
            )}
          </div>
        </div>

        {/* Generated Code */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Generated Code</span>
              <div className="flex rounded-md border border-border overflow-hidden">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id)}
                    className={`px-2.5 py-1 text-xs font-medium transition-colors border-l first:border-l-0 border-border ${
                      language === lang.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card hover:bg-muted'
                    }`}
                  >
                    {lang.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <CopyButton text={generatedCode} />
          </div>
          <div className="relative rounded-lg border border-input bg-tool-bg overflow-hidden">
            <pre className="p-4 text-sm font-mono overflow-x-auto max-h-[400px] whitespace-pre-wrap break-all">
              <code>{generatedCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
