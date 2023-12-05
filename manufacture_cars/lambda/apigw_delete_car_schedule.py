import repositories.dynamodb_repository as dynamodb_repository
import clients.sns_client as sns
import clients.ssm_client as ssm
from botocore.exceptions import ClientError
import os
import json


def handler(event, context):
    sns_client = sns.SnsClient()
    ssm_client = ssm.SsmClient()

    ddb_repo = dynamodb_repository.DynamoDbRepository()
    ddb_repo.table = "ScheduledCarsTable"
    item_key ={"vin": event["pathParameters"]["vin"]}
    topic_arn = os.environ.get("SNS_TOPIC_ARN")
    notify = ""
    try:
        notify = ssm_client.get_parameter("/config/publishToSns")["Parameter"]["Value"]
    except ClientError as e:
        error_code = e.response["Error"]["Code"] 
        if error_code == "AccessDeniedException" or error_code == "ParameterNotFound":
            if topic_arn == None:
                print("Not publishing to SNS topic, since parameter is not set.")

    if ddb_repo.delete_item(item_key):
        print("CarSchedule {} successfully deleted!".format(item_key))
        if topic_arn != None and notify == "true":
            print("Sending notification to: {}".format(topic_arn))
            message = "Deleted car schedule with vin {}".format("vin")
            subject = "Deleted car"
            sns_client.send_notification(topic_arn, message, subject)
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"message": "Car deleted!"}),
            "isBase64Encoded": False,
        }
    else:
        print("Oops, something went wrong!")
    return
