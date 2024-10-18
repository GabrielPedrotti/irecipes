import os
from flask import Flask, render_template
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
    APP_DIR = os.path.abspath(os.path.dirname(__file__))
    STATIC_FOLDER = os.path.join(APP_DIR, 'build/static')
    TEMPLATE_FOLDER = os.path.join(APP_DIR, 'build')

    app = Flask(__name__, static_folder=STATIC_FOLDER,
                template_folder=TEMPLATE_FOLDER)
    CORS(app)
    app.json_encoder = MongoJsonEncoder
    app.register_blueprint(users)
    app.register_blueprint(videos)
    app.register_blueprint(videoInteractions)

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        return render_template('index.html')
    
     # Print all registered routes
    with app.app_context():
        for rule in app.url_map.iter_rules():
            methods = ','.join(rule.methods)
            print(f"{rule.endpoint}: {rule} [{methods}]")

    return app
