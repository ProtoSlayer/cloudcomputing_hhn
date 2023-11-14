import {
  Stack,
  StackProps,
  aws_apigateway as apigateway,
  aws_dynamodb as ddb,
  aws_sns as sns,
  aws_sns_subscriptions as sns_sub,
  aws_iam as iam,
  aws_ssm as ssm,
  Duration,
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

    // SNS Topics
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

    // Add subscriptions
    const email: string = "dennis.spohrer@xl2.de";
    createCarScheduleSnsTopic.addSubscription(
      new sns_sub.EmailSubscription(email)
    );

    deleteCarScheduleSnsTopic.addSubscription(
      new sns_sub.EmailSubscription(email)
    );

    // Define ParameterStore entries for topic arns
    const publishToSnsTopicParameter = new ssm.StringParameter(
      this,
      "PublishToSnsTopicsParameter",
      {
        parameterName: "/config/publishToSns",
        stringValue: "true",
      }
    );

    //Declare create cars lambda function
    const createCarScheduleLambda = new PythonFunction(
      this,
      "CreateCarSchedule",
      {
        functionName: "CreateCarScheduleLambda",
        entry: "lambda",
        runtime: Runtime.PYTHON_3_11,
        index: "apigw_create_car_schedule.py",
        timeout: Duration.seconds(10),
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
      timeout: Duration.seconds(10),
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
        timeout: Duration.seconds(10),
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
        timeout: Duration.seconds(10),
        environment: {
          SNS_TOPIC_ARN: deleteCarScheduleSnsTopic.topicArn,
        },
      }
    );

    //Allow lambda to publish to sns topics
    const snsTopicPolicyStatement = new iam.PolicyStatement({
      actions: ["sns:publish"],
      resources: [
        createCarScheduleSnsTopic.topicArn,
        deleteCarScheduleSnsTopic.topicArn,
      ],
      effect: iam.Effect.ALLOW,
    });

    //Allow lambda to get parameters from ParameterStore
    const parameterStorePolicyStatement = new iam.PolicyStatement({
      actions: ["ssm:GetParameter"],
      resources: [publishToSnsTopicParameter.parameterArn],
      effect: iam.Effect.ALLOW,
    });

    //Add statements to policy
    const lambdaPolicy = new iam.Policy(this, "LambdaPolicy", {
      statements: [snsTopicPolicyStatement, parameterStorePolicyStatement],
    });

    // Attach policy to lambda roles
    createCarScheduleLambda.role?.attachInlinePolicy(lambdaPolicy);
    deleteCarScheduleLambda.role?.attachInlinePolicy(lambdaPolicy);

    const carsResource = carsApigateway.root.addResource("cars");
    const carResource = carsResource.addResource("{vin}");
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

    const scheduledCarsTable = new ddb.Table(this, "ScheduledCarsTable", {
      tableName: "ScheduledCarsTable",
      partitionKey: { name: "vin", type: ddb.AttributeType.STRING },
      deletionProtection: false,
    });

    scheduledCarsTable.grantWriteData(createCarScheduleLambda);
    scheduledCarsTable.grantReadData(readCarScheduleLambda);
    scheduledCarsTable.grantWriteData(updateCarScheduleLambda);
    scheduledCarsTable.grantWriteData(deleteCarScheduleLambda);
  }
}
