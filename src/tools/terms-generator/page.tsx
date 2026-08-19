'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

function generateTerms(data: {
  companyName: string
  websiteUrl: string
  jurisdiction: string
  effectiveDate: string
  ecommerce: boolean
}): string {
  const { companyName, websiteUrl, jurisdiction, effectiveDate, ecommerce } = data
  const company = companyName || '[Company Name]'
  const url = websiteUrl || '[Website URL]'
  const law = jurisdiction || '[Jurisdiction]'
  const date = effectiveDate || new Date().toISOString().split('T')[0]

  return `Terms of Service

Effective Date: ${date}

Please read these Terms of Service ("Terms," "Terms of Service") carefully before using ${url} (the "Website") operated by ${company} ("us," "we," or "our").

1. ACCEPTANCE OF TERMS

By accessing or using the Website, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Website.

2. USE OF THE WEBSITE

You agree to use the Website only for lawful purposes and in accordance with these Terms. You agree not to use the Website:

- In any way that violates any applicable federal, state, local, or international law or regulation
- To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation
- To impersonate or attempt to impersonate ${company}, a ${company} employee, another user, or any other person or entity
- To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Website

3. INTELLECTUAL PROPERTY

The Website and its original content, features, and functionality are and will remain the exclusive property of ${company}. The Website is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of ${company}.

4. USER CONTENT

If you submit, post, or display content on or through the Website, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute such content in connection with operating the Website.

You represent and warrant that:
- You own or control all rights in and to the content you provide
- The content is accurate and not misleading
- The use of the content does not violate these Terms and will not cause injury to any person or entity

5. LINKS TO OTHER WEBSITES

Our Website may contain links to third-party websites or services that are not owned or controlled by ${company}.

${company} has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. We do not warrant the offerings of any of these entities/individuals or their websites.

6. TERMINATION

We may terminate or suspend your access to the Website immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.

All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.

7. DISCLAIMER OF WARRANTIES

The Website is provided on an "AS IS" and "AS AVAILABLE" basis. ${company} makes no representations or warranties of any kind, express or implied, as to the operation of the Website or the information, content, or materials included on the Website.

You expressly agree that your use of the Website is at your sole risk. To the full extent permissible by applicable law, ${company} disclaims all warranties, express or implied, including but not limited to implied warranties of merchantability and fitness for a particular purpose.

8. LIMITATION OF LIABILITY

In no event shall ${company}, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:

- Your access to or use of or inability to access or use the Website
- Any conduct or content of any third party on the Website
- Any content obtained from the Website
- Unauthorized access, use, or alteration of your transmissions or content

9. INDEMNIFICATION

You agree to defend, indemnify, and hold harmless ${company} and its licensees and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses, including but not limited to attorney's fees, resulting from or arising out of your use of and access to the Website.

10. GOVERNING LAW

These Terms shall be governed and construed in accordance with the laws of ${law}, without regard to its conflict of law provisions.

Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.

11. CHANGES TO TERMS

We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.

By continuing to access or use our Website after those revisions become effective, you agree to be bound by the revised terms.

12. SEVERABILITY

If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law, and the remaining provisions will continue in full force and effect.

${ecommerce ? `13. RETURNS AND REFUNDS

If you are not satisfied with a purchase, you may request a return or refund within 30 days of the purchase date, subject to the following conditions:
- Items must be in their original condition and packaging
- Digital products and services may not be eligible for refund once accessed or downloaded
- Refunds will be processed within 5-10 business days to the original payment method
- Shipping costs for returns are the responsibility of the customer unless the item is defective

14. SHIPPING AND DELIVERY

${company} strives to process and ship all orders within 3-5 business days. Delivery times may vary based on your location and shipping method selected. ${company} is not responsible for delays caused by third-party shipping carriers or customs processing.

Risk of loss and title for items purchased pass to you upon delivery to the carrier. Any claims for missing or damaged items must be reported within 7 days of the expected delivery date.

15. PAYMENT TERMS

All prices are listed in the applicable currency and are subject to change without notice. Payment must be received in full before orders are processed. We accept major credit cards, debit cards, and other payment methods as displayed at checkout. You agree to provide accurate billing information and authorize us to charge the selected payment method.

16` : '13'}. CONTACT US

If you have any questions about these Terms, please contact us:

Website: ${url}
Company: ${company}
`
}

export default function TermsGeneratorTool() {
  const [companyName, setCompanyName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [jurisdiction, setJurisdiction] = useState('')
  const [ecommerce, setEcommerce] = useState(false)
  const [effectiveDate, setEffectiveDate] = useState(() => new Date().toISOString().split('T')[0])

  const output = useMemo(() => {
    return generateTerms({ companyName, websiteUrl, jurisdiction, effectiveDate, ecommerce })
  }, [companyName, websiteUrl, jurisdiction, effectiveDate, ecommerce])

  const clear = () => {
    setCompanyName('')
    setWebsiteUrl('')
    setJurisdiction('')
    setEffectiveDate(new Date().toISOString().split('T')[0])
  }

  return (
    <ToolPage
      title="Terms of Service Generator"
      description="Generate terms of service for your website or application"
      category="generators"
      categoryLabel="Generators"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Terms of Service Generator is a free browser-based tool that lets you generate a terms of service page for your website covering usage rules, intellectual property, and liability. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Configure the generation parameters — type, format, quantity, and any constraints.</li>
            <li>Click <strong>Generate</strong> to produce your output.</li>
            <li>Review the generated content and regenerate if needed.</li>
            <li>Copy individual items or download the full set for immediate use.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when creating legally required terms of service for websites, apps, or online services. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this legal tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is the difference between terms of service and a privacy policy?', answer: 'Terms of service govern the rules and conditions for using your website, while a privacy policy specifically explains how you collect, use, and protect user data.' },
        { question: 'Are terms of service legally enforceable?', answer: 'Yes, terms of service are generally enforceable as a contract when users agree to them, but specific clauses may be challenged in court depending on your jurisdiction.' },
        { question: 'Does my website legally need terms of service?', answer: 'While not always legally required, having terms of service protects your business by limiting liability, defining acceptable use, and establishing governing law for disputes.' },
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
            <label className="text-sm font-medium mb-1 block">Governing Law Jurisdiction</label>
            <input
              type="text"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              placeholder="State of California, United States"
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

          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={ecommerce} onChange={e => setEcommerce(e.target.checked)} className="rounded accent-primary" />
            E-commerce site (add returns, refunds, shipping sections)
          </label>
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Generated Terms of Service</span>
            <div className="flex gap-2">
              <CopyButton text={output} />
              <DownloadButton content={output} filename="terms-of-service.txt" />
            </div>
          </div>
          <ToolTextarea value={output} readOnly rows={24} />
        </div>
      </div>
    </ToolPage>
  )
}
