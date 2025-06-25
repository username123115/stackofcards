import type { RulesetListing, RulesetPreview } from '@client/types/schema/ruleset'
import styles from './rulesetListing.module.css'

import type { rulesetAction, rulesetSelection } from '@client/utility'

export default function RulesetListingComponent({ listing, selectRuleset }:
	{ listing: RulesetListing, selectRuleset: ((action: rulesetSelection) => void) }) {
	const items = listing.contents.map(
		(preview) => (
			<li key={preview.ruleset_id}>
				<RulesetPreview preview={preview} setAction={(a) => selectRuleset({ target: preview.ruleset_id, action: a })} />
			</li>
		)
	)
	return (
		<div>
			<ul className={styles.rulesetContainer}>
				{items}
			</ul>
		</div>
	)
}

export function RulesetPreview({ preview, setAction }:
	{ preview: RulesetPreview, setAction: ((action: rulesetAction) => void) }) {
	return (<div>
		<div className={styles.rulesetElement}>
			<h1> {preview.title} </h1>
			<p> {preview.description} </p>
			<p> by {preview.author_name} </p>
			<div className={styles.buttonContainers}>
				<button className={styles.rulesetButton} onClick={() => setAction("startGame")}>
					Start
				</button>
				<button className={styles.rulesetButton} onClick={() => setAction("edit")}>
					Edit
				</button>
			</div>

		</div>


	</div>)
}
