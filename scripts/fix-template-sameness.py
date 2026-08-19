#!/usr/bin/env python3
"""
Fix template sameness: replace the IDENTICAL generic "How to Use" and "Tips"
sections across 150 tool pages with category-specific content.
This prevents Google from flagging the site for "scaled content abuse."
"""
import os, re

TOOLS_DIR = '/root/megautils/src/tools'

# The generic text that's identical across 150 tools
GENERIC_HOWTO = """            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>"""

GENERIC_TIPS_PATTERN = r"""            <li>All processing happens locally in your browser.*?Bookmark this page for quick access whenever you need [^<]*\.</li>"""

# Category-specific How-To steps (different per category)
CATEGORY_HOWTO = {
    "converter": """            <li>Select the <strong>source unit</strong> from the left dropdown or input field.</li>
            <li>Enter the numeric value you want to convert.</li>
            <li>All target unit values update <strong>automatically</strong> as you type.</li>
            <li>Click any result to <strong>copy</strong> it to your clipboard.</li>""",
    "financial": """            <li>Enter the required financial values (amount, rate, duration) in the input fields.</li>
            <li>Adjust parameters like compounding frequency or tax rate if available.</li>
            <li>Review the calculated results, charts, and breakdowns displayed below.</li>
            <li>Use the results for planning — consult a financial advisor for important decisions.</li>""",
    "css": """            <li>Use the visual controls (sliders, color pickers, toggles) to design your effect.</li>
            <li>See the <strong>live preview</strong> update in real time as you adjust settings.</li>
            <li>Review the generated <strong>CSS code</strong> in the code panel below.</li>
            <li>Click <strong>Copy CSS</strong> to paste the code directly into your stylesheet.</li>""",
    "color": """            <li>Pick a color using the visual color picker or enter a value in any format (HEX, RGB, HSL).</li>
            <li>View instant conversions across all supported color formats.</li>
            <li>Use the generated palette, contrast ratios, or name suggestions as needed.</li>
            <li>Copy any color value with one click for use in your design or code.</li>""",
    "developer": """            <li>Paste or type your code or data into the <strong>input panel</strong>.</li>
            <li>Select any formatting options or conversion targets if available.</li>
            <li>View the processed output instantly in the <strong>result panel</strong>.</li>
            <li>Use <strong>Copy</strong> to grab the output or <strong>Download</strong> to save it as a file.</li>""",
    "encoder": """            <li>Choose your operation mode — <strong>encode</strong> or <strong>decode</strong>.</li>
            <li>Paste or type your input text in the source field.</li>
            <li>The converted result appears <strong>instantly</strong> in the output field.</li>
            <li>Copy the result for use in your code, API requests, or documents.</li>""",
    "seo": """            <li>Fill in the required fields with your page or content information.</li>
            <li>Configure optional settings to match your specific SEO needs.</li>
            <li>Review the generated output, preview, or analysis results.</li>
            <li>Copy the generated code or export the results for use on your website.</li>""",
    "text": """            <li>Paste or type your text content into the input area.</li>
            <li>Select the operation or transformation you want to apply.</li>
            <li>View the processed text <strong>instantly</strong> in the output area.</li>
            <li>Copy the result or download it for use in your documents or projects.</li>""",
    "image": """            <li>Upload your image using the <strong>file picker</strong> or drag and drop.</li>
            <li>Configure output settings such as size, format, or quality level.</li>
            <li>Preview the result and compare it with the original if available.</li>
            <li>Download the processed image to your device.</li>""",
    "datetime": """            <li>Enter a date, time, or timestamp value in the input field.</li>
            <li>Select your target format or calculation type.</li>
            <li>View the converted or calculated result instantly.</li>
            <li>Copy the result for use in your code, logs, or scheduling systems.</li>""",
    "network": """            <li>Enter the URL, IP address, or network value you want to analyze.</li>
            <li>The tool parses and displays all extracted components and details.</li>
            <li>Review the structured breakdown of each element.</li>
            <li>Copy specific values or the full analysis for your documentation.</li>""",
    "generator": """            <li>Configure the generation parameters — type, format, quantity, and any constraints.</li>
            <li>Click <strong>Generate</strong> to produce your output.</li>
            <li>Review the generated content and regenerate if needed.</li>
            <li>Copy individual items or download the full set for immediate use.</li>""",
    "markdown": """            <li>Enter or paste your Markdown or HTML content in the editor.</li>
            <li>See the converted output or live preview update as you type.</li>
            <li>Adjust formatting using the toolbar or keyboard shortcuts.</li>
            <li>Copy the output or export it in your preferred format.</li>""",
    "math": """            <li>Enter the required numeric values or expressions in the input fields.</li>
            <li>Select the operation or calculation type if multiple options exist.</li>
            <li>View the result, intermediate steps, and any visual representations.</li>
            <li>Copy the result for use in your work, assignments, or reports.</li>""",
    "content": """            <li>Enter or paste the text or content you want to analyze or transform.</li>
            <li>Configure any available settings such as platform limits or output format.</li>
            <li>Review the analysis results, scores, or transformed output.</li>
            <li>Use the insights to improve your content before publishing.</li>""",
    "string": """            <li>Paste or type the string value you want to process in the input field.</li>
            <li>Select the specific operation — escape, unescape, test, or generate.</li>
            <li>Review the processed output and any match highlights or validation results.</li>
            <li>Copy the result for direct use in your code or queries.</li>""",
    "crypto": """            <li>Enter the text or data you want to process in the input field.</li>
            <li>Select the algorithm, format, or security parameters.</li>
            <li>View the generated hash, password, or identifier instantly.</li>
            <li>Copy the result — it is generated locally and never transmitted.</li>""",
}

# Category-specific Tips (different per category)
CATEGORY_TIPS = {
    "converter": """            <li>All conversions use mathematically precise formulas with no rounding until the final display.</li>
            <li>Metric and imperial units are both supported — the tool automatically handles the conversion factors.</li>
            <li>Results update in real time as you type, so you can quickly compare different values.</li>
            <li>Bookmark specific conversions you use frequently for instant access.</li>
            <li>All calculations run in your browser — no data is sent to any server.</li>""",
    "financial": """            <li>Financial calculator results are estimates — always consult a qualified financial advisor before making important decisions.</li>
            <li>Interest rates should be entered as annual percentages (e.g., enter 7 for 7% per year).</li>
            <li>Results account for compounding frequency when applicable — check whether your rate compounds monthly, quarterly, or annually.</li>
            <li>Use the comparison features to evaluate different scenarios side by side.</li>
            <li>All calculations happen locally in your browser — your financial data stays private.</li>""",
    "css": """            <li>Copy the generated CSS directly into your project stylesheet — it is production-ready.</li>
            <li>Test the effect in multiple browsers since some CSS properties have varying support.</li>
            <li>Combine multiple generators (e.g., gradient + box-shadow) for layered visual effects.</li>
            <li>Use CSS custom properties (variables) to make generated values easy to update later.</li>
            <li>All code generation happens in your browser — no external dependencies required.</li>""",
    "color": """            <li>Use the HEX format for CSS and web design, RGB for programmatic color manipulation, and HSL for intuitive hue adjustments.</li>
            <li>Always check contrast ratios against WCAG guidelines when choosing text and background color combinations.</li>
            <li>Save color palettes by bookmarking the page or copying values to your design system documentation.</li>
            <li>Consider color blindness accessibility — test your palette with a contrast checker tool.</li>
            <li>All color processing runs locally with no server communication required.</li>""",
    "developer": """            <li>For large inputs, the tool processes data efficiently in your browser but very large files may take a moment.</li>
            <li>Use keyboard shortcuts like Ctrl+A to select all output text before copying.</li>
            <li>The tool preserves your data types and structure during conversion or formatting.</li>
            <li>Compare the formatted output with the original to verify no data was altered.</li>
            <li>All processing is client-side — safe for use with proprietary or sensitive code.</li>""",
    "encoder": """            <li>Encoding is NOT encryption — encoded data can be decoded by anyone. Never use encoding to protect sensitive information.</li>
            <li>UTF-8 characters, emojis, and special symbols are fully supported in both encoding and decoding.</li>
            <li>When decoding, ensure the input is complete — partial or corrupted encoded strings may produce unexpected results.</li>
            <li>Check for unwanted whitespace or line breaks that may have been introduced during copy-paste operations.</li>
            <li>Processing is entirely local — your data never leaves your browser.</li>""",
    "seo": """            <li>Validate generated markup using Google Rich Results Test before deploying to your site.</li>
            <li>Keep meta titles under 60 characters and descriptions under 160 characters for optimal display in search results.</li>
            <li>Update structured data whenever your page content changes significantly.</li>
            <li>Test how your pages appear in search results using the preview features provided.</li>
            <li>All SEO analysis runs in your browser — your website data stays private.</li>""",
    "text": """            <li>For very long documents, processing is instant but rendering the output may take a brief moment.</li>
            <li>The tool handles Unicode text correctly, including accented characters, CJK scripts, and emoji.</li>
            <li>Use the undo function in your browser (Ctrl+Z) if you need to revert input changes.</li>
            <li>Combine multiple text operations by copying the output of one tool into the input of another.</li>
            <li>No text is stored or transmitted — all processing runs locally in your browser.</li>""",
    "image": """            <li>Supported input formats typically include JPEG, PNG, WebP, and GIF — check specific format notes below the tool.</li>
            <li>Larger images produce higher quality output but take longer to process in the browser.</li>
            <li>The original image is never modified — all processing creates a new output file.</li>
            <li>For batch processing, use the tool repeatedly — each image is handled independently.</li>
            <li>Your images are never uploaded to any server — all processing happens on your device.</li>""",
    "datetime": """            <li>Unix timestamps are always in UTC — local time zone conversions are applied automatically when relevant.</li>
            <li>Be careful with time zone differences when converting between formats for international applications.</li>
            <li>The tool handles leap years, daylight saving time transitions, and month-length variations correctly.</li>
            <li>For programming, remember that JavaScript uses millisecond timestamps while Unix traditionally uses seconds.</li>
            <li>All date calculations run locally with no server dependency.</li>""",
    "network": """            <li>URLs and IP addresses are parsed locally — no external lookups are made unless explicitly stated.</li>
            <li>The tool follows standard RFCs for URL parsing and network protocol interpretation.</li>
            <li>Use the parsed components to debug routing issues, API endpoints, or DNS configurations.</li>
            <li>Sensitive URLs containing authentication tokens are safe to paste — nothing leaves your browser.</li>
            <li>Results are formatted for easy copying into documentation or bug reports.</li>""",
    "generator": """            <li>Generated values use cryptographically secure random sources when security-sensitive (passwords, UUIDs).</li>
            <li>Click Generate multiple times to produce different variations until you find what you need.</li>
            <li>Customize format options to match the exact requirements of your project or platform.</li>
            <li>Copy individual items or generate in bulk depending on the tool capabilities.</li>
            <li>All generation happens in your browser — nothing is stored on any server.</li>""",
    "markdown": """            <li>The live preview updates as you type, showing exactly how your Markdown will render.</li>
            <li>Use the toolbar buttons for quick formatting or learn the keyboard shortcuts for faster editing.</li>
            <li>The tool supports GitHub Flavored Markdown (GFM) including tables, task lists, and strikethrough.</li>
            <li>Export options let you save your work as HTML or copy the raw Markdown for pasting elsewhere.</li>
            <li>All content stays in your browser — nothing is saved to or transmitted through any server.</li>""",
    "math": """            <li>Results are calculated to high precision but displayed values may be rounded for readability.</li>
            <li>For scientific notation, the tool handles very large and very small numbers correctly.</li>
            <li>Double-check results for critical calculations — this tool is an aid, not a replacement for professional verification.</li>
            <li>The calculator supports standard mathematical operations and common constants like pi and e.</li>
            <li>All computation runs locally in your browser with no server dependency.</li>""",
    "content": """            <li>Analyze your content before publishing to optimize for engagement and readability.</li>
            <li>Character count limits vary by platform — this tool shows you exactly where you stand.</li>
            <li>Use the readability scores as guidelines, not absolute rules — context and audience matter more.</li>
            <li>Test multiple headline variations to find the one with the strongest impact.</li>
            <li>Your content is never stored or shared — all analysis runs locally in your browser.</li>""",
    "string": """            <li>Escape characters correctly before inserting strings into code to prevent syntax errors and security vulnerabilities.</li>
            <li>Different languages and formats have different escaping rules — select the correct mode for your use case.</li>
            <li>Test escaped strings in a safe environment before using them in production queries or code.</li>
            <li>The tool handles edge cases like nested quotes, backslashes, and null bytes correctly.</li>
            <li>All processing is client-side — safe to use with database queries containing sensitive data.</li>""",
    "crypto": """            <li>Hashes are one-way functions — you cannot reverse a hash to recover the original input.</li>
            <li>For passwords, use bcrypt or Argon2 rather than simple hashes like MD5 or SHA-256.</li>
            <li>Generated passwords and UUIDs use cryptographically secure random number generators.</li>
            <li>Never share generated secrets through insecure channels — use a password manager instead.</li>
            <li>All cryptographic operations run locally — your sensitive data never leaves your device.</li>""",
}

# Map tool slugs to categories
def get_tool_category(filepath):
    """Read a tool file and extract its category prop."""
    with open(filepath) as f:
        content = f.read()
    m = re.search(r'category="([^"]*)"', content)
    return m.group(1) if m else None

# Default fallback for unmapped categories
DEFAULT_HOWTO = CATEGORY_HOWTO["developer"]
DEFAULT_TIPS = CATEGORY_TIPS["developer"]

fixed = 0
for slug in sorted(os.listdir(TOOLS_DIR)):
    filepath = os.path.join(TOOLS_DIR, slug, 'page.tsx')
    if not os.path.isfile(filepath):
        continue
    
    with open(filepath) as f:
        content = f.read()
    
    # Only fix tools that have the generic template
    if "is a free browser-based tool that lets you" not in content:
        continue
    
    # Get the tool's category
    category = get_tool_category(filepath)
    
    # Map category to our content
    cat_map = {
        'converters': 'converter', 'financial': 'financial', 'css': 'css',
        'color': 'color', 'developer': 'developer', 'encoders': 'encoder',
        'seo': 'seo', 'text': 'text', 'image': 'image', 'datetime': 'datetime',
        'network': 'network', 'generators': 'generator', 'markdown': 'markdown',
        'math': 'math', 'content': 'content', 'string': 'string', 'crypto': 'crypto',
    }
    cat_key = cat_map.get(category, 'developer')
    
    new_howto = CATEGORY_HOWTO.get(cat_key, DEFAULT_HOWTO)
    new_tips = CATEGORY_TIPS.get(cat_key, DEFAULT_TIPS)
    
    # Replace the generic How-To
    if GENERIC_HOWTO in content:
        content = content.replace(GENERIC_HOWTO, new_howto)
    
    # Replace the generic Tips (using regex since the bookmark text varies)
    old_tips_pattern = (
        r'            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content\.</li>\n'
        r'            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices\.</li>\n'
        r'            <li>No account or sign-up is required — the tool is completely free with no usage limits\.</li>\n'
        r'            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications\.</li>\n'
        r'            <li>Bookmark this page for quick access whenever you need [^<]*\.</li>'
    )
    content = re.sub(old_tips_pattern, new_tips, content)
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    fixed += 1

print(f"Fixed {fixed} tools with category-specific content")
