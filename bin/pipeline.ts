#!/usr/bin/env node

import { App } from '@aws-cdk/core';
import { ApplicationStack } from '../lib/application-stack';
import { PipelineStack } from '../lib/pipeline-stack';
import { RepositoryStack } from '../lib/repository-stack';

const app = new App();
const prodAccountId = app.node.tryGetContext('prod-account') || process.env.CDK_INTEG_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT;

new RepositoryStack(app, 'RepositoryStack');

const devApplicationStack = new ApplicationStack(app, 'DevApplicationStack', { stageName: 'beta' });
const prodApplicationStack = new ApplicationStack(app, 'ProdApplicationStack', { stageName: 'sbx' });
new PipelineStack(app, 'OpImpact-PipelineStack', {
  devApplicationStack: devApplicationStack,
  prodApplicationStack: prodApplicationStack,
  prodAccountId: prodAccountId,
});
