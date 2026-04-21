-- 004_indexes.sql
-- Performance indexes for current query patterns (filters, sorts, counters).
-- Idempotent: safe to run multiple times.

-- Places: common filters/sorts
CREATE INDEX IF NOT EXISTS idx_places_district
  ON public.places (district);

CREATE INDEX IF NOT EXISTS idx_places_category
  ON public.places (category);

CREATE INDEX IF NOT EXISTS idx_places_created_at_desc
  ON public.places (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_places_likes_count_desc
  ON public.places (likes_count DESC);

CREATE INDEX IF NOT EXISTS idx_places_views_desc
  ON public.places (views DESC);

-- Tips/events/housing: list ordering + ranking
CREATE INDEX IF NOT EXISTS idx_tips_created_at_desc
  ON public.tips (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tips_likes_count_desc
  ON public.tips (likes_count DESC);

CREATE INDEX IF NOT EXISTS idx_tips_views_desc
  ON public.tips (views DESC);

CREATE INDEX IF NOT EXISTS idx_events_date_asc
  ON public.events (date ASC);

CREATE INDEX IF NOT EXISTS idx_events_likes_count_desc
  ON public.events (likes_count DESC);

CREATE INDEX IF NOT EXISTS idx_events_views_desc
  ON public.events (views DESC);

CREATE INDEX IF NOT EXISTS idx_housing_created_at_desc
  ON public.housing (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_housing_district
  ON public.housing (district);

CREATE INDEX IF NOT EXISTS idx_housing_type
  ON public.housing (type);

CREATE INDEX IF NOT EXISTS idx_housing_min_price
  ON public.housing (min_price);

CREATE INDEX IF NOT EXISTS idx_housing_likes_count_desc
  ON public.housing (likes_count DESC);

CREATE INDEX IF NOT EXISTS idx_housing_views_desc
  ON public.housing (views DESC);

-- Comments: frequent read by item and ordered by created_at
CREATE INDEX IF NOT EXISTS idx_comments_item_created
  ON public.comments (item_type, item_id, created_at ASC);

-- Card views: unique view lookup and group counting
CREATE INDEX IF NOT EXISTS idx_card_views_item_created
  ON public.card_views (item_type, item_id, created_at DESC);

-- Likes: fast lookup in toggleLike/getUserLikes and aggregations
CREATE INDEX IF NOT EXISTS idx_likes_item_user
  ON public.likes (item_type, item_id, user_id);

CREATE INDEX IF NOT EXISTS idx_likes_item_created
  ON public.likes (item_type, item_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_likes_user_item
  ON public.likes (user_id, item_type, item_id);
