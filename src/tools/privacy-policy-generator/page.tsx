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
  gdprCompliance: boolean
  dpoEmail: string
  ccpaCompliance: boolean
}): string {
  const { companyName, websiteUrl, contactEmail, collectsCookies, usesAnalytics, thirdPartyServices, effectiveDate, gdprCompliance, dpoEmail, ccpaCompliance } = data
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

${gdprCompliance ? `${usesAnalytics ? '11' : '10'}. GDPR COMPLIANCE (EEA USERS)

If you are a resident of the European Economic Area (EEA), you have certain data protection rights under the General Data Protection Regulation (GDPR).

Data Controller: ${company}, contactable at ${email}.
${dpoEmail ? `Data Protection Officer: ${dpoEmail}` : ''}

Legal Basis for Processing: We process your personal data based on (a) your consent, (b) the performance of a contract, (c) compliance with legal obligations, or (d) our legitimate interests.

International Data Transfers: Your information may be transferred to and processed in countries outside the EEA. We ensure adequate safeguards are in place, such as Standard Contractual Clauses, to protect your data.

You have the right to lodge a complaint with your local data protection supervisory authority if you believe we have not complied with applicable data protection laws.

` : ''}${ccpaCompliance ? `${gdprCompliance ? (usesAnalytics ? '12' : '11') : (usesAnalytics ? '11' : '10')}. YOUR CALIFORNIA PRIVACY RIGHTS (CCPA/CPRA)

If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA):

- Right to Know — You have the right to request information about the categories and specific pieces of personal information we have collected about you.
- Right to Delete — You have the right to request deletion of your personal information, subject to certain exceptions.
- Right to Opt-Out — You have the right to opt out of the sale or sharing of your personal information. We do not sell personal information.
- Right to Non-Discrimination — We will not discriminate against you for exercising your privacy rights.
- Right to Correct — You have the right to request correction of inaccurate personal information.

To exercise these rights, please contact us at ${email}. We will respond to your request within 45 days.

Do Not Sell or Share My Personal Information: We do not sell or share your personal information as defined by the CCPA/CPRA.

` : ''}${(() => { let n = usesAnalytics ? 10 : 9; if (gdprCompliance) n++; if (ccpaCompliance) n++; return n + 1; })()}. CONTACT US

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
  const [gdprCompliance, setGdprCompliance] = useState(false)
  const [ccpaCompliance, setCcpaCompliance] = useState(false)
  const [dpoEmail, setDpoEmail] = useState('')
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
      gdprCompliance,
      dpoEmail,
      ccpaCompliance,
    })
  }, [companyName, websiteUrl, contactEmail, collectsCookies, usesAnalytics, thirdPartyServices, effectiveDate, gdprCompliance, dpoEmail, ccpaCompliance])

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
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Privacy Policy Generator is a free browser-based tool that lets you generate a comprehensive privacy policy page for your website based on your data collection practices. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Configure the generation parameters — type, format, quantity, and any constraints.</li>
            <li>Click <strong>Generate</strong> to produce your output.</li>
            <li>Review the generated content and regenerate if needed.</li>
            <li>Copy individual items or download the full set for immediate use.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when creating legally required privacy policies for websites, apps, or online services that collect user data. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this legal tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'Does my website need a privacy policy?', answer: 'Yes, if your website collects any personal data (including through cookies or analytics), most privacy laws like GDPR, CCPA, and CalOPPA require you to have a privacy policy.' },
        { question: 'Is a generated privacy policy legally binding?', answer: 'A generated privacy policy provides a solid starting template, but you should have it reviewed by a legal professional to ensure it meets the specific requirements of your jurisdiction and business.' },
        { question: 'What should a privacy policy include?', answer: 'A privacy policy should cover what data you collect, how you use it, third-party sharing, cookie usage, user rights, data security measures, and contact information.' },
        { question: 'How often should I update my privacy policy?', answer: 'Update your privacy policy whenever you change your data collection practices, add new third-party services, or when privacy laws in your jurisdiction change.' },
      ]}
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
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={gdprCompliance}
                onChange={(e) => setGdprCompliance(e.target.checked)}
                className="rounded accent-primary"
              />
              GDPR compliance (EU users)
            </label>
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={ccpaCompliance}
                onChange={(e) => setCcpaCompliance(e.target.checked)}
                className="rounded accent-primary"
              />
              CCPA/CPRA Compliance (California)
            </label>
          </div>

          {gdprCompliance && (
            <div>
              <label className="text-sm font-medium mb-1 block">DPO Email (optional)</label>
              <input
                type="email"
                value={dpoEmail}
                onChange={(e) => setDpoEmail(e.target.value)}
                placeholder="dpo@example.com"
                className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
              />
            </div>
          )}

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
