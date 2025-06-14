import styles from './editor.module.css'
import type { GameConfig } from '@bindings/GameConfig'

import type { Pattern } from "@bindings/Pattern";
import type { Phase } from "@bindings/Phase";
import type { PlayerClass } from "@bindings/PlayerClass";
import type { Rank } from "@bindings/Rank";
import type { RankOrder } from "@bindings/RankOrder";
import type { Suit } from "@bindings/Suit";
import type { ZoneClass } from "@bindings/ZoneClass";

import type { ZoneCleanupBehavior } from "@bindings/ZoneCleanupBehavior";
import type { ZoneVisibility } from "@bindings/ZoneVisibility";

import type { PatternPiece } from "@bindings/PatternPiece";
import type { Relation } from "@bindings/Relation";
import type { PlayerAssignmentRule } from "@bindings/PlayerAssignmentRule";

import type { ZoneVisibilityRule } from "@bindings/ZoneVisibilityRule";

function ConfigDisplay({ config }: { config: GameConfig }) {
	return (
		<>
			<div>
				<AllowedRanksList ranks={config.allowed_ranks} />
				<AllowedSuitsList suits={config.allowed_suits} />
				<OrderList config={config} />
				<PatternList config={config} />
				<ZoneList config={config} />
				<PlayerList config={config} />
				<VariableList mappings={config.initial_zones} />

				<div>
					<div> Initial phase: {config.initial_phase} </div>
				</div>
			</div>
		</>
	)
}

function AllowedRanksList({ ranks }: { ranks: Rank[] }) {
	const rlist = ranks.map(
		(rank) => {
			return (
				<li key={rank}>
					{rank}
				</li>
			)
		}
	)
	return (
		<div>
			<ul>
				{rlist}
			</ul>
		</div>
	)
}

function AllowedSuitsList({ suits }: { suits: Suit[] }) {
	const slist = suits.map(
		(rank) => {
			return (
				<li key={rank}>
					{rank}
				</li>
			)
		}
	)
	return (
		<div>
			<ul>
				{slist}
			</ul>
		</div>
	)
}

function OrderList({ config }: { config: GameConfig }) {
	const orderList = Object.entries(config.orders).map(
		([orderName, order]) => {
			return (
				<li key={orderName}>
					<OrderDisplay order={order!} />
				</li>
			)
		}
	)
	return (<div> <ul> {orderList} </ul> </div>)
}

function OrderDisplay({ order }: { order: RankOrder }) {
	const elements = order.order.map(
		(rank, index) => {
			return (
				<li key={index}> {rank} </li>
			)
		}
	)
	return (
		<div> <ul> {elements} </ul> </div>
	)
}

function PatternList({ config }: { config: GameConfig }) {
	const patternList = Object.entries(config.patterns).map(
		([patternName, pattern]) => {
			return (
				<li key={patternName}>
					<PatternDisplay pattern={pattern!} />
				</li>
			)
		}
	)
	return (<div> <ul> {patternList} </ul> </div>)
}

function PatternDisplay({ pattern }: { pattern: Pattern }) {
	if ("Relation" in pattern) {
		return (<PatternRelation relation={pattern.Relation} />);
	}
	if ("Suit" in pattern) {
	}
}

function PatternRelation({ relation }: { relation: Relation }) {
	if ("Consecutive" in relation) {
		return (<span> {relation.Consecutive} </span>)
	}
	return (<span> TODO </span>)
}

function ZoneList({ config }: { config: GameConfig }) {
	const zoneList = Object.entries(config.zone_classes).map(
		([zoneName, zone]) => {
			return (
				<li key={zoneName}>
					<ZoneDisplay zone={zone!} />
				</li>
			)
		}
	)
	return (<div> <ul> {zoneList} </ul> </div>)

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

function PlayerList({ config }: { config: GameConfig }) {
	const playerList = Object.entries(config.player_classes).map(
		([playerName, player]) => {
			return (
				<li key={playerName}>
					<div>
						<div> {playerName} </div>
						<PlayerDisplay player={player!} />
					</div>
				</li>
			)
		}
	)
	return (<div> <ul> {playerList} </ul> </div>)
}

function PlayerDisplay({ player }: { player: PlayerClass }) {
	return (
		<div>
			<div>
				<div> Zones </div>
				<VariableList mappings={player.zones} />
			</div>
			<div>
				<div> Assignment Rule </div>
				<PlayerAssignmentDisplay assignment={player.assignment_rule} />
			</div>
		</div>
	)
}

function PlayerAssignmentDisplay({ assignment }: { assignment: PlayerAssignmentRule }) {
	if (assignment === "All") {
		return (<span> All </span>)
	}
	if ("Index" in assignment) {
		return (<span> {String(assignment.Index)} </span>)
	}

}

function VariableList({ mappings }: { mappings: { [key in string]?: string } }) {
	const mapList = Object.entries(mappings).map(
		([name, zoneClass]) => {
			return (
				<li key={name}>
					<VariableDisplay name={name} zoneClass={zoneClass!} />
				</li>
			)
		}
	)
	return (<div> <ul> {mapList} </ul> </div>)

}

function VariableDisplay({ name, zoneClass }: { name: string, zoneClass: string }) {
	return (
		<div>
			<div> {name} </div>
			<div> {zoneClass} </div>
		</div>
	)
}

export default ConfigDisplay
