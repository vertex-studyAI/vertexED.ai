-- Daily operational retention; no learner content or AI accounting is pruned.
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule(
  'vertexed-rate-limit-retention-v1',
  '17 3 * * *',
  $job$
    select public.prune_waitlist_rate_limits(now() - interval '30 days');
    delete from cron.job_run_details
      where jobid = (select jobid from cron.job where jobname = 'vertexed-rate-limit-retention-v1')
        and end_time < now() - interval '30 days';
  $job$
);
