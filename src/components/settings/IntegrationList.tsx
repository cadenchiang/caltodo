"use client";

/**
 * The integrations list, grouped by whether each one is connected.
 *
 * Previously the cards were split across two components and rendered in a
 * fixed order, so a connected account, an unconnected one, and a dashed
 * Canvas-only "add another" row all sat in one undifferentiated column. That
 * is the thing that made the page hard to manage: nothing told you what you
 * had set up versus what was merely on offer, and only Canvas looked like it
 * could hold more than one account.
 *
 * Here every card keeps its own connect and disconnect flow. This file only
 * decides which group a card belongs in, and renders each connected group as
 * the account plus its extra accounts plus one "add another" row.
 */

import type { IntegrationCredentials } from "@/lib/types";
import { useTaskContext } from "@/contexts/TaskContext";
import { splitByConnection, type CatalogEntry, type CatalogId } from "@/lib/integration-catalog";
import { hasDisclosure } from "@/lib/integration-disclosure";
import GoogleCalendarSettings from "./GoogleCalendarSettings";
import CanvasSettings from "./CanvasSettings";
import GradescopeSettings from "./GradescopeSettings";
import PensieveSettings from "./PensieveSettings";
import BrightspaceSettings from "./BrightspaceSettings";
import BlackboardSettings from "./BlackboardSettings";
import GoogleClassroomSettings from "./GoogleClassroomSettings";
import SyllabusSettings from "./SyllabusSettings";
import ConnectedIntegration from "./ConnectedIntegration";

/** Everything a provider card needs from the page around it. */
interface CardContext {
  credentials: IntegrationCredentials;
  onUpdate: (updated: IntegrationCredentials) => void;
  syncing: boolean;
  lastSyncedAt: string | null;
  syncedCount: Partial<Record<CatalogId, number | undefined>>;
}

/**
 * Renders the card for one catalog entry.
 *
 * @param id - Which integration to render.
 * @param ctx - Credentials, the update callback, and sync status.
 * @returns That integration's existing settings card.
 * @remarks A switch rather than a lookup table because the cards do not share
 *          a prop shape: three of them read the credentials context directly
 *          and take none at all.
 */
function IntegrationCard({ id, ctx }: { id: CatalogId; ctx: CardContext }) {
  const { credentials, onUpdate, syncing, lastSyncedAt, syncedCount } = ctx;
  const shared = { credentials, onUpdate, syncing, lastSyncedAt };
  switch (id) {
    case "gcal":
      return <GoogleCalendarSettings />;
    case "canvas":
      return <CanvasSettings {...shared} syncedCount={syncedCount.canvas} />;
    case "gradescope":
      return <GradescopeSettings {...shared} syncedCount={syncedCount.gradescope} />;
    case "pensieve":
      return <PensieveSettings {...shared} syncedCount={syncedCount.pensieve} />;
    case "brightspace":
      return <BrightspaceSettings {...shared} syncedCount={syncedCount.brightspace} />;
    case "blackboard":
      return <BlackboardSettings {...shared} syncedCount={syncedCount.blackboard} />;
    case "classroom":
      return <GoogleClassroomSettings />;
    case "syllabus":
      return <SyllabusSettings />;
  }
}

/**
 * One connected integration.
 *
 * Providers whose whole connection is a set of credential columns render the
 * shared disclosure card, which puts every account - and disconnecting - behind
 * a dropdown. Google Calendar and Classroom keep their own cards: one is an
 * OAuth grant with its own revoke flow and the other rides on that grant.
 */
function ConnectedEntry({ entry, ctx }: { entry: CatalogEntry; ctx: CardContext }) {
  const { credentials, onUpdate } = ctx;
  if (hasDisclosure(entry.id)) {
    return (
      <ConnectedIntegration
        provider={entry.id}
        label={entry.label}
        credentials={credentials}
        onUpdate={onUpdate}
      />
    );
  }
  return <IntegrationCard id={entry.id} ctx={ctx} />;
}

/** Small uppercase heading separating the two groups. */
function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-wider uppercase text-subtle-foreground mb-2 px-1">
      {children}
    </p>
  );
}

interface IntegrationListProps {
  credentials: IntegrationCredentials;
  onUpdate: (updated: IntegrationCredentials) => void;
}

/**
 * Renders every integration, connected ones first.
 *
 * @param credentials - The user's current integration credentials.
 * @param onUpdate - Callback the cards use to publish credential changes.
 * @returns Two labelled groups, or one when everything is in the same state.
 * @remarks The headings are dropped when a group is empty, so a brand new
 *          account sees a plain list rather than an "Connected" heading over
 *          nothing.
 */
export default function IntegrationList({ credentials, onUpdate }: IntegrationListProps) {
  const { syncing, lastSyncedAt, syncResult } = useTaskContext();
  const { connected, available } = splitByConnection(credentials);

  const ctx: CardContext = {
    credentials,
    onUpdate,
    syncing,
    lastSyncedAt,
    syncedCount: {
      canvas: syncResult?.canvas.synced,
      gradescope: syncResult?.gradescope.synced,
      pensieve: syncResult?.pensieve.synced,
      brightspace: syncResult?.brightspace?.synced,
      blackboard: syncResult?.blackboard?.synced,
    },
  };

  return (
    <div className="space-y-6">
      {connected.length > 0 && (
        <div>
          <GroupHeading>Connected · {connected.length}</GroupHeading>
          <div className="space-y-3">
            {connected.map((entry) => (
              <ConnectedEntry key={entry.id} entry={entry} ctx={ctx} />
            ))}
          </div>
        </div>
      )}

      {available.length > 0 && (
        <div>
          {connected.length > 0 && <GroupHeading>Available</GroupHeading>}
          <div className="space-y-3">
            {available.map((entry) => (
              <IntegrationCard key={entry.id} id={entry.id} ctx={ctx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
