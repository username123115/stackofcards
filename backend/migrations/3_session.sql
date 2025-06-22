create table "sessions" 
(
	session 	uuid primary key 		default uuid_generate_v1mc(),
	reference 	uuid references "user" (user_id),
	created_at 	timestamptz 			not null default now(),
	expires 	timestamptz 			not null
);
