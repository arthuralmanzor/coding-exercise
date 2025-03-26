create policy "own like courses only"
on "public"."courses_likes"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));
