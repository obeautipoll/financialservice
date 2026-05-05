-- About page CMS seed/upsert for Supabase.
-- Run this after supabase/cms_schema.sql if the About page or its sections are missing.
-- No new table is required: the admin About editor uses cms_pages, cms_sections, and cms_section_items.

insert into public.cms_pages (
  slug,
  nav_label,
  page_title,
  page_description,
  seo_title,
  seo_description,
  hero_title,
  hero_body,
  hero_primary_button_label,
  hero_primary_button_url,
  hero_image_url,
  hero_visible,
  is_published,
  sort_order
)
values (
  'about-us',
  'ABOUT US',
  'About Team',
  'Meet the people behind our financial services team and learn how we support clients.',
  'About Us',
  'Learn about our team, history, and mission.',
  'About Team',
  'Meet the professionals who help individuals and families make confident financial decisions.',
  'Learn More',
  '/contact',
  '',
  true,
  true,
  2
)
on conflict (slug) do update
set
  nav_label = excluded.nav_label,
  page_title = excluded.page_title,
  page_description = excluded.page_description,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  hero_title = excluded.hero_title,
  hero_body = excluded.hero_body,
  hero_primary_button_label = excluded.hero_primary_button_label,
  hero_primary_button_url = excluded.hero_primary_button_url,
  hero_visible = excluded.hero_visible,
  is_published = excluded.is_published,
  sort_order = excluded.sort_order;

with about_page as (
  select id
  from public.cms_pages
  where slug = 'about-us'
)
insert into public.cms_sections (
  page_id,
  section_key,
  section_label,
  section_type,
  title,
  body,
  sort_order,
  is_active
)
select id, 'our-team', 'Our Team', 'cards', 'Our Team', 'Edit team members from the About page admin card.', 1, true
from about_page
union all
select id, 'history', 'History', 'list', 'History', 'Edit timeline items from the About page admin card.', 2, true
from about_page
union all
select id, 'our-interns', 'Our Interns', 'cta', 'Our Interns', 'Share internship or career information here.', 3, true
from about_page
on conflict (page_id, section_key) do update
set
  section_label = excluded.section_label,
  section_type = excluded.section_type,
  title = excluded.title,
  body = excluded.body,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

with team_section as (
  select s.id
  from public.cms_sections s
  join public.cms_pages p on p.id = s.page_id
  where p.slug = 'about-us'
    and s.section_key = 'our-team'
),
team_items(title, subtitle, body, sort_order) as (
  values
    ('Team Member 1', 'Financial Advisor', 'Add a short description for this team member.', 1),
    ('Team Member 2', 'Financial Advisor', 'Add a short description for this team member.', 2),
    ('Team Member 3', 'Financial Advisor', 'Add a short description for this team member.', 3)
)
insert into public.cms_section_items (
  section_id,
  title,
  subtitle,
  body,
  image_url,
  link_label,
  link_url,
  sort_order,
  is_active
)
select
  team_section.id,
  team_items.title,
  team_items.subtitle,
  team_items.body,
  '',
  '',
  '',
  team_items.sort_order,
  true
from team_section
cross join team_items
where not exists (
  select 1
  from public.cms_section_items existing
  where existing.section_id = team_section.id
    and existing.title = team_items.title
);

with history_section as (
  select s.id
  from public.cms_sections s
  join public.cms_pages p on p.id = s.page_id
  where p.slug = 'about-us'
    and s.section_key = 'history'
),
history_items(title, subtitle, body, sort_order) as (
  values
    ('Company Foundation', 'Year Founded', 'Add the first major milestone for the team here.', 1),
    ('Team Growth', 'Growth Milestone', 'Add a second milestone or important team update here.', 2)
)
insert into public.cms_section_items (
  section_id,
  title,
  subtitle,
  body,
  image_url,
  link_label,
  link_url,
  sort_order,
  is_active
)
select
  history_section.id,
  history_items.title,
  history_items.subtitle,
  history_items.body,
  '',
  '',
  '',
  history_items.sort_order,
  true
from history_section
cross join history_items
where not exists (
  select 1
  from public.cms_section_items existing
  where existing.section_id = history_section.id
    and existing.title = history_items.title
);
