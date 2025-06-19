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
			"type": "field_input",
			"name": "PLAYER_NAME",
			"text": "var",
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
			"name": "ACTIONS",
			"check": "any",
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
			"name": "ACTIONS",
			"check": "any",
		}
	],
	"previousStatement": ["socs_offer", "socs_t_case"],
	"nextStatement": ["socs_t_case"],
	"colour": 100,
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

type InterpreterType = "socs_t_zone" | "socs_t_zone_sel" | "socs_t_card" | "socs_t_card_sel" | "socs_t_player" | "socs_t_player_sel"

// Given a type search for offer blocks that declare this variable
function getDeclaredVariables(block: Blockly.Block, targetType: InterpreterType): [string, string][] {
	const declarations: [string, string][] = [];
	let parentBlock: Blockly.Block | null = block.getSurroundParent();

	while (parentBlock) {
		if (["socs_offer_case", "socs_offer_case_any"].includes(parentBlock.type)) {
			//Iterate through the choices field looking for socs_choice_unified blocks
			const offerStatement = parentBlock.getInput('OFFERS');
			if (offerStatement && offerStatement.connection) {
				let childBlock = offerStatement.connection.targetBlock();
				while (childBlock) {
					if (childBlock.type === 'socs_choice_unified') {
						const choiceTypeDropdownValue = childBlock.getFieldValue('CHOICE_TYPE');
						const declaredVarName = childBlock.getFieldValue('AS');
						const declaredType = choiceTypeDropdownValue as InterpreterType;

						if (declaredType === targetType && declaredVarName && declaredVarName !== '') {
							if (!declarations.some(dec => dec[1] === declaredVarName)) {
								declarations.push([declaredVarName, declaredVarName]);
							}
						}
					}


					childBlock = childBlock.getNextBlock();
				}
			}
		} else if (parentBlock.type === 'socs_offer' && targetType === 'socs_t_player') {
			const playerName = parentBlock.getFieldValue('PLAYER_NAME');
			if (!declarations.some(dec => dec[1] === playerName)) {
				declarations.push([playerName, playerName]);
			}
		}
		parentBlock = parentBlock.getSurroundParent();
	}
	return declarations;
}

export default function generateBlockDefinitions() {
	Blockly.defineBlocksWithJsonArray([REMADE_IF_ELSE, PHASE_JSON, SHUFFLE_JSON, INIT_ZONE, GEN_CARDS, OFFER_CASE, OFFER, OFFER_DECLARELESS, OFFER_CASE_ANY, PLAYER_OF_TYPE, PLAYER_ADVANCE, PLAYER_ADVANCE_TYPE, PLAYER_CURRENT, PLAYERS_ALL]);
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
	Blockly.Blocks['socs_get_unified'] = {
		init: function(this: Blockly.Block) {
			const options: [string, InterpreterType][] = [
				["player", "socs_t_player"],
				["player selection", "socs_t_player_sel"],
				["card", "socs_t_card"],
				["card selection", "socs_t_card_sel"],
			]

			function typeValidator(newValue: string): string {
				const selectedType: InterpreterType = newValue as InterpreterType;
				const block = typeDropdown.getSourceBlock();
				if (block) {
					block.setOutput(true, selectedType);
					const fieldVar = block.getField('VARIABLE');
					if (fieldVar) {
						fieldVar.setValue("");
						fieldVar.forceRerender();
					}

				}

				return newValue;
			}

			function generateVariables(this: Blockly.FieldDropdown): Blockly.MenuOption[] {
				const block = this.getSourceBlock();
				if (block) {
					const selectedType = block.getFieldValue('TYPE');
					const outputType = selectedType as InterpreterType;
					const declaredOptions = getDeclaredVariables(block, outputType);
					if (declaredOptions.length) {
						return declaredOptions;
					}

				}
				return [["", ""]];
			}

			const typeDropdown = new Blockly.FieldDropdown(options, typeValidator);
			const varDropdown = new Blockly.FieldDropdown(generateVariables);

			this.appendDummyInput()
				.appendField(typeDropdown, "TYPE")
				.appendField("named")
				.appendField(varDropdown, "VARIABLE");

			this.setColour(60);

		}
	}

	Blockly.Blocks['socs_choice_unified'] = {
		init: function(this: Blockly.Block) {
			// Dropdown options and their corresponding input checks
			const choiceOptions: [string, InterpreterType, InterpreterType[]][] = [
				['player', 'socs_t_player', ['socs_t_player', 'socs_t_player_sel']],
				['set of players', 'socs_t_player_sel', ['socs_t_player', 'socs_t_player_sel']],
				['card', 'socs_t_card', ['socs_t_zone', 'socs_t_zone_sel']],
				['set of cards', 'socs_t_card_sel', ['socs_t_zone', 'socs_t_zone_sel']],
			];

			const updateSourceCheck = (block: Blockly.Block, choiceValue: string) => {
				const sourceInput = block.getInput('SOURCE');
				if (sourceInput) {
					const option = choiceOptions.find(opt => opt[1] === choiceValue);
					if (option) {
						sourceInput.setCheck(option[2] as string[]);
					}
				}
			};

			// Create the dropdown field
			const choiceDropdown = new Blockly.FieldDropdown(
				choiceOptions.map(opt => [opt[0], opt[1]]),
			);

			function validator(newValue: string) {
				const block = choiceDropdown.getSourceBlock();
				if (block) {
					updateSourceCheck(block, newValue);
				}
				return newValue;
			}

			choiceDropdown.setValidator(validator);

			this.appendDummyInput()
				.appendField("Choose any")
				.appendField(choiceDropdown, "CHOICE_TYPE")
				.appendField("from");

			this.appendValueInput("SOURCE")
				.setCheck(['socs_t_player', 'socs_t_player_sel']);

			this.appendDummyInput()
				.appendField("as")
				.appendField(new Blockly.FieldTextInput(), "AS");

			this.appendDummyInput("DUMMY");

			this.setPreviousStatement(true, "socs_t_choice");
			this.setNextStatement(true, "socs_t_choice");
			this.setInputsInline(true);
			this.setColour(90);
			this.setTooltip("Defines a choice option for a player offer, dynamically adjusting allowed input types.");
			this.setHelpUrl(""); // Add a help URL if available

			updateSourceCheck(this, this.getFieldValue('CHOICE_TYPE'));
		}
	};
}
