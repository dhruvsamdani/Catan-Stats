from flask import Flask, request, render_template
from flask.json import jsonify
from flask_restful import Resource, Api
from marshmallow import Schema, fields
from backend import Database

class CatanSchema(Schema):
    winner = fields.Str(required='True')

app = Flask(__name__)
api = Api(app)
schema = CatanSchema()

class Catan(Resource):
    @app.route('/')
    def index():
        return render_template('index.html')

    def database(self, filename='database.ini', section='postgresql'):
        return Database(filename,section)

    def post(self):
        args = request.get_json()
        entry_data = args.get('roles')
        entry_data.append(args.get('winner'))
        entry_data.append(args.get('player_count'))
        self.database().addToDatabase(entry_data)
        return jsonify({'data': entry_data, 'entry': 'success'})

api.add_resource(Catan, '/catan')

if __name__ == '__main__':
    app.run()
