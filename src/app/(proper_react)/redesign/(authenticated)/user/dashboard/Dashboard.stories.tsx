/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from "@storybook/react";

import { OnerepScanResultRow, OnerepScanRow } from "knex/types/tables";
import { View as DashboardEl } from "./View";
import { Shell } from "../../../Shell";
import { getEnL10nSync } from "../../../../../functions/server/mockL10n";
import {
  createRandomScanResult,
  createRandomBreach,
  createUserWithPremiumSubscription,
} from "../../../../../../apiMocks/mockData";
import { SubscriberBreach } from "../../../../../../utils/subscriberBreaches";
import { LatestOnerepScanData } from "../../../../../../db/tables/onerep_scans";

const brokerOptions = {
  "no-scan": "No scan started",
  empty: "No scan results",
  unresolved: "With unresolved scan results",
  resolved: "All scan results resolved",
};
const breachOptions = {
  empty: "No data breaches",
  unresolved: "With unresolved data breaches",
  resolved: "All data breaches resolved",
};
type DashboardWrapperProps = (
  | {
      countryCode: "us";
      brokers: keyof typeof brokerOptions;
      premium: boolean;
    }
  | {
      countryCode: "nl";
    }
) & {
  breaches: keyof typeof breachOptions;
  scanInProgress: boolean;
};
const DashboardWrapper = (props: DashboardWrapperProps) => {
  const mockedResolvedBreach: SubscriberBreach = createRandomBreach({
    dataClasses: [
      "email-addresses",
      "ip-addresses",
      "phone-numbers",
      "passwords",
      "pins",
      "social-security-numbers",
      "partial-credit-card-data",
      "security-questions-and-answers",
    ],
    addedDate: new Date("2023-06-18T14:48:00.000Z"),
    dataClassesEffected: [
      { "email-addresses": ["email1@gmail.com", "email2@gmail.com"] },
      { "ip-addresses": 1 },
      { "phone-numbers": 1 },
      { passwords: 1 },
    ],
    isResolved: true,
  });

  const mockedUnresolvedBreach: SubscriberBreach = createRandomBreach({
    dataClasses: ["email-addresses", "ip-addresses", "phone-numbers"],
    addedDate: new Date("2023-06-18T14:48:00.000Z"),
    dataClassesEffected: [
      { "email-addresses": ["email1@gmail.com", "email2@gmail.com"] },
      { "ip-addresses": 1 },
    ],
    isResolved: false,
  });

  let breaches: SubscriberBreach[] = [];
  if (props.breaches === "resolved") {
    breaches = [mockedResolvedBreach];
  }
  if (props.breaches === "unresolved") {
    breaches = [mockedResolvedBreach, mockedUnresolvedBreach];
  }

  const mockedScan: OnerepScanRow = {
    created_at: new Date(1998, 2, 31),
    updated_at: new Date(1998, 2, 31),
    id: 0,
    onerep_profile_id: 0,
    onerep_scan_id: 0,
    onerep_scan_reason: "initial",
    onerep_scan_status: "finished",
  };

  const mockedScanInProgress: OnerepScanRow = {
    ...mockedScan,
    onerep_scan_status: "in_progress",
  };

  const mockedResolvedScanResults: OnerepScanResultRow[] = [
    createRandomScanResult({ status: "removed" }),
    createRandomScanResult({ status: "waiting_for_verification" }),
    createRandomScanResult({ status: "optout_in_progress" }),
  ];

  const mockedUnresolvedScanResults: OnerepScanResultRow[] = [
    ...mockedResolvedScanResults,
    createRandomScanResult({ status: "new", manually_resolved: false }),
    createRandomScanResult({ status: "new", manually_resolved: true }),
  ];

  const scanData: LatestOnerepScanData = { scan: null, results: [] };

  if (props.countryCode === "us") {
    if (props.brokers !== "no-scan") {
      scanData.scan = props.scanInProgress ? mockedScanInProgress : mockedScan;

      if (props.brokers === "resolved") {
        scanData.results = mockedResolvedScanResults;
      }
      if (props.brokers === "unresolved") {
        scanData.results = mockedUnresolvedScanResults;
      }
    }
  }

  const user = createUserWithPremiumSubscription();
  if (props.countryCode !== "us" || !props.premium) {
    user.fxa.subscriptions = [];
  }

  const mockedSession = {
    expires: new Date().toISOString(),
    user: user,
  };

  return (
    <Shell l10n={getEnL10nSync()} session={mockedSession}>
      <DashboardEl
        countryCode={props.countryCode}
        user={user}
        userBreaches={breaches}
        userScanData={scanData}
        isEligibleForFreeScan={props.countryCode === "us"}
        locale={"en"}
        featureFlagsEnabled={{
          FreeBrokerScan: true,
          PremiumBrokerRemoval: true,
        }}
        scanInProgress={props.scanInProgress}
      />
    </Shell>
  );
};

const meta: Meta<typeof DashboardWrapper> = {
  title: "Pages/Dashboard",
  component: DashboardWrapper,
  argTypes: {
    brokers: {
      options: Object.keys(brokerOptions),
      description: "Scan results",
      control: {
        type: "radio",
        labels: brokerOptions,
      },
    },
    breaches: {
      options: Object.keys(breachOptions),
      control: {
        type: "radio",
        labels: breachOptions,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof DashboardWrapper>;

export const DashboardNonUsNoBreaches: Story = {
  name: "Non-US user, with 0 breaches",
  args: {
    countryCode: "nl",
    breaches: "empty",
  },
};

export const DashboardNonUsUnresolvedBreaches: Story = {
  name: "Non-US user, with unresolved breaches",
  args: {
    countryCode: "nl",
    breaches: "unresolved",
  },
};

export const DashboardNonUsResolvedBreaches: Story = {
  name: "Non-US user, with all breaches resolved",
  args: {
    countryCode: "nl",
    breaches: "resolved",
  },
};

export const DashboardUsNoPremiumNoScanNoBreaches: Story = {
  name: "US user, without Premium, without scan, with 0 breaches",
  args: {
    countryCode: "us",
    premium: false,
    breaches: "empty",
    brokers: "no-scan",
    scanInProgress: false,
  },
};

export const DashboardUsNoPremiumNoScanUnresolvedBreaches: Story = {
  name: "US user, without Premium, without scan, with unresolved breaches",
  args: {
    countryCode: "us",
    premium: false,
    breaches: "unresolved",
    brokers: "no-scan",
    scanInProgress: false,
  },
};

export const DashboardUsNoPremiumNoScanResolvedBreaches: Story = {
  name: "US user, without Premium, without scan, with all breaches resolved",
  args: {
    countryCode: "us",
    premium: false,
    breaches: "resolved",
    brokers: "no-scan",
    scanInProgress: false,
  },
};

export const DashboardUsNoPremiumEmptyScanNoBreaches: Story = {
  name: "US user, without Premium, with 0 scan results, with 0 breaches",
  args: {
    countryCode: "us",
    premium: false,
    breaches: "empty",
    brokers: "empty",
    scanInProgress: false,
  },
};

export const DashboardUsNoPremiumEmptyScanUnresolvedBreaches: Story = {
  name: "US user, without Premium, with 0 scan results, with unresolved breaches",
  args: {
    countryCode: "us",
    premium: false,
    breaches: "unresolved",
    brokers: "empty",
    scanInProgress: false,
  },
};

export const DashboardUsNoPremiumEmptyScanResolvedBreaches: Story = {
  name: "US user, without Premium, with 0 scan results, with all breaches resolved",
  args: {
    countryCode: "us",
    premium: false,
    breaches: "resolved",
    brokers: "empty",
    scanInProgress: false,
  },
};

export const DashboardUsNoPremiumUnresolvedScanNoBreaches: Story = {
  name: "US user, without Premium, with unresolved scan results, with 0 breaches",
  args: {
    countryCode: "us",
    premium: false,
    breaches: "empty",
    brokers: "unresolved",
    scanInProgress: false,
  },
};

export const DashboardUsNoPremiumUnresolvedScanUnresolvedBreaches: Story = {
  name: "US user, without Premium, with unresolved scan results, with unresolved breaches",
  args: {
    countryCode: "us",
    premium: false,
    breaches: "unresolved",
    brokers: "unresolved",
    scanInProgress: false,
  },
};

export const DashboardUsNoPremiumUnresolvedScanResolvedBreaches: Story = {
  name: "US user, without Premium, with unresolved scan results, with all breaches resolved",
  args: {
    countryCode: "us",
    premium: false,
    breaches: "resolved",
    brokers: "unresolved",
    scanInProgress: false,
  },
};

export const DashboardUsNoPremiumResolvedScanNoBreaches: Story = {
  name: "US user, without Premium, with all scan results resolved, with 0 breaches",
  args: {
    countryCode: "us",
    premium: false,
    breaches: "empty",
    brokers: "resolved",
    scanInProgress: false,
  },
};

export const DashboardUsNoPremiumResolvedScanUnresolvedBreaches: Story = {
  name: "US user, without Premium, with all scan results resolved, with unresolved breaches",
  args: {
    countryCode: "us",
    premium: false,
    breaches: "unresolved",
    brokers: "resolved",
    scanInProgress: false,
  },
};

export const DashboardUsNoPremiumResolvedScanResolvedBreaches: Story = {
  name: "US user, without Premium, with all scan results resolved, with all breaches resolved",
  args: {
    countryCode: "us",
    premium: false,
    breaches: "resolved",
    brokers: "resolved",
    scanInProgress: false,
  },
};

export const DashboardUsPremiumNoScanNoBreaches: Story = {
  name: "US user, with Premium, without scan, with 0 breaches",
  args: {
    countryCode: "us",
    premium: true,
    breaches: "empty",
    brokers: "no-scan",
    scanInProgress: false,
  },
};

export const DashboardUsPremiumNoScanUnresolvedBreaches: Story = {
  name: "US user, with Premium, without scan, with unresolved breaches",
  args: {
    countryCode: "us",
    premium: true,
    breaches: "unresolved",
    brokers: "no-scan",
    scanInProgress: false,
  },
};

export const DashboardUsPremiumNoScanResolvedBreaches: Story = {
  name: "US user, with Premium, without scan, with all breaches resolved",
  args: {
    countryCode: "us",
    premium: true,
    breaches: "resolved",
    brokers: "no-scan",
    scanInProgress: false,
  },
};

export const DashboardUsPremiumEmptyScanNoBreaches: Story = {
  name: "US user, with Premium, with 0 scan results, with 0 breaches",
  args: {
    countryCode: "us",
    premium: true,
    breaches: "empty",
    brokers: "empty",
    scanInProgress: false,
  },
};

export const DashboardUsPremiumEmptyScanUnresolvedBreaches: Story = {
  name: "US user, with Premium, with 0 scan results, with unresolved breaches",
  args: {
    countryCode: "us",
    premium: true,
    breaches: "unresolved",
    brokers: "empty",
    scanInProgress: false,
  },
};

export const DashboardUsPremiumEmptyScanResolvedBreaches: Story = {
  name: "US user, with Premium, with 0 scan results, with all breaches resolved",
  args: {
    countryCode: "us",
    premium: true,
    breaches: "resolved",
    brokers: "empty",
    scanInProgress: false,
  },
};

export const DashboardUsPremiumUnresolvedScanNoBreaches: Story = {
  name: "US user, with Premium, with unresolved scan results, with 0 breaches",
  args: {
    countryCode: "us",
    premium: true,
    breaches: "empty",
    brokers: "unresolved",
    scanInProgress: false,
  },
};

export const DashboardUsPremiumUnresolvedScanUnresolvedBreaches: Story = {
  name: "US user, with Premium, with unresolved scan results, with unresolved breaches",
  args: {
    countryCode: "us",
    premium: true,
    breaches: "unresolved",
    brokers: "unresolved",
    scanInProgress: false,
  },
};

export const DashboardUsPremiumUnresolvedScanResolvedBreaches: Story = {
  name: "US user, with Premium, with unresolved scan results, with all breaches resolved",
  args: {
    countryCode: "us",
    premium: true,
    breaches: "resolved",
    brokers: "unresolved",
    scanInProgress: false,
  },
};

export const DashboardUsPremiumResolvedScanNoBreaches: Story = {
  name: "US user, with Premium, with all scan results resolved, with 0 breaches",
  args: {
    countryCode: "us",
    premium: true,
    breaches: "empty",
    brokers: "resolved",
    scanInProgress: false,
  },
};

export const DashboardUsPremiumScanInProgressNoBreaches: Story = {
  name: "US user, with Premium, with a scan in progress, with no breaches",
  args: {
    countryCode: "us",
    premium: true,
    breaches: "empty",
    brokers: "empty",
    scanInProgress: true,
  },
};

export const DashboardUsPremiumScanInProgressWithBreaches: Story = {
  name: "US user, with Premium, with a scan in progress, with unresolved breaches",
  args: {
    countryCode: "us",
    premium: true,
    breaches: "unresolved",
    brokers: "empty",
    scanInProgress: true,
  },
};
