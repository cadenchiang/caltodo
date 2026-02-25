-- Friendships table with connection request flow (LinkedIn-style).
-- requester_id sends a request to receiver_id.
-- Status: 'pending' (awaiting accept) or 'accepted' (connected).

CREATE TABLE public.friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT no_self_friend CHECK (requester_id != receiver_id)
);

-- Unique index ensuring only one request per pair regardless of direction
CREATE UNIQUE INDEX idx_friendships_pair
  ON public.friendships (LEAST(requester_id, receiver_id), GREATEST(requester_id, receiver_id));

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Users can see friendships they are part of
CREATE POLICY "Users can view own friendships" ON public.friendships
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Users can create friendship requests (they must be the requester)
CREATE POLICY "Users can create friend requests" ON public.friendships
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- Receiver can update status (accept/decline)
CREATE POLICY "Receiver can update friend request" ON public.friendships
  FOR UPDATE USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Either party can delete the friendship
CREATE POLICY "Users can delete own friendships" ON public.friendships
  FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
