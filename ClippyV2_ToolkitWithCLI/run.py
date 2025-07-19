import sys
import subprocess
import os

if len(sys.argv) < 3:
    print("Usage: python run.py <plugin_id> "<input_string>"")
    sys.exit(1)

plugin_id = sys.argv[1]
input_str = sys.argv[2]

plugin_path = os.path.join("plugins", plugin_id + ".py")
if not os.path.exists(plugin_path):
    print("Plugin not found:", plugin_path)
    sys.exit(2)

proc = subprocess.run(["python3", plugin_path], input=input_str.encode(), capture_output=True)
print("OUTPUT:")
print(proc.stdout.decode())
if proc.stderr:
    print("ERROR:")
    print(proc.stderr.decode())