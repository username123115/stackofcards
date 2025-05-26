import styles from './components.module.css'
import type { RulesetDescriber } from '@bindings/RulesetDescriber'

function CreateGame({ rulesets = [] }: { rulesets: Array<RulesetDescriber> }) {
	const listItems = rulesets.map((ruleset) =>
		<li key={ruleset.identifier.toString()}>
			<RulesetElement ruleset={ruleset}></RulesetElement>
		</li>
	);

	return (
		<>
			<div>
				<h1> Create game </h1>
			</div>
			<div>
				<ul> {listItems} </ul>
			</div>
		</>
	)
}

function RulesetElement({ ruleset }: { ruleset: RulesetDescriber }) {
	return (
		<>
			<div>
				<h1> {ruleset.name} </h1>
				<p> {ruleset.description} </p>
			</div>
		</>
	)
}

export default CreateGame
