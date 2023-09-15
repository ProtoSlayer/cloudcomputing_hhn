import * as cdk from 'aws-cdk-lib';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as iam from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs';

export class CodeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //FIXME: Welches API Gateway wollen wir verwenden
    //FIXME: Wollen wir die Ressourcen/Methoden in CDK Coden lassen oder vielleicht Swagger nehmen/OpenAPI?
    const carsApigateway = new cdk.aws_apigateway.RestApi(this, "Cars");

    //Declare Lambda functions
    const createCarScheduleLambda = new lambda.Function(this, 'CreateCarSchedule',{
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("lambda/create"),
      handler:"apigw-create-car-schedule.handler",
    });

    //Declare Lambda functions
    const readCarScheduleLambda = new lambda.Function(this, 'ReadCarSchedule',{
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("lambda/read"),
      handler:"apigw-read-car-schedule.handler",
    });

    //Declare Lambda functions
    const updateCarScheduleLambda = new lambda.Function(this, 'UpdateCarSchedule',{
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("lambda/update"),
      handler:"apigw-update-car-schedule.handler",
    });

    //Declare Lambda functions
    const deleteCarScheduleLambda = new lambda.Function(this, 'DeleteCarSchedule',{
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("lambda/delete"),
      handler:"apigw-delete-car-schedule.handler",
    });

    const carsResource = carsApigateway.root.addResource('cars');
    const carResource = carsResource.addResource('{carId}')
    const getCarsMethod = carsResource.addMethod('GET',new LambdaIntegration(createCarScheduleLambda));
    const getCarMethod = carResource.addMethod('GET',new LambdaIntegration(createCarScheduleLambda));
  };
}
