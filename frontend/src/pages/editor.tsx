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
			<Block type="controls_ifelse" />
			<Block type="logic_compare" />
			<Block type="logic_operation" />
			<Block type="logic_operation" />
			<Block type="logic_boolean" />
			<Block type="logic_ternary" />

			<Block type="math_number" />

			<Block type="controls_for" />
			<Block type="variables_get" />
			<Block type="variables_set" />

			<Block type="text" />
			<Block type="text_print" />

			<Block type="socs_phase" />
			<Block type="socs_shuffle" />
			<Block type="socs_init_zone" />
			<Block type="socs_gen_cards" />
			<Block type="socs_enter_phase" />

		</BlocklyComponent>
	)
}

export default Editor
