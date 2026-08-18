#!/usr/bin/env python3
"""
Add helpContent to tool pages. v2: properly handles all ToolPage patterns.
Pattern A: categoryLabel on its own line, faqs on next line or no faqs
Pattern B: categoryLabel and faqs on same line (need to split)
Pattern C: categoryLabel with > on same line (no faqs, need to split)
"""
import os, re

TOOLS_DIR = '/root/megautils/src/tools'

# Import content from the main script
exec(open('/root/megautils/scripts/add-help-content.py').read())


def generate_content_block(tool_slug):
    """Generate helpContent and faqs JSX blocks for a tool."""
    all_tools = {**TOOL_CONTENT, **REMAINING_TOOLS}
    if tool_slug not in all_tools:
        return None, None
    
    tool_info = all_tools[tool_slug]
    
    if isinstance(tool_info, dict):
        what = tool_info["what"]
        howto_items = "\n".join(f"            <li>{step}</li>" for step in tool_info["howto"])
        when = tool_info["when"]
        tips_items = "\n".join(f"            <li>{tip}</li>" for tip in tool_info["tips"])
        faqs = tool_info["faqs"]
    else:
        title, ttype, desc, when_use, domain, topic = tool_info
        what = f"{title} is a free browser-based tool that lets you {desc[0].lower() + desc[1:]}. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately."
        howto_items = f"""            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>"""
        when = f"This tool is particularly useful when {when_use}. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this {domain} tool saves time and eliminates the need for desktop software installation."
        tips_items = f"""            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need {topic.lower()}.</li>"""
        faqs = [
            (f"Is this {title.lower()} free to use?", f"Yes, completely free with no usage limits, no sign-up required, and no ads blocking the tool interface."),
            (f"Is my data safe when using this tool?", "Absolutely. All processing happens entirely in your browser. No data is ever uploaded to or stored on any server. Your content remains on your device at all times."),
            (f"Does this tool work on mobile devices?", "Yes. The tool is fully responsive and works on smartphones and tablets in any modern browser."),
        ]
    
    # Escape single quotes in FAQs for JSX
    def esc(s):
        return s.replace("'", "\\'")
    
    help_block = f"""      helpContent={{
        <>
          <h2>What is This Tool?</h2>
          <p>{what}</p>

          <h2>How to Use This Tool</h2>
          <ol>
{howto_items}
          </ol>

          <h2>When to Use This Tool</h2>
          <p>{when}</p>

          <h2>Tips and Best Practices</h2>
          <ul>
{tips_items}
          </ul>
        </>
      }}"""

    faq_items = ",\n        ".join(
        f"{{ question: '{esc(q)}', answer: '{esc(a)}' }}"
        for q, a in faqs
    )
    faqs_block = f"""      faqs={{[
        {faq_items},
      ]}}"""

    return help_block, faqs_block


def inject_into_file(filepath, tool_slug):
    """Inject helpContent into a tool page, handling all patterns."""
    with open(filepath, 'r') as f:
        content = f.read()
    
    if 'helpContent' in content:
        return False  # Already has it
    
    blocks = generate_content_block(tool_slug)
    if not blocks:
        return False
    
    help_block, faqs_block = blocks
    
    lines = content.split('\n')
    new_lines = []
    inserted = False
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        if inserted:
            new_lines.append(line)
            continue
        
        # Pattern B: categoryLabel and faqs on same line
        # e.g.: <ToolPage title="..." categoryLabel="Developer Tools" faqs={[
        if 'categoryLabel=' in line and 'faqs={[' in line and not inserted:
            # Split the line: everything before faqs stays, faqs goes to new line
            faqs_idx = line.index('faqs={[')
            before_faqs = line[:faqs_idx].rstrip()
            after_faqs = line[faqs_idx:]
            
            new_lines.append(before_faqs)
            new_lines.append(help_block)
            new_lines.append('      ' + after_faqs.strip())
            inserted = True
            continue
        
        # Pattern C: categoryLabel followed by > on same line (no faqs, closes tag)
        # e.g.: categoryLabel="Text Tools">
        if 'categoryLabel=' in line and line.rstrip().endswith('>') and 'faqs=' not in line and not inserted:
            # Split: remove the >, add helpContent, then faqs, then >
            trimmed = line.rstrip().rstrip('>')
            new_lines.append(trimmed)
            new_lines.append(help_block)
            new_lines.append(faqs_block)
            new_lines.append('    >')
            inserted = True
            continue
        
        # Pattern A: categoryLabel on its own line
        if 'categoryLabel=' in line and not inserted:
            new_lines.append(line)
            # Check if next line has faqs
            if i + 1 < len(lines) and 'faqs=' in lines[i + 1]:
                # Insert helpContent between categoryLabel and faqs
                new_lines.append(help_block)
                inserted = True
                continue
            else:
                # No faqs on next line - insert both helpContent and faqs
                new_lines.append(help_block)
                new_lines.append(faqs_block)
                inserted = True
                continue
        
        new_lines.append(line)
    
    if inserted:
        result = '\n'.join(new_lines)
        with open(filepath, 'w') as f:
            f.write(result)
        return True
    
    return False


# Process all tools
success = 0
failed = []

for tool_slug in sorted(os.listdir(TOOLS_DIR)):
    tool_path = os.path.join(TOOLS_DIR, tool_slug, 'page.tsx')
    if not os.path.isfile(tool_path):
        continue
    
    with open(tool_path, 'r') as f:
        if 'helpContent' in f.read():
            continue
    
    all_tools = {**TOOL_CONTENT, **REMAINING_TOOLS}
    if tool_slug not in all_tools:
        failed.append(tool_slug)
        continue
    
    if inject_into_file(tool_path, tool_slug):
        success += 1
        print(f"OK: {tool_slug}")
    else:
        failed.append(tool_slug)
        print(f"FAIL: {tool_slug}")

print(f"\nDone: {success} tools updated")
if failed:
    print(f"Failed ({len(failed)}): {', '.join(failed)}")
