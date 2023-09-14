import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs';

export class CodeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //FIXME: Welches API Gateway wollen wir verwenden
    //FIXME: Wollen wir die Ressourcen/Methoden in CDK Coden lassen oder vielleicht Swagger nehmen/OpenAPI?
    const carsApigateway = new cdk.aws_apigateway.RestApi(this, "Cars");


    //Declare Lambda functions
    const createCarSchedule = new lambda.Function(this, 'CreateCarSchedule',{
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("lambda"),
      handler:"apigw-create-car-schedule.handler",
    })



  }
}
