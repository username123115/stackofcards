import type { RulesetDescriber } from '@bindings/RulesetDescriber'
import styles from './create_game.module.css'

function CreateGame({ selectRuleset = null, rulesets = [] }:
	{ selectRuleset: ((ruleset: RulesetDescriber) => void) | null, rulesets: Array<RulesetDescriber> }) {

	const listItems = rulesets.map((ruleset) =>
		<li key={ruleset.identifier.toString()}>
			<button className={styles.rulesetElement} onClick={() => selectRuleset ? selectRuleset(ruleset) : null}>
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
