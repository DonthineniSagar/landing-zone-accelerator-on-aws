/**
 *  Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

import * as t from './common-types';
import { Region } from './common-types';

/**
 * Global configuration items.
 */
export abstract class GlobalConfigTypes {
  static readonly controlTowerConfig = t.interface({
    enable: t.boolean,
  });

  static readonly cloudtrailConfig = t.interface({
    enable: t.boolean,
    organizationTrail: t.boolean,
  });

  static readonly sessionManagerConfig = t.interface({
    sendToCloudWatchLogs: t.boolean,
    sendToS3: t.boolean,
    excludeRegions: t.optional(t.array(t.region)),
    excludeAccounts: t.optional(t.array(t.string)),
  });

  static readonly loggingConfig = t.interface({
    account: t.nonEmptyString,
    cloudtrail: GlobalConfigTypes.cloudtrailConfig,
    sessionManager: GlobalConfigTypes.sessionManagerConfig,
  });

  static readonly identityPerimeterConfig = t.interface({
    enable: t.boolean,
  });

  static readonly resourcePerimeterConfig = t.interface({
    enable: t.boolean,
  });

  static readonly networkPerimeterConfig = t.interface({
    enable: t.boolean,
  });

  static readonly dataProtectionConfig = t.interface({
    enable: t.boolean,
    identityPerimeter: this.identityPerimeterConfig,
    resourcePerimeter: this.resourcePerimeterConfig,
    networkPerimeter: this.networkPerimeterConfig,
  });

  static readonly artifactTypeEnum = t.enums('ArtifactType', ['REDSHIFT', 'QUICKSIGHT', 'ATHENA']);

  static readonly costAndUsageReportConfig = t.interface({
    additionalSchemaElements: t.optional(t.array(t.nonEmptyString)),
    compression: t.enums('CompressionType', ['ZIP', 'GZIP', 'Parquet']),
    format: t.enums('FormatType', ['textORcsv', 'Parquet']),
    reportName: t.nonEmptyString,
    s3Prefix: t.nonEmptyString,
    timeUnit: t.enums('TimeCoverageType', ['HOURLY', 'DAILY', 'MONTHLY']),
    additionalArtifacts: t.optional(t.array(this.artifactTypeEnum)),
    refreshClosedReports: t.boolean,
    reportVersioning: t.enums('VersioningType', ['CREATE_NEW_REPORT', 'OVERWRITE_REPORT']),
  });

  static readonly notificationConfig = t.interface({
    notificationType: t.enums('NotificationType', ['ACTUAL', 'FORECASTED']),
    thresholdType: t.enums('ThresholdType', ['PERCENTAGE', 'ABSOLUTE_VALUE']),
    comparisonOperator: t.enums('ComparisonType', ['GREATER_THAN', 'LESS_THAN', 'EQUAL_TO']),
    threshold: t.optional(t.number),
  });

  static readonly budgetsConfig = t.interface({
    amount: t.number,
    budgetName: t.nonEmptyString,
    budgetType: t.enums('NotificationType', [
      'USAGE',
      'COST',
      'RI_UTILIZATION',
      'RI_COVERAGE',
      'SAVINGS_PLANS_UTILIZATION',
      'SAVINGS_PLANS_COVERAGE',
    ]),
    timeUnit: t.enums('TimeUnitType', ['DAILY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']),
    address: t.optional(t.nonEmptyString),
    includeUpfront: t.optional(t.boolean),
    includeTax: t.optional(t.boolean),
    includeSupport: t.optional(t.boolean),
    includeSubscription: t.optional(t.boolean),
    includeRecurring: t.optional(t.boolean),
    includeOtherSubscription: t.optional(t.boolean),
    includeCredit: t.optional(t.boolean),
    includeDiscount: t.optional(t.boolean),
    includeRefund: t.optional(t.boolean),
    useAmortized: t.optional(t.boolean),
    useBlended: t.optional(t.boolean),
    notifications: t.optional(t.array(this.notificationConfig)),
    subscriptionType: t.enums('SubscriptionType', ['EMAIL', 'SNS']),
    unit: t.optional(t.nonEmptyString),
  });

  static readonly reportConfig = t.interface({
    costAndUsageReport: t.optional(this.costAndUsageReportConfig),
    budgets: t.optional(this.budgetsConfig),
  });

  static readonly globalConfig = t.interface({
    homeRegion: t.nonEmptyString,
    enabledRegions: t.array(t.region),
    managementAccountAccessRole: t.nonEmptyString,
    cloudwatchLogRetentionInDays: t.number,
    controlTower: GlobalConfigTypes.controlTowerConfig,
    logging: GlobalConfigTypes.loggingConfig,
    dataProtection: t.optional(GlobalConfigTypes.dataProtectionConfig),
    reports: t.optional(GlobalConfigTypes.reportConfig),
  });
}

/**
 * AWS ControlTower configuration
 */
export class ControlTowerConfig implements t.TypeOf<typeof GlobalConfigTypes.controlTowerConfig> {
  /**
   * Indicates whether AWS ControlTower enabled.
   *
   * When control tower is enabled, accelerator makes sure account configuration file have three mandatory AWS CT accounts.
   * In AWS Control Tower, three shared accounts in your landing zone are provisioned automatically during setup: the management account,
   * the log archive account, and the audit account.
   */
  readonly enable = true;
}

/**
 * AWS Cloudtrail configuration
 */
export class CloudtrailConfig implements t.TypeOf<typeof GlobalConfigTypes.cloudtrailConfig> {
  /**
   * Indicates whether AWS Cloudtrail enabled.
   *
   * Cloudtrail a service that helps you enable governance, compliance, and operational and risk auditing of your AWS account.
   */
  readonly enable = false;
  /**
   * Indicates whether AWS OrganizationTrail enabled.
   *
   * When OrganizationTrail and cloudtrail is enabled accelerator will enable trusted access designates CloudTrail as a trusted service in your organization.
   * A trusted service can query the organization's structure and create service-linked roles in the organization's accounts.
   */
  readonly organizationTrail = false;
}

/**
 * AWS SessionManager configuration
 */
export class SessionManagerConfig implements t.TypeOf<typeof GlobalConfigTypes.sessionManagerConfig> {
  /**
   * Indicates whether sending SessionManager logs to CloudWatchLogs enabled.
   */
  readonly sendToCloudWatchLogs = false;
  /**
   * Indicates whether sending SessionManager logs to S3 enabled.
   *
   * When this flag is on, accelerator will send session manager logs to Central log bucket in Logarchvie account.
   */
  readonly sendToS3 = false;
  /**
   * List of AWS Region names to be excluded from configuring SessionManager configuration
   */
  readonly excludeRegions = [];
  /**
   * List of AWS Account names to be excluded from configuring SessionManager configuration
   */
  readonly excludeAccounts = [];
}

/**
 * Accelerator global logging configuration
 */
export class LoggingConfig implements t.TypeOf<typeof GlobalConfigTypes.loggingConfig> {
  /**
   * Accelerator logging account name.
   * Accelerator use LogArchive account for global logging.
   * This account maintains consolidated logs.
   */
  readonly account = 'LogArchive';
  /**
   * CloudTrail logging configuration
   */
  readonly cloudtrail: CloudtrailConfig = new CloudtrailConfig();
  /**
   * SessionManager logging configuration
   */
  readonly sessionManager: SessionManagerConfig = new SessionManagerConfig();
}

/**
 * IdentityPerimeter configuration
 */
export class IdentityPerimeterConfig implements t.TypeOf<typeof GlobalConfigTypes.identityPerimeterConfig> {
  /**
   * Indicates whether IdentityPerimeter configuration enabled.
   */
  readonly enable = false;
}

/**
 * ResourcePerimeter configuration
 */
export class ResourcePerimeterConfig implements t.TypeOf<typeof GlobalConfigTypes.resourcePerimeterConfig> {
  /**
   * Indicates whether ResourcePerimeter configuration enabled.
   */
  readonly enable = false;
}

/**
 * NetworkPerimeter configuration
 */
export class NetworkPerimeterConfig implements t.TypeOf<typeof GlobalConfigTypes.networkPerimeterConfig> {
  /**
   * Indicates whether NetworkPerimeter configuration enabled.
   */
  readonly enable = false;
}

/**
 * DataProtection configuration
 */
export class DataProtectionConfig implements t.TypeOf<typeof GlobalConfigTypes.dataProtectionConfig> {
  /**
   * Indicates whether DataProtection configuration enabled.
   *
   * When this flag is on, accelerator applies the Identity Perimeter controls for VPC Endpoints
   */
  readonly enable = false;
  /**
   * IdentityPerimeter configuration
   */
  readonly identityPerimeter = new IdentityPerimeterConfig();
  /**
   * ResourcePerimeter configuration
   */
  readonly resourcePerimeter = new ResourcePerimeterConfig();
  /**
   * NetworkPerimeter configuration
   */
  readonly networkPerimeter = new NetworkPerimeterConfig();
}

/**
 * CostAndUsageReport configuration
 */
export class CostAndUsageReportConfig implements t.TypeOf<typeof GlobalConfigTypes.costAndUsageReportConfig> {
  /**
   * A list of strings that indicate additional content that Amazon Web Services includes in the report, such as individual resource IDs.
   */
  readonly additionalSchemaElements = [''];
  /**
   * The compression format that Amazon Web Services uses for the report.
   */
  readonly compression = '';
  /**
   * The format that Amazon Web Services saves the report in.
   */
  readonly format = '';
  /**
   * The name of the report that you want to create. The name must be unique, is case sensitive, and can't include spaces.
   */
  readonly reportName = '';
  /**
   * The prefix that Amazon Web Services adds to the report name when Amazon Web Services delivers the report. Your prefix can't include spaces.
   */
  readonly s3Prefix = '';
  /**
   * The granularity of the line items in the report.
   */
  readonly timeUnit = '';
  /**
   * A list of manifests that you want Amazon Web Services to create for this report.
   */
  readonly additionalArtifacts = undefined;
  /**
   * Whether you want Amazon Web Services to update your reports after they have been finalized if Amazon Web Services detects charges related to previous months. These charges can include refunds, credits, or support fees.
   */
  readonly refreshClosedReports = true;
  /**
   * Whether you want Amazon Web Services to overwrite the previous version of each report or to deliver the report in addition to the previous versions.
   */
  readonly reportVersioning = '';
}

/**
 * BudgetReport configuration
 */
export class BudgetReportConfig implements t.TypeOf<typeof GlobalConfigTypes.budgetsConfig> {
  /**
   * The address that AWS sends budget notifications to, either an SNS topic or an email.
   *
   * When you create a subscriber, the value of Address can't contain line breaks.
   */
  readonly address = '';
  /**
   * The cost or usage amount that's associated with a budget forecast, actual spend, or budget threshold.
   *
   * @default 2000
   */
  readonly amount = 2000;
  /**
   * The name of a budget. The value must be unique within an account. BudgetName can't include : and \ characters. If you don't include value for BudgetName in the template, Billing and Cost Management assigns your budget a randomly generated name.
   */
  readonly budgetName = '';
  /**
   * The length of time until a budget resets the actual and forecasted spend. DAILY is available only for RI_UTILIZATION and RI_COVERAGE budgets.
   */
  readonly timeUnit = '';
  /**
   * Specifies whether this budget tracks costs, usage, RI utilization, RI coverage, Savings Plans utilization, or Savings Plans coverage.
   */
  readonly budgetType = '';
  /**
   * Specifies whether a budget includes upfront RI costs.
   *
   * @default true
   */
  readonly includeUpfront = true;
  /**
   * Specifies whether a budget includes taxes.
   *
   * @default true
   */
  readonly includeTax = true;
  /**
   * Specifies whether a budget includes support subscription fees.
   *
   * @default true
   */
  readonly includeSupport = true;
  /**
   * Specifies whether a budget includes non-RI subscription costs.
   *
   * @default true
   */
  readonly includeOtherSubscription = true;
  /**
   * Specifies whether a budget includes subscriptions.
   *
   * @default true
   */
  readonly includeSubscription = true;
  /**
   * Specifies whether a budget includes recurring fees such as monthly RI fees.
   *
   * @default true
   */
  readonly includeRecurring = true;
  /**
   * Specifies whether a budget includes discounts.
   *
   * @default true
   */
  readonly includeDiscount = true;
  /**
   * Specifies whether a budget includes refunds.
   *
   * @default true
   */
  readonly includeRefund = false;
  /**
   * Specifies whether a budget includes credits.
   *
   * @default true
   */
  readonly includeCredit = false;
  /**
   * Specifies whether a budget uses the amortized rate.
   *
   * @default false
   */
  readonly useAmortized = false;
  /**
   * Specifies whether a budget uses a blended rate.
   *
   * @default false
   */
  readonly useBlended = false;
  /**
   * The type of notification that AWS sends to a subscriber.
   *
   * An enum value that specifies the target subscription type either EMAIL or SNS
   */
  readonly subscriptionType = '';
  /**
   * The unit of measurement that's used for the budget forecast, actual spend, or budget threshold, such as USD or GBP.
   */
  readonly unit = '';
  /**
   * The type of threshold for a notification. For ABSOLUTE_VALUE thresholds,
   * AWS notifies you when you go over or are forecasted to go over your total cost threshold.
   * For PERCENTAGE thresholds, AWS notifies you when you go over or are forecasted to go over a certain percentage of your forecasted spend. For example,
   * if you have a budget for 200 dollars and you have a PERCENTAGE threshold of 80%, AWS notifies you when you go over 160 dollars.
   */
  /**
   * The comparison that's used for the notification that's associated with a budget.
   */
  readonly notifications = [
    {
      notificationType: '',
      thresholdType: '',
      comparisonOperator: '',
      threshold: 90,
    },
  ];
}

/**
 * Accelerator report configuration
 */
export class ReportConfig implements t.TypeOf<typeof GlobalConfigTypes.reportConfig> {
  /**
   * Cost and usage report configuration
   *
   * If you want to create cost and usage report with daily granularity of the line items in the report, you need to provide below value for this parameter.
   *
   * @example
   * ```
   * costAndUsageReport:
   *     compression: Parquet
   *     format: Parquet
   *     reportName: accelerator-cur
   *     s3Prefix: cur
   *     timeUnit: DAILY
   *     refreshClosedReports: true
   *     reportVersioning: CREATE_NEW_REPORT
   * ```
   */
  readonly costAndUsageReport = new CostAndUsageReportConfig();
  /**
   * Budget report configuration
   *
   * If you want to create budget report with monthly granularity of the line items in the report and other default parameters , you need to provide below value for this parameter.
   *
   * @example
   * ```
   * budgets:
   *     budgetName: accel-budget
   *     timeUnit: MONTHLY
   *     budgetType: COST
   *     amount: 2000
   *     includeUpfront: true
   *     includeTax: true
   *     includeSupport: true
   *     includeSubscription: true
   *     includeRecurring: true
   *     includeOtherSubscription: true
   *     includeDiscount: true
   *     includeCredit: false
   *     includeRefund: false
   *     useBlended: false
   *     useAmortized: false
   *     subscriptionType: EMAIL
   *     address: myemail+pa-budg@example.com
   *     unit: USD
   *     notification:
   *       notificationType: ACTUAL
   *       thresholdType: PERCENTAGE
   *       threshold: 90
   *       comparisonOperator: GREATER_THAN
   * ```
   */
  readonly budgets = new BudgetReportConfig();
}

/**
 * Accelerator global configuration
 */
export class GlobalConfig implements t.TypeOf<typeof GlobalConfigTypes.globalConfig> {
  /**
   * Global configuration file name, this file must be present in accelerator config repository
   */
  static readonly FILENAME = 'global-config.yaml';

  /**
   * Accelerator home region name. The region where accelerator pipeline deployed.
   *
   * To use us-east-1 as home region for the accelerator, you need to provide below value for this parameter.
   * Note: Variable HOME_REGION created for future usage of home region in the file
   *
   * @example
   * ```
   * homeRegion: &HOME_REGION us-east-1
   * ```
   */
  readonly homeRegion: string;
  /**
   * List of AWS Region names where accelerator will be deployed. Home region must be part of this list.
   * us-east-1 must be in the list of enabled regions if it is not your Home region.
   *
   * To add us-west-2 along with home region for accelerator deployment, you need to provide below value for this parameter.
   *
   * @example
   * ```
   * enabledRegions:
   *   - *HOME_REGION
   *   - us-west-2
   * ```
   */
  readonly enabledRegions: t.Region[];

  /**
   * This role trusts the management account, allowing users in the management
   * account to assume the role, as permitted by the management account
   * administrator. The role has administrator permissions in the new member
   * account.
   *
   * Examples:
   * - AWSControlTowerExecution
   * - OrganizationAccountAccessRole
   */
  readonly managementAccountAccessRole = 'AWSControlTowerExecution';

  /**
   * CloudWatchLogs retention in days, accelerator's custom resource lambda function logs retention period is configured based on this value.
   */
  readonly cloudwatchLogRetentionInDays = 365;

  /**
   * AWS ControlTower configuration
   *
   * To indicate environment has control tower enabled, you need to provide below value for this parameter.
   *
   * @example
   * ```
   * controlTower:
   *   enable: true
   * ```
   */
  readonly controlTower: ControlTowerConfig = new ControlTowerConfig();
  /**
   * Accelerator logging configuration
   *
   * To enable organization trail and session manager logs sending to S3, you need to provide below value for this parameter.
   *
   * @example
   * ```
   * logging:
   *   account: LogArchive
   *   cloudtrail:
   *     enable: false
   *     organizationTrail: false
   *   sessionManager:
   *     sendToCloudWatchLogs: false
   *     sendToS3: true
   * ```
   */
  readonly logging: LoggingConfig = new LoggingConfig();

  /**
   * DataProtection configuration
   *
   * To enable data protection for Root organizational unit, and enable identityPerimeter, resourcePerimeter and networkPerimeter, you need to provide below value for this parameter.
   *
   * @example
   * ```
   * dataProtection:
   *   enable: true
   *   deploymentTargets:
   *     organizationalUnits:
   *       - Root
   *   identityPerimeter:
   *     enable: true
   *   resourcePerimeter:
   *     enable: true
   *   networkPerimeter:
   *     enable: true
   * ```
   */
  readonly dataProtection: DataProtectionConfig | undefined = undefined;
  /**
   * Report configuration
   *
   * To enable budget report along with cost and usage report, you need to provide below value for this parameter.
   *
   * @example
   * ```
   * reports:
   *   costAndUsageReport:
   *     compression: Parquet
   *     format: Parquet
   *     reportName: accelerator-cur
   *     s3Prefix: cur
   *     timeUnit: DAILY
   *     refreshClosedReports: true
   *     reportVersioning: CREATE_NEW_REPORT
   *   budgets:
   *     budgetName: accel-budget
   *     timeUnit: MONTHLY
   *     budgetType: COST
   *     amount: 2000
   *     includeUpfront: true
   *     includeTax: true
   *     includeSupport: true
   *     includeSubscription: true
   *     includeRecurring: true
   *     includeOtherSubscription: true
   *     includeDiscount: true
   *     includeCredit: false
   *     includeRefund: false
   *     useBlended: false
   *     useAmortized: false
   *     subscriptionType: EMAIL
   *     address: myemail+pa-budg@example.com
   *     unit: USD
   *     notification:
   *       notificationType: ACTUAL
   *       thresholdType: PERCENTAGE
   *       threshold: 90
   *       comparisonOperator: GREATER_THAN
   * ```
   */
  readonly reports: ReportConfig | undefined = undefined;

  /**
   *
   * @param props
   * @param values
   */
  constructor(
    props: {
      homeRegion: string;
    },
    values?: t.TypeOf<typeof GlobalConfigTypes.globalConfig>,
  ) {
    if (values) {
      Object.assign(this, values);
    }

    this.homeRegion = props.homeRegion;
    this.enabledRegions = [props.homeRegion as Region];

    //
    // Validation errors
    //
    const errors: string[] = [];

    //In the commerical partition if the home region is not us-east-1 is must be an
    //enabled region as the accelerator will need to create some resources in the management
    //account us-east-1 region
    //In the GovCloud partition the home region must be us-gov-west-1 as the
    //CodePipeline service does not exist in us-gov-east-1
    if (values?.homeRegion !== undefined && values?.cloudwatchLogRetentionInDays !== undefined) {
      if (values.homeRegion == 'us-gov-west-1' || values.homeRegion == 'us-gov-east-1') {
        if (values.homeRegion != 'us-gov-west-1') {
          errors.push('The region us-gov-west-1 must be the home region.');
        }
      } else {
        if (values.homeRegion != 'us-east-1' && !values.enabledRegions.includes('us-east-1')) {
          errors.push('The region us-east-1 must be included in the list of enabled regions');
        }
      }
    }

    if (errors.length) {
      throw new Error(`${GlobalConfig.FILENAME} has ${errors.length} issues: ${errors.join(' ')}`);
    }
  }

  /**
   * Load from file in given directory
   * @param dir
   * @returns
   */
  static load(dir: string): GlobalConfig {
    const buffer = fs.readFileSync(path.join(dir, GlobalConfig.FILENAME), 'utf8');
    const values = t.parse(GlobalConfigTypes.globalConfig, yaml.load(buffer));

    const homeRegion = values.homeRegion;

    return new GlobalConfig(
      {
        homeRegion,
      },
      values,
    );
  }

  /**
   * Load from string content
   * @param content
   */
  static loadFromString(content: string): GlobalConfig | undefined {
    try {
      const values = t.parse(GlobalConfigTypes.globalConfig, yaml.load(content));
      return new GlobalConfig(values);
    } catch (e) {
      console.log('[global-config] Error parsing input, global config undefined');
      console.log(`${e}`);
      return undefined;
    }
  }
}
