import os
import sqlite3
from flask import Flask, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, JWTManager
from werkzeug.security import generate_password_hash, check_password_hash
import re
import smtplib
from email.message import EmailMessage
import secrets
from datetime import timedelta

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'super-secret'  # Change this in production!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

# Database setup
DATABASE = 'user_auth.db'

def init_db():
    with sqlite3.connect(DATABASE) as db:
        cursor = db.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                confirmed INTEGER DEFAULT 0
            )
        ''')
        db.commit()

def get_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db

# Helper functions
def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def create_user(email, password):
    db = get_db()
    cursor = db.cursor()
    hashed_password = generate_password_hash(password)
    try:
        cursor.execute("INSERT INTO users (email, password) VALUES (?, ?)", (email, hashed_password))
        db.commit()
        user_id = cursor.lastrowid
        return user_id
    except sqlite3.IntegrityError:
        return None  # Email already exists
    finally:
        db.close()

def confirm_user(token):
    db = get_db()
    cursor = db.cursor()
    email = get_email_from_token(token)
    if not email:
        return False
    cursor.execute("UPDATE users SET confirmed = 1 WHERE email = ?", (email,))
    db.commit()
    db.close()
    return True

def get_user_by_email(email):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    db.close()
    return user

def send_email(to_email, subject, body):
    # Simulate email sending
    print(f"Sending email to: {to_email}")
    print(f"Subject: {subject}")
    print(f"Body: {body}")
    # In real app: use smtplib to send
    # msg = EmailMessage()
    # msg.set_content(body)
    # msg['Subject'] = subject
    # msg['From'] = "your_email@example.com"
    # msg['To'] = to_email
    # with smtplib.SMTP("your_smtp_server.com", 587) as server: # Adjust SMTP details
    #     server.starttls()
    #     server.login("your_email@example.com", "your_password")
    #     server.send_message(msg)
    return True  # Assume success for now

def generate_token(email, token_type="confirmation"):
    token = secrets.urlsafe_token(32)
    # You might want to store these tokens with their expiry in DB for a real system
    # Here, we'll just fake it
    return f"{token}-{email}" # token + email, to be extracted later


def get_email_from_token(token):
    try:
        _, email = token.rsplit("-", 1)
        return email
    except ValueError:
        return None

# Routes
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'message': 'Missing data'}), 400
    email = data['email']
    password = data['password']
    if not is_valid_email(email):
        return jsonify({'message': 'Invalid email format'}), 400

    if create_user(email, password):
        token = generate_token(email)
        send_email(email, "Confirm Your Email", f"Click here to confirm: http://127.0.0.1:5000/confirm/{token}") # change URL in prod
        return jsonify({'message': 'Registration successful. Check your email to confirm.'}), 201
    else:
        return jsonify({'message': 'Email already registered'}), 409

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'message': 'Missing data'}), 400
    email = data['email']
    password = data['password']
    user = get_user_by_email(email)

    if user and check_password_hash(user['password'], password) and user['confirmed']:
        access_token = create_access_token(identity=email)
        return jsonify({'access_token': access_token}), 200
    elif user and check_password_hash(user['password'], password) and not user['confirmed']:
        return jsonify({'message': 'Please confirm your email first.'}), 401
    else:
        return jsonify({'message': 'Invalid credentials'}), 401


@app.route('/confirm/<token>', methods=['GET'])
def confirm_email(token):
    if confirm_user(token):
        return jsonify({'message': 'Email confirmed successfully!'}), 200
    else:
        return jsonify({'message': 'Invalid or expired token'}), 400


@app.route('/forgot', methods=['POST'])
def forgot_password():
    data = request.get_json()
    if not data or 'email' not in data:
        return jsonify({'message': 'Missing email'}), 400
    email = data['email']
    user = get_user_by_email(email)
    if user:
        token = generate_token(email, "reset")
        send_email(email, "Reset Your Password", f"Click here to reset: http://127.0.0.1:5000/reset/{token}") # Change URL in prod
        return jsonify({'message': 'Check your email for password reset instructions.'}), 200
    else:
        return jsonify({'message': 'Email not found'}), 404

@app.route('/reset/<token>', methods=['POST'])
def reset_password(token):
    data = request.get_json()
    if not data or 'new_password' not in data:
        return jsonify({'message': 'Missing new password'}), 400

    email = get_email_from_token(token)

    if not email:
        return jsonify({'message': 'Invalid or expired token'}), 400
  
    new_password = data['new_password']
    db = get_db()
    cursor = db.cursor()
    hashed_password = generate_password_hash(new_password)
    cursor.execute("UPDATE users SET password = ? WHERE email = ?", (hashed_password, email))
    db.commit()
    db.close()
    return jsonify({'message': 'Password reset successful'}), 200


if __name__ == '__main__':
    init_db()
    app.run(debug=True)