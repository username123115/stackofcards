import type { RulesetListing, RulesetPreview } from '@client/types/schema/ruleset'
import styles from './rulesetListing.module.css'

export type rulesetAction = "startGame" | "edit"
export interface rulesetActionObject {
	target: String,
	action: rulesetAction,
}

export default function RulesetListing({ listing, takeAction }:
	{ listing: RulesetListing, takeAction: ((action: rulesetActionObject) => void) }) {
	const items = listing.contents.map(
		(preview) => (
			<li key={preview.ruleset_id}>
				<RulesetPreview preview={preview} setAction={(a) => takeAction({ target: preview.ruleset_id, action: a })} />
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
