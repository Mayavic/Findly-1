grant select on public.waitlist to authenticated;

create policy "Admins can view waitlist"
  on waitlist for select
  to authenticated
  using (
    (auth.jwt() ->> 'email') in (
      'ludovic.desgranges@newscore.fr',
      'victoire.gastaud10@gmail.com',
      'maiwenchio@yahoo.fr'
    )
  );
