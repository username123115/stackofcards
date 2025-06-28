import type { RulesetListing, RulesetPreview } from '@client/types/schema/ruleset'
import styles from './rulesetListing.module.css'
import type { rulesetAction, rulesetSelection } from '@client/utility'

import { useContext } from 'react'
import { UserContext } from '@client/userContext'

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
	const [uinfo, _] = useContext(UserContext);
	const ownedByUser = uinfo?.username === preview.author_name;

	return (<div>
		<div className={ownedByUser ? styles.rulesetElementOwned : styles.rulesetElement}>
			<h1 className={styles.title}> {preview.title} </h1>
			<p> {preview.description} </p>
			<p> by <a className={styles.plink} href={`/user/${preview.author_name}`}> {preview.author_name} </a> </p>
			<div className={styles.buttonContainers}>
				<button className={styles.rulesetButton} onClick={() => setAction("startGame")}>
					Play
				</button>
				<button className={styles.rulesetButton} onClick={() => setAction("edit")}>
					{ownedByUser ? "Edit" : "View"}
				</button>
			</div>

		</div>


	</div>)
}
