import type { GameConfig } from '@bindings/GameConfig'
import ConfigDisplay from '@components/editor/config_display'

import { useState } from 'react';

import styles from './editor.module.css';

import BlocklyComponent from '@Blockly/index';
import { Block } from '@Blockly/index';

import * as Blockly from 'blockly/core';

import { useRef } from 'react';

import { workspaceToGameConfig } from '@Blockly/serialization/toGameConfig';

type ConfigDisplay = "Block" | "Settings";

function Editor({ config }: { config: GameConfig }) {
	const [currentDisplay, setCurrentDisplay] = useState<ConfigDisplay>("Block");
	const [currentConfig, setCurrentConfig] = useState<GameConfig>(config);
	const primaryWorkspace = useRef<Blockly.WorkspaceSvg | null>(null);

	function handleSetWorkspace(workspace: Blockly.WorkspaceSvg | null) {
		primaryWorkspace.current = workspace;
	}

	function handleSwitchDisplay(option: ConfigDisplay) {
		if (option !== currentDisplay) {
			if (currentDisplay === "Block" && primaryWorkspace.current) {
				const savedCode = workspaceToGameConfig(primaryWorkspace.current);
				console.log(savedCode);
				setCurrentConfig({ ...currentConfig, phases: savedCode });
			}
			setCurrentDisplay(option);
		}
	}

	return (
		<>
			<div>
				<SwitchMenu options={["Settings", "Block"]} setOption={handleSwitchDisplay} />
				{(currentDisplay === "Settings") && <ConfigDisplay config={currentConfig} saveEdits={(e) => setCurrentConfig(e)} />}
				{(currentDisplay === "Block") && <Blocks config={currentConfig} setWorkspace={handleSetWorkspace} />}

			</div>
		</>
	)
}

function SwitchMenu({ options, setOption }: { options: ConfigDisplay[], setOption: ((displayOption: ConfigDisplay) => void) }) {
	const olist = options.map(
		(opt) => <li key={opt}> <button onClick={() => setOption(opt)}> {opt} </button> </li>

	)
	return (<div>
		<ul className={styles.pageMenu} >
			{olist}
		</ul>
	</div>)
}

function Blocks({ config, setWorkspace }: {
	config?: GameConfig,
	setWorkspace?: ((wkspc: Blockly.WorkspaceSvg | null) => void);
}) {
	return (
		<BlocklyComponent
			readOnly={false}
			trashcan={true}
			move={{
				scrollbars: true,
				drag: true,
				wheel: true,
			}}
			config={config}
			setWorkspace={setWorkspace}
		>
			<Block type="socs_remade_if_else" />
			<Block type="socs_remade_while" />

			<Block type="logic_compare" />
			<Block type="logic_operation" />
			<Block type="logic_operation" />
			<Block type="logic_boolean" />

			<Block type="math_number" />

			<Block type="socs_phase" />
			<Block type="socs_enter_phase" />

			<Block type="socs_shuffle" />
			<Block type="socs_gen_cards" />
			<Block type="socs_deal_cards" />
			<Block type="socs_num_cards" />
			<Block type="socs_cards_move" />
			<Block type="socs_cards_matching_rank" />
			<Block type="socs_cards_matching_suit" />

			<Block type="socs_offer" />
			<Block type="socs_offer_declareless" />
			<Block type="socs_offer_case" />
			<Block type="socs_offer_case_any" />
			<Block type="socs_choice_unified" />
			<Block type="socs_choice_move" />

			<Block type="socs_rank_from_card" />
			<Block type="socs_suit_from_card" />

			<Block type="socs_player_current" />

			<Block type="socs_players_all" />
			<Block type="socs_zone_for_player" />
			<Block type="socs_zones_of_type" />


			<Block type="socs_player_of_type" />
			<Block type="socs_player_advance" />
			<Block type="socs_player_advance_type" />

			<Block type="socs_card_selector" />

			<Block type="socs_get_unified" />
			<Block type="socs_get_number" />
			<Block type="socs_set_number" />

			<Block type="socs_declare_winner" />



		</BlocklyComponent>
	)
}

export default Editor
