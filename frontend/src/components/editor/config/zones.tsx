import type { GameConfig } from '@client/types/engine/config'

import type { ZoneClass, ZoneCleanupBehavior, ZoneVisibility, ZoneVisibilityRule } from '@client/types/engine/core'

import { ConfigItemList, } from './utility'
import type { ModifiableConfigProps } from './utility'

import zoneStyles from './zones.module.css'
import styles from './config.module.css'

export default function ZoneListing({ config, handleEditZones = null }:
	{ config: GameConfig, handleEditZones: ((zones: GameConfig['zone_classes']) => void) | null }) {

	function defaultZone() {
		let newZone: ZoneClass = {
			visibility: {
				owner: "Visible",
				others: "Visible",
			},
			cleanup: "Never",
			rules: [],
		}
		return newZone;

	}
	return <ConfigItemList Component={ZoneDisplayWrapper} config={config} contents={config['zone_classes']} defaultItem={defaultZone} updateContents={handleEditZones} prefix={"new_zone"} />
}

function ZoneDisplayWrapper(props: ModifiableConfigProps<ZoneClass>) {
	return <ZoneDisplay config={props.config} zone={props.configItem!} editZone={props.setConfigItem} />
}

function ZoneDisplay({ config, zone, editZone = null }: { config: GameConfig, zone: ZoneClass, editZone: ((zone: ZoneClass) => void) | null }) {
	return (
		<div className={styles.fieldListing} >
			<ZoneRulesDisplay config={config} rules={zone.rules} editRules={editZone ? (r) => editZone({ ...zone, rules: r }) : null} />
			<ZoneVisibilityDisplay visibility={zone.visibility} editVisibility={editZone ? (v) => { editZone({ ...zone, visibility: v }) } : null} />
			<ZoneCleanupDisplay cleanupRule={zone.cleanup} editCleanupRule={editZone ? (c) => { editZone({ ...zone, cleanup: c }) } : null} />
		</div>
	)
}

function ZoneRulesDisplay({ config, rules, editRules = null }:
	{ config: GameConfig, rules: string[], editRules?: ((rules: string[]) => void) | null }) {

	function SingleRule({ name }: { name: string }) {
		return (
			<div className={styles.listItem}>
				<span> {name} </span>
				{editRules &&
					<button className={styles.invisibleButton} onClick={() => { editRules(rules.filter((n) => n !== name)) }}> X </button>}
			</div>
		)
	}

	const ruleList = rules.map(
		(ruleName) => (<li key={ruleName}> <SingleRule name={ruleName} /> </li>)
	);
	const options = Object.entries(config.patterns).map(([n, _]) => n);
	return (
		<div className={styles.horizontalList}>
			{editRules &&
				<select value={undefined}
					onChange={
						(e) => {
							const toAdd = e.target.value;
							if (!toAdd) return;
							if (rules.includes(toAdd)) {
								return;
							}
							editRules(rules.concat(toAdd));
						}
					}>
					<option value={undefined}> </option>
					{options.map((option) => (<option key={option} value={option}> {option} </option>))}
				</select>
			}
			<div>
				<ul className={styles.horizontalList}> {ruleList} </ul>
			</div>
		</div>
	);
}

function ZoneVisibilityDisplay({ visibility, editVisibility = null }:
	{ visibility: ZoneVisibility, editVisibility: ((visibility: ZoneVisibility) => void) | null }) {
	return (
		<div className={styles.horizontalList} >
			<div className={zoneStyles.zoneVisibilityHeader} >
				<div> Owner </div>
				<div>
					<ZoneVisibilityRuleDisplay displayRule={visibility.owner}
						editDisplayRule={editVisibility ? (e) => { editVisibility({ ...visibility, owner: e, }) } : null} />
				</div>

			</div>
			<div className={zoneStyles.zoneVisibilityHeader}>
				<div> Others </div>
				<div>
					<ZoneVisibilityRuleDisplay displayRule={visibility.others}
						editDisplayRule={editVisibility ? (e) => { editVisibility({ ...visibility, others: e, }) } : null} />
				</div>

			</div>
		</div>
	)
}

function ZoneVisibilityRuleDisplay({ displayRule, editDisplayRule = null }:
	{ displayRule: ZoneVisibilityRule, editDisplayRule: ((displayRule: ZoneVisibilityRule) => void) | null }) {

	if (!editDisplayRule) {
		return (<div className={styles.rounded}> {displayRule} </div>)
	}
	const options: ZoneVisibilityRule[] = ["Visible", "Hidden", "Top", "Bottom"];

	return (
		<div className={styles.rounded}>
			<select value={displayRule} onChange={(e) => editDisplayRule(e.target.value as ZoneVisibilityRule)}>
				{options.map((option) => (<option key={option} value={option}> {option} </option>))}
			</select>
		</div>
	)


}

function ZoneCleanupDisplay({ cleanupRule, editCleanupRule = null }:
	{ cleanupRule: ZoneCleanupBehavior, editCleanupRule: ((cleanupRule: ZoneCleanupBehavior) => void) | null }) {

	const options: ZoneCleanupBehavior[] = ["Never", "OnEmpty"];

	if (!editCleanupRule) {
		return (<div className={styles.rounded}>
			{cleanupRule}
		</div>);
	}

	return (
		<div className={styles.rounded}>
			<select value={cleanupRule} onChange={(e) => editCleanupRule(e.target.value as ZoneCleanupBehavior)}>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</div>
	);
}
