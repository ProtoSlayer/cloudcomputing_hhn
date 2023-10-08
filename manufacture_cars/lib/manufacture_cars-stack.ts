import {Stack, StackProps, aws_apigateway as apigateway, aws_lambda as lambda,} from 'aws-cdk-lib';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';


export class ManufactureCarsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const carsApigateway = new apigateway.RestApi(this, "Cars");

//Declare create cars lambda function
const createCarScheduleLambda = new lambda.Function(this, 'CreateCarSchedule',{
  runtime: lambda.Runtime.PYTHON_3_11,
  code: lambda.Code.fromAsset("lambda/create"),
  handler:"apigw-create-car-schedule.handler",
});

//Declare read lambda function
const readCarScheduleLambda = new lambda.Function(this, 'ReadCarSchedule',{
  runtime: lambda.Runtime.PYTHON_3_11,
  code: lambda.Code.fromAsset("lambda/read"),
  handler:"apigw-read-car-schedule.handler",
});

//Declare update lambda function
const updateCarScheduleLambda = new lambda.Function(this, 'UpdateCarSchedule',{
  runtime: lambda.Runtime.PYTHON_3_11,
  code: lambda.Code.fromAsset("lambda/update"),
  handler:"apigw-update-car-schedule.handler",
});

//Declare delete lambda function
const deleteCarScheduleLambda = new lambda.Function(this, 'DeleteCarSchedule',{
  runtime: lambda.Runtime.PYTHON_3_11,
  code: lambda.Code.fromAsset("lambda/delete"),
  handler:"apigw-delete-car-schedule.handler",
});

const carsResource = carsApigateway.root.addResource('cars');
const carResource = carsResource.addResource('{carId}')
const getCarsMethod = carsResource.addMethod('GET',new LambdaIntegration(createCarScheduleLambda));
const getCarMethod = carResource.addMethod('GET',new LambdaIntegration(createCarScheduleLambda));
  }
}
