import type { GameConfig } from '@client/types/engine/config'
import type { RulesetContents } from '@client/types/schema/ruleset'

import ConfigDisplay from '@components/editor/config_display'

import { useState } from 'react';
import styles from './editor.module.css';

import BlocklyComponent from '@Blockly/index';
import { Block } from '@Blockly/index';
import * as Blockly from 'blockly/core';
import { useRef } from 'react';

import { workspaceToGameConfig } from '@Blockly/serialization/toGameConfig';

import utilityStyles from '@styles/utility.module.css'

type DisplaySetting = "Block" | "Settings" | "Information";

function Editor({ ruleset, message = null, saveRuleset = null }: { ruleset: RulesetContents, message: string | null, saveRuleset: ((rule: RulesetContents) => void) | null }) {
	const [currentDisplay, setCurrentDisplay] = useState<DisplaySetting>("Block");

	const [currentConfig, setCurrentConfig] = useState<GameConfig>(ruleset.config);
	const [currentTitle, setCurrentTitle] = useState(ruleset.title);
	const [currentDescription, setCurrentDiscription] = useState(ruleset.description);


	const primaryWorkspace = useRef<Blockly.WorkspaceSvg | null>(null);

	function handleSetWorkspace(workspace: Blockly.WorkspaceSvg | null) {
		primaryWorkspace.current = workspace;
	}

	function handleSwitchDisplay(option: DisplaySetting) {
		if (option !== currentDisplay) {
			setCurrentDisplay(option);
			saveConfig();
		}
	}

	function saveConfig() {
		if (currentDisplay === "Block" && primaryWorkspace.current) {
			const savedCode = workspaceToGameConfig(primaryWorkspace.current);
			console.log(savedCode);
			setCurrentConfig({ ...currentConfig, phases: savedCode });
		}
	}

	function handleSaveRuleset() {
		if (saveRuleset) {
			let nconf = { ...currentConfig };
			if (currentDisplay === "Block" && primaryWorkspace.current) {
				const savedCode = workspaceToGameConfig(primaryWorkspace.current);
				nconf.phases = savedCode;
			}
			saveRuleset({ title: currentTitle, description: currentDescription, config: nconf });
		}

	}

	return (
		<>
			<div>
				<div className={utilityStyles.centerHor}>
					<div> {message} </div>
					<div className={styles.bar}>
						<div className={styles.title} > {currentTitle} </div>
						<SwitchMenu options={["Settings", "Block", "Information"]} setOption={handleSwitchDisplay} />
						<button onClick={handleSaveRuleset} className={styles.save}> Save </button>
					</div>
				</div>


				<div className={utilityStyles.centerDiv}>
					{(currentDisplay === "Settings") && <ConfigDisplay config={currentConfig} saveEdits={(e) => setCurrentConfig(e)} />}
					{(currentDisplay === "Block") && <Blocks config={currentConfig} setWorkspace={handleSetWorkspace} />}

					{(currentDisplay === "Information") &&
						<div className={styles.information}>
							<div className={styles.hor}>
								<div> Title: </div>
								<input value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} type="text" />
							</div>
							<div className={styles.hor}>
								<div> Description: </div>
								<input value={currentDescription} onChange={(e) => setCurrentDiscription(e.target.value)} type="text" />
							</div>
						</div>
					}
				</div>

			</div>
		</>
	)
}

function SwitchMenu({ options, setOption }: { options: DisplaySetting[], setOption: ((displayOption: DisplaySetting) => void) }) {
	const olist = options.map(
		(opt) => <li key={opt}> <button className={styles.menuButton} onClick={() => setOption(opt)}> {opt} </button> </li>

	)
	return (<div className={utilityStyles.centerHor}>
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
