import { BackendServicesStack } from './backend_services-stack';
import { OpImpactStack } from './opimpact-stack';
 
import { Stage, Construct, StageProps } from '@aws-cdk/core';

export class DataLakeIngressPipelineStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        new OpImpactStack(this, 'OpImpact-Stack', {
            //env: { account: '717921910193', region: 'ca-central-1'}
					}
				);
        new BackendServicesStack (this, 'Backend-Stack');
    }
}
