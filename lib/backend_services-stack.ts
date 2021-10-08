import * as apigw from '@aws-cdk/aws-apigateway';
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as constLocal from './constLocal';
import * as iam2 from './iam-stack';
import * as lambda from '@aws-cdk/aws-lambda';

export class BackendServicesStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const presignedURLRole = new iam.Role(this, 'presignedURLRole', {
    	roleName: 'presignedURLRole',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")
      ]
    })
    const ksPolicies = new iam.Policy(this, 'kms-s3', iam2.genericS3KMSPolicyStmts);
		presignedURLRole.attachInlinePolicy(ksPolicies);

		//
    // defines an API Gateway REST API resource backed by our "sample" function.
		//
    const sampleFunction = new lambda.Function(this, 'BackendSampleHandler', {
      functionName: 'CDK-Backend-SampleFuction',
      role: presignedURLRole,
      runtime: lambda.Runtime.NODEJS_14_X,    // execution environment
		  code: lambda.Code.fromAsset('lambda/backend'),  // code loaded from "lambda" directory
			handler: 'sample.handler'                // file is "hello", function is "handler"
		});
    new apigw.LambdaRestApi(this, 'SampleEndpoint', {
      handler: sampleFunction
    });
		new cdk.CfnOutput(this, 'sampleFunction.functionArn', {
                        description: 'Lambda : sampleFunction ',
                        value: sampleFunction.functionArn
    })

    // 
    // defines an API Gateway REST API resource backed by a lambda function.
    //
    const getSignedURLFunction = new lambda.Function(this, 'getSignedURLHandler', {
      functionName: 'CDK-getSignedURLHandler',
      role: presignedURLRole,
      description: "",
      environment: {
        	"UploadBucket": constLocal.bucketName+`-${this.account}`
      },
      runtime: lambda.Runtime.NODEJS_14_X,    // execution environment
		  code: lambda.Code.fromAsset('lambda/backend/signedURL'), 
			handler: 'handle.handler'                // file is "handle", function is "handler"
		});
    new apigw.LambdaRestApi(this, 'getSignedURLAPI', {
      handler: getSignedURLFunction
    });
		new cdk.CfnOutput(this, 'getSignedURLFunction.functionArn', {
                        description: 'Lambda : getSignedURL Function ',
                        value: getSignedURLFunction.functionArn
    })
  }
}
