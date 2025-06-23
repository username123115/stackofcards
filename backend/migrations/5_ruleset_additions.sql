alter table "ruleset"
add column published boolean not null default false,
add column title text not null default '',
add column description text not null default '';
