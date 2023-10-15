import {Stack, StackProps, aws_apigateway as apigateway, aws_lambda as lambda, aws_dynamodb as ddb} from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

export class ManufactureCarsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const carsApigateway = new apigateway.RestApi(this, "Cars",{
      restApiName: "ManufactureCarsRestAPI"
    });

    //Declare create cars lambda function
    const createCarScheduleLambda = new lambda.Function(this, "CreateCarSchedule",{
      functionName: "CreateCarScheduleLambda",
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset("lambda/create"),
      handler:"apigw_create_car_schedule.handler",
    });

    //Declare read lambda function
    const readCarScheduleLambda = new lambda.Function(this, "ReadCarSchedule",{
      functionName: "ReadCarScheduleLambda",
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset("lambda/read"),
      handler:"apigw_read_car_schedule.handler",
    });

    //Declare update lambda function
    const updateCarScheduleLambda = new lambda.Function(this, "UpdateCarSchedule",{
      functionName: "UpdateCarScheduleLambda",
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset("lambda/update"),
      handler:"apigw_update_car_schedule.handler",
    });

    //Declare delete lambda function
    const deleteCarScheduleLambda = new lambda.Function(this, "DeleteCarSchedule",{
      functionName: "DeleteCarScheduleLambda",
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset("lambda/delete"),
      handler:"apigw_delete_car_schedule.handler",
    });

    const carsResource = carsApigateway.root.addResource("cars");
    const carResource = carsResource.addResource("{knr}");
    carsResource.addMethod("GET",new LambdaIntegration(readCarScheduleLambda));
    carResource.addMethod("GET",new LambdaIntegration(readCarScheduleLambda));
    carsResource.addMethod("POST", new LambdaIntegration(createCarScheduleLambda));
    carResource.addMethod("PUT", new LambdaIntegration(updateCarScheduleLambda));
    carResource.addMethod("DELETE", new LambdaIntegration(deleteCarScheduleLambda));

    const scheduledCarsTable = new ddb.TableV2(this, "ScheduledCarsTable",{
      tableName: "ScheduledCarsTable",
      partitionKey: {name: "knr", type: ddb.AttributeType.STRING},
    });

    scheduledCarsTable.grantWriteData(createCarScheduleLambda);
    scheduledCarsTable.grantReadData(readCarScheduleLambda);
    scheduledCarsTable.grantWriteData(updateCarScheduleLambda);
    scheduledCarsTable.grantWriteData(deleteCarScheduleLambda);
  };
}
