/**
 * Which academic term a course name belongs to.
 *
 * Sync flags courses the user has not selected yet so it can offer them. That
 * list has to be filtered, or a student who has been on caltodo for a year is
 * offered every course they have ever taken. The filter used to be a literal
 * list of Spring 2026 spellings, which stopped matching anything the moment
 * the term rolled over: a Fall 2026 student was never told about a new class,
 * silently and forever.
 *
 * The rule here is deliberately conservative. A course is offered unless its
 * name names a term that is not the current one, so a course with no term in
 * its name - which is most of them - is still surfaced.
 */

/** The three terms a course name can name. */
export type Season = "Spring" | "Summer" | "Fall";

/** A term as a season and the calendar year it falls in. */
export interface AcademicTerm {
  season: Season;
  year: number;
}

/** First letter of each season, used to read abbreviations like "FA26". */
const SEASON_INITIALS: Record<Season, string> = {
  Spring: "S",
  Summer: "U",
  Fall: "F",
};

/**
 * Resolves the term a date falls in.
 *
 * @param date - Instant to classify; defaults to now.
 * @returns The season and year covering that date.
 * @remarks Month boundaries follow the ordinary US academic calendar:
 *          January through May is Spring, June and July are Summer, and
 *          August through December is Fall. A course is usually listed a
 *          month or two before its term starts, which the "no term named
 *          means offer it" rule already covers.
 */
export function getCurrentTerm(date: Date = new Date()): AcademicTerm {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  if (month <= 5) return { season: "Spring", year };
  if (month <= 7) return { season: "Summer", year };
  return { season: "Fall", year };
}

/**
 * Every spelling of a term that shows up in a Canvas course name.
 *
 * @param term - The term to spell out.
 * @returns Lowercased spellings, e.g. "fall 2026", "fa26", "f26", "f'26".
 * @remarks Schools are inconsistent, and Berkeley alone uses both "FA26" and
 *          "Fall 2026". Matching is done lowercased so each spelling is
 *          listed once rather than in every combination of capitals.
 */
export function termSpellings(term: AcademicTerm): string[] {
  const { season, year } = term;
  const initial = SEASON_INITIALS[season].toLowerCase();
  const yy = String(year % 100).padStart(2, "0");
  const yyyy = String(year);
  const abbrev = season.slice(0, 2).toLowerCase();
  return [
    `${season.toLowerCase()} ${yyyy}`,
    `${season.toLowerCase()}${yyyy}`,
    `${abbrev}${yy}`,
    `${abbrev}${yyyy}`,
    `${initial}${yy}`,
    `${initial}'${yy}`,
  ];
}

/** The terms either side of a given one, in calendar order. */
const SEASON_ORDER: Season[] = ["Spring", "Summer", "Fall"];

/**
 * Terms close enough to the current one to still count as current.
 *
 * @param term - The term the date falls in.
 * @returns That term plus the one after it.
 * @remarks Next term's courses appear in Canvas well before the current one
 *          ends - Fall sites are up during Summer - so treating only the
 *          exact term as current would hide exactly the courses a student
 *          most wants to be told about.
 */
export function acceptableTerms(term: AcademicTerm): AcademicTerm[] {
  const index = SEASON_ORDER.indexOf(term.season);
  const isLast = index === SEASON_ORDER.length - 1;
  const next: AcademicTerm = isLast
    ? { season: SEASON_ORDER[0], year: term.year + 1 }
    : { season: SEASON_ORDER[index + 1], year: term.year };
  return [term, next];
}

/**
 * Reports whether a course name names a term other than the current ones.
 *
 * @param courseName - The Canvas course name.
 * @param date - Instant deciding what "current" means; defaults to now.
 * @returns True only when the name names a term, and that term is not current
 *          or next.
 * @remarks Returns false for a name with no term in it at all. That is the
 *          conservative direction: a course is only withheld when its name
 *          gives positive evidence it belongs to a different term.
 */
export function namesAnotherTerm(courseName: string, date: Date = new Date()): boolean {
  const name = courseName.toLowerCase();
  const current = new Set(
    acceptableTerms(getCurrentTerm(date)).flatMap((t) => termSpellings(t))
  );

  // Look back and forward a few years, which is the whole span a student's
  // course list can cover, and see whether any OTHER term is spelled out.
  const year = date.getFullYear();
  for (let y = year - 4; y <= year + 2; y++) {
    for (const season of SEASON_ORDER) {
      for (const spelling of termSpellings({ season, year: y })) {
        if (current.has(spelling)) continue;
        if (name.includes(spelling)) return true;
      }
    }
  }
  return false;
}

/**
 * Reports whether an unselected course is worth offering to the user.
 *
 * @param courseName - The Canvas course name.
 * @param date - Instant deciding what "current" means; defaults to now.
 * @returns True unless the name names a term that has passed or is far off.
 */
export function isCurrentTermCourse(courseName: string, date: Date = new Date()): boolean {
  return !namesAnotherTerm(courseName, date);
}
