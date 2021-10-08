import * as cdk from '@aws-cdk/core';

export class CdkHubStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    new cdk.CfnOutput(this, 'CdkHubStack',{
                description: 'CDK Hub Stack ',
                value: "1.0"
    })
  }
}
