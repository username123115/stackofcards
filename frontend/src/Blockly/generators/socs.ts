import * as Blockly from 'blockly/core';
import type { GameConfig } from '@bindings/GameConfig'

import { phasesFromConfig, zonesFromConfig } from '@client/utility'

export default function generateBlockDefinitions(config: GameConfig) {

	Blockly.Extensions.register('socs_dynamic_sets',
		function() {
			this.workspace.getVariableMap().getVariablesOfType("phase");
			const toModify = this.getInput('INPUT');
			if (toModify) {
				toModify.appendField(new Blockly.FieldDropdown(() => getDoubleMap(phasesFromConfig(config))));
			}
		});

	function getDoubleMap(s: string[]): [string, string][] {
		return s.map((st) => [st, st]);
	}
}
