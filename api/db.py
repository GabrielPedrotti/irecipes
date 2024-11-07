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


def get_videos(filters, page, videosPerPage):
    """
    Returns a cursor to a list of video documents.

    Based on the page number and the number of videos per page, the result may
    be skipped and limited.

    The `filters` from the API are passed to the `build_query_sort_project`
    method, which constructs a query, sort, and projection, and then that query
    is executed by this method (`get_videos`).

    Returns 2 elements in a tuple: (videos, total_num_videos)
    """
    print('filters', filters)
    print('page', page)
    print('videosPerPage', videosPerPage)
    query, project = build_query_sort_project(filters)
    print('query', query)
    print('project', project)
    
    if project:
        cursor = db.videos.find(query, project)
    else:
        cursor = db.videos.find(query)

    total_num_videos = 0
    if page == 0:
        total_num_videos = db.videos.count_documents(query)

    videos = cursor.limit(videosPerPage)
    video_list = list(videos)

    for video in video_list:
        user_data = db.users.find_one({"_id": ObjectId(video.get('user_id'))})
        if user_data:
            video['user'] = {
                "userId": str(user_data['_id']),
                "name": user_data.get('name'),
                "userName": user_data.get('userName'),
                "profileImage": user_data.get('profileImage')
            }

    return (video_list, total_num_videos)

def add_video(video, user_id):
    """
    Adds a new video to the database.
    
    The video dictionary should contain the following keys:
    - title: str
    - description: str
    - duration: int
    - tags: arrayOf(str)
    - url: str
    - created_at: datetime
    - comments: arrayOf(comment)
    - likes: int
    - user_id: str (ObjectId as a string)
    
    Returns the ObjectId of the inserted video document.
    Raises an exception if a duplicate key or another error occurs.
    """
    try:
        user_id = ObjectId(user_id)
        if not bson.ObjectId.is_valid(user_id):
            raise ValueError(f"Invalid user_id: {user_id}")

        video["user_id"] = user_id

        result = db.videos.insert_one(video)

        
        return str(result.inserted_id)

    except DuplicateKeyError as e:
        raise ValueError(f"Video with the same title already exists: {e}")

    except OperationFailure as e:
        raise RuntimeError(f"Database operation failed: {e}")

    except Exception as e:
        raise RuntimeError(f"An error occurred: {e}")
    
def update_video(video_id, update_fields):
    """
    Updates an existing video in the database.
    
    Arguments:
    - video_id: The ObjectId (as a string) or other unique identifier for the video to be updated.
    - update_fields: A dictionary containing the fields to be updated.

    Returns:
    - The modified video document or raises an error if the update fails.
    """
    try:
        if isinstance(video_id, str):
            try:
                video_id = ObjectId(video_id)
            except InvalidId:
                raise ValueError(f"Invalid video_id: {video_id}")

        # Perform the update
        result = db.videos.find_one_and_update(
            {"_id": video_id},           # Find the video by ObjectId
            {"$set": update_fields},    # Update the specified fields
            return_document=True 
        )
        
        if result is None:
            raise ValueError(f"Video with id {video_id} not found.")
        
        return result

    except InvalidId as e:
        raise ValueError(f"Invalid ObjectId: {e}")

    except OperationFailure as e:
        raise RuntimeError(f"Database operation failed: {e}")

    except Exception as e:
        raise RuntimeError(f"An error occurred: {e}")

def get_video(video_id):
    """
    Retrieves a video document by its ObjectId.
    
    Arguments:
    - video_id: The ObjectId (as a string) or other unique identifier for the video to be retrieved.

    Returns:
    - The video document or None if not found.
    """
    try:
        if isinstance(video_id, str):
            try:
                video_id = ObjectId(video_id)
            except InvalidId:
                raise ValueError(f"Invalid video_id: {video_id}")

        video = db.videos.find_one({"_id": video_id})
        
        return video

    except InvalidId as e:
        raise ValueError(f"Invalid ObjectId: {e}")

    except OperationFailure as e:
        raise RuntimeError(f"Database operation failed: {e}")

    except Exception as e:
        raise RuntimeError(f"An error occurred: {e}")
    
def get_user_videos(user_id): 
    """
    Retrieves a list of video documents by the user's ObjectId.
    
    Arguments:
    - user_id: The ObjectId (as a string) or other unique identifier for the user.

    Returns:
    - A list of video documents or an empty list if not found.
    """
    try:
        if isinstance(user_id, str):
            try:
                user_id = ObjectId(user_id)
            except InvalidId:
                raise ValueError(f"Invalid user_id: {user_id}")

        videos = db.videos.find({"user_id": user_id})
        
        return list(videos)

    except InvalidId as e:
        raise ValueError(f"Invalid ObjectId: {e}")

    except OperationFailure as e:
        raise RuntimeError(f"Database operation failed: {e}")

    except Exception as e:
        raise RuntimeError(f"An error occurred: {e}")


