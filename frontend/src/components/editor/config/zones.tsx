import type { GameConfig } from '@bindings/GameConfig'
import type { ZoneClass } from "@bindings/ZoneClass";
import type { ZoneCleanupBehavior } from "@bindings/ZoneCleanupBehavior";
import type { ZoneVisibility } from "@bindings/ZoneVisibility";
import type { ZoneVisibilityRule } from "@bindings/ZoneVisibilityRule";

import styles from './config.module.css'

export default function ZoneList({ config, handleEditZones = null }:
	{ config: GameConfig, handleEditZones: ((zones: GameConfig['zone_classes']) => void) | null }) {

	const zoneList = Object.entries(config.zone_classes).map(
		([zoneName, zone]) => {
			return (
				<li key={zoneName}>
					<div>
						{zoneName}
						<ZoneDisplay zone={zone!} editZone={
							handleEditZones ? (z) => handleEditZones({ ...config.zone_classes, [zoneName]: z }) : null
						} />
					</div>
				</li>
			)
		}
	)
	function AddNewZone() {
		if (handleEditZones) {
			let untitled_zones = 0;
			while (config.zone_classes[`new_zone_${untitled_zones}`]) {
				untitled_zones += 1;
			}
			const newZoneName = `new_zone_${untitled_zones}`;

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

	return (
		<div className={styles.zoneList}>
			<ul> {zoneList} </ul>
			{handleEditZones &&
				<button onClick={AddNewZone}> Add Zone </button>
			}
		</div>)

}

function ZoneDisplay({ zone, editZone = null }: { zone: ZoneClass, editZone: ((zone: ZoneClass) => void) | null }) {
	return (
		<div className={styles.zoneDisplay} >
			<ZoneRulesDisplay rules={zone.rules} />
			<ZoneVisibilityDisplay visibility={zone.visibility}
				editVisibility={editZone ? (v) => editZone({ ...zone, visibility: v }) : null}
			/>
			<ZoneCleanupDisplay cleanupRule={zone.cleanup} />
		</div>
	)
}

function ZoneRulesDisplay({ rules }: { rules: string[] }) {
	const ruleList = rules.map(
		(ruleName) => (<li key={ruleName}> {ruleName} </li>)
	);
	return (<div className={styles.zoneRules}> <ul> {ruleList} </ul> </div>);
}

function ZoneVisibilityDisplay({ visibility, editVisibility = null }:
	{ visibility: ZoneVisibility, editVisibility: ((visibility: ZoneVisibility) => void) | null }) {
	return (
		<div className={styles.zoneVisibility} >
			<div className={styles.zoneVisibilityHeader} >
				<div> Owner </div>
				<div>
					<ZoneVisibilityRuleDisplay displayRule={visibility.owner}
						editDisplayRule={editVisibility ? (e) => {
							editVisibility({ ...visibility, owner: e, })
						} : null} />
				</div>

			</div>
			<div className={styles.zoneVisibilityHeader}>
				<div> Others </div>
				<div>
					<ZoneVisibilityRuleDisplay displayRule={visibility.owner}
						editDisplayRule={editVisibility ? (e) => {
							editVisibility({ ...visibility, others: e, })
						} : null} />
				</div>

			</div>
		</div>
	)
}

function ZoneVisibilityRuleDisplay({ displayRule, editDisplayRule = null }:
	{ displayRule: ZoneVisibilityRule, editDisplayRule: ((displayRule: ZoneVisibilityRule) => void) | null }) {

	if (!editDisplayRule) {
		return (<div className={styles.zoneVisibilityRule}> {displayRule} </div>)
	}
	const options: ZoneVisibilityRule[] = ["Visible", "Hidden", "Top", "Bottom"];

	return (
		<div className={styles.zoneVisibilityRule}>
			<select value={displayRule} onChange={(e) => editDisplayRule(e.target.value as ZoneVisibilityRule)}>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</div>
	)


}

function ZoneCleanupDisplay({ cleanupRule }: { cleanupRule: ZoneCleanupBehavior }) {

	return (<div className={styles.zoneCleanup}>
		{cleanupRule}
	</div>)
}
