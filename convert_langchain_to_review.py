#!/usr/bin/env python3
"""
Convert LangChain results to review app format
Usage: python convert_langchain_to_review.py <langchain_json_file>
"""

import json
import sys
from datetime import datetime

def convert_to_review_format(langchain_file):
    """Convert LangChain export format to review app format"""
    
    # Load the LangChain results
    with open(langchain_file, 'r') as f:
        data = json.load(f)
    
    # Transform to review app format
    review_data = {
        "metadata": {
            "generated": datetime.now().isoformat(),
            "total_products": data.get('metadata', {}).get('total_products', 0),
            "grouping_rate": data.get('metadata', {}).get('grouping_rate', 0)
        },
        "groups": []
    }
    
    # Convert each group
    for idx, group in enumerate(data.get('grouped_products', [])):
        group_data = {
            "id": f"group-{idx}",
            "parent_sku": group.get('parent_sku', ''),
            "parent_title": group.get('parent_title', ''),
            "confidence": group.get('confidence', 0.85),
            "reasoning": group.get('reasoning', 'SKU pattern match'),
            "variant_count": group.get('variant_count', len(group.get('variants', []))),
            "common_attributes": group.get('common_attributes', {}),
            "varying_attributes": group.get('varying_attributes', []),
            "review_status": "pending",
            "variants": []
        }
        
        # Add variant details
        for variant in group.get('variants', []):
            variant_data = {
                "sku": variant.get('sku', ''),
                "title": variant.get('title', ''),
                "attributes": variant.get('attributes', {})
            }
            group_data['variants'].append(variant_data)
        
        review_data['groups'].append(group_data)
    
    # Save the converted file
    output_file = langchain_file.replace('.json', '_for_review.json')
    with open(output_file, 'w') as f:
        json.dump(review_data, f, indent=2)
    
    print(f"✅ Converted {len(review_data['groups'])} groups")
    print(f"📁 Saved to: {output_file}")
    print(f"\n📱 Next steps:")
    print(f"1. Open http://localhost:3000 in your browser")
    print(f"2. Click 'Import JSON' and select {output_file}")
    print(f"3. Start reviewing your variant groups!")
    
    return output_file

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python convert_langchain_to_review.py <langchain_json_file>")
        sys.exit(1)
    
    convert_to_review_format(sys.argv[1])