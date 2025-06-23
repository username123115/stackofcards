create table "ruleset"
(
	ruleset_id 		uuid primary key 		default uuid_generate_v1mc(),
	created_at 		timestamptz 			not null default now(),
	updated_at 		timestamptz,

	config 			text 					not null,
	config_version 	integer default 0 		not null,

	based_on 		uuid references "ruleset" (ruleset_id),
	owner 			uuid references "user" (user_id)
);

SELECT trigger_updated_at('"ruleset"')
