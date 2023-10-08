import * as cdk from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ManufactureCarsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
        const carsApigateway = new cdk.aws_apigateway.RestApi(this, "Cars");

    const lambdaFn = new NodejsFunction(this, "Hello There")
  }
}
