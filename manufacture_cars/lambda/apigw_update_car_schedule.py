import repositories.dynamodb_repository as dynamodb_repository
import json


def handler(event, context):
    print(event)
    ddb_repo = dynamodb_repository.DynamoDbRepository()
    ddb_repo.table = "ScheduledCarsTable"
    query_item_key = event["pathParameters"]["vin"]
    update_item = json.loads(event["body"])
    updated_item = ddb_repo.modify_item(query_item_key, update_item)

    if updated_item != None:
        print("CarSchedule successfully updated!")
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"message": "Car data updated!"}),
            "isBase64Encoded": False,
        }
    else:
        print("Oops,something went wrong!")

    return
