import boto3


class DynamoDbRepository:
    def __init__(self):
        self.conn = boto3.resource("dynamodb")
        self.table = None

    def insert_item(self, item):
        """Insert an item to table"""
        dynamodb = self.conn
        table = dynamodb.Table(self.table)
        response = table.put_item(Item=item)
        if response["ResponseMetadata"]["HTTPStatusCode"] == 200:
            return True
        else:
            return False

    def retrieve_item(self, query_item):
        """
        Get an item given its key
        """
        dynamodb = self.conn
        table = dynamodb.Table(self.table)
        response = table.get_item(Key=query_item)
        item = response["Item"]
        return item

    def delete_item(self, item_key):
        """
        delete an item
        PARAMS
        @table_name: name of the table
        @item_key: dict containing key
        """
        dynamodb = self.conn
        table = dynamodb.Table(self.table)
        response = table.delete_item(Key=item_key)
        if response["ResponseMetadata"]["HTTPStatusCode"] == 200:
            return True
        else:
            return False


    def modify_item(self, item_key, item):
        """
        Update an item
        """
        dynamodb = self.conn
        table = dynamodb.Table(self.table)
        response = table.update_item(
            Key={"vin": item_key},
            UpdateExpression="SET color = :color, carType = :carType",
            ExpressionAttributeValues={
                ":color": item["color"],
                ":carType": item["carType"],
            },
            ReturnValues="ALL_NEW",
        )
        if response["ResponseMetadata"]["HTTPStatusCode"] == 200:
            return True
        else:
            return False
