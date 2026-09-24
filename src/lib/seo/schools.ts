/**
 * Per-school landing page data.
 *
 * Every entry is a school that has at least one real caltodo user, with the
 * LMS hostname taken from that user's synced assignment URLs. The hostname is
 * what makes each generated page genuinely distinct: the setup instructions
 * quote the school's own Canvas domain rather than a generic placeholder.
 *
 * K-12 districts are deliberately excluded; the marketing copy addresses
 * college students.
 */

/** A school eligible for a generated /for/{slug} landing page. */
export interface School {
  /** URL slug, unique across the list. */
  slug: string;
  /** Display name as students would write it. */
  name: string;
  /** The school's Canvas hostname, e.g. "bcourses.berkeley.edu". */
  canvasHost: string;
}

/** [slug, display name, Canvas host] for each school with real usage. */
const RAW: ReadonlyArray<readonly [string, string, string]> = [
  ["uc-berkeley", "UC Berkeley", "bcourses.berkeley.edu"],
  ["university-of-florida", "University of Florida", "ufl.instructure.com"],
  ["university-of-houston-downtown", "University of Houston-Downtown", "canvas.uhd.edu"],
  ["indiana-university", "Indiana University", "iu.instructure.com"],
  ["university-of-nevada-reno", "University of Nevada, Reno", "webcampus.unr.edu"],
  ["san-diego-state-university", "San Diego State University", "sdsu.instructure.com"],
  ["lake-sumter-state-college", "Lake-Sumter State College", "lssc.instructure.com"],
  ["virginia-tech", "Virginia Tech", "canvas.vt.edu"],
  ["university-of-central-florida", "University of Central Florida", "webcourses.ucf.edu"],
  ["ucla", "UCLA", "bruinlearn.ucla.edu"],
  ["uc-irvine", "UC Irvine", "canvas.eee.uci.edu"],
  ["university-of-illinois-chicago", "University of Illinois Chicago", "canvas.uic.edu"],
  ["arizona-state-university", "Arizona State University", "canvas.asu.edu"],
  ["georgia-tech", "Georgia Tech", "gatech.instructure.com"],
  ["collin-college", "Collin College", "collin.instructure.com"],
  ["washington-university-in-st-louis", "Washington University in St. Louis", "wustl.instructure.com"],
  ["university-of-miami", "University of Miami", "miami.instructure.com"],
  ["illinois-state-university", "Illinois State University", "illinoisstate.instructure.com"],
  ["st-clair-county-community-college", "St. Clair County Community College", "sc4.instructure.com"],
  ["cal-state-fullerton", "Cal State Fullerton", "csufullerton.instructure.com"],
  ["george-mason-university", "George Mason University", "canvas.gmu.edu"],
  ["florida-state-university", "Florida State University", "canvas.fsu.edu"],
  ["houston-community-college", "Houston Community College", "hccs.instructure.com"],
  ["university-of-north-texas", "University of North Texas", "unt.instructure.com"],
  ["university-of-virginia", "University of Virginia", "canvas.its.virginia.edu"],
  ["ut-san-antonio", "UT San Antonio", "utsa.instructure.com"],
  ["penn-state", "Penn State", "psu.instructure.com"],
  ["cu-boulder", "CU Boulder", "canvas.colorado.edu"],
  ["pasco-hernando-state-college", "Pasco-Hernando State College", "phsc.instructure.com"],
  ["university-of-houston", "University of Houston", "canvas.uh.edu"],
  ["unc-chapel-hill", "UNC Chapel Hill", "uncch.instructure.com"],
  ["california-western-school-of-law", "California Western School of Law", "cwsl.instructure.com"],
  ["uc-santa-cruz", "UC Santa Cruz", "canvas.ucsc.edu"],
  ["university-of-oklahoma", "University of Oklahoma", "canvas.ou.edu"],
  ["cal-state-san-marcos", "Cal State San Marcos", "csusm.instructure.com"],
  ["byu-idaho", "BYU-Idaho", "byui.instructure.com"],
  ["university-of-melbourne", "University of Melbourne", "canvas.lms.unimelb.edu.au"],
  ["university-of-pittsburgh", "University of Pittsburgh", "canvas.pitt.edu"],
  ["university-of-illinois-urbana-champaign", "University of Illinois Urbana-Champaign", "canvas.illinois.edu"],
  ["uc-riverside", "UC Riverside", "elearn.ucr.edu"],
  ["bowdoin-college", "Bowdoin College", "bowdoin.instructure.com"],
  ["uc-santa-barbara", "UC Santa Barbara", "ucsb.instructure.com"],
  ["carnegie-mellon-university", "Carnegie Mellon University", "canvas.cmu.edu"],
  ["santa-ana-college", "Santa Ana College", "rsccd.instructure.com"],
  ["de-anza-college", "De Anza College", "deanza.instructure.com"],
];

/** All schools with a generated landing page, in stable declaration order. */
export const SCHOOLS: readonly School[] = RAW.map(([slug, name, canvasHost]) => ({
  slug,
  name,
  canvasHost,
}));

/** Slug lookup index, built once at module load. */
const BY_SLUG = new Map(SCHOOLS.map((s) => [s.slug, s]));

/**
 * Looks up a school by its URL slug.
 *
 * @param slug - Slug from the /for/{slug} route segment
 * @returns The matching School, or undefined when the slug is unknown
 *          (caller is expected to render notFound()).
 */
export function getSchool(slug: string): School | undefined {
  return BY_SLUG.get(slug);
}
