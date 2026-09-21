-- L8 (2026-09-21 audit): board_layouts had no DELETE policy, so
-- DELETE /api/board-layout ("reset my board") ran as the user, affected 0
-- rows under RLS, and still reported success. Owners may delete their own
-- row; nothing else changes.

drop policy if exists "Users can delete own board layout" on public.board_layouts;

create policy "Users can delete own board layout"
  on public.board_layouts for delete
  using (auth.uid() = user_id);
