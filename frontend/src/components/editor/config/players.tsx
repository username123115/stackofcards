import type { GameConfig } from '@bindings/GameConfig'
import type { PlayerClass } from "@bindings/PlayerClass";
import type { PlayerAssignmentRule } from "@bindings/PlayerAssignmentRule";

import { NumField } from "./utility"

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
			<ul className={styles.elementListing}>
				{playerList}
				{handleEditPlayers && <button className={styles.menuButton}> Add player </button>}
			</ul>
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
				<PlayerAssignmentDisplay assignment={player.assignment_rule} editAssignment={
					editPlayer ? (rules) => editPlayer({ ...player, assignment_rule: rules }) : null
				} />
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

	function FieldContentsComp() {
		if (assignment === "All") {
			return <div> </div>
		} else if ("Index" in assignment) {
			return (
				<div>
					<NumField num={assignment.Index} setNum={editAssignment ? (n) => {
						editAssignment({ ...assignment, Index: n })
					} : null} />
				</div>)

		}
	}

	function FieldNameComp() {
		type fieldTypes = "all" | "index";
		const ALL_FIELDS: fieldTypes[] = ["all", "index"]

		let currentType: fieldTypes = "all";
		if (assignment === "All") {
			currentType = "all"
		} else if ("Index" in assignment) {
			currentType = "index"
		}
		if (!editAssignment) {
			return <div> {currentType} </div>
		} else {
			return (
				<div>
					<select value={currentType} onChange={(e) => {
						const sel = e.target.value as fieldTypes
						if (sel === "all") {
							editAssignment("All");
						} else if (sel === "index") {
							editAssignment({ Index: 0 });
						}
					}}>
						{
							ALL_FIELDS.map(
								(f) => <option value={f}> {f} </option>
							)
						}
					</select>
				</div>
			)
		}
	}
	return (
		<div className={styles.horizontalList}>
			<div className={styles.rounded} > <FieldNameComp /> </div>
			<FieldContentsComp />
		</div>
	)


}

