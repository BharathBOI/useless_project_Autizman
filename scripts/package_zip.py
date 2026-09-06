import os
import sys
import zipfile
import shutil

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ARTIFACT_DIR = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\27c6504f-78ba-4871-a4f4-f717b555dc6f"

def make_archive(output_filename, include_node_modules=False):
    target_path = os.path.join(ROOT_DIR, output_filename)
    if os.path.exists(target_path):
        try:
            os.remove(target_path)
        except Exception as e:
            print(f"Notice: couldn't remove existing {output_filename}: {e}")

    print(f"Creating {output_filename} (include_node_modules={include_node_modules})...")
    count = 0
    total_bytes = 0

    with zipfile.ZipFile(target_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zipf:
        for root, dirs, files in os.walk(ROOT_DIR):
            # Exclude git
            if ".git" in dirs:
                dirs.remove(".git")
            
            # Conditionally exclude node_modules
            if not include_node_modules and "node_modules" in dirs:
                dirs.remove("node_modules")

            # Exclude dist to avoid duplicated built artifacts
            if "dist" in dirs:
                dirs.remove("dist")

            for file in files:
                # Exclude zip files themselves to avoid recursion
                if file.endswith(".zip") or file.endswith(".lock"):
                    continue
                
                # Exclude temporary or system files
                if file == ".DS_Store" or file.endswith(".tmp"):
                    continue

                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, ROOT_DIR)
                
                try:
                    file_size = os.path.getsize(full_path)
                    zipf.write(full_path, rel_path)
                    count += 1
                    total_bytes += file_size
                except Exception as err:
                    print(f"Skipping {rel_path}: {err}")

    final_size_mb = os.path.getsize(target_path) / (1024 * 1024)
    print(f"SUCCESS: {output_filename} created with {count} files ({final_size_mb:.2f} MB)")
    
    # Copy to artifact directory
    if os.path.exists(ARTIFACT_DIR):
        artifact_path = os.path.join(ARTIFACT_DIR, output_filename)
        shutil.copyfile(target_path, artifact_path)
        print(f"Copied to artifact dir: {artifact_path}")

    # Copy to public dir for in-app download
    public_path = os.path.join(ROOT_DIR, "public", output_filename)
    shutil.copyfile(target_path, public_path)
    print(f"Copied to public dir: {public_path}")

    return target_path

if __name__ == "__main__":
    # 1. Complete package with all modules (node_modules + full source + assets)
    full_zip = make_archive("serialos_complete_with_modules.zip", include_node_modules=True)

    # 2. Clean source package (full source + assets + scripts, without node_modules)
    source_zip = make_archive("serialos_source.zip", include_node_modules=False)

    print("\nAll packages created successfully!")
