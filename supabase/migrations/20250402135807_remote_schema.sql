alter table "public"."mood_entries" drop constraint "mood_entries_user_id_fkey";

alter table "public"."profiles" drop constraint "profiles_id_fkey";

alter table "public"."mood_entries" alter column "created_at" set not null;

alter table "public"."mood_entries" alter column "date" drop default;

alter table "public"."mood_entries" alter column "date" set not null;

alter table "public"."mood_entries" alter column "date" set data type date using "date"::date;

alter table "public"."mood_entries" alter column "id" set default uuid_generate_v4();

alter table "public"."mood_entries" alter column "mood" set data type character varying(20) using "mood"::character varying(20);

alter table "public"."mood_entries" alter column "updated_at" drop default;

CREATE INDEX idx_mood_entries_date ON public.mood_entries USING btree (date);

CREATE INDEX idx_mood_entries_mood ON public.mood_entries USING btree (mood);

CREATE UNIQUE INDEX idx_mood_entries_user_date ON public.mood_entries USING btree (user_id, date);

CREATE INDEX idx_mood_entries_user_id ON public.mood_entries USING btree (user_id);

alter table "public"."mood_entries" add constraint "mood_entries_mood_check" CHECK (((mood)::text = ANY ((ARRAY['great'::character varying, 'good'::character varying, 'neutral'::character varying, 'low'::character varying, 'terrible'::character varying])::text[]))) not valid;

alter table "public"."mood_entries" validate constraint "mood_entries_mood_check";

alter table "public"."mood_entries" add constraint "mood_entries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."mood_entries" validate constraint "mood_entries_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

set check_function_bodies = off;

create or replace view "public"."mood_statistics" as  SELECT mood_entries.user_id,
    count(*) AS total_entries,
    count(*) FILTER (WHERE ((mood_entries.mood)::text = 'great'::text)) AS great_count,
    count(*) FILTER (WHERE ((mood_entries.mood)::text = 'good'::text)) AS good_count,
    count(*) FILTER (WHERE ((mood_entries.mood)::text = 'neutral'::text)) AS neutral_count,
    count(*) FILTER (WHERE ((mood_entries.mood)::text = 'low'::text)) AS low_count,
    count(*) FILTER (WHERE ((mood_entries.mood)::text = 'terrible'::text)) AS terrible_count,
    round((((count(*) FILTER (WHERE ((mood_entries.mood)::text = 'great'::text)))::numeric / (count(*))::numeric) * (100)::numeric), 2) AS great_percentage,
    round((((count(*) FILTER (WHERE ((mood_entries.mood)::text = 'good'::text)))::numeric / (count(*))::numeric) * (100)::numeric), 2) AS good_percentage,
    round((((count(*) FILTER (WHERE ((mood_entries.mood)::text = 'neutral'::text)))::numeric / (count(*))::numeric) * (100)::numeric), 2) AS neutral_percentage,
    round((((count(*) FILTER (WHERE ((mood_entries.mood)::text = 'low'::text)))::numeric / (count(*))::numeric) * (100)::numeric), 2) AS low_percentage,
    round((((count(*) FILTER (WHERE ((mood_entries.mood)::text = 'terrible'::text)))::numeric / (count(*))::numeric) * (100)::numeric), 2) AS terrible_percentage
   FROM mood_entries
  GROUP BY mood_entries.user_id;


CREATE OR REPLACE FUNCTION public.update_modified_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

create policy "Users can update own profile"
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can view own profile"
on "public"."profiles"
as permissive
for select
to public
using ((auth.uid() = id));


CREATE TRIGGER set_mood_entries_updated_at BEFORE UPDATE ON public.mood_entries FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_modified_column();


