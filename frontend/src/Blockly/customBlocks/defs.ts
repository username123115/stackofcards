export type InterpreterType = "socs_t_zone" | "socs_t_zone_sel" | "socs_t_card" | "socs_t_card_sel" | "socs_t_player" |
	"socs_t_player_sel" | "socs_t_order" | "socs_t_zone_class" | "socs_t_player_class" | "socs_t_rank" | "socs_t_suit"

export const TYPE_TO_HUE: { [key in InterpreterType]: number } = {
	"socs_t_zone": 230,
	"socs_t_zone_sel": 250,
	"socs_t_card": 80,
	"socs_t_card_sel": 100,
	"socs_t_player": 40,
	"socs_t_player_sel": 60,
	"socs_t_zone_class": 210,
	"socs_t_player_class": 40,
	"socs_t_order": 40,
	"socs_t_rank": 10,
	"socs_t_suit": 20,
}

export const F_VAR_DECL = "DECL";
export const F_VAR_GET = "GET";
export const F_DROPDOWN_TYPE = "CHOICE_TYPE";
export const F_BLOCK_LIST_OFFERS = "OFFERS";
export const F_SOURCE = "SOURCE";
export const F_DEST = "DEST";

export const B_IF_ELSE = "socs_remade_if_else"
export const B_WHILE = "socs_remade_while"
export const B_PHASE = "socs_phase"
export const B_SHUFFLE = "socs_shuffle"
export const B_GEN_CARDS = "socs_gen_cards"
export const B_DEAL_CARD = "socs_deal_cards"
export const B_OFFER = "socs_offer"
export const B_OFFER_DECLARELESS = "socs_offer_declareless"
export const B_OFFER_CASE = "socs_offer_case"
export const B_OFFER_CASE_ANY = "socs_offer_case_any"
export const B_PLAYER_ADVANCE = "socs_player_advance"
export const B_PLAYER_ADVANCE_TYPE = "socs_player_advance_type"
export const B_CARDS_MOVE = "socs_cards_move"
export const B_DECLARE_WINNER = "socs_declare_winner"
export const B_ZONE_FOR_PLAYER = "socs_zone_for_player"
export const B_SET_NUMBER = "socs_set_number"
export const B_ENTER_PHASE = "socs_enter_phase"

export const V_GET_UNIFIED = "socs_get_unified"

export const V_GET_NUMBER = "socs_get_number"
export const V_ZONES_OF_TYPE = "socs_zones_of_type"

export const V_CHOICE_UNIFIED = "socs_choice_unified"
export const V_CHOICE_MOVE = "socs_choice_move"

export const V_NUM_CARDS = "socs_num_cards"
export const V_CARD_SELECTOR = "socs_card_selector"

export const V_RANK_FROM_CARD = "socs_rank_from_card"
export const V_SUIT_FROM_CARD = "socs_suit_from_card"
export const V_CARDS_MATCHING_RANK = "socs_cards_matching_rank"
export const V_CARDS_MATCHING_SUIT = "socs_cards_matching_suit"

export const V_PLAYER_CURRENT = "socs_player_current"
export const V_PLAYER_OF_TYPE = "socs_player_of_type"
export const V_PLAYERS_ALL = "socs_players_all"

export const IF_ELSE = {
	"type": B_IF_ELSE,
	"tooltip": "",
	"helpUrl": "",
	"message0": "if %1 do %2 else %3",
	"args0": [
		{
			"type": "input_value",
			"name": "CONDITION",
			"check": "Boolean"
		},
		{
			"type": "input_statement",
			"name": "GO_TRUE",
			"check": "any"
		},
		{
			"type": "input_statement",
			"name": "GO_FALSE",
			"check": "any"
		}
	],
	"previousStatement": "any",
	"nextStatement": "any",
	"colour": 210
}

export const WHILE = {
	"type": B_WHILE,
	"tooltip": "",
	"helpUrl": "",
	"message0": "while %1 do %2",
	"args0": [
		{
			"type": "input_value",
			"name": "CONDITION",
			"check": "Boolean"
		},
		{
			"type": "input_statement",
			"name": "DO",
			"check": "any"
		},
	],
	"previousStatement": "any",
	"nextStatement": "any",
	"colour": 210
}

export const PHASE = {
	"type": B_PHASE,
	"tooltip": "Game phase",
	"message0": "phase %1",
	"args0": [
		{
			"type": "field_input",
			"name": "PHASE",
			"text": "phase",

		}
	],
	"nextStatement": "any",
	"colour": 60
}

export const SHUFFLE_JSON = {
	"type": B_SHUFFLE,
	"tooltip": "",
	"helpUrl": "",
	"message0": "shuffle %1",
	"args0": [
		{
			"type": "input_value",
			"name": "ZONES",
			"check": ["socs_t_zones", "socs_t_zone"]
		}
	],
	"previousStatement": "any",
	"nextStatement": "any",
	"colour": 250,
}

//TODO, more dropdown options
export const GEN_CARDS = {
	"type": B_GEN_CARDS,
	"tooltip": "",
	"helpUrl": "",
	"message0": "generate cards %1 into %2",
	"args0": [
		{
			"type": "field_dropdown",
			"name": "CARDS",
			"options": [
				[
					"all allowed",
					"ALL"
				]
			]
		},
		{
			"type": "input_value",
			"name": "DEST",
			"check": "socs_t_zone"
		}
	],
	"previousStatement": "any",
	"nextStatement": "any",
	"colour": 250,
}

export const DEAL_CARD = {
	"type": B_DEAL_CARD,
	"tooltip": "",
	"helpUrl": "",
	"message0": "deal %1 cards from %2 into %3",
	"args0": [
		{
			"type": "input_value",
			"name": "NUM_CARDS",
			"check": "Number",

		},
		{
			"type": "input_value",
			"name": "SOURCE",
			"check": "socs_t_zone",
		},
		{
			"type": "input_value",
			"name": "DEST",
			"check": ["socs_t_zone", "socs_t_zone_sel"]
		}
	],
	"previousStatement": "any",
	"nextStatement": "any",
	"inputsInline": true,
	"colour": 250,
}

export const NUM_CARDS = {
	"type": V_NUM_CARDS,
	"tooltip": "",
	"helpUrl": "",
	"message0": "# cards in %1",
	"args0": [
		{
			"type": "input_value",
			"check": ["socs_t_card", "socs_t_card_sel"],
			"name": "CARD_COLLECTION"
		}
	],
	"output": "Number",
	"colour": 210
}

export const CARD_SELECTOR = {
	"type": V_CARD_SELECTOR,
	"tooltip": "",
	"helpUrl": "",
	"message0": "%1 in %2",
	"args0": [
		{
			"type": "field_dropdown",
			"name": "SELCTOR",
			"options": [
				[
					"top card",
					"TOP"
				],
				[
					"bottom card",
					"BOTTOM"
				],
				[
					"all cards",
					"ALL"
				]
			]
		},
		{
			"type": "input_value",
			"name": "ZONE",
			"check": "socs_t_zone"
		}
	],
	"output": "socs_t_card_sel",
	"colour": TYPE_TO_HUE["socs_t_card_sel"],
	"inputsInline": true
}

export const OFFER = {
	"type": B_OFFER,
	"tooltip": "",
	"helpUrl": "",
	"message0": "offer to %1 as %2 %3 %4",
	"args0": [
		{
			"type": "input_value",
			"name": "OFFER_TO",
			"check": ["socs_t_player", "socs_t_player_sel"],
		},
		{
			"type": "field_input",
			"name": "PLAYER_NAME",
			"text": "var",
		},
		{
			"type": "input_dummy",
			"name": "IDK_WHAT_THIS_DUMMY_DOES"
		},
		{
			"type": "input_statement",
			"name": "CASES",
			"check": "socs_t_case",
		}
	],
	"previousStatement": "any",
	"nextStatement": "any",
	"colour": 100,
}

export const OFFER_DECLARELESS = {
	"type": B_OFFER_DECLARELESS,
	"tooltip": "",
	"helpUrl": "",
	"message0": "offer to %1 %2 %3",
	"args0": [
		{
			"type": "input_value",
			"name": "OFFER_TO",
			"check": ["socs_t_player", "socs_t_player_sel"],
		},
		{
			"type": "input_dummy",
			"name": "IDK_WHAT_THIS_DUMMY_DOES"
		},
		{
			"type": "input_statement",
			"name": "CASES",
			"check": "socs_t_case",
		}
	],
	"previousStatement": "any",
	"nextStatement": "any",
	"colour": 100,
}


export const OFFER_CASE = {
	"type": B_OFFER_CASE,
	"tooltip": "",
	"helpUrl": "",
	"message0": "only if %1 choices %2 handle %3 %4",
	"args0": [
		{
			"type": "input_value",
			"name": "FILTER",
			"check": "Boolean"
		},
		{
			"type": "input_statement",
			"name": "OFFERS",
			"check": "socs_t_choice"
		},
		{
			"type": "input_statement",
			"name": "ACTIONS",
			"check": "any",
		},
		{
			"type": "field_input",
			"name": "PROMPT",
			"text": "",
		}
	],
	"previousStatement": ["socs_offer", "socs_t_case"],
	"nextStatement": ["socs_t_case"],
	"colour": 100,
}

export const OFFER_CASE_ANY = {
	"type": B_OFFER_CASE_ANY,
	"tooltip": "",
	"helpUrl": "",
	"message0": "choices %1 handle %2 %3",
	"args0": [
		{
			"type": "input_statement",
			"name": "OFFERS",
			"check": "socs_t_choice",
		},
		{
			"type": "input_statement",
			"name": "ACTIONS",
			"check": "any",
		},
		{
			"type": "field_input",
			"name": "PROMPT",
			"text": "",
		}
	],
	"previousStatement": ["socs_offer", "socs_t_case"],
	"nextStatement": ["socs_t_case"],
	"colour": 100,
}

export const PLAYER_CURRENT = {
	"type": V_PLAYER_CURRENT,
	"tooltip": "",
	"helpUrl": "",
	"message0": "current player",
	"output": "socs_t_player",
	"colour": TYPE_TO_HUE["socs_t_player"]
}

export const PLAYER_OF_TYPE = {
	"type": V_PLAYER_OF_TYPE,
	"tooltip": "",
	"helpUrl": "",
	"message0": "player %1 is %2 %3",
	"args0": [
		{
			"type": "input_value",
			"name": "PLAYER",
			"check": "socs_t_player"
		},
		{
			"type": "input_value",
			"name": "TYPE_NAME",
			"check": "socs_t_player_class",
		},
		{
			"type": "input_dummy",
			"name": "DUMMY"
		}
	],
	"output": "Boolean",
	"colour": 210,
}

export const PLAYERS_ALL = {
	"type": V_PLAYERS_ALL,
	"tooltip": "",
	"helpUrl": "",
	"message0": "all players",
	"output": "socs_t_player_sel",
	"colour": TYPE_TO_HUE["socs_t_player_sel"],
}

export const PLAYER_ADVANCE = {
	"type": B_PLAYER_ADVANCE,
	"tooltip": "",
	"helpUrl": "",
	"message0": "advance player state by %1",
	"args0": [
		{
			"type": "input_value",
			"name": "ADVANCE",
			"check": "Number"
		}
	],
	"previousStatement": "any",
	"nextStatement": "any",
	"colour": 15
}

export const PLAYER_ADVANCE_TYPE = {
	"type": B_PLAYER_ADVANCE_TYPE,
	"tooltip": "",
	"helpUrl": "",
	"message0": "advance player state by %1 of type %2 %3",
	"args0": [
		{
			"type": "input_value",
			"name": "ADVANCE",
			"check": "Number"
		},
		{
			"type": "field_dropdown",
			"name": "NAME",
			"options": [
				[
					"todo",
					"TODO"
				]
			]
		},
		{
			"type": "input_dummy",
			"name": "NAME"
		}
	],
	"previousStatement": "any",
	"nextStatement": "any",
	"colour": 15
}

export const CHOICE_MOVE = {
	"type": V_CHOICE_MOVE,
	"tooltip": "",
	"helpUrl": "",
	"message0": "move any from %1 to %2",
	"args0": [
		{
			"type": "input_value",
			"name": "SOURCE",
			"check": "socs_t_zone"
		},
		{
			"type": "input_value",
			"name": "DEST",
			"check": "socs_t_zone"
		}
	],
	"previousStatement": "socs_t_choice",
	"nextStatement": "socs_t_choice",
	"colour": 90,
	"inputsInline": true
}

export const CARDS_MOVE = {
	"type": B_CARDS_MOVE,
	"tooltip": "",
	"helpUrl": "",
	"message0": "move cards %1 to %2",
	"args0": [
		{
			"type": "input_value",
			"name": "SOURCE",
			"check": ["socs_t_card", "socs_t_card_sel"]
		},
		{
			"type": "input_value",
			"name": "DEST",
			"check": "socs_t_zone"
		}
	],
	"previousStatement": "any",
	"nextStatement": "any",
	"colour": 80,
	"inputsInline": true
}

export const RANK_FROM_CARD = {
	"type": V_RANK_FROM_CARD,
	"tooltip": "",
	"helpUrl": "",
	"message0": "rank of %1",
	"args0": [
		{
			"type": "input_value",
			"name": "NAME",
			"check": "socs_t_card"
		}
	],
	"output": "socs_t_rank",
	"colour": TYPE_TO_HUE["socs_t_rank"],
}

export const SUIT_FROM_CARD = {
	"type": V_SUIT_FROM_CARD,
	"tooltip": "",
	"helpUrl": "",
	"message0": "suit of %1",
	"args0": [
		{
			"type": "input_value",
			"name": "NAME",
			"check": "socs_t_card"
		}
	],
	"output": "socs_t_suit",
	"colour": TYPE_TO_HUE["socs_t_suit"],
}

export const CARDS_MATCHING_RANK = {
	"type": V_CARDS_MATCHING_RANK,
	"tooltip": "",
	"helpUrl": "",
	"message0": "cards in %1 matching rank %2",
	"args0": [
		{
			"type": "input_value",
			"name": "ZONE",
			"check": "socs_t_zone"
		},
		{
			"type": "input_value",
			"name": "RANK",
			"check": "socs_t_rank"
		}
	],
	"output": "socs_t_card_sel",
	"colour": TYPE_TO_HUE["socs_t_card_sel"],
	"inputsInline": true
}

export const CARDS_MATCHING_SUIT = {
	"type": V_CARDS_MATCHING_SUIT,
	"tooltip": "",
	"helpUrl": "",
	"message0": "cards in %1 matching suit %2",
	"args0": [
		{
			"type": "input_value",
			"name": "ZONE",
			"check": "socs_t_zone"
		},
		{
			"type": "input_value",
			"name": "RANK",
			"check": "socs_t_suit"
		}
	],
	"output": "socs_t_card_sel",
	"colour": TYPE_TO_HUE["socs_t_card_sel"],
	"inputsInline": true
}

export const DECLARE_WINNER = {
	"type": B_DECLARE_WINNER,
	"tooltip": "",
	"helpUrl": "",
	"message0": "declare %1 as winner",
	"args0": [
		{
			"type": "input_value",
			"name": "PLAYER",
			"check": "socs_t_player"
		}
	],
	"previousStatement": "any",
	"colour": 225
}

export const ALL_STATIC_DEFS = [IF_ELSE, PHASE, SHUFFLE_JSON, GEN_CARDS, OFFER_CASE,
	OFFER, OFFER_DECLARELESS, OFFER_CASE_ANY, PLAYER_OF_TYPE, PLAYER_ADVANCE, PLAYER_ADVANCE_TYPE,
	PLAYER_CURRENT, PLAYERS_ALL, DEAL_CARD, NUM_CARDS, WHILE, CARD_SELECTOR, CHOICE_MOVE, CARDS_MOVE,
	RANK_FROM_CARD, SUIT_FROM_CARD, CARDS_MATCHING_RANK, CARDS_MATCHING_SUIT, DECLARE_WINNER]

export const ALL_OFFER_CASES = [B_OFFER_CASE, B_OFFER_CASE_ANY]
