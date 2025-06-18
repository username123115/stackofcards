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

const PHASE_JSON = {
	type: "socs_phase",
	tooltip: "Game phase",
	message0: "phase %1",
	args0: [
		{
			type: "field_input",
			name: "NAME",
			text: "phase",

		}
	],
	nextStatement: null,
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
	"previousStatement": null,
	"nextStatement": null,
	"colour": 285
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
	"colour": 330
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
	"previousStatement": null,
	"nextStatement": null,
	"colour": 285
}


export default function generateBlockDefinitions() {
	Blockly.defineBlocksWithJsonArray([PHASE_JSON, SHUFFLE_JSON, INIT_ZONE, GEN_CARDS]);
	Blockly.Blocks['socs_enter_phase'] = {
		init: function(this: Blockly.Block) {
			const currentWorkspace = this.workspace;
			const getPhaseOptions = function(): Blockly.MenuOption[] {
				const options: [string, string][] = [];
				// Access the workspace the block belongs to
				const blocks = currentWorkspace.getAllBlocks(false);

				for (let i = 0; i < blocks.length; i++) {
					const block = blocks[i];
					if (block.type === 'socs_phase') {
						const phaseName = block.getFieldValue('NAME');
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
}
