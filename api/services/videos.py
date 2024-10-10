from flask import Blueprint, request, jsonify
from db import get_videos, add_video, update_video, get_video, get_user_videos, db
from datetime import datetime
from flask_cors import CORS
from google.cloud import storage
import os

videos = Blueprint('videos', 'videos', url_prefix='/api/v1/videos')
CORS(videos)

storage_client = storage.Client.from_service_account_json('C:/Users/gabri/Desktop/iRecipes/irecipes/api/secret/videoUploader.json')
bucket_name = 'irecipes-videos'

@videos.route('/uploadVideo', methods=['POST'])
def uploadVideo():
    try:
        data = request.get_json()
        video_name = data.get('filename')
        content_type = data.get('contentType')

        if not video_name or not content_type:
            return jsonify({"error": "Filename and contentType are required"}), 400
        

        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(video_name)

        url = blob.generate_signed_url(
            scheme='https',
            version="v4",
            expiration=600,
            method="PUT",
            # content_type=content_type
        )

        print('url', url)

        return jsonify({"uploadUrl": url}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@videos.route('/postVideo', methods=['POST'])
def postVideo():
    try:
        video = {}
        data = request.get_json()
        title = data.get('title')
        description = data.get('description')
        tags = data.get('tags')
        video_url = data.get('url')
        duration = data.get('duration')
        user = data.get('userId')
        created_at = datetime.now()
        comments = []
        likes = 0

        video = {
            "title": title,
            "description": description,
            "tags": tags,
            "url": video_url,
            "duration": duration,
            "created_at": created_at,
            "comments": comments,
            "likes": likes
        }

        print('video', video)
        print('user', user)

        add_video(video, user)

        return jsonify({"message": "Video posted successfully"}), 200
    except Exception as e:
        print('e', e)
        return jsonify({"error": str(e)}), 500
    
@videos.route('/updateVideo', methods=['PUT'])
def updateVideo():
    # update_video(video_id, update_fields):
    try:
        data = request.get_json()
        video_id = data.get('videoId')
        update_fields = data.get('updateFields')
        
        update_video(video_id, update_fields)

        return jsonify({"message": "Video updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@videos.route('/postLike', methods=['POST'])
def postLike():
    try:
        data = request.get_json()
        video_id = data.get('videoId')
        # user_id = data.get('userId')

        # needs to sum 1 to the likes field

        db.videos.find_one_and_update(
            {"_id": video_id},
            {"$inc": {"likes": 1}}
        )
        
        return jsonify({"message": "Like posted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@videos.route('/deleteLike', methods=['DELETE'])
def deleteLike():
    try:
        data = request.get_json()
        video_id = data.get('videoId')
        # user_id = data.get('userId')

        # needs to subtract 1 to the likes field

        db.videos.find_one_and_update(
            {"_id": video_id},
            {"$inc": {"likes": -1}}
        )
        
        return jsonify({"message": "Like deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@videos.route('/postComment', methods=['POST'])
def postComment():
    try:
        data = request.get_json()
        video_id = data.get('videoId')
        user_id = data.get('userId')
        comment = data.get('comment')
        timestamp = datetime.now()

        db.videos.find_one_and_update(
            {"_id": video_id},
            {"$push": {"comments": {"userId": user_id, "comment": comment, "timestamp": timestamp}}}
        )

        return jsonify({"message": "Comment posted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@videos.route('/updateViews', methods=['POST'])
def updateViews():
    try:
        data = request.get_json()
        video_id = data.get('videoId')
        user_id = data.get('userId')
        watched_time = data.get('watchedTime')  # tempo assistido em segundos
        watched_complete = data.get('watchedComplete', False)

        db.videos.find_one_and_update(
            {"_id": video_id},
            {"$push": {"views": {"userId": user_id, "watchedTime": watched_time, "watchedComplete": watched_complete}}}
        )

        return jsonify({"message": "Views updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@videos.route('/getVideos', methods=['GET'])
def getVideos():
    try:
        page = int(request.args.get('page', 0))
        print('request.args', page)
        videosPerPage = int(request.args.get('videosPerPage', 10))
        filters = request.args.get('filters', '{}')
        filters = eval(filters)
        videos, total_num_videos = get_videos(filters, page, videosPerPage)
        print('videos', videos)
        return jsonify({"videos": videos, "total_num_videos": total_num_videos}), 200
    except Exception as e:
        print('e', e)
        return jsonify({"error": str(e)}), 500
    
@videos.route('/getVideo', methods=['GET'])
def getVideo():
    try:
        video_id = request.args.get('videoId')
        video = get_video(video_id)
        return jsonify({"video": video}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@videos.route('/getUserVideos', methods=['GET'])
def getUserVideos():
    try:
        user_id = request.args.get('userId')
        videos = get_user_videos(user_id)
        return jsonify({"videos": videos}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500