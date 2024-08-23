from flask import Blueprint, request, jsonify
from db import get_users

from flask_cors import CORS
from datetime import datetime


users = Blueprint(
    'users', 'users', url_prefix='/api/v1/users')

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