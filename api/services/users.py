from flask import Blueprint, request, jsonify
from db import get_users, add_user, update_user, db
from flask_cors import CORS
from datetime import datetime
from utils.hashPassword import hashPassword, checkPassword
from bson.errors import InvalidId
from pymongo.errors import OperationFailure

users = Blueprint('users', 'users', url_prefix='/api/v1/users')
CORS(users)

@users.route('/', methods=['GET'])
def getUsers():
    usersPerPage = 20

    (users, total_num_entries) = get_users(
        None, page=0, usersPerPage=usersPerPage)

    response = {
        "users": users,
        "page": 0,
        "filters": {},
        "entries_per_page": usersPerPage,
        "total_results": total_num_entries,
    }

    print('response', response)

    return jsonify(response)

@users.route('/', methods=['POST'])
def postUser():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    try:
        name = data['name']
        age = data['age']
        email = data['email']
        password = data['password']
        created_at = datetime.utcnow()
        preferences = data['preferences']

        hashedPassword = hashPassword(password)

        # TODO add more validation here

        user = {
            "name": name,
            "age": age,
            "email": email,
            "password": hashedPassword,
            "created_at": created_at,
            "preferences": preferences
        }

        user_id = add_user(user)

        return jsonify({"message": "User created successfully", "user_id": user_id}), 201

    except KeyError as e:
        return jsonify({"error": f"Missing field: {str(e)}"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users.route('/<user_id>', methods=['PUT'])
def putUser(user_id):
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    try:
        if 'password' in data:
            data['password'] = hash_password(data['password'])

        updated_user = update_user(user_id, data)

        return jsonify({"message": "User updated successfully", "user": updated_user}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()

    # Validate input data
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        # Find the user by email
        user = db.users.find_one({"email": data['email']})
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401

        # Check if the provided password matches the stored hashed password
        if checkPassword(data['password'], user['password']):
            # If using JWT, generate a token here
            # For this example, we'll just return a success message
            return jsonify({"message": "Login successful", "user": user}), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401

    except OperationFailure as e:
        return jsonify({"error": f"Database operation failed: {e}"}), 500

    except Exception as e:
        return jsonify({"error": f"An error occurred: {e}"}), 500