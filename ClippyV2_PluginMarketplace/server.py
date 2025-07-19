from flask import Flask, request, redirect, send_from_directory, jsonify
import os
import json

app = Flask(__name__)
PLUGIN_DIR = "plugins"
META_FILE = "registry.json"

@app.route("/")
def form():
    return open("index.html").read()

@app.route("/upload", methods=["POST"])
def upload():
    f = request.files['plugin']
    name = request.form['name']
    author = request.form['author']
    filename = name.replace(" ", "_").lower() + ".py"
    f.save(os.path.join(PLUGIN_DIR, filename))

    # Save registry
    entry = { "id": filename[:-3], "name": name, "author": author }
    try:
        with open(META_FILE, 'r') as f:
            registry = json.load(f)
    except:
        registry = []

    registry.append(entry)
    with open(META_FILE, 'w') as f:
        json.dump(registry, f)

    return redirect("/")

@app.route("/registry")
def registry():
    try:
        with open(META_FILE, 'r') as f:
            return jsonify(json.load(f))
    except:
        return jsonify([])

@app.route("/plugins/<path:filename>")
def serve_plugin(filename):
    return send_from_directory(PLUGIN_DIR, filename)

if __name__ == "__main__":
    app.run(port=5002)