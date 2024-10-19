from flask import Flask, jsonify, request
from flask_cors import CORS  # Import Flask-CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/events', methods=['GET'])
def get_events():
    location = request.args.get('location')
    # Example data
    events = [
        {"name": "Concert A", "date": "2024-11-10", "location": location},
        {"name": "Festival B", "date": "2024-11-12", "location": location},
        {"name": "Conference C", "date": "2024-11-15", "location": location}
    ]
    return jsonify({"events": events})

if __name__ == '__main__':
    app.run(port=5000)
