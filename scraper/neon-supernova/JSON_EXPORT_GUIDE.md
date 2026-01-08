# CSV to JSON Converter - Usage Guide

## Overview
The SICK scraper now automatically exports data in **both CSV and JSON formats**.

## Automatic Export (Built-in)

When you run the scraper, it automatically creates:
- `scraped_data/products.csv` - CSV format
- `scraped_data/products.json` - JSON format

Both files are updated after each product is scraped!

## Manual Conversion

If you have an existing CSV file and want to convert it to JSON:

### Usage:
```bash
python csv_to_json.py <input_csv> [output_json]
```

### Examples:

**Convert with automatic naming:**
```bash
python csv_to_json.py scraped_data/products.csv
# Creates: scraped_data/products.json
```

**Specify custom output path:**
```bash
python csv_to_json.py scraped_data/products.csv output/data.json
# Creates: output/data.json
```

**Convert any CSV file:**
```bash
python csv_to_json.py my_data.csv my_data.json
```

## JSON Format

The JSON file uses `records` orientation with 2-space indentation:

```json
[
  {
    "part_number": "1150604",
    "url": "https://www.sick.com/...",
    "name": "WLG12H-34162120A00ZDZZZZZZZZZ1",
    "description": "Photoelectric sensors: W12",
    "category": "Photoelectric sensors: W12",
    "actual_part_no": "1150604",
    "price_teaser": "Log in to get your price",
    "phased_out": "No",
    "successor_product": "N/A",
    "certificates": "CE|IO-Link",
    "specifications": "{...}",
    "suitable_accessories": "Cable (2095897)|Bracket (2012938)",
    "image_urls": "https://...|https://...",
    "local_image_paths": "scraped_data/images/1150604_0.png|...",
    "pdf_url": "https://..."
  },
  {
    "part_number": "1012860",
    ...
  }
]
```

## Features

✅ **Automatic Export** - Scraper saves both formats  
✅ **Real-time Updates** - JSON updated after each product  
✅ **Standalone Converter** - Convert existing CSVs  
✅ **Formatted Output** - Pretty-printed with indentation  
✅ **File Size Info** - Shows output file size  

## Command Line Output

```
Reading CSV: scraped_data/products.csv
  ✓ Loaded 25 records
  ✓ Columns: ['part_number', 'url', 'name', ...]

Converting to JSON...
  ✓ Saved to: scraped_data/products.json
  ✓ File size: 152.34 KB

✓ Conversion successful!
  JSON file: scraped_data/products.json
```

## Integration

The JSON format is perfect for:
- Web applications (React, Vue, Angular)
- REST APIs
- NoSQL databases (MongoDB, etc.)
- Data analysis tools
- Import into other systems

## Notes

- JSON files may be larger than CSV due to formatting
- Use `orient='records'` for array of objects format
- Automatically handles special characters and escaping
- All CSV columns are preserved in JSON
