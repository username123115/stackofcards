import * as Blockly from 'blockly/core';
import * as Defs from './defs';

import type { InterpreterType } from './defs';
import { TYPE_TO_HUE } from './defs';

function getVarOfType(block: Blockly.Block, typeName: string): string[] {
	return block.workspace.getVariableMap().getVariablesOfType(typeName).map(
		(v) => v.getName()
	)
}

function getVarOfTypeOptions(block: Blockly.Block, typeName: string, pad: boolean = false): [string, string][] {
	const results: [string, string][] = [];
	getVarOfType(block, typeName).map((v) => results.push([v, v]));
	if (pad && (results.length === 0)) {
		results.push(["", ""]);
	}
	return results;
}

// Given a type search for offer blocks that declare this variable
function getDeclaredVariables(block: Blockly.Block, targetType: InterpreterType): [string, string][] {
	const declarations: [string, string][] = [];
	let parentBlock: Blockly.Block | null = block.getSurroundParent();

	while (parentBlock) {
		if (Defs.ALL_OFFER_CASES.includes(parentBlock.type)) {
			//Iterate through the choices field looking for socs_choice_unified blocks
			const offerStatement = parentBlock.getInput('OFFERS');
			if (offerStatement && offerStatement.connection) {
				let childBlock = offerStatement.connection.targetBlock();
				while (childBlock) {
					if (childBlock.type === Defs.V_CHOICE_UNIFIED) {
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
		} else if (parentBlock.type === Defs.B_OFFER && targetType === 'socs_t_player') {
			const playerName = parentBlock.getFieldValue('PLAYER_NAME');
			if (!declarations.some(dec => dec[1] === playerName)) {
				declarations.push([playerName, playerName]);
			}
		}
		parentBlock = parentBlock.getSurroundParent();
	}

	function getOptionVarsOfType(t: string) {
		getVarOfTypeOptions(block, t).map((v) => { declarations.push(v) })
	}

	if (targetType === 'socs_t_zone') { getOptionVarsOfType('socs_v_zone'); }
	if (targetType === 'socs_t_zone_class') { getOptionVarsOfType('socs_v_zone_class'); }
	if (targetType === 'socs_t_player_class') { getOptionVarsOfType('socs_v_player_class'); }
	if (targetType === 'socs_t_order') { getOptionVarsOfType('socs_v_order'); }

	return declarations;
}

export default function generateBlockDefinitions() {

	Blockly.defineBlocksWithJsonArray(Defs.ALL_STATIC_DEFS);

	Blockly.Blocks[Defs.V_GET_NUMBER] = {
		init: function(this: Blockly.Block) {
			const currentBlock = this;
			this.appendDummyInput()
				.appendField("number")
				.appendField(new Blockly.FieldDropdown(() => getVarOfTypeOptions(currentBlock, 'socs_v_number', true)), "NUMBER");
			this.setColour(230);
			this.setOutput(true, "Number");
		}
	}

	Blockly.Blocks[Defs.B_ZONE_FOR_PLAYER] = {
		init: function(this: Blockly.Block) {
			const currentBlock = this;
			this.appendValueInput("OWNER")
				.appendField("zone owned by")
				.setCheck("socs_t_player")
			this.appendDummyInput()
				.appendField("named")
				.appendField(new Blockly.FieldDropdown(() => getVarOfTypeOptions(currentBlock, 'socs_v_player_zone', true)), "NUMBER");
			this.setColour(TYPE_TO_HUE['socs_t_zone']);
			this.setOutput(true, "socs_t_zone");
		}
	}

	Blockly.Blocks[Defs.V_ZONES_OF_TYPE] = {
		init: function(this: Blockly.Block) {
			const currentBlock = this;
			this.appendDummyInput()
				.appendField("zones of type")
				.appendField(new Blockly.FieldDropdown(() => getVarOfTypeOptions(currentBlock, 'socs_v_zone_class', true)), "NUMBER");
			this.setColour(TYPE_TO_HUE['socs_t_zone_sel']);
			this.setOutput(true, "socs_t_zone_sel");
		}
	}

	Blockly.Blocks[Defs.B_SET_NUMBER] = {
		init: function(this: Blockly.Block) {
			const currentBlock = this;
			this.appendDummyInput()
				.appendField("set number")
				.appendField(new Blockly.FieldDropdown(() => getVarOfTypeOptions(currentBlock, 'socs_v_number', true)), "NAME")
				.appendField("to")
			this.appendValueInput("VALUE")
				.setCheck(['Number']);

			this.setColour(230);
			this.setPreviousStatement(true, "any");
			this.setNextStatement(true, "any");
			this.setInputsInline(true);
		}
	}

	Blockly.Blocks[Defs.B_ENTER_PHASE] = {
		init: function(this: Blockly.Block) {
			const currentWorkspace = this.workspace;
			const getPhaseOptions = function(): Blockly.MenuOption[] {
				const options: [string, string][] = [];
				const blocks = currentWorkspace.getAllBlocks(false);

				for (let i = 0; i < blocks.length; i++) {
					const block = blocks[i];
					if (block.type === Defs.B_PHASE) {
						const phaseName = block.getFieldValue('PHASE');
						if (phaseName) {
							options.push([phaseName, phaseName]);
						}
					}
				}

				if (options.length === 0) {
					options.push(['(define a phase)', '']);
				}

				return options;
			};
			this.appendDummyInput()
				.appendField("enter phase")
				.appendField(new Blockly.FieldDropdown(getPhaseOptions), "PHASE_NAME");
			this.setPreviousStatement(true, "any");
			this.setColour(60); this.setTooltip("Enter a specific game phase");
			this.setHelpUrl("");
		}
	};
	Blockly.Blocks[Defs.V_GET_UNIFIED] = {
		init: function(this: Blockly.Block) {
			const options: [string, InterpreterType][] = [
				["player", "socs_t_player"],
				["player selection", "socs_t_player_sel"],
				["card", "socs_t_card"],
				["card selection", "socs_t_card_sel"],
				["zone", "socs_t_zone"],
				["zone type", "socs_t_zone_class"],
				["player type", "socs_t_player_class"],
				["order", "socs_t_order"],
			]

			function typeValidator(newValue: string): string {
				const selectedType: InterpreterType = newValue as InterpreterType;
				const block = typeDropdown.getSourceBlock();
				if (block) {
					block.setOutput(true, selectedType);
					block.setColour(TYPE_TO_HUE[selectedType]);
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

	Blockly.Blocks[Defs.V_CHOICE_UNIFIED] = {
		init: function(this: Blockly.Block) {
			// Dropdown options and their corresponding input checks
			const choiceOptions: [string, InterpreterType, InterpreterType[]][] = [
				['player', 'socs_t_player', ['socs_t_player', 'socs_t_player_sel']],
				['set of players', 'socs_t_player_sel', ['socs_t_player', 'socs_t_player_sel']],
				['card', 'socs_t_card', ['socs_t_card', 'socs_t_card_sel']],
				['set of cards', 'socs_t_card_sel', ['socs_t_card', 'socs_t_card_sel']],
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
