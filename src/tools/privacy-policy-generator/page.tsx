'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

function generatePolicy(data: {
  companyName: string
  websiteUrl: string
  contactEmail: string
  collectsCookies: boolean
  usesAnalytics: boolean
  thirdPartyServices: string
  effectiveDate: string
}): string {
  const { companyName, websiteUrl, contactEmail, collectsCookies, usesAnalytics, thirdPartyServices, effectiveDate } = data
  const company = companyName || '[Company Name]'
  const url = websiteUrl || '[Website URL]'
  const email = contactEmail || '[Contact Email]'
  const date = effectiveDate || new Date().toISOString().split('T')[0]
  const services = thirdPartyServices ? thirdPartyServices.split(',').map(s => s.trim()).filter(Boolean) : []

  return `Privacy Policy

Effective Date: ${date}

1. INTRODUCTION

${company} ("we," "our," or "us") operates ${url} (the "Website"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our Website.

Please read this Privacy Policy carefully. By using the Website, you agree to the collection and use of information in accordance with this policy.

2. INFORMATION WE COLLECT

We may collect information about you in a variety of ways. The information we may collect includes:

Personal Data: Personally identifiable information, such as your name, email address, and other information you voluntarily provide to us when you contact us or use our services.

Usage Data: Information our servers automatically collect when you access the Website, such as your browser type, operating system, access times, and the pages you have viewed.

3. USE OF YOUR INFORMATION

We may use information collected about you to:
- Operate and maintain the Website
- Improve, personalize, and expand our Website
- Understand and analyze how you use our Website
- Respond to your comments, questions, and requests
- Send you technical notices and support messages
${usesAnalytics ? '- Monitor and analyze usage and trends to improve your experience\n- Use analytics services to better understand Website usage' : ''}

4. COOKIES AND TRACKING TECHNOLOGIES

${collectsCookies
    ? `We use cookies and similar tracking technologies to track activity on our Website and hold certain information.

Cookies are files with a small amount of data that are sent to your browser from a website and stored on your device. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.

Types of cookies we use:
- Essential cookies: Required for the Website to function properly
- Analytics cookies: Help us understand how visitors interact with the Website
- Preference cookies: Remember your settings and preferences`
    : `We do not use cookies or similar tracking technologies on our Website.`}

5. THIRD-PARTY SERVICES

${services.length > 0
    ? `We may employ the following third-party services:\n\n${services.map(s => `- ${s}`).join('\n')}\n\nThese third parties may have access to your personal information only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose.`
    : 'We do not currently use third-party service providers that collect personal information.'}

${usesAnalytics ? `6. ANALYTICS

We may use third-party analytics services to evaluate your use of the Website, compile reports on activity, and provide other services relating to Website activity and internet usage. These analytics services may use cookies and other tracking technologies to perform their services.

` : ''}${usesAnalytics ? '7' : '6'}. DATA SECURITY

We use administrative, technical, and physical security measures to protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.

${usesAnalytics ? '8' : '7'}. YOUR RIGHTS

Depending on your location, you may have the following rights regarding your personal information:
- The right to access your personal data
- The right to rectify inaccurate personal data
- The right to request deletion of your personal data
- The right to restrict processing of your personal data
- The right to data portability
- The right to object to processing of your personal data

${usesAnalytics ? '9' : '8'}. CHILDREN'S PRIVACY

Our Website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.

${usesAnalytics ? '10' : '9'}. CHANGES TO THIS PRIVACY POLICY

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top.

${usesAnalytics ? '11' : '10'}. CONTACT US

If you have any questions about this Privacy Policy, please contact us:

Email: ${email}
Website: ${url}
`
}

export default function PrivacyPolicyGeneratorTool() {
  const [companyName, setCompanyName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [collectsCookies, setCollectsCookies] = useState(true)
  const [usesAnalytics, setUsesAnalytics] = useState(true)
  const [thirdPartyServices, setThirdPartyServices] = useState('Google Analytics, Google AdSense')
  const [effectiveDate, setEffectiveDate] = useState(() => new Date().toISOString().split('T')[0])

  const output = useMemo(() => {
    return generatePolicy({
      companyName,
      websiteUrl,
      contactEmail,
      collectsCookies,
      usesAnalytics,
      thirdPartyServices,
      effectiveDate,
    })
  }, [companyName, websiteUrl, contactEmail, collectsCookies, usesAnalytics, thirdPartyServices, effectiveDate])

  const clear = () => {
    setCompanyName('')
    setWebsiteUrl('')
    setContactEmail('')
    setCollectsCookies(true)
    setUsesAnalytics(true)
    setThirdPartyServices('Google Analytics, Google AdSense')
    setEffectiveDate(new Date().toISOString().split('T')[0])
  }

  return (
    <ToolPage
      title="Privacy Policy Generator"
      description="Generate a privacy policy for your website or app"
      category="generators"
      categoryLabel="Generators"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Your Details</span>
            <ClearButton onClear={clear} />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Company / Website Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Inc."
              className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Website URL</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Contact Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="privacy@example.com"
              className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Effective Date</label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={collectsCookies}
                onChange={(e) => setCollectsCookies(e.target.checked)}
                className="rounded accent-primary"
              />
              Website uses cookies
            </label>
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={usesAnalytics}
                onChange={(e) => setUsesAnalytics(e.target.checked)}
                className="rounded accent-primary"
              />
              Website uses analytics
            </label>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Third-Party Services (comma-separated)</label>
            <input
              type="text"
              value={thirdPartyServices}
              onChange={(e) => setThirdPartyServices(e.target.value)}
              placeholder="Google Analytics, Stripe, Mailchimp"
              className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
            />
          </div>
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Generated Privacy Policy</span>
            <div className="flex gap-2">
              <CopyButton text={output} />
              <DownloadButton content={output} filename="privacy-policy.txt" />
            </div>
          </div>
          <ToolTextarea value={output} readOnly rows={24} />
        </div>
      </div>
    </ToolPage>
  )
}
