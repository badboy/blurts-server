/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getOnerepProfileId } from "../../../../../../../db/tables/subscribers";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../api/utils/auth";
import {
  createScan,
  listScanResults,
  getScanDetails,
  isEligible,
} from "../../../../../../functions/server/onerep";
import Script from "next/script";
import {
  setOnerepScan,
  setOnerepScanResults,
} from "../../../../../../../db/tables/onerep_scans";

export function generateMetadata() {
  return {
    title: "Welcome - Scanning",
  };
}

export default async function UserWelcomeScanning() {
  const eligible = await isEligible();
  if (!eligible) {
    return (
      <main>
        <h2>You have already used your free scan.</h2>
      </main>
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.subscriber?.id) {
    throw new Error("No session");
  }

  const result = await getOnerepProfileId(session.user.subscriber.id);
  const profileId = result[0]["onerep_profile_id"] as number;
  const scan = await createScan(profileId);
  await setOnerepScan(profileId, scan.id);

  let iterations = 0;
  const totalIterations = 15;

  const interval = setInterval(
    () =>
      void (async () => {
        const scanDetails = await getScanDetails(profileId, scan.id);

        // Give up after set number of iterations.
        if (iterations >= totalIterations) {
          clearInterval(interval);
        } else if (scanDetails.status === "finished") {
          clearInterval(interval);

          const scanListFull = [];
          const firstPage = await listScanResults(profileId, { per_page: 100 });
          // Results are paginated, use per_page maximum and collect all pages into one result.
          if (firstPage.meta.last_page > 1) {
            let currentPage = 2;
            while (currentPage <= firstPage.meta.last_page) {
              const nextPage = await listScanResults(profileId, {
                per_page: 100,
              });
              currentPage++;
              nextPage.data.forEach((element: object) =>
                scanListFull.push(element)
              );
            }
          } else {
            scanListFull.push(firstPage.data);
          }
          // Store full list of results in the DB.
          await setOnerepScanResults(profileId, scan.id, {
            data: scanListFull[0],
          });
        } else {
          iterations++;
        }
      })(),
    1000
  );

  return (
    <>
      <Script
        type="module"
        src="/nextjs_migration/client/js/welcome.js"
      ></Script>
      <main>
        <h2 id="status">Scanning for exposures...</h2>
        <div id="progress">0%</div>
      </main>
    </>
  );
}
