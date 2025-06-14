import type { GameConfig } from '@bindings/GameConfig'
import type { ZoneClass } from "@bindings/ZoneClass";
import type { ZoneCleanupBehavior } from "@bindings/ZoneCleanupBehavior";
import type { ZoneVisibility } from "@bindings/ZoneVisibility";
import type { ZoneVisibilityRule } from "@bindings/ZoneVisibilityRule";

import { useState } from 'react';

import styles from './config.module.css'

export default function ZoneList({ config, handleEditZones = null }:
	{ config: GameConfig, handleEditZones: ((zones: GameConfig['zone_classes']) => void) | null }) {

	const zoneList = Object.entries(config.zone_classes).map(
		([zoneName, zone]) => {
			return (
				<li key={zoneName}>
					<div>
						<ZoneName name={zoneName} editName={handleEditZones ? (newName) => {
							if (!handleEditZones || newName.trim() === '' || newName === zoneName) {
								return;
							}

							if (config.zone_classes.hasOwnProperty(newName)) {
								return;
							}

							const updatedZones: GameConfig['zone_classes'] = {};
							Object.entries(config.zone_classes).forEach(([key, val]) => {
								if (key === zoneName) {
									updatedZones[newName] = val;
								} else {
									updatedZones[key] = val;
								}
							});

							handleEditZones(updatedZones);
						} : null} />
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

function ZoneName({ name, editName = null }:
	{ name: string, editName: ((newName: string) => void) | null }) {
	const [currentName, setCurrentName] = useState(name);
	if (!editName) {
		return (<div> {name} </div>)
	} else {
		return (<div> <input type="text" value={currentName}
			onChange={(e) => setCurrentName(e.target.value)}
			onBlur={() => {
				if (currentName !== name) {
					editName(currentName);
					setCurrentName(name);
				}
			}}
			onKeyDown={(e) => {
				if (e.key === 'Enter') {
					e.currentTarget.blur();
				}
			}
			}
		/> </div>)
	}
}

function ZoneDisplay({ zone, editZone = null }: { zone: ZoneClass, editZone: ((zone: ZoneClass) => void) | null }) {
	return (
		<div className={styles.zoneDisplay} >
			<ZoneRulesDisplay rules={zone.rules} editRules={
				editZone ? (r) => editZone({ ...zone, rules: r }) : null
			}
			/>
			<ZoneVisibilityDisplay visibility={zone.visibility}
				editVisibility={editZone ? (v) => { editZone({ ...zone, visibility: v }) } : null}
			/>
			<ZoneCleanupDisplay cleanupRule={zone.cleanup} editCleanupRule={
				editZone ? (c) => { editZone({ ...zone, cleanup: c }) } : null
			} />
		</div>
	)
}

function ZoneRulesDisplay({ rules, editRules = null }:
	{ rules: string[], editRules: ((rules: string[]) => void) | null }) {

	function SingleRule({ name }: { name: string }) {
		return (
			<div className={styles.zoneRule}>
				<span> {name} </span>
				{editRules && <button onClick={
					() => {
						editRules(rules.filter((n) => n !== name))
					}
				}> X </button>}
			</div>
		)
	}

	const ruleList = rules.map(
		(ruleName) => (<li key={ruleName}> <SingleRule name={ruleName} /> </li>)
	);
	const options = ["HI", "TEST", "BYE"];
	return (
		<div className={styles.zoneRulesContainer}>
			{editRules &&
				<select onChange={
					(e) => {
						const toAdd = e.target.value;
						if (rules.includes(toAdd)) {
							return;
						}
						editRules(rules.concat(toAdd));
					}
				}>
					{options.map((option) => (<option key={option} value={option}> {option} </option>))}
				</select>
			}
			<div className={styles.zoneRules}>
				<ul> {ruleList} </ul>
			</div>
		</div>
	);
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
					<ZoneVisibilityRuleDisplay displayRule={visibility.others}
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
				{options.map((option) => (<option key={option} value={option}> {option} </option>))}
			</select>
		</div>
	)


}

function ZoneCleanupDisplay({ cleanupRule, editCleanupRule = null }:
	{ cleanupRule: ZoneCleanupBehavior, editCleanupRule: ((cleanupRule: ZoneCleanupBehavior) => void) | null }) {

	const options: ZoneCleanupBehavior[] = ["Never", "OnEmpty"];

	if (!editCleanupRule) {
		return (<div className={styles.zoneCleanup}>
			{cleanupRule}
		</div>);
	}

	return (
		<div className={styles.zoneCleanup}>
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
