import type { GameConfig } from '@bindings/GameConfig'
import ConfigDisplay from '@components/editor/config_display'

import { useState } from 'react';

import styles from './editor.module.css';

import BlocklyComponent from '@Blockly/index';
import { Block, Value, Shadow, Field, Category } from '@Blockly/index';

type ConfigDisplay = "Block" | "Settings";

function Editor({ config }: { config: GameConfig }) {
	const [currentDisplay, setCurrentDisplay] = useState<ConfigDisplay>("Block");
	return (
		<>
			<div>
				<SwitchMenu options={["Settings", "Block"]} setOption={(o) => setCurrentDisplay(o)} />
				{(currentDisplay === "Settings") && <ConfigDisplay config={config} saveEdits={(e) => console.log(e)} />}
				{(currentDisplay === "Block") && <Blocks />}

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

function Blocks() {
	return (
		<BlocklyComponent
			readOnly={false}
			trashcan={true}
			move={{
				scrollbars: true,
				drag: true,
				wheel: true,
			}}
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

		</BlocklyComponent>
	)
}

export default Editor
