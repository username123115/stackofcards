import type { RulesetDescriber } from '@bindings/RulesetDescriber'
import type { RulesetSelection, RulesetAction } from '@client/utility'

import styles from './create_game.module.css'

function CreateGame({ selectRuleset = null, rulesets = [] }:
	{
		selectRuleset: ((ruleset: RulesetSelection) => void) | null,
		rulesets: Array<RulesetDescriber>
	}) {

	function select(ruleset: bigint, action: RulesetAction) {
		if (selectRuleset) {
			selectRuleset({ selection: ruleset, action });
		}
	}

	const listItems = rulesets.map((ruleset) =>
		<li key={ruleset.identifier.toString()}>
			<button className={styles.rulesetElement}
				onClick={() => select(ruleset.identifier, "CreateGame")}>
				<h1> {ruleset.name} </h1>
				<p> {ruleset.description} </p>
			</button>
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
