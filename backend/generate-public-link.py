import azure.functions as func
import datetime
import uuid

# In-memory storage for simplicity
links_storage = {}


def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        # Parse the request body
        req_body = req.get_json()
    except ValueError:
        return func.HttpResponse("Invalid JSON", status_code=400)

    # Generate a unique identifier for the link
    link_id = str(uuid.uuid4())

    # Calculate expiry date (30 days from now)
    expiry_date = datetime.datetime.utcnow() + datetime.timedelta(days=30)

    # Store the link data
    links_storage[link_id] = {"data": req_body, "expiry": expiry_date}

    public_link = f"http://<your-azure-function-url>/{link_id}"

    return func.HttpResponse(f"Public link: {public_link}", status_code=200)
