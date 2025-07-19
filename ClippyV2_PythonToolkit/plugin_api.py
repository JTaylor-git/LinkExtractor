from flask import Flask, request, jsonify
import subprocess
import uuid
import os

app = Flask(__name__)
PLUGIN_DIR = "plugins"

@app.route("/api/python/run/<plugin_id>", methods=["POST"])
def run_plugin(plugin_id):
    plugin_path = os.path.join(PLUGIN_DIR, plugin_id + ".py")
    if not os.path.exists(plugin_path):
        return jsonify({"error": "Plugin not found"}), 404

    input_data = request.json.get("input", "")
    try:
        result = subprocess.run(["python3", plugin_path], input=input_data.encode(),
                                capture_output=True, timeout=5)
        return jsonify({
            "output": result.stdout.decode(),
            "error": result.stderr.decode(),
            "returncode": result.returncode
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/")
def index():
    return "Clippy Python API is live!"

if __name__ == "__main__":
    app.run(debug=True, port=5001)