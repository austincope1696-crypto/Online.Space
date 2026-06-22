-- profile customization: accent color and cover image for the public "stage"
alter table public.spaces add column if not exists accent_color text default '#00ffd1';
alter table public.spaces add column if not exists cover_url text;
