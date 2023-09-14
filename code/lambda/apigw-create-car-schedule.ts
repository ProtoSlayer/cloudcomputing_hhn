import { ApiGateway } from "aws-cdk-lib/aws-events-targets";
import { Handler } from "aws-cdk-lib/aws-lambda";

export const handler: Handler = async (event: any, context: any) => {

    return {
        "isBase64Encoded": false,
        "statusCode": 200,
        "headers": { "example": "123245"},
        "body": "Hello there."
    }
}