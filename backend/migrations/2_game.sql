create table ruleset
(
	ruleset_id  		uuid primary key 						default uuid_generate_v1mc(),
	maximum_players 	int not null
						check (maximum_players > 0 and maximum_players <= 100)
						default 2,

	title 				text not null 							default 'awesome card game',
	description 		text not null 							default '',

	-- Later add features that can define the behavior of games, for now assume Go Fish

	created_at 			timestamptz not null 					default now(),
	updated_at 			timestamptz
);

create type game_status_enum as enum (
	'WAITING_FOR_PLAYERS',
	'READY_TO_START',
	'IN_PROGRESS',
	'PAUSED',
	'FINISHED',
	'ABORTED'
);

create type game_visibility_enum as enum (
	'PUBLIC',
	'PRIVATE'
);

create table game
(
	game_id 			uuid primary key 						default uuid_generate_v1mc(),	
	ruleset_id  		uuid not null REFERENCES ruleset(ruleset_id),

	code 				varchar(6) unique not null
						check (char_length(code) = 6)
						check (code ~ '^[A-Z0-9]{6}$'),
	current_players 	int not null 							default 0,

	visibility 			game_visibility_enum not null 			default 'PRIVATE',
	status 				game_status_enum not null 				default 'WAITING_FOR_PLAYERS',

	created_at 			timestamptz not null 					default now(),
	updated_at 			timestamptz

);
CREATE INDEX idx_game_status_visibility ON game (status, visibility);

SELECT trigger_updated_at('"game"');
SELECT trigger_updated_at('"ruleset"');
