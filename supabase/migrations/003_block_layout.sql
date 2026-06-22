-- block-based customizable profile layout — the foundation for endless future block types
alter table public.spaces add column if not exists layout jsonb default '[]';
