from flask import Flask, redirect, url_for, session
from flask_dance.contrib.github import make_github_blueprint, github

app = Flask(__name__)
app.secret_key = "supersecret"
app.config["GITHUB_OAUTH_CLIENT_ID"] = "your_client_id"
app.config["GITHUB_OAUTH_CLIENT_SECRET"] = "your_client_secret"

github_bp = make_github_blueprint()
app.register_blueprint(github_bp, url_prefix="/github_login")

@app.route("/")
def index():
    if not github.authorized:
        return '<a href="/github_login">Log in with GitHub</a>'
    resp = github.get("/user")
    user_data = resp.json()
    return f"<h1>Welcome, {user_data['login']}</h1>"

if __name__ == "__main__":
    app.run(port=5004)