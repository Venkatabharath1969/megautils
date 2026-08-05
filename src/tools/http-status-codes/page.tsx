'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

interface StatusCode {
  code: number
  name: string
  description: string
}

const statusCodes: StatusCode[] = [
  // 1xx Informational
  { code: 100, name: 'Continue', description: 'The server has received the request headers and the client should proceed to send the request body.' },
  { code: 101, name: 'Switching Protocols', description: 'The requester has asked the server to switch protocols and the server has agreed.' },
  { code: 102, name: 'Processing', description: 'The server has received and is processing the request, but no response is available yet.' },
  { code: 103, name: 'Early Hints', description: 'Used to return some response headers before final HTTP message.' },

  // 2xx Success
  { code: 200, name: 'OK', description: 'The request has succeeded.' },
  { code: 201, name: 'Created', description: 'The request has been fulfilled and a new resource has been created.' },
  { code: 202, name: 'Accepted', description: 'The request has been accepted for processing, but processing has not been completed.' },
  { code: 203, name: 'Non-Authoritative Information', description: 'The server successfully processed the request but is returning information from another source.' },
  { code: 204, name: 'No Content', description: 'The server successfully processed the request but is not returning any content.' },
  { code: 205, name: 'Reset Content', description: 'The server successfully processed the request, asks the requester to reset its document view.' },
  { code: 206, name: 'Partial Content', description: 'The server is delivering only part of the resource due to a range header sent by the client.' },
  { code: 207, name: 'Multi-Status', description: 'The message body contains multiple status codes for multiple independent operations.' },
  { code: 208, name: 'Already Reported', description: 'The members of a DAV binding have already been enumerated.' },
  { code: 226, name: 'IM Used', description: 'The server has fulfilled a GET request for the resource with instance-manipulations applied.' },

  // 3xx Redirection
  { code: 300, name: 'Multiple Choices', description: 'The request has more than one possible response.' },
  { code: 301, name: 'Moved Permanently', description: 'The URL of the requested resource has been changed permanently.' },
  { code: 302, name: 'Found', description: 'The URI of requested resource has been changed temporarily.' },
  { code: 303, name: 'See Other', description: 'The server sent this response to direct the client to get the requested resource at another URI with a GET request.' },
  { code: 304, name: 'Not Modified', description: 'The response has not been modified, client can use cached version.' },
  { code: 305, name: 'Use Proxy', description: 'The requested resource is available only through a proxy.' },
  { code: 307, name: 'Temporary Redirect', description: 'The server sends this response to direct the client to get the requested resource at another URI with the same method.' },
  { code: 308, name: 'Permanent Redirect', description: 'The resource is now permanently located at another URI, specified by the Location header.' },

  // 4xx Client Error
  { code: 400, name: 'Bad Request', description: 'The server cannot process the request due to something perceived to be a client error.' },
  { code: 401, name: 'Unauthorized', description: 'Authentication is required and has failed or has not been provided.' },
  { code: 402, name: 'Payment Required', description: 'Reserved for future use. Originally intended for digital payment systems.' },
  { code: 403, name: 'Forbidden', description: 'The client does not have access rights to the content.' },
  { code: 404, name: 'Not Found', description: 'The server cannot find the requested resource.' },
  { code: 405, name: 'Method Not Allowed', description: 'The request method is known by the server but not supported by the target resource.' },
  { code: 406, name: 'Not Acceptable', description: 'The server cannot produce a response matching the list of acceptable values defined in the request headers.' },
  { code: 407, name: 'Proxy Authentication Required', description: 'Authentication is required by a proxy.' },
  { code: 408, name: 'Request Timeout', description: 'The server timed out waiting for the request.' },
  { code: 409, name: 'Conflict', description: 'The request conflicts with the current state of the server.' },
  { code: 410, name: 'Gone', description: 'The requested content has been permanently deleted from the server.' },
  { code: 411, name: 'Length Required', description: 'The server rejected the request because the Content-Length header field is not defined.' },
  { code: 412, name: 'Precondition Failed', description: 'The server does not meet one of the preconditions specified by the client.' },
  { code: 413, name: 'Payload Too Large', description: 'Request entity is larger than limits defined by server.' },
  { code: 414, name: 'URI Too Long', description: 'The URI requested by the client is longer than the server is willing to interpret.' },
  { code: 415, name: 'Unsupported Media Type', description: 'The media format of the requested data is not supported by the server.' },
  { code: 416, name: 'Range Not Satisfiable', description: 'The range specified by the Range header field in the request cannot be fulfilled.' },
  { code: 417, name: 'Expectation Failed', description: 'The expectation indicated by the Expect request header cannot be met by the server.' },
  { code: 418, name: "I'm a Teapot", description: 'The server refuses the attempt to brew coffee with a teapot (RFC 2324).' },
  { code: 421, name: 'Misdirected Request', description: 'The request was directed at a server that is not able to produce a response.' },
  { code: 422, name: 'Unprocessable Entity', description: 'The request was well-formed but was unable to be followed due to semantic errors.' },
  { code: 423, name: 'Locked', description: 'The resource that is being accessed is locked.' },
  { code: 424, name: 'Failed Dependency', description: 'The request failed due to failure of a previous request.' },
  { code: 425, name: 'Too Early', description: 'The server is unwilling to risk processing a request that might be replayed.' },
  { code: 426, name: 'Upgrade Required', description: 'The server refuses to perform the request using the current protocol.' },
  { code: 428, name: 'Precondition Required', description: 'The origin server requires the request to be conditional.' },
  { code: 429, name: 'Too Many Requests', description: 'The user has sent too many requests in a given amount of time.' },
  { code: 431, name: 'Request Header Fields Too Large', description: 'The server is unwilling to process the request because its header fields are too large.' },
  { code: 451, name: 'Unavailable For Legal Reasons', description: 'The user-agent requested a resource that cannot legally be provided.' },

  // 5xx Server Error
  { code: 500, name: 'Internal Server Error', description: 'The server has encountered a situation it does not know how to handle.' },
  { code: 501, name: 'Not Implemented', description: 'The request method is not supported by the server and cannot be handled.' },
  { code: 502, name: 'Bad Gateway', description: 'The server, while acting as a gateway, received an invalid response.' },
  { code: 503, name: 'Service Unavailable', description: 'The server is not ready to handle the request, often due to maintenance or overload.' },
  { code: 504, name: 'Gateway Timeout', description: 'The server is acting as a gateway and did not get a response in time.' },
  { code: 505, name: 'HTTP Version Not Supported', description: 'The HTTP version used in the request is not supported by the server.' },
  { code: 506, name: 'Variant Also Negotiates', description: 'The server has an internal configuration error.' },
  { code: 507, name: 'Insufficient Storage', description: 'The server is unable to store the representation needed to complete the request.' },
  { code: 508, name: 'Loop Detected', description: 'The server detected an infinite loop while processing the request.' },
  { code: 510, name: 'Not Extended', description: 'Further extensions to the request are required for the server to fulfill it.' },
  { code: 511, name: 'Network Authentication Required', description: 'The client needs to authenticate to gain network access.' },
]

const categories = [
  { range: '1xx', label: 'Informational', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  { range: '2xx', label: 'Success', color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30' },
  { range: '3xx', label: 'Redirection', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30' },
  { range: '4xx', label: 'Client Error', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30' },
  { range: '5xx', label: 'Server Error', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' },
]

function getCategoryColor(code: number): string {
  if (code < 200) return 'bg-blue-500/10 border-blue-500/30'
  if (code < 300) return 'bg-green-500/10 border-green-500/30'
  if (code < 400) return 'bg-yellow-500/10 border-yellow-500/30'
  if (code < 500) return 'bg-orange-500/10 border-orange-500/30'
  return 'bg-red-500/10 border-red-500/30'
}

function getCodeColor(code: number): string {
  if (code < 200) return 'text-blue-600 dark:text-blue-400'
  if (code < 300) return 'text-green-600 dark:text-green-400'
  if (code < 400) return 'text-yellow-600 dark:text-yellow-400'
  if (code < 500) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

export default function HttpStatusCodesTool() {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let results = statusCodes
    if (filterCategory) {
      const prefix = parseInt(filterCategory[0])
      results = results.filter((s) => Math.floor(s.code / 100) === prefix)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      results = results.filter(
        (s) =>
          s.code.toString().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      )
    }
    return results
  }, [search, filterCategory])

  return (
    <ToolPage
      title="HTTP Status Codes"
      description="Searchable reference of all HTTP status codes with descriptions. Filter by category."
      category="network"
      categoryLabel="Network Tools"
      faqs={[
        { question: 'What does HTTP 404 mean?', answer: 'HTTP 404 (Not Found) means the server cannot find the requested resource. This usually occurs when a URL is mistyped or the page has been removed.' },
        { question: 'What is the difference between 401 and 403?', answer: '401 (Unauthorized) means authentication is required and has not been provided. 403 (Forbidden) means the server understood the request but refuses to authorize it, even with valid credentials.' },
        { question: 'What does a 500 Internal Server Error mean?', answer: 'A 500 error indicates the server encountered an unexpected condition that prevented it from fulfilling the request. It is a generic server-side error, not caused by the client.' },
        { question: 'What is the difference between 301 and 302 redirects?', answer: '301 (Moved Permanently) tells browsers and search engines the resource has moved permanently to a new URL. 302 (Found) indicates a temporary redirect where the original URL should still be used in the future.' },
      ]}
    >
      <div className="space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, name, or description..."
            className="w-full h-10 px-4 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategory(null)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors border ${!filterCategory ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-muted'}`}
          >
            All ({statusCodes.length})
          </button>
          {categories.map((cat) => {
            const count = statusCodes.filter((s) => Math.floor(s.code / 100).toString() + 'xx' === cat.range).length
            return (
              <button
                key={cat.range}
                onClick={() => setFilterCategory(filterCategory === cat.range ? null : cat.range)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors border ${filterCategory === cat.range ? cat.color + ' border' : 'border-border bg-card hover:bg-muted'}`}
              >
                {cat.range} {cat.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {filtered.length} status code{filtered.length !== 1 ? 's' : ''}
        </div>

        {/* Status codes list */}
        <div className="space-y-2">
          {filtered.map((status) => (
            <div key={status.code} className={`flex items-start gap-4 p-4 rounded-lg border ${getCategoryColor(status.code)}`}>
              <div className={`text-2xl font-bold font-mono shrink-0 w-14 ${getCodeColor(status.code)}`}>
                {status.code}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm">{status.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{status.description}</div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center p-8 text-muted-foreground text-sm">
            No status codes match your search.
          </div>
        )}
      </div>
    </ToolPage>
  )
}
