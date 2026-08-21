import re
import sys

def find_duplicates(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    current_dict = None
    seen_keys = {}

    for i, line in enumerate(lines, 1):
        m_dict = re.match(r'^\s*([a-z]{2}):\s*\{', line)
        if m_dict:
            current_dict = m_dict.group(1)
            seen_keys[current_dict] = {}
            continue

        if current_dict:
            m_key = re.match(r'^\s*"([^"]+)":', line)
            if m_key:
                key = m_key.group(1)
                if key in seen_keys[current_dict]:
                    print(f"Duplicate in '{current_dict}' at line {i}: '{key}' (first seen at line {seen_keys[current_dict][key]})")
                else:
                    seen_keys[current_dict][key] = i

find_duplicates('frontend/lib/localization.ts')
