alter table "ruleset"
add column owner_name text;

update "ruleset" rs
set owner_name = u.username
from "user" u
where rs.owner = u.user_id;

alter table "ruleset"
alter column owner_name set not null;
