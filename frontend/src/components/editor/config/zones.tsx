import type { GameConfig } from '@client/types/engine/config'

import type { ZoneClass, ZoneCleanupBehavior, ZoneVisibility, ZoneVisibilityRule } from '@client/types/engine/core'

import { renameProperty, NameFieldComponent } from './utility'

import zoneStyles from './zones.module.css'
import styles from './config.module.css'

export default function ZoneList({ config, handleEditZones = null }:
	{ config: GameConfig, handleEditZones: ((zones: GameConfig['zone_classes']) => void) | null }) {

	function RenameZone(newName: string, oldName: string) {
		if (handleEditZones) {
			const result = renameProperty(config.zone_classes, newName, oldName);
			if (result) {
				handleEditZones(result);
			}
		}
	}
	function AddNewZone() {
		if (handleEditZones) {
			let untitledZones = 0;
			while (config.zone_classes[`new_zone_${untitledZones}`]) {
				untitledZones += 1;
			}
			const newZoneName = `new_zone_${untitledZones}`;

			let newZone: ZoneClass = {
				visibility: {
					owner: "Visible",
					others: "Visible",
				},
				cleanup: "Never",
				rules: [],
			}
			const updated = {
				...config.zone_classes,
				[newZoneName]: newZone,
			}
			handleEditZones(updated);
		}
	}

	const zoneList = Object.entries(config.zone_classes).map(
		([zoneName, zone]) => {
			return (
				<li key={zoneName}>
					<div>
						<NameFieldComponent name={zoneName} editName={handleEditZones ? (newName) => { RenameZone(newName, zoneName) } : null} />
						<ZoneDisplay config={config} zone={zone!} editZone={handleEditZones ? (z) => handleEditZones({ ...config.zone_classes, [zoneName]: z }) : null} />
					</div>
				</li>
			)
		}
	)

	return (
		<div>
			<ul className={styles.elementListing}>
				{zoneList}
				{handleEditZones && <button className={styles.menuButton} onClick={AddNewZone}> Add Zone </button>}
			</ul>
		</div>)

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
