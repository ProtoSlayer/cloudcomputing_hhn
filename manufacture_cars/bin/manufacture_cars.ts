#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ManufactureCarsStack } from '../lib/manufacture_cars-stack';
import { AwsSolutionsChecks } from 'cdk-nag';

const app = new cdk.App();
cdk.Aspects.of(app).add(new AwsSolutionsChecks({verbose:true}))
new ManufactureCarsStack(app, 'ManufactureCarsStack', {
});