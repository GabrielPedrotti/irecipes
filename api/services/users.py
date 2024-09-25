from flask import Blueprint, request, jsonify
from db import get_users, add_user, update_user, db
from flask_cors import CORS
from datetime import datetime
from utils.hashPassword import hashPassword, checkPassword
from bson import ObjectId
from pymongo.errors import OperationFailure

class UserAlreadyExistsError(Exception):
    pass

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

    print('data', data)

    if not data:
        return jsonify({"error": "No input data provided"}), 400
    
    print('data2', data)

    try:
        name = data['name']
        userName = data['userName']
        email = data['email']
        password = data['password']
        birthDate = data['birthDate']
        useTerms = data['useTerms']
        created_at = datetime.utcnow()
        tastes = data['tastes']

        print('name', name)

        hashedPassword = hashPassword(password)
        print('hashedPassword' , hashedPassword)

        if getUserByEmail(email):
            raise UserAlreadyExistsError("Email: is already in use")

        if getUserByUserName(userName):
            raise UserAlreadyExistsError("Username: is already in use")

        user = {
            "userName": userName,
            "name": name,
            "email": email,
            "password": hashedPassword,
            "created_at": created_at,
            "tastes": tastes,
            "birthDate": birthDate,
            "useTerms": useTerms
        }

        user_id = add_user(user)

        return jsonify({"message": "User created successfully", user: { "_id": user_id }}), 201

    except UserAlreadyExistsError as e:
        return jsonify({"error": str(e)}), 400

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
            data['password'] = hashPassword(data['password'])

        updated_user = update_user(user_id, data)

        return jsonify({"message": "User updated successfully", "user": updated_user}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users.route('/<user_id>', methods=['GET'])
def getUser(user_id):
    user = db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        return None

    return user

def getUserByEmail(email):
    user = db.users.find_one({"email": email})

    return user

def getUserByUserName(userName):
    user = db.users.find_one({"userName": userName})
    
    return user


@users.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()

    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        user = db.users.find_one({"email": data['email']})
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401

        if checkPassword(data['password'], user['password']):
            return jsonify({"message": "Login successful", "user": user}), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401

    except OperationFailure as e:
        return jsonify({"error": f"Database operation failed: {e}"}), 500

    except Exception as e:
        return jsonify({"error": f"An error occurred: {e}"}), 500