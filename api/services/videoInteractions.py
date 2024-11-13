from flask import Blueprint, jsonify, request
from db import get_videos, get_db
from datetime import datetime
from flask_cors import CORS
from bson import ObjectId
from pymongo import MongoClient, errors

videoInteractions = Blueprint('videoInteractions', 'videoInteractions', url_prefix='/api/v1/interactions')
CORS(videoInteractions)

@videoInteractions.route('/videoInteraction', methods=['POST'])
def log_video_interaction():
    data = request.json
    user_id = data.get('userId')
    video_id = data.get('videoId')

    if not user_id or not video_id:
        return jsonify({"error": "userId and videoId are required"}), 400

    update_fields = {}
    if 'watchedTime' in data:
        update_fields['watchedTime'] = data['watchedTime']
    if 'liked' in data:
        update_fields['liked'] = data['liked']
    if 'commented' in data:
        update_fields['commented'] = data['commented']
    if 'shared' in data:
        update_fields['shared'] = data['shared']
    if 'watchedComplete' in data:
        update_fields['watchedComplete'] = data['watchedComplete']
    update_fields['timestamp'] = datetime.now()

    try:
        existing_interaction = get_db().videoInteractions.find_one({"userId": user_id, "videoId": video_id})
        if existing_interaction:

            if 'watchedTime' in update_fields:
                existing_watched_time = existing_interaction.get('watchedTime', 0)
                if update_fields['watchedTime'] > existing_watched_time:
                    pass
                else:

                    update_fields.pop('watchedTime', None)

            if existing_interaction.get('watchedComplete', False):
                if 'watchedComplete' in update_fields and update_fields['watchedComplete'] == False:
                    update_fields.pop('watchedComplete', None)
            else:
                pass

            if update_fields:
                update_fields['timestamp'] = datetime.now()
                get_db().videoInteractions.update_one(
                    {"userId": user_id, "videoId": video_id},
                    {"$set": update_fields}
                )
            return jsonify({"message": "Interaction updated successfully"})
        else:
            interaction = {
                "userId": user_id,
                "videoId": video_id,
                "watchedTime": data.get('watchedTime', 0),
                "liked": data.get('liked', False),
                "commented": data.get('commented', False),
                "shared": data.get('shared', False),
                "watchedComplete": data.get('watchedComplete', False),
                "timestamp": datetime.now()
            }
            get_db().videoInteractions.insert_one(interaction)
            return jsonify({"message": "Interaction logged successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@videoInteractions.route('/videoInteraction', methods=['PUT'])
def updateVideoInteraction():
    data = request.json
    user_id = data.get('userId')
    video_id = data.get('videoId')
    update_fields = data.get('updateFields')

    try:
        get_db().videoInteractions.update_one(
            {"userId": user_id, "videoId": video_id},
            {"$set": update_fields}
        )
        return jsonify({"message": "Interaction updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
  
@videoInteractions.route('/recommended', methods=['GET'])
def recommended_videos():
    user_id = request.args.get('userId')
    posted_video_id = request.args.get('postedVideoId')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))

    # if no user id is provided, return the most recent videos
    if not user_id:
        videos, total_num_videos = get_videos({}, page, limit)
        videos_list = videos
        return jsonify(videos_list), 200


    print("user_id -------------->", user_id)
    
    user = get_db().users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # verify if the posted video exists
    posted_video = None
    if posted_video_id:
        posted_video = get_db().videos.find_one({"_id": ObjectId(posted_video_id)})
        if posted_video:
            posted_video_user = get_db().users.find_one({"_id": ObjectId(posted_video.get('user_id'))})
            if posted_video_user:
                posted_video['user'] = {
                    "userId": str(posted_video_user['_id']),
                    "name": posted_video_user.get('name'),
                    "userName": posted_video_user.get('userName'),
                    "profileImage": posted_video_user.get('profileImage')
                }

    tastes = user.get('tastes', [])
    user_interactions = list(get_db().videoInteractions.find({"userId": user_id}))
    interactions_by_video_id = {interaction['videoId']: interaction for interaction in user_interactions}

    print("user_interactions --------------->", user_interactions)

    interacted_video_ids = [ObjectId(interaction['videoId']) for interaction in user_interactions]
    interacted_videos = list(get_db().videos.find({"_id": {"$in": interacted_video_ids}}))

    videos_watched_more_than_half = []
    for video in interacted_videos:
        video_id_str = str(video['_id'])
        interaction = interactions_by_video_id.get(video_id_str)
        if interaction:
            watched_time = interaction.get('watchedTime', 0) * 1000
            duration = video.get('duration', 0)
            if duration > 0 and watched_time >= (0.5 * duration):
                videos_watched_more_than_half.append(video['_id'])

    watched_complete_interactions = get_db().videoInteractions.find({
        "userId": user_id,
        "watchedComplete": True
    })
    watched_complete_video_ids = [ObjectId(interaction['videoId']) for interaction in watched_complete_interactions]

    watched_complete_videos = list(get_db().videos.find({
        "_id": {"$in": watched_complete_video_ids}
    }))

    tags_from_watched_videos = []
    for video in watched_complete_videos:
        tags_from_watched_videos.extend(video.get('tags', []))

    from collections import Counter
    tag_counts = Counter(tags_from_watched_videos)

    if not tag_counts:
        tag_counts = Counter(tastes)

    sorted_tags = [tag for tag, _ in tag_counts.most_common()]
    excluded_video_ids = [ObjectId(video_id) for video_id in videos_watched_more_than_half]

    skip = (page - 1) * limit

    try:
        pipeline = [
            {
                "$match": {
                    "tags": {"$in": sorted_tags},
                    "_id": {"$nin": excluded_video_ids}
                }
            },
            {
                "$addFields": {
                    "tagScore": {
                        "$size": {
                            "$setIntersection": ["$tags", sorted_tags]
                        }
                    }
                }
            },
            {
                "$sort": {
                    "tagScore": -1,
                    "engagementScore": -1,
                    "createdAt": -1
                }
            },
            {"$skip": skip},
            {"$limit": limit}
        ]

        pipeline.insert(1, {
            "$addFields": {
                "engagementScore": {"$sum": ["$likes", "$views"]}
            }
        })

        recommended_videos_cursor = get_db().videos.aggregate(pipeline)

        recommended_videos = list(recommended_videos_cursor)

        for video in recommended_videos:
            user_data = get_db().users.find_one({"_id": ObjectId(video.get('user_id'))})
            if user_data:
                video['user'] = {
                    "userId": str(user_data['_id']),
                    "name": user_data.get('name'),
                    "userName": user_data.get('userName'),
                    "profileImage": user_data.get('profileImage')
                }

        if posted_video:
            recommended_videos.insert(0, posted_video)

        return jsonify(recommended_videos), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

   
