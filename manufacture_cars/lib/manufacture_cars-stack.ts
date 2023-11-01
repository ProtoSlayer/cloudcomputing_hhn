import {
  Stack,
  StackProps,
  aws_apigateway as apigateway,
  aws_dynamodb as ddb,
  aws_sns as sns,
  aws_sns_subscriptions as sns_sub,
  aws_iam as iam,
} from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";

export class ManufactureCarsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const carsApigateway = new apigateway.RestApi(this, "Cars", {
      restApiName: "ManufactureCarsRestAPI",
    });

    //SNS Topics
    const createCarScheduleSnsTopic = new sns.Topic(
      this,
      "CreateCarScheduleTopic",
      {
        displayName: "CreateCarScheduleTopic",
      }
    );
    const deleteCarScheduleSnsTopic = new sns.Topic(
      this,
      "DeleteCarScheduleTopic",
      {
        displayName: "DeleteCarScheduleTopic",
      }
    );
    const email: string = "dennis.spohrer@xl2.de"
    createCarScheduleSnsTopic.addSubscription(
      new sns_sub.EmailSubscription(email)
    );

    deleteCarScheduleSnsTopic.addSubscription(
      new sns_sub.EmailSubscription(email)
    );

    const snsTopicPolicy = new iam.PolicyStatement({
      actions: ["sns:publish"],
      resources: [
        createCarScheduleSnsTopic.topicArn,
        deleteCarScheduleSnsTopic.topicName,
      ],
    });

    //Declare create cars lambda function
    const createCarScheduleLambda = new PythonFunction(
      this,
      "CreateCarSchedule",
      {
        functionName: "CreateCarScheduleLambda",
        entry: "lambda",
        runtime: Runtime.PYTHON_3_11,
        index: "apigw_create_car_schedule.py",
        environment: {
          SNS_TOPIC_ARN: createCarScheduleSnsTopic.topicArn,
        },
      }
    );

    //Declare read lambda function
    const readCarScheduleLambda = new PythonFunction(this, "ReadCarSchedule", {
      functionName: "ReadCarScheduleLambda",
      entry: "lambda",
      runtime: Runtime.PYTHON_3_11,
      index: "apigw_read_car_schedule.py",
    });

    //Declare update lambda function
    const updateCarScheduleLambda = new PythonFunction(
      this,
      "UpdateCarSchedule",
      {
        functionName: "UpdateCarScheduleLambda",
        entry: "lambda",
        runtime: Runtime.PYTHON_3_11,
        index: "apigw_update_car_schedule.py",
      }
    );

    //Declare update lambda function
    const deleteCarScheduleLambda = new PythonFunction(
      this,
      "DeleteCarSchedule",
      {
        functionName: "DeleteCarScheduleLambda",
        entry: "lambda",
        runtime: Runtime.PYTHON_3_11,
        index: "apigw_delete_car_schedule.py",
        environment: {
          SNS_TOPIC_ARN: deleteCarScheduleSnsTopic.topicArn,
        },
      }
    );
    // Allow lambda to publish messages on the SNS topics
    createCarScheduleLambda.addToRolePolicy(snsTopicPolicy);
    deleteCarScheduleLambda.addToRolePolicy(snsTopicPolicy);

    // //Declare create cars lambda function
    // const createCarScheduleLambda = new lambda.Function(this, "CreateCarSchedule",{
    //   functionName: "CreateCarScheduleLambda",
    //   runtime: lambda.Runtime.PYTHON_3_11,
    //   code: lambda.Code.fromAsset("lambda/create"),
    //   handler:"apigw_create_car_schedule.handler",
    // });

    //Declare read lambda function
    // const readCarScheduleLambda = new lambda.Function(this, "ReadCarSchedule",{
    //   functionName: "ReadCarScheduleLambda",
    //   runtime: lambda.Runtime.PYTHON_3_11,
    //   code: lambda.Code.fromAsset("lambda/read"),
    //   handler:"apigw_read_car_schedule.handler",
    // });

    // //Declare update lambda function
    // const updateCarScheduleLambda = new lambda.Function(this, "UpdateCarSchedule",{
    //   functionName: "UpdateCarScheduleLambda",
    //   runtime: lambda.Runtime.PYTHON_3_11,
    //   code: lambda.Code.fromAsset("lambda/update"),
    //   handler:"apigw_update_car_schedule.handler",
    // });

    // //Declare delete lambda function
    // const deleteCarScheduleLambda = new lambda.Function(this, "DeleteCarSchedule",{
    //   functionName: "DeleteCarScheduleLambda",
    //   runtime: lambda.Runtime.PYTHON_3_11,
    //   code: lambda.Code.fromAsset("lambda/delete"),
    //   handler:"apigw_delete_car_schedule.handler",
    // });

    const carsResource = carsApigateway.root.addResource("cars");
    const carResource = carsResource.addResource("{vin}");
    carsResource.addMethod("GET", new LambdaIntegration(readCarScheduleLambda));
    carResource.addMethod("GET", new LambdaIntegration(readCarScheduleLambda));
    carsResource.addMethod(
      "POST",
      new LambdaIntegration(createCarScheduleLambda)
    );
    carResource.addMethod(
      "PUT",
      new LambdaIntegration(updateCarScheduleLambda)
    );
    carResource.addMethod(
      "DELETE",
      new LambdaIntegration(deleteCarScheduleLambda)
    );

    const scheduledCarsTable = new ddb.TableV2(this, "ScheduledCarsTable", {
      tableName: "ScheduledCarsTable",
      partitionKey: { name: "vin", type: ddb.AttributeType.STRING },
    });

    scheduledCarsTable.grantWriteData(createCarScheduleLambda);
    scheduledCarsTable.grantReadData(readCarScheduleLambda);
    scheduledCarsTable.grantWriteData(updateCarScheduleLambda);
    scheduledCarsTable.grantWriteData(deleteCarScheduleLambda);
  }
}
