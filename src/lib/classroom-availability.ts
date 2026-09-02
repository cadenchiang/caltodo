/**
 * Whether Google Classroom can currently be connected.
 *
 * The integration is written and its sync path works, but the two scopes it
 * needs — `classroom.courses.readonly` and `classroom.coursework.me.readonly`
 * — are Google "restricted" scopes. Until they are registered on the OAuth
 * consent screen and the app passes Google's verification, Google rejects the
 * authorization request outright, so anyone who picks Classroom is bounced to
 * an error page rather than connected.
 *
 * Offering it anyway spends a student's first minute in the product on a dead
 * end, so the entry points show "Coming soon" instead. Flip this to `true`
 * when verification lands and both surfaces come back on together — nothing
 * else needs to change.
 *
 * @module classroom-availability
 */

/** True once Google has verified the app for the Classroom scopes. */
export const CLASSROOM_AVAILABLE = false;
