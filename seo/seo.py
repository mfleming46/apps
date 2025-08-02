import sys
from urllib.parse import urljoin

def parse_seo_file(filepath):
    fields = {}
    description_lines = []
    in_description = False

    with open(filepath, 'r', encoding='utf-8') as file:
        for line in file:
            stripped = line.rstrip()

            if in_description:
                if not stripped or stripped.startswith("..."):
                    break
                description_lines.append(stripped)
            elif stripped.lower().startswith("description:"):
                in_description = True
                first_line = stripped[len("description:"):].strip()
                if first_line:
                    description_lines.append(first_line)
            elif ':' in stripped:
                key, value = stripped.split(':', 1)
                fields[key.strip().lower()] = value.strip()

    if description_lines:
        fields["description"] = ' '.join(description_lines)

    return fields

def truncate(text, max_len=160):
    return text if len(text) <= max_len else text[:157].rstrip() + '…'

def generate_meta_tags(fields):
    base_url = fields.get("base", "")
    rel_url = fields.get("url")
    description = truncate(fields.get("description", ""))
    title = fields.get("title", "")
    image = fields.get("image", "")

    if not base_url or not rel_url:
        sys.exit("Error: 'base:' and 'url:' are required fields in the file.")

    canonical_url = urljoin(base_url, rel_url)
    image_url = urljoin(base_url, image) if image else ""

    return f"""<!-- SEO Meta -->
<meta name="description" content="{description}">
<link rel="canonical" href="{canonical_url}">

<!-- Open Graph -->
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:image" content="{image_url}">
<meta property="og:url" content="{canonical_url}">
<meta property="og:type" content="website">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{description}">
<meta name="twitter:image" content="{image_url}">
"""

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python seo.py yourfile.txt")
        sys.exit(1)

    fields = parse_seo_file(sys.argv[1])
    print(generate_meta_tags(fields))
