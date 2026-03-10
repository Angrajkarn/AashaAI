import os, zipfile
with zipfile.ZipFile('source.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git', '__pycache__', 'venv']]
        for file in files:
            if file == 'source.zip': continue
            zipf.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), '.'))
