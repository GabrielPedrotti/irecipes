from flask import Blueprint, request, jsonify
from db import get_users, add_user, update_user, db
from flask_cors import CORS
from datetime import datetime, timedelta
from utils.hashPassword import hashPassword, checkPassword
from bson import ObjectId
from pymongo.errors import OperationFailure
from google.cloud import storage
class UserAlreadyExistsError(Exception):
    pass

users = Blueprint('users', 'users', url_prefix='/api/v1/users')
CORS(users)

storage_client = storage.Client.from_service_account_json('secret/videoUploader.json')
bucket_name = 'irecipes-images'

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
            "useTerms": useTerms,
            "followers": [],
            "following": []
        }

        user_id = add_user(user)

        return jsonify({"message": "User created successfully", "user": { "_id": user_id }}), 201

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
    try:
        if not user_id or not ObjectId.is_valid(user_id):
            return jsonify({"error": "Invalid user ID provided"}), 400
        
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify(user), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
    
@users.route('/follow', methods=['POST'])
def follow():
    data = request.get_json()
    user_id = data.get('userId')
    follow_id = data.get('followId')

    try:
        db.users.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$push": {"following": follow_id}}
        )

        db.users.find_one_and_update(
            {"_id": ObjectId(follow_id)},
            {"$push": {"followers": user_id}}
        )

        return jsonify({"message": "User followed successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@users.route('/unfollow', methods=['POST'])
def unfollow():
    data = request.get_json()
    user_id = data.get('userId')
    follow_id = data.get('followId')

    try:
        db.users.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$pull": {"following": follow_id}}
        )

        db.users.find_one_and_update(
            {"_id": ObjectId(follow_id)},
            {"$pull": {"followers": user_id}}
        )

        return jsonify({"message": "User unfollowed successfully"}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users.route('/<user_id>/uploadProfileImage', methods=['POST'])
def uploadProfileImage(user_id):
    try:
        file_data = request.get_data()
        content_type = request.headers.get('Content-Type')

        if not file_data:
            return jsonify({"error": "No data found in the request"}), 400

        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(f"profileImages/{user_id}")
        blob.upload_from_string(file_data, content_type=content_type)

        print(blob.public_url)

        signed_url = blob.generate_signed_url(expiration=timedelta(days=50000))

        db.users.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": {"profileImage": signed_url}}
        )

        return jsonify({"message": "Image uploaded successfully", "data": blob.public_url}), 200
    except Exception as e:
        print('error:', e)
        return jsonify({"error": str(e)}), 500
