from flask import Flask, request, session, redirect, url_for, render_template_string
import hashlib

app = Flask(__name__)
app.secret_key = 'supersecret'  # Use env var in production

USERS = {
    "alice@example.com": hashlib.sha256(b"pass123").hexdigest()
}

LOGIN_FORM = """
<h2>Login</h2>
<form method="POST">
Email: <input name="email"><br>
Password: <input type="password" name="password"><br>
<input type="submit">
</form>
"""

@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        pw = hashlib.sha256(request.form["password"].encode()).hexdigest()
        if USERS.get(email) == pw:
            session["user"] = email
            return redirect("/dashboard")
        return "Invalid login"

    return render_template_string(LOGIN_FORM)

@app.route("/dashboard")
def dash():
    if "user" not in session:
        return redirect("/")
    return f"<h1>Welcome, {session['user']}</h1><a href='/logout'>Logout</a>"

@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect("/")

if __name__ == "__main__":
    app.run(debug=True, port=5003)