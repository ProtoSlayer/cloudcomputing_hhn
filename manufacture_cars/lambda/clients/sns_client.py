import boto3


class SnsClient:
    def __init__(self):
        self.client = boto3.client("sns")

    def send_notification(self, topic_arn, message, subject):
        self.client.publish(TopicArn=topic_arn, Message=message, Subject=subject)
