from pymongo import MongoClient
import urllib

username="dingzq0807" 
pwd="ZS6a7BYUmFUay0mO"
client = MongoClient("mongodb+srv://dingzq0807:" +urllib.parse.quote(pwd) +"@cluster0.58jhzag.mongodb.net/")


db_name=client["test"]
collection=db_name["students"]
result = collection.aggregate([
    { "$group": { "_id": "$major", "total_students": { "$sum": 1 } } },
    { "$sort": { "total_students": -1 } },
    { "$limit": 1 },
    { "$lookup": {
        "from": "courses",
        "localField": "courses",
        "foreignField": "_id",
        "as": "course_details"
    } },
    { "$project": {
        "major": "$_id",
        "total_students": 1,
        "course_details": 1,
        "_id": 0
    } }
])

for doc in result:
    print(doc)