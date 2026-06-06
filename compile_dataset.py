import zipfile
import xml.etree.ElementTree as ET
import os
import json

csv_path = r"c:\Users\rando\projects\ExpertHire 2028\Mahakumbh_Complete_Dataset.csv"
output_dir = r"c:\Users\rando\projects\ExpertHire 2028\src\data"
output_file = os.path.join(output_dir, "historical_data.json")

def parse_xlsx(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return None
    
    data = {}
    with zipfile.ZipFile(file_path, 'r') as zip_ref:
        # Load shared strings
        shared_strings = []
        try:
            with zip_ref.open('xl/sharedStrings.xml') as f:
                tree = ET.parse(f)
                root = tree.getroot()
                ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
                for t in root.findall('.//ns:t', ns):
                    shared_strings.append(t.text if t.text else "")
        except KeyError:
            print("No shared strings found.")
        
        # We know there are exactly 6 sheets
        sheet_keys = ["visitors", "revenue", "environment", "media", "safety", "sentiment"]
        ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        
        for idx in range(1, 7):
            sheet_file = f'xl/worksheets/sheet{idx}.xml'
            if sheet_file not in zip_ref.namelist():
                print(f"Missing {sheet_file}!")
                continue
                
            with zip_ref.open(sheet_file) as f:
                tree = ET.parse(f)
                root = tree.getroot()
                rows = root.findall('.//ns:row', ns)
                
                sheet_data = []
                headers = []
                for r_idx, row in enumerate(rows):
                    row_data = {}
                    for cell in row.findall('ns:c', ns):
                        cell_ref = cell.attrib.get('r')
                        cell_type = cell.attrib.get('t')
                        val_el = cell.find('ns:v', ns)
                        val = ""
                        if val_el is not None:
                            val = val_el.text
                            if cell_type == 's':
                                val = shared_strings[int(val)]
                        row_data[cell_ref] = val
                    
                    # Sort cells by column letter conversion
                    def col_key(cell_ref):
                        col_letters = ''.join(c for c in cell_ref if c.isalpha())
                        num = 0
                        for char in col_letters:
                            num = num * 26 + (ord(char) - ord('A') + 1)
                        return num
                    
                    sorted_cells = sorted(row_data.items(), key=lambda x: col_key(x[0]))
                    row_cells = [val for _, val in sorted_cells]
                    
                    if not row_cells:
                        continue
                        
                    if r_idx == 0:
                        headers = row_cells
                    else:
                        # Map to headers
                        record = {}
                        for h_idx, h in enumerate(headers):
                            if h_idx < len(row_cells):
                                val = row_cells[h_idx]
                                # Convert numbers to floats/ints if appropriate
                                try:
                                    if '.' in val:
                                        record[h] = float(val)
                                    else:
                                        record[h] = int(val)
                                except ValueError:
                                    record[h] = val
                        sheet_data.append(record)
                
                data[sheet_keys[idx-1]] = sheet_data
                print(f"Parsed sheet {idx} ({sheet_keys[idx-1]}): {len(sheet_data)} records.")
                
    return data

def main():
    data = parse_xlsx(csv_path)
    if data:
        os.makedirs(output_dir, exist_ok=True)
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"Successfully compiled dataset and saved to {output_file}")

if __name__ == "__main__":
    main()
