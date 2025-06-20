import type { GameConfig } from '@bindings/GameConfig'
import ConfigDisplay from '@components/editor/config_display'

import { useState } from 'react';

import styles from './editor.module.css';

import BlocklyComponent from '@Blockly/index';
import { Block, Value, Shadow, Field, Category } from '@Blockly/index';

type ConfigDisplay = "Block" | "Settings";

function Editor({ config }: { config: GameConfig }) {
	const [currentDisplay, setCurrentDisplay] = useState<ConfigDisplay>("Block");
	const [currentConfig, setCurrentConfig] = useState<GameConfig>(config);
	return (
		<>
			<div>
				<SwitchMenu options={["Settings", "Block"]} setOption={(o) => setCurrentDisplay(o)} />
				{(currentDisplay === "Settings") && <ConfigDisplay config={currentConfig} saveEdits={(e) => setCurrentConfig(e)} />}
				{(currentDisplay === "Block") && <Blocks config={currentConfig} />}

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

function Blocks({ config }: { config?: GameConfig }) {
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
		>
			<Block type="socs_remade_if_else" />
			<Block type="logic_compare" />
			<Block type="logic_operation" />
			<Block type="logic_operation" />
			<Block type="logic_boolean" />

			<Block type="math_number" />

			<Block type="text" />
			<Block type="text_print" />

			<Block type="socs_phase" />
			<Block type="socs_enter_phase" />

			<Block type="socs_shuffle" />
			<Block type="socs_gen_cards" />
			<Block type="socs_deal_cards" />
			<Block type="socs_num_cards" />

			<Block type="socs_offer" />
			<Block type="socs_offer_declareless" />
			<Block type="socs_offer_case" />
			<Block type="socs_offer_case_any" />
			<Block type="socs_choice_unified" />

			<Block type="socs_player_current" />

			<Block type="socs_players_all" />

			<Block type="socs_player_of_type" />
			<Block type="socs_player_advance" />
			<Block type="socs_player_advance_type" />

			<Block type="socs_get_unified" />



		</BlocklyComponent>
	)
}

export default Editor
