#!/usr/bin/env python3
"""
Fix helpContent injection for files where it was placed inside faqs=[].
The issue: when categoryLabel and faqs are on the same line, helpContent
was injected between them incorrectly.
"""
import os, re, glob

TOOLS_DIR = '/root/megautils/src/tools'

fixed = 0
for tool_dir in sorted(os.listdir(TOOLS_DIR)):
    filepath = os.path.join(TOOLS_DIR, tool_dir, 'page.tsx')
    if not os.path.isfile(filepath):
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    if 'helpContent' not in content:
        continue
    
    # Check for the broken pattern: faqs={[\n      helpContent={
    # This means helpContent was injected inside the faqs array
    if 'faqs={[\n      helpContent={' in content:
        # Fix: move helpContent BEFORE faqs
        # Step 1: Extract the helpContent block
        # Find the helpContent block
        help_match = re.search(
            r'      helpContent=\{[\s\S]*?\n      \}\}',
            content
        )
        if not help_match:
            # Try alternate pattern
            help_match = re.search(
                r'      helpContent=\{[\s\S]*?      \}\}',
                content
            )
        
        if help_match:
            help_block = help_match.group(0)
            # Remove helpContent from its wrong position
            content_without = content[:help_match.start()] + content[help_match.end():]
            
            # Now fix the faqs line - remove the orphaned newline
            content_without = content_without.replace('faqs={[\n\n', 'faqs={[\n')
            
            # Find where to insert helpContent: before faqs={[
            # First find the faqs={[ that's on the same line as categoryLabel
            faq_pattern = re.search(r'(categoryLabel="[^"]*")\s*(faqs=\{\[)', content_without)
            if faq_pattern:
                # Split: put helpContent between categoryLabel and faqs
                insert_pos = faq_pattern.start(2)
                content_fixed = content_without[:insert_pos] + '\n' + help_block + '\n' + content_without[insert_pos:]
                
                with open(filepath, 'w') as f:
                    f.write(content_fixed)
                fixed += 1
                print(f"FIXED: {tool_dir}")
                continue
        
        # If the above didn't work, try a different approach
        # Remove the entire helpContent block and re-inject properly
        print(f"COMPLEX: {tool_dir} - needs manual review")
    
    # Also check: some files might have categoryLabel on one line and faqs on next
    # where helpContent was injected between correctly but the faqs opening is wrong
    elif 'faqs={[' in content and 'helpContent={' in content:
        # Check if the order is correct: helpContent should come before faqs
        help_pos = content.find('helpContent={')
        faqs_pos = content.find('faqs={[')
        if help_pos > faqs_pos:
            print(f"ORDER ISSUE: {tool_dir} - helpContent after faqs")

print(f"\nFixed {fixed} files")
