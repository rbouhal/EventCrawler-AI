from flask import Flask, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv
import os
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()
api_key = os.getenv('API_KEY')
client = OpenAI(api_key = api_key)

@app.route('/generate-ad', methods=['POST'])
def generate_ad():
    try:
        data = request.get_json()
        events = data.get('events', [])
        ads = []

        for event in events:
            prompt = f"Create a short ad for travelers and mention why {event['name']} is a must-visit destination. Date: {event['date']}, Time: {event['time']}, Location: {event['address']}"

            # Make the API call to generate the ad
            response = client.completions.create(
                prompt=prompt,
                model="gpt-3.5-turbo-instruct",
                top_p=0.7, max_tokens=100,
                stream=True
            )
            
            ad_text = ""
            for part in response:
                ad_text += part.choices[0].text or ""

            # Add the ad to the list
            ads.append({
                "name": event['name'],
                "image": event['image'],
                "ad_text": ad_text
            })

        return jsonify(ads)  # Return the list of ads as a JSON response

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
