from openai import OpenAI

# Initialize OpenAI API key
client = OpenAI(api_key = "x")

# TO-DO: SAVE THE VALUES FROM EACH EVENT:

# Example
name: event.name
date: event.dates.start.localDate
time: event.dates.start.localTime
address: `${addressLine}, ${venue.city.name}, ${stateCode} ${postalCode}`
url: event.url
image: event.images[0].url

#TO-DO: LOOP THROUGH EACH EVENT AND MAKE THE API CALL:

# Customize the prompt to generate an ad-like description for the event details
prompt = f"Create a short ad for travelers and mention why it's a must-visit destination using the following: {''}"


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

# write the descriptions onto a text file
with open('ad_description.txt', 'w') as file:
    file.write(ad_text)


# Extract the generated text from the API response
print(ad_text)