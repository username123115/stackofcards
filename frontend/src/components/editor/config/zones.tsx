import type { GameConfig } from '@bindings/GameConfig'
import type { ZoneClass } from "@bindings/ZoneClass";
import type { ZoneCleanupBehavior } from "@bindings/ZoneCleanupBehavior";
import type { ZoneVisibility } from "@bindings/ZoneVisibility";
import type { ZoneVisibilityRule } from "@bindings/ZoneVisibilityRule";

export default function ZoneList({ config, handleEditZones = null }:
	{ config: GameConfig, handleEditZones: ((zones: GameConfig['zone_classes']) => void) | null }) {

	const zoneList = Object.entries(config.zone_classes).map(
		([zoneName, zone]) => {
			return (
				<li key={zoneName}>
					<div>
						{zoneName}
						<ZoneDisplay zone={zone!} />
					</div>
				</li>
			)
		}
	)
	function AddNewZone() {
		if (handleEditZones) {
			let untitled_zones = 0;
			while (!config.zone_classes[`new_zone_${untitled_zones}`]) {
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
		<div>
			<ul> {zoneList} </ul>
			{handleEditZones &&
				<button onClick={AddNewZone}> Add Zone </button>
			}
		</div>)

}

function ZoneDisplay({ zone }: { zone: ZoneClass }) {
	return (
		<div>
			<ZoneRulesDisplay rules={zone.rules} />
			<ZoneVisibilityDisplay visibility={zone.visibility} />
			<ZoneCleanupDisplay cleanupRule={zone.cleanup} />

		</div>
	)
}

function ZoneRulesDisplay({ rules }: { rules: string[] }) {
	const ruleList = rules.map(
		(ruleName) => (<li key={ruleName}> {ruleName} </li>)
	);
	return (<ul> {ruleList} </ul>);
}

function ZoneVisibilityDisplay({ visibility }: { visibility: ZoneVisibility }) {
	return (
		<div>
			<div>
				<div> Owner </div>
				<div> <ZoneVisibilityRuleDisplay displayRule={visibility.owner} /> </div>

			</div>
			<div>
				<div> Others </div>
				<div> <ZoneVisibilityRuleDisplay displayRule={visibility.others} /> </div>

			</div>
		</div>
	)
}

function ZoneVisibilityRuleDisplay({ displayRule }: { displayRule: ZoneVisibilityRule }) {
	return (<div> {displayRule} </div>)
}

function ZoneCleanupDisplay({ cleanupRule }: { cleanupRule: ZoneCleanupBehavior }) {
	return (<div> {cleanupRule} </div>)
}
