import type { RulesetShittyThingRemove } from '@client/types/schema/ruleset'
import type { RulesetSelection, RulesetAction } from '@client/utility'

import styles from './create_game.module.css'

function CreateGame({ selectRuleset = null, rulesets = [] }:
	{
		selectRuleset: ((ruleset: RulesetSelection) => void) | null,
		rulesets: Array<RulesetShittyThingRemove>
	}) {

	function select(ruleset: bigint, action: RulesetAction) {
		if (selectRuleset) {
			selectRuleset({ selection: ruleset, action });
		}
	}

	const listItems = rulesets.map((ruleset) =>
		<li key={ruleset.identifier.toString()}>
			<div className={styles.rulesetElement}>
				<h1> {ruleset.name} </h1>
				<p> {ruleset.description} </p>
				<div className={styles.buttonContainers}>
					<button className={styles.rulesetButton} onClick={() => select(ruleset.identifier, "CreateGame")}>
						Start
					</button>
					<button className={styles.rulesetButton} onClick={() => select(ruleset.identifier, "Edit")}>
						Edit
					</button>
				</div>

			</div>
		</li >
	);

	return (
		<>
			<div>
				<h1 className={styles.title} > Create game </h1>
			</div>
			<div>
				<ul className={styles.rulesetContainer}> {listItems} </ul>
			</div>
		</>
	)
}


export default CreateGame
