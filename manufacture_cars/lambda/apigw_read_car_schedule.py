import repositories.dynamodb_repository as dynamodb_repository
import json


def handler(event, context):
    ddb_repo = dynamodb_repository.DynamoDbRepository()
    ddb_repo.table = "ScheduledCarsTable"
    query_item = {"vin": event["pathParameters"]["vin"]}
    item = ddb_repo.retrieve_item(query_item)
    if item != None:
        print("CarSchedule {} successfully returned!".format(item["vin"]))
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"message": "Car data retrieved!", "carSchedule":item}),
            "isBase64Encoded": False,
        }
    else:
        print("Oops, something went wrong.")
    return
