import repositories.dynamodb_repository as dynamodb_repository
import clients.sns_client as sns
import clients.ssm_client as ssm
from botocore.exceptions import ClientError
import json
import os


def handler(event, context):
    ddb_repo = dynamodb_repository.DynamoDbRepository()
    sns_client = sns.SnsClient()
    ssm_client = ssm.SsmClient()
    ddb_repo.table = "ScheduledCarsTable"
    car_schedule = json.loads(event["body"])
    topic_arn = os.environ.get("SNS_TOPIC_ARN")
    notify = ""
    try:
        notify = ssm_client.get_parameter("/config/publishToSns")
    except ClientError as e:
        error_code = e.response["Error"]["Code"] 
        if error_code == "AccessDeniedException" or error_code == "ParameterNotFound":
            if topic_arn == None:
                print("Not publishing to SNS topic, since parameter is not set.")

    if ddb_repo.insert_item(car_schedule):
        print("CarSchedule {} successfully created!".format(car_schedule["vin"]))
        if topic_arn != None and notify["Parameter"]["Value"] == "true":
            print("Sending notification to: {}".format(topic_arn))
            message = "Safed new car schedule with vin {}".format(car_schedule["vin"])
            subject = "New car"
            sns_client.send_notification(topic_arn, message, subject)

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"message": "Car safed!"}),
            "isBase64Encoded": False,
        }

    else:
        print("Oops,something went wrong!")
    return
