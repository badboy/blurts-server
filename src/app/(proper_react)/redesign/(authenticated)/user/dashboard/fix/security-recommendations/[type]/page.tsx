/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SecurityRecommendationsLayout } from "../SecurityRecommendationsLayout";
import { getSecurityRecommendationsByType } from "../securityRecommendationsData";
import { authOptions } from "../../../../../../../../api/utils/auth";
import { getSubscriberBreaches } from "../../../../../../../../functions/server/getUserBreaches";
import { getSubscriberEmails } from "../../../../../../../../functions/server/getSubscriberEmails";
import { getGuidedExperienceBreaches } from "../../../../../../../../functions/universal/guidedExperienceBreaches";
import {
  getL10n,
  getLocale,
} from "../../../../../../../../functions/server/l10n";

interface SecurityRecommendationsProps {
  params: {
    type: string;
  };
}

export default async function SecurityRecommendations({
  params,
}: SecurityRecommendationsProps) {
  const session = await getServerSession(authOptions);
  const locale = getLocale();
  if (!session?.user?.subscriber?.id) {
    return redirect("/");
  }
  const l10n = getL10n();
  const breaches = await getSubscriberBreaches(session.user);
  const subscriberEmails = await getSubscriberEmails(session.user);
  const guidedExperienceBreaches = getGuidedExperienceBreaches(
    breaches,
    subscriberEmails
  );

  const { type } = params;
  const pageData = getSecurityRecommendationsByType({
    dataType: type,
    breaches: guidedExperienceBreaches,
  });

  if (!pageData) {
    redirect("/redesign/user/dashboard");
  }

  return (
    <SecurityRecommendationsLayout
      label={l10n.getString("security-recommendation-steps-label")}
      pageData={pageData}
      locale={locale}
    />
  );
}
