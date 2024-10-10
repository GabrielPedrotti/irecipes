from flask import Blueprint, jsonify, request
from db import get_videos, get_db
from datetime import datetime
from flask_cors import CORS
from bson import ObjectId

videoInteractions = Blueprint('videoInteractions', 'videoInteractions', url_prefix='/api/v1/interactions')
CORS(videoInteractions)

@videoInteractions.route('/videoInteraction', methods=['POST'])
def log_video_interaction():
    data = request.json
    user_id = data.get('userId')
    video_id = data.get('videoId')
    watched_time = data.get('watchedTime')
    liked = data.get('liked', False)
    commented = data.get('commented', False)
    shared = data.get('shared', False)
    watched_complete = data.get('watchedComplete', False)

    interaction = {
        "userId": user_id,
        "videoId": video_id,
        "watchedTime": watched_time,
        "liked": liked,
        "commented": commented,
        "shared": shared,
        "watchedComplete": watched_complete,
        "timestamp": datetime.now()
    }

    try:
      existing_interaction = get_db().videoInteractions.find_one({"userId": user_id, "videoId": video_id})
      if existing_interaction:
          
          get_db().videoInteractions.update_one(
              {"userId": user_id, "videoId": video_id},
              {"$set": interaction}
          )
          return jsonify({"message": "Interaction updated successfully"})
      
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
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))

    if not user_id:
        videos, total_num_videos = get_videos({}, page, limit)
        return jsonify({"videos": videos, "total_num_videos": total_num_videos}), 200

    user = get_db().users.find_one({"_id": ObjectId(user_id)})

    if not user:
        return jsonify({"error": "User not found"}), 404

    tastes = user.get('tastes', [])

    user_interactions = list(get_db().videoInteractions.find({"userId": user_id}))
    interacted_videos = [interaction['videoId'] for interaction in user_interactions]
    print('interacted_videos', interacted_videos)

    if not user_interactions:
        interacted_videos = []

    weights = {
        'watchedComplete': 5,
        'liked': 3,
        'commented': 4,
        'shared': 6,
        'watchedTime': 0.1
    }

    taste_weights = {taste: 0 for taste in tastes}
    # usa as interações para calcular o peso de cada gosto
    if user_interactions:
        for interaction in user_interactions:
            video = get_db().videos.find_one({"_id": ObjectId(interaction['videoId'])})
            video_tastes = video.get('tags', [])

            relevance_score = (
                interaction.get('watchedComplete', 0) * weights['watchedComplete'] +
                interaction.get('liked', 0) * weights['liked'] +
                interaction.get('commented', 0) * weights['commented'] +
                interaction.get('shared', 0) * weights['shared'] +
                interaction.get('watchedTime', 0) * weights['watchedTime']
            )

            print('relevance_score', relevance_score)

            for taste in video_tastes:
                if taste in taste_weights:
                    taste_weights[taste] += relevance_score
                else:
                    taste_weights[taste] = relevance_score

    # ordena os gostos por peso
    sorted_tastes = sorted(taste_weights.items(), key=lambda x: x[1], reverse=True)
    sorted_tastes = [taste for taste, _ in sorted_tastes]  
    print('sorted_tastes', sorted_tastes)

    if not sorted_tastes:
        sorted_tastes = tastes

    skip = (page - 1) * limit
    try:
        # busca vídeos que tenham pelo menos um dos gostos do usuário e que ele ainda não interagiu.
        recommended_videos_cursor = get_db().videos.aggregate([
            {
                "$match": {
                    "tags": {"$in": sorted_tastes},
                    "id": {"$nin": interacted_videos}
                }
            },
            {
                "$addFields": {
                    "engagementScore": {"$sum": ["$likes", "$views"]}
                }
            },
            {"$sort": {"engagementScore": -1, "createdAt": -1}},
            {"$skip": skip},
            {"$limit": limit}
        ])

        recommended_videos = list(recommended_videos_cursor)

        return jsonify(recommended_videos), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


   
