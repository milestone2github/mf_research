import azure.functions as func
import pymongo
import os
from bson.json_util import dumps


def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        # Get query params
        search_type = req.params.get("type")  # 'client' or 'familyHead'
        search_query = req.params.get("query")  # search text
        rm_filter = req.params.get("rm")  # optional RM filter

        # Connect to MongoDB
        client = pymongo.MongoClient(
            "mongodb+srv://Vilakshanb:TIW0YwgQNaI8iMSc@milestone.wftaulr.mongodb.net"
        )
        db = client["Milestone"]  # replace with your database name
        collection = db["MintDb"]  # replace with your collection name

        # Build query based on parameters
        query = {}
        if search_type == "client":
            query["NAME"] = {"$regex": search_query, "$options": "i"}
        elif search_type == "familyHead":
            query["FAMILY HEAD"] = {"$regex": search_query, "$options": "i"}

        if rm_filter:
            query["RELATIONSHIP MANAGER"] = rm_filter

        # Fetch data from MongoDB
        results = collection.find(query)
        results_list = list(results)

        # Convert to JSON
        results_json = dumps(results_list)

        return func.HttpResponse(
            results_json, mimetype="application/json", status_code=200
        )
    except Exception as e:
        return func.HttpResponse("Error: " + str(e), status_code=500)
