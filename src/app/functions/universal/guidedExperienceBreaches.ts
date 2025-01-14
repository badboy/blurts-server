/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BreachDataTypes } from "./breach";
import { SubscriberBreach } from "../../../utils/subscriberBreaches";
import { GuidedExperienceBreaches } from "../server/getUserBreaches";

export function getGuidedExperienceBreaches(
  subscriberBreaches: SubscriberBreach[],
  emails: string[]
): GuidedExperienceBreaches {
  const guidedExperienceBreaches: GuidedExperienceBreaches = {
    highRisk: {
      ssnBreaches: [],
      creditCardBreaches: [],
      pinBreaches: [],
      bankBreaches: [],
    },
    passwordBreaches: {
      passwords: [],
      securityQuestions: [],
    },
    securityRecommendations: {
      phoneNumber: [],
      emailAddress: [],
      IPAddress: [],
    },
    emails,
  };
  subscriberBreaches.forEach((b) => {
    // high risks
    if (b.dataClasses.includes(BreachDataTypes.SSN)) {
      guidedExperienceBreaches.highRisk.ssnBreaches.push(b);
    }

    if (b.dataClasses.includes(BreachDataTypes.CreditCard)) {
      guidedExperienceBreaches.highRisk.creditCardBreaches.push(b);
    }

    if (b.dataClasses.includes(BreachDataTypes.PIN)) {
      guidedExperienceBreaches.highRisk.pinBreaches.push(b);
    }

    if (b.dataClasses.includes(BreachDataTypes.BankAccount)) {
      guidedExperienceBreaches.highRisk.bankBreaches.push(b);
    }

    // passwords

    // TODO: Add tests when passwords component has been made - MNTOR-1712
    /* c8 ignore start */
    if (b.dataClasses.includes(BreachDataTypes.Passwords)) {
      guidedExperienceBreaches.passwordBreaches.passwords.push(b);
    }
    if (b.dataClasses.includes(BreachDataTypes.SecurityQuestions)) {
      guidedExperienceBreaches.passwordBreaches.securityQuestions.push(b);
    }

    // security recommendations
    // TODO: Add tests when security recs work is merged in
    if (b.dataClasses.includes(BreachDataTypes.Phone)) {
      guidedExperienceBreaches.securityRecommendations.phoneNumber.push(b);
    }

    if (b.dataClasses.includes(BreachDataTypes.Email)) {
      guidedExperienceBreaches.securityRecommendations.emailAddress.push(b);
    }

    if (b.dataClasses.includes(BreachDataTypes.HistoricalPasswords)) {
      guidedExperienceBreaches.securityRecommendations.IPAddress.push(b);
    }
    /* c8 ignore stop */
  });

  return guidedExperienceBreaches;
}
