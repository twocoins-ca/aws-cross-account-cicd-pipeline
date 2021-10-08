import * as cdk from '@aws-cdk/core';
import * as destinations from '@aws-cdk/aws-lambda-destinations';
import * as iam from '@aws-cdk/aws-iam';
import * as iam2 from './iam-stack';
import * as constLocal from './constLocal';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3_notifications from '@aws-cdk/aws-s3-notifications';
import * as sns from "@aws-cdk/aws-sns";

/******************************************
//
// Note: bucketName is defined in the first session below as opimpact
//
******************************************/

export class OpImpactStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

		const bucketName = constLocal.bucketName+`-${this.account}`;
		const bucketNameOut = constLocal.bucketName+"-out";

		const s3InBucket = new s3.Bucket(this, 'ClamAvIngressBucket', {
			bucketName: bucketName,
			encryption: s3.BucketEncryption.KMS_MANAGED,
			publicReadAccess: false,
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
			enforceSSL: true,
			versioned: true,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
    	autoDeleteObjects: true
  	});
		new cdk.CfnOutput(this, 'ClamAvScan-InBucket',{
			description: 'ClamAvScan Bucket..',
			value: s3InBucket.bucketName
  	})

		const bucketout = new s3.Bucket(this, 'ClamAvOutBucket', {
			bucketName: bucketNameOut,
			encryption: s3.BucketEncryption.KMS_MANAGED,
			publicReadAccess: false,
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
			enforceSSL: true,
			versioned: true,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
    	autoDeleteObjects: true
  	});
		new cdk.CfnOutput(this, 'ClamAvScan-OutBucket',{
			//description: 'ClamAvScan Bucket: '+ bucketout.bucketName,
			description: 'ClamAvScan Bucket..',
			value: bucketout.bucketName
  	})



    //Lambda
    // AWS Lambda resources


    const cleanS3CopyRole = new iam.Role(this, 'customRole', {
    	roleName: 'CleanS3CopyRole',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")
      ]
    })

		//Adding inline policies
    const putLogEventsPolicy = new iam.Policy(this, 'cw-logs', iam2.putLogEventsPolicyStmt);
    const ksPolicies = new iam.Policy(this, 'kms-s3', iam2.genericS3KMSPolicyStmts);
    cleanS3CopyRole.attachInlinePolicy(putLogEventsPolicy);
    cleanS3CopyRole.attachInlinePolicy(ksPolicies);

    //Example how to import a SNS topic 
		//const topic = sns.Topic.fromTopicArn(
    //  this,
    //  "ExistingSNSTopic",
    //  `arn:${cdk.Aws.PARTITION}:sns:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:existing-sns-topic`
    //);

		const avScanFailureSNSTopic = new sns.Topic(this, 'S3CopyFailureSNSTopic', {
			displayName: 'CLEAN S3 copy failure SNS Topic',
      topicName: 'avScanFailureSNSTopic',
		});

		const avScanSuccessSNSTopic = new sns.Topic(this, 'S3CopySuccessSNSTopic', {
			displayName: 'CLEAN S3 copy success SNS Topic',
      topicName: 'avScanSuccessSNSTopic',
		});

		const cleanS3Copy = new lambda.Function(this, 'CleanS3CopyHandler', {
			functionName: 'CleanS3CopyHandler',
			runtime: lambda.Runtime.NODEJS_14_X,            // execution environment
    	code: lambda.Code.fromAsset('lambda/backend'),  // code loaded from "lambda/backend" directory
			role: cleanS3CopyRole,
      onFailure: new destinations.SnsDestination(avScanFailureSNSTopic),
      onSuccess: new destinations.SnsDestination(avScanSuccessSNSTopic),
    	handler: 'cleanS3Copy.handler'               
		});

		new cdk.CfnOutput(this, 'CLEAN S3 Copy Lambda Function',{
			description: 'Lambda function for S3 Copy if avStatus is CLEAN.',
			value: cleanS3Copy.functionArn
  	})

    //S3 notification

    /*
    // import existing Lambda by ARN
    // arn:aws:lambda:ca-central-1:657887547478:function:avScanner
    const importedLambdaFromArn = lambda.Function.fromFunctionArn(
      this,
      'avScanner',
      `arn:aws:lambda:${cdk.Stack.of(this).region}:${
        cdk.Stack.of(this).account
      }:function:avScanner` // mutable field used or not or any other parameter?
    );

  	new cdk.CfnOutput(this, 'Lambda Function',{
      description: "avScanner lambda function arn",
      value: importedLambdaFromArn.functionArn
    })

    //const s3CreatedNotification = new s3_notifications.LambdaDestination(importedLambdaFromArn);
    const s3CreatedNotification = new s3_notifications.LambdaDestination(cleanS3Copy);
    s3CreatedNotification.bind(this, s3InBucket);
    s3InBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3_notifications.LambdaDestination(importedLambdaFromArn)
      //s3CreatedNotification
      // 👇 only invoke lambda if object matches the filter
      // {prefix: 'test/', suffix: '.yaml'},
    )
    */
  }
}
