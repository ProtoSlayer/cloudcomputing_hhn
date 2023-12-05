import boto3


class SsmClient:
    def __init__(self):
        self.client = boto3.client("ssm")

    def get_parameter(self, parameter_name):
        return self.client.get_parameter(Name=parameter_name)
