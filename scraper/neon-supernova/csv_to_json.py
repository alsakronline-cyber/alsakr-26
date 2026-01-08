#!/usr/bin/env python3
"""
CSV to JSON Converter
Converts SICK scraper CSV output to JSON format.
"""

import pandas as pd
import json
import sys
import os

def convert_csv_to_json(csv_path, json_path=None, indent=2):
    """
    Convert CSV file to JSON format with cleaning and optimization.
    
    Args:
        csv_path: Path to input CSV file
        json_path: Path to output JSON file (optional, defaults to same name with .json extension)
        indent: JSON indentation (default: 2)
    
    Returns:
        Path to created JSON file
    """
    # Validate CSV path
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV file not found: {csv_path}")
    
    # Determine JSON output path
    if json_path is None:
        json_path = csv_path.rsplit('.', 1)[0] + '.json'
    
    print(f"Reading CSV: {csv_path}")
    
    # Read CSV
    df = pd.read_csv(csv_path)
    print(f"  ✓ Loaded {len(df)} records")
    
    # --- Cleaning Step ---
    # 1. Drop columns that are completely empty or named "Unnamed"
    unnamed_cols = [col for col in df.columns if col.startswith('Unnamed')]
    if unnamed_cols:
        print(f"  ✓ Dropping {len(unnamed_cols)} 'Unnamed' columns")
        df = df.drop(columns=unnamed_cols)
    
    # 2. Convert to records (list of dicts)
    records = df.to_dict(orient='records')
    
    # 3. Parse nested JSON strings (like 'specifications')
    print(f"  ✓ Parsing nested JSON fields...")
    for record in records:
        for key, value in record.items():
            # Check if value is a string that looks like JSON
            if isinstance(value, str) and value.startswith('{') and value.endswith('}'):
                try:
                    record[key] = json.loads(value)
                except:
                    pass
            # Also handle NaN/Null values for cleaner JSON
            if pd.isna(value):
                record[key] = None

    # Write to JSON
    print(f"Writing JSON: {json_path}")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=indent, ensure_ascii=False)
    
    # Get file size
    file_size = os.path.getsize(json_path)
    size_kb = file_size / 1024
    
    print(f"  ✓ Saved to: {json_path}")
    print(f"  ✓ File size: {size_kb:.2f} KB")
    
    return json_path

def main():
    """Main function for command-line usage."""
    if len(sys.argv) < 2:
        print("Usage: python csv_to_json.py <input_csv> [output_json]")
        print("\nExample:")
        print("  python csv_to_json.py scraped_data/products.csv")
        print("  python csv_to_json.py scraped_data/products.csv output.json")
        sys.exit(1)
    
    csv_path = sys.argv[1]
    json_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        output_path = convert_csv_to_json(csv_path, json_path)
        print(f"\n✓ Conversion successful!")
        print(f"  JSON file: {output_path}")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
