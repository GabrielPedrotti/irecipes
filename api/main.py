import os
from flask import Flask, jsonify
from flask.json.provider import DefaultJSONProvider
from flask.json import JSONEncoder
from flask_cors import CORS
from bson import json_util, ObjectId
from datetime import datetime, timedelta
import json

# Import the users Blueprint correctly
from services.users import users
from services.videos import videos
from services.videoInteractions import videoInteractions

    
class JSONEncoder(json.JSONEncoder):
    print('JSONEncoder')
    def default(self, o):
        print('o', o)
        if isinstance(o, ObjectId):
            return str(o)
        return json_util.default(o, json_util.CANONICAL_JSON_OPTIONS)
    

class MongoJsonEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.strftime("%Y-%m-%d %H:%M:%S")
        if isinstance(obj, ObjectId):
            return str(obj)
        return json_util.default(obj, json_util.CANONICAL_JSON_OPTIONS)

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    app.config['MONGO_URI'] = os.environ.get('MONGO_URI')
    
    app.json_encoder = MongoJsonEncoder
    app.register_blueprint(users)
    app.register_blueprint(videos)
    app.register_blueprint(videoInteractions)

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        return jsonify({
            "message": "iRecipes API",
            "version": "1.1.3",
            "endpoints": [
                "/api/v1/users",
                "/api/v1/videos",
                "/api/v1/video-interactions"
            ]
        })

    return app
