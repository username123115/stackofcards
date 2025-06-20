import VariableList from './variableMappings'
import type { GameConfig } from '@bindings/GameConfig'
import type { PlayerClass } from "@bindings/PlayerClass";
import type { PlayerAssignmentRule } from "@bindings/PlayerAssignmentRule";

import styles from './config.module.css'

export default function PlayerList({ config, handleEditPlayers = null }:
	{ config: GameConfig, handleEditPlayers: ((players: GameConfig['player_classes']) => void) | null }) {

	const validClasses = Object.keys(config.player_zones);

	const playerList = Object.entries(config.player_classes).map(
		([playerName, player]) => {
			return (
				<li key={playerName}>
					<div>
						<div> {playerName} </div>
						<PlayerDisplay player={player!} allowedClasses={validClasses} editPlayer={
							handleEditPlayers ? (p) => handleEditPlayers({ ...config.player_classes, [playerName]: p }) : null
						} />
					</div>
				</li>
			)
		}
	)
	return (
		<div>
			<ul className={styles.elementListing}> {playerList} </ul>
		</div>)
}

function PlayerDisplay({ player, allowedClasses, editPlayer = null }:
	{ player: PlayerClass, allowedClasses: string[], editPlayer: ((player: PlayerClass) => void) | null }) {
	return (
		<div className={styles.fieldListing} >
			<div>
				<PlayerVariableDisplay assignments={player.active_zones} allowedAssignments={allowedClasses} editVariables={
					editPlayer ? (variables) => editPlayer({ ...player, active_zones: variables }) : null

				} />
				<PlayerAssignmentDisplay assignment={player.assignment_rule} />
			</div>
		</div>
	)
}

function PlayerVariableDisplay({ assignments, allowedAssignments, editVariables = null }:
	{ assignments: string[], allowedAssignments: string[], editVariables: ((variables: string[]) => void) | null }) {
	const handleCheckboxChange = (className: string) => {
		if (!editVariables) return;

		if (assignments.includes(className)) {
			editVariables(assignments.filter((c) => c !== className))
		} else {
			editVariables([...assignments, className])
		}
	}
	return (
		<ul className={styles.horizontalList} >
			{
				allowedAssignments.map(
					(assignment) => (
						<li key={assignment}>
							<div className={styles.listItem} >
								<label>
									<input
										type="checkbox"
										checked={assignments.includes(assignment)}
										disabled={!editVariables}
										onChange={() => handleCheckboxChange(assignment)}
									/>
								</label>
								{assignment}
							</div>
						</li>
					)
				)
			}
		</ul>
	)
}

function PlayerAssignmentDisplay({ assignment, editAssignment = null }:
	{ assignment: PlayerAssignmentRule, editAssignment: ((assignment: PlayerAssignmentRule) => void) | null }) {

	if (assignment === "All") {
		return "All";
	} else {
		return "Index";
	}



}
