import azure.functions as func
import pymongo
from datetime import datetime, timedelta
import os
import uuid
import json


def main(req: func.HttpRequest) -> func.HttpResponse:
    client = pymongo.MongoClient(
        "mongodb+srv://milestonegpt4:kv6A5KW7sUKJ9jOQ@cluster0.krug8nd.mongodb.net/"
    )
    db = client["Calculator"]
    collection = db["Retirement"]

    try:
        # Parse the request body
        req_body = req.get_json()
    except ValueError:
        return func.HttpResponse("Invalid JSON", status_code=400)

    # Generate a unique identifier for the link
    link_id = str(uuid.uuid4())

    # Calculate expiry date (30 days from now)
    expiry_date = datetime.utcnow() + timedelta(days=30)

    # Store the link data
    collection.insert_one({"_id": link_id, "data": req_body, "expiry": expiry_date})

    # Construct the public link
    public_link = f"https://mniveshcalculator.azurewebsites.net/api/GenerateLinkFunction/{link_id}"

    return func.HttpResponse(
        json.dumps({"link": public_link}),
        status_code=200,
        mimetype="application/json",
    )
