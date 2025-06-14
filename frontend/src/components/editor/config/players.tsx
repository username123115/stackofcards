import VariableList from './variableMappings'
import type { GameConfig } from '@bindings/GameConfig'
import type { PlayerClass } from "@bindings/PlayerClass";
import type { PlayerAssignmentRule } from "@bindings/PlayerAssignmentRule";

export default function PlayerList({ config }: { config: GameConfig }) {
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
	return (
		<div>
			<ul> {playerList} </ul>
		</div>)
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
