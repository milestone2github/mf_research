import requests

# URL of the form submission endpoint
form_url = (
    "https://www.camsonline.com/Investors/Statements/Consolidated-Account-Statement"
)

# Form data to be submitted
form_data = {
    "field1": "value1",
    "field2": "value2",
    # Add other form fields as necessary
}

# Optional: If the website uses cookies for session management, capture and send them with the request
session = requests.Session()
# You might need to visit the form page first to get a session cookie if required
response = session.get(form_url)

# Submit the form
response = session.post(form_url, data=form_data)

# Check the response
if response.ok:
    print("Form submitted successfully.")
    # Process the response content if needed
else:
    print("Failed to submit the form.")
