import * as Blockly from 'blockly/core';

function generatedTypedBlockGet(name: String, blockName: String) {
	return {
		type: blockName,
		message0: "%1",
		args0: [
			{
				type: "field_variable",
				name: "VAR",
				variable: "%{BKY_VARIABLES_DEFAULT_NAME}",
				variableTypes: [name],
				defaultType: name,
				check: name,
			}

		],
	}
}

const REMADE_IF_ELSE = {
	"type": "socs_remade_if_else",
	"tooltip": "",
	"helpUrl": "",
	"message0": "if %1 do %2 else %3",
	"args0": [
		{
			"type": "input_value",
			"name": "IF",
			"check": "Boolean"
		},
		{
			"type": "input_statement",
			"name": "DO",
			"check": "any"
		},
		{
			"type": "input_statement",
			"name": "ELSE",
			"check": "any"
		}
	],
	"previousStatement": "any",
	"nextStatement": "any",
	"colour": 210
}


const PHASE_JSON = {
	type: "socs_phase",
	tooltip: "Game phase",
	message0: "phase %1",
	args0: [
		{
			type: "field_input",
			name: "PHASE",
			text: "phase",

		}
	],
	nextStatement: "any",
	colour: 60
}

const SHUFFLE_JSON = {
	"type": "socs_shuffle",
	"tooltip": "",
	"helpUrl": "",
	"message0": "shuffle %1",
	"args0": [
		{
			"type": "input_value",
			"name": "NAME",
			"check": ["socs_t_zones", "socs_t_zone"]
		}
	],
	"previousStatement": "any",
	"nextStatement": "any",
	"colour": 250,
}

const INIT_ZONE = {
	"type": "socs_init_zone",
	"tooltip": "",
	"helpUrl": "",
	"message0": "zone named %1 %2",
	"args0": [
		{
			"type": "field_variable",
			"name": "NAME",
			"variable": "item"
		},
		{
			"type": "input_dummy",
			"name": "zonetarget"
		}
	],
	"output": "socs_t_zone",
	"colour": 250,
}

const GEN_CARDS = {
	"type": "socs_gen_cards",
	"tooltip": "",
	"helpUrl": "",
	"message0": "generate cards %1 into %2",
	"args0": [
		{
			"type": "field_variable",
			"name": "NAME",
			"variable": "item"
		},
		{
			"type": "input_value",
			"name": "NAME",
			"check": "socs_t_zone"
		}
	],
	"previousStatement": "any",
	"nextStatement": "any",
	"colour": 250,
}

const OFFER = {
	"type": "socs_offer",
	"tooltip": "",
	"helpUrl": "",
	"message0": "offer to %1 as %2 %3 %4",
	"args0": [
		{
			"type": "input_value",
			"name": "PLAYER_SELECTION",
			"check": ["socs_t_player", "socs_t_player_sel"],
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
			"name": "PLAYER"
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

const OFFER_DECLARELESS = {
	"type": "socs_offer_declareless",
	"tooltip": "",
	"helpUrl": "",
	"message0": "offer to %1 %2 %3",
	"args0": [
		{
			"type": "input_value",
			"name": "PLAYER_SELECTION",
			"check": ["socs_t_player", "socs_t_player_sel"],
		},
		{
			"type": "input_dummy",
			"name": "PLAYER"
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


const OFFER_CASE = {
	"type": "socs_offer_case",
	"tooltip": "",
	"helpUrl": "",
	"message0": "only if %1 choices %2 handle %3",
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
			"name": "ACTIONS"
		}
	],
	"previousStatement": ["socs_offer", "socs_t_case"],
	"nextStatement": ["socs_t_case"],
	"colour": 100,
}

const OFFER_CASE_ANY = {
	"type": "socs_offer_case_any",
	"tooltip": "",
	"helpUrl": "",
	"message0": "choices %1 handle %2",
	"args0": [
		{
			"type": "input_statement",
			"name": "OFFERS",
			"check": "socs_t_choice",
		},
		{
			"type": "input_statement",
			"name": "ACTIONS"
		}
	],
	"previousStatement": ["socs_offer", "socs_t_case"],
	"nextStatement": ["socs_t_case"],
	"colour": 100,
}

const PLAYER_GET = {
	"type": "socs_player_get",
	"tooltip": "",
	"helpUrl": "",
	"message0": "player %1 %2",
	"args0": [
		{
			"type": "field_dropdown",
			"name": "PLAYER",
			"options": [
				[
					"todo",
					"TODO"
				]
			]
		},
		{
			"type": "input_dummy",
			"name": "DUMMY"
		}
	],
	"output": "socs_t_player",
	"colour": 40
}

const CARD_GET = {
	"type": "socs_card_get",
	"tooltip": "",
	"helpUrl": "",
	"message0": "card %1 %2",
	"args0": [
		{
			"type": "field_dropdown",
			"name": "CARD",
			"options": [
				[
					"todo",
					"TODO"
				]
			]
		},
		{
			"type": "input_dummy",
			"name": "DUMMY"
		}
	],
	"output": "socs_t_card",
	"colour": 20,
}

const PLAYER_CURRENT = {
	"type": "socs_player_current",
	"tooltip": "",
	"helpUrl": "",
	"message0": "current player",
	"output": "socs_t_player",
	"colour": 40
}

const PLAYER_OF_TYPE = {
	"type": "socs_player_of_type",
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
			"type": "field_dropdown",
			"name": "TYPE",
			"options": [
				[
					"todo",
					"TODO"
				]
			]
		},
		{
			"type": "input_dummy",
			"name": "DUMMY"
		}
	],
	"output": "Boolean",
	"colour": 210,
}

const PLAYERS_ALL = {
	"type": "socs_players_all",
	"tooltip": "",
	"helpUrl": "",
	"message0": "all players",
	"output": "socs_t_player_sel",
	"colour": 60
}

const PLAYER_ADVANCE = {
	"type": "socs_player_advance",
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

const PLAYER_ADVANCE_TYPE = {
	"type": "socs_player_advance_type",
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

const CHOICE_PLAYER = {
	"type": "socs_choice_player",
	"tooltip": "",
	"helpUrl": "",
	"message0": "any player from %1 as %2 %3",
	"args0": [
		{
			"type": "input_value",
			"name": "PLAYERS",
			"check": [
				"socs_t_player",
				"socs_t_player_sel"
			]
		},
		{
			"type": "field_dropdown",
			"name": "AS",
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
	"previousStatement": ["socs_t_choice"],
	"nextStatement": "socs_t_choice",
	"colour": 90
}

const CHOICE_PLAYER_SEL = {
	"type": "socs_choice_player_sel",
	"tooltip": "",
	"helpUrl": "",
	"message0": "any set of players from %1 as %2 %3",
	"args0": [
		{
			"type": "input_value",
			"name": "PLAYERS",
			"check": [
				"socs_t_player",
				"socs_t_player_sel"
			]
		},
		{
			"type": "field_dropdown",
			"name": "AS",
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
	"previousStatement": ["socs_t_choice"],
	"nextStatement": "socs_t_choice",
	"colour": 90
}

const CHOICE_CARD = {
	"type": "socs_choice_card",
	"tooltip": "",
	"helpUrl": "",
	"message0": "any card from %1 as %2 %3",
	"args0": [
		{
			"type": "input_value",
			"name": "PLAYERS",
			"check": [
				"socs_t_zone",
				"socs_t_zone_sel"
			]
		},
		{
			"type": "field_dropdown",
			"name": "AS",
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
	"previousStatement": ["socs_t_choice"],
	"nextStatement": "socs_t_choice",
	"colour": 90
}


export default function generateBlockDefinitions() {
	Blockly.defineBlocksWithJsonArray([REMADE_IF_ELSE, PHASE_JSON, SHUFFLE_JSON, INIT_ZONE, GEN_CARDS, OFFER_CASE, OFFER, OFFER_DECLARELESS, OFFER_CASE_ANY, PLAYER_GET, PLAYER_OF_TYPE, PLAYER_ADVANCE, PLAYER_ADVANCE_TYPE, PLAYER_CURRENT, PLAYERS_ALL, CHOICE_PLAYER, CHOICE_PLAYER_SEL, CARD_GET, CHOICE_CARD]);
	Blockly.Blocks['socs_enter_phase'] = {
		init: function(this: Blockly.Block) {
			const currentWorkspace = this.workspace;
			const getPhaseOptions = function(): Blockly.MenuOption[] {
				const options: [string, string][] = [];
				const blocks = currentWorkspace.getAllBlocks(false);

				for (let i = 0; i < blocks.length; i++) {
					const block = blocks[i];
					if (block.type === 'socs_phase') {
						const phaseName = block.getFieldValue('PHASE');
						if (phaseName) {
							options.push([phaseName, phaseName]);
						}
					}
				}

				// Add a default option if no phases are found
				if (options.length === 0) {
					options.push(['(define a phase)', '']);
				}

				return options;
			};
			this.appendDummyInput()
				.appendField("enter phase")
				.appendField(new Blockly.FieldDropdown(getPhaseOptions), "PHASE_NAME"); // Use the dynamic options function
			this.setPreviousStatement(true, null);
			this.setColour(60); // Keep the same colour as the phase definition block
			this.setTooltip("Enter a specific game phase");
			this.setHelpUrl(""); // Add a help URL if needed
		}
	};
	Blockly.Blocks['socs_choice_unified'] = {
		init: function(this: Blockly.Block) {
			// Dropdown options and their corresponding input checks
			const choiceOptions = [
				['any player', 'PLAYER', ['socs_t_player', 'socs_t_player_sel']],
				['any set of players', 'PLAYER_SET', ['socs_t_player_sel']],
				['any card', 'CARD', ['socs_t_zone', 'socs_t_zone_sel']]
			];

			// Function to update the source input's check based on dropdown selection
			const updateSourceCheck = (block: Blockly.Block, choiceValue: string) => {
				const sourceInput = block.getInput('SOURCE');
				if (sourceInput) {
					const option = choiceOptions.find(opt => opt[1] === choiceValue);
					if (option) {
						// Set the allowed connection types
						sourceInput.setCheck(option[2] as string[]);
					}
				}
			};

			// Create the dropdown field
			const choiceDropdown = new Blockly.FieldDropdown(
				choiceOptions.map(opt => [opt[2][0], opt[2][1]]), // Map to [displayText, value]
			);

			function validator(newValue: string) {
				// This is the callback function triggered when the dropdown value changes
				const block = choiceDropdown.getSourceBlock();
				if (block) {
					updateSourceCheck(block, newValue);
				}
				return newValue;
			}

			choiceDropdown.setValidator(validator);

			this.appendDummyInput()
				.appendField("Choose")
				.appendField(choiceDropdown, "CHOICE_TYPE")
				.appendField("from");

			this.appendValueInput("SOURCE")
				.setCheck(['socs_t_player', 'socs_t_player_sel']);

			this.appendDummyInput()
				.appendField("as")
				.appendField(new Blockly.FieldDropdown([
					[
						"todo",
						"TODO"
					]
				]), "AS");

			this.appendDummyInput("DUMMY");

			this.setPreviousStatement(true, ["socs_t_choice"]);
			this.setNextStatement(true, "socs_t_choice");
			this.setColour(90);
			this.setTooltip("Defines a choice option for a player offer, dynamically adjusting allowed input types.");
			this.setHelpUrl(""); // Add a help URL if available

			updateSourceCheck(this, this.getFieldValue('CHOICE_TYPE'));
		}
	};
}
