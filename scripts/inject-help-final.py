#!/usr/bin/env python3
"""
Final helpContent injection script. Properly handles all ToolPage patterns.
"""
import os, re

TOOLS_DIR = '/root/megautils/src/tools'

# Load content data
exec(open('/root/megautils/scripts/tool-content-data.py').read())


def esc(s):
    """Escape single quotes for JSX string literals."""
    return s.replace("'", "\\'")


def make_help_block(tool_slug):
    """Generate helpContent JSX block."""
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
        howto_items = """            <li>Enter your data or content in the <strong>input area</strong>.</li>
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
            (f"Is this {title.lower()} free to use?", "Yes, completely free with no usage limits, no sign-up required, and no ads blocking the tool interface."),
            ("Is my data safe when using this tool?", "Absolutely. All processing happens entirely in your browser. No data is ever uploaded to or stored on any server. Your content remains on your device at all times."),
            ("Does this tool work on mobile devices?", "Yes. The tool is fully responsive and works on smartphones and tablets in any modern browser."),
        ]
    
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


def inject(filepath, tool_slug):
    """Inject helpContent into a tool file."""
    with open(filepath, 'r') as f:
        content = f.read()
    
    if 'helpContent' in content:
        return False
    
    result = make_help_block(tool_slug)
    if not result:
        return False
    help_block, faqs_block = result
    
    has_existing_faqs = 'faqs={[' in content or 'faqs={' in content
    
    lines = content.split('\n')
    new_lines = []
    done = False
    
    for i, line in enumerate(lines):
        if done:
            new_lines.append(line)
            continue
        
        # PATTERN B: categoryLabel AND faqs on SAME line
        if 'categoryLabel=' in line and 'faqs={' in line:
            # Split line: everything before 'faqs' | helpContent | faqs...
            m = re.search(r'(\s*faqs=\{)', line)
            if m:
                before = line[:m.start()].rstrip()
                after = line[m.start():]
                new_lines.append(before)
                new_lines.append(help_block)
                new_lines.append(after)
                done = True
                continue
        
        # PATTERN C: categoryLabel with > closing on same line (no faqs)
        if 'categoryLabel=' in line and line.rstrip().endswith('>') and 'faqs=' not in line:
            # Remove trailing >, add helpContent + faqs, then >
            trimmed = line.rstrip()[:-1].rstrip()
            new_lines.append(trimmed)
            new_lines.append(help_block)
            if not has_existing_faqs:
                new_lines.append(faqs_block)
            new_lines.append('    >')
            done = True
            continue
        
        # PATTERN A: categoryLabel on its own line (no faqs on this line)
        if 'categoryLabel=' in line and 'faqs=' not in line and not line.rstrip().endswith('>'):
            new_lines.append(line)
            # Insert helpContent right after this line
            new_lines.append(help_block)
            # If no existing faqs, add faqs too
            if not has_existing_faqs:
                new_lines.append(faqs_block)
            done = True
            continue
        
        new_lines.append(line)
    
    if done:
        with open(filepath, 'w') as f:
            f.write('\n'.join(new_lines))
        return True
    return False


# Run
success = 0
failed = []

for slug in sorted(os.listdir(TOOLS_DIR)):
    path = os.path.join(TOOLS_DIR, slug, 'page.tsx')
    if not os.path.isfile(path):
        continue
    with open(path) as f:
        if 'helpContent' in f.read():
            continue
    
    all_tools = {**TOOL_CONTENT, **REMAINING_TOOLS}
    if slug not in all_tools:
        failed.append(slug)
        continue
    
    if inject(path, slug):
        success += 1
        print(f"OK: {slug}")
    else:
        failed.append(slug)
        print(f"FAIL: {slug}")

print(f"\nDone: {success} tools updated")
if failed:
    print(f"Failed ({len(failed)}): {', '.join(failed)}")
