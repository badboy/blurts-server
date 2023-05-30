/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

interface CircleChartProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  class?: string;
  title?: string;
  "data-txt-other"?: string;
  "data-txt-none"?: string;
  data?: string;
}

declare namespace JSX {
  interface IntrinsicElements {
    "circle-chart": CircleChartProps;
  }
}