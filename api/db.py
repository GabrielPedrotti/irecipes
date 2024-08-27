import bson

from flask import g ,current_app
from werkzeug.local import LocalProxy
from pymongo.errors import DuplicateKeyError, OperationFailure
from bson.objectid import ObjectId
from bson.errors import InvalidId
from pymongo import MongoClient

def get_db():
    """
    Configuration method to return db instance
    """
    if "db" not in g:
        # Use the MongoDB URI from Flask's app config
        mongo_uri = current_app.config['MONGO_URI']
        client = MongoClient(mongo_uri)
        g.db = client["irecipes-data"]

    return g.db

# Use LocalProxy to read the global db instance with just `db`
db = LocalProxy(get_db)

def build_query_sort_project(filters):
    """
    Builds the `query` predicate, `sort` and `projection` attributes for a given
    filters dictionary.
    """
    query = {}
    project = None
    if filters:
        if "text" in filters:
            query = {"$text": {"$search": filters["text"]}}
            meta_score = {"$meta": "textScore"}
            project = {"score": meta_score}
        elif "cast" in filters:
            query = {"cast": {"$in": filters["cast"]}}
        elif "genres" in filters:
            query = {"genres": {"$in": filters["genres"]}}

    return query, project

def get_users(filters, page, usersPerPage):
    """
    Returns a cursor to a list of user documents.

    Based on the page number and the number of users per page, the result may
    be skipped and limited.

    The `filters` from the API are passed to the `build_query_sort_project`
    method, which constructs a query, sort, and projection, and then that query
    is executed by this method (`get_users`).

    Returns 2 elements in a tuple: (users, total_num_users)
    """
    query, project = build_query_sort_project(filters)
    if project:
        cursor = db.users.find(query, project)
    else:
        cursor = db.users.find(query)

    total_num_users = 0
    if page == 0:
        total_num_users = db.users.count_documents(query)

    users = cursor.limit(usersPerPage)

    return (list(users), total_num_users)

def add_user(user):
    """
    Adds a new user to the database.
    
    The user dictionary should contain the following keys:
    - name: str
    - age: str
    - email: str
    - password: str (hashed)
    - created_at: datetime
    - preferences: arrayOf(tastes)
    
    Returns the ObjectId of the inserted user document.
    Raises an exception if a duplicate key or another error occurs.
    """
    try:
        result = db.users.insert_one(user)
        
        return str(result.inserted_id)

    except DuplicateKeyError as e:
        # Handle duplicate key error (e.g., email or username already exists)
        raise ValueError(f"User with the same username or email already exists: {e}")

    except OperationFailure as e:
        # Handle any other database operation failures
        raise RuntimeError(f"Database operation failed: {e}")

    except Exception as e:
        # Handle other general exceptions
        raise RuntimeError(f"An error occurred: {e}")

def update_user(user_id, update_fields):
    """
    Updates an existing user in the database.
    
    Arguments:
    - user_id: The ObjectId (as a string) or other unique identifier for the user to be updated.
    - update_fields: A dictionary containing the fields to be updated.

    Returns:
    - The modified user document or raises an error if the update fails.
    """
    try:
        if isinstance(user_id, str):
            try:
                user_id = ObjectId(user_id)
            except InvalidId:
                raise ValueError(f"Invalid user_id: {user_id}")

        # Perform the update
        result = db.users.find_one_and_update(
            {"_id": user_id},           # Find the user by ObjectId
            {"$set": update_fields},    # Update the specified fields
            return_document=True 
        )
        
        if result is None:
            raise ValueError(f"User with id {user_id} not found.")
        
        return result

    except InvalidId as e:
        raise ValueError(f"Invalid ObjectId: {e}")

    except OperationFailure as e:
        raise RuntimeError(f"Database operation failed: {e}")

    except Exception as e:
        raise RuntimeError(f"An error occurred: {e}")


