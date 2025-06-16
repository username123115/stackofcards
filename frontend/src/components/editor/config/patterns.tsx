import type { GameConfig } from '@bindings/GameConfig'

import { renameProperty, NameFieldComponent } from './utility'

import type { PatternPiece } from "@bindings/PatternPiece";
import type { Relation } from "@bindings/Relation";
import type { Pattern } from "@bindings/Pattern";

import { useState } from "react"

import styles from './config.module.css';

export default function PatternList({ config, handleEditPatterns = null }:
	{ config: GameConfig, handleEditPatterns: ((patterns: GameConfig['patterns']) => void) | null }) {

	function RenamePattern(newName: string, oldName: string) {
		if (handleEditPatterns) {
			const result = renameProperty(config.patterns, newName, oldName);
			if (result) {
				handleEditPatterns(result);
			}
		}
	}

	function AddNewPattern() {
		if (handleEditPatterns) {
			let untitledPatterns = 0;
			while (config.patterns[`new_pattern_${untitledPatterns}`]) {
				untitledPatterns += 1;
			}
			const newPatternName = `new_pattern_${untitledPatterns}`;
			const updated = {
				...config.patterns,
				[newPatternName]: [],
			}
			handleEditPatterns(updated);

		}
	}

	const patternList = Object.entries(config.patterns).map(
		([patternName, pattern]) => {
			return (
				<li key={patternName}>
					<div>
						<NameFieldComponent name={patternName} editName={handleEditPatterns ? (newName) => { RenamePattern(newName, patternName) } : null} />
						<PatternVecDisplay config={config} patterns={pattern!} editPatterns={handleEditPatterns ? (p) => {
							handleEditPatterns(
								{
									...config.patterns,
									[patternName]: p,
								}
							)
						} : null} />
					</div>
				</li>
			)
		}
	)

	return (
		<div>
			<ul className={styles.elementListing}>
				{patternList}
				{handleEditPatterns && <button onClick={() => AddNewPattern()}> Add pattern </button>}
			</ul>

		</div>)
}

function PatternVecDisplay({ config, patterns, editPatterns = null }:
	{ config: GameConfig, patterns: Pattern[], editPatterns: ((patterns: Pattern[]) => void) | null }) {
	const pvec = patterns.map(
		(pattern, index) => {
			return (
				<li key={JSON.stringify(pattern) + index}>
					{
						editPatterns && (
							<div className={styles.horizontalList}>
								<button className={styles.invisibleButton}> X </button>
								<EditablePattern config={config} pattern={pattern} editPattern={(p) => {
									const copy = [...patterns];
									copy[index] = p;
									editPatterns(copy);
								}} />
							</div>)
					}
				</li>)
		}
	)
	return (
		<div>
			<ul className={styles.elementListing}>
				{pvec}
				{editPatterns &&
					(
						<div>
							<button onClick={() => {
								const copy = [...patterns];
								copy.push({ Suit: [] });
								editPatterns(copy);
							}
							}> Add Pattern Part
							</button>
							<button onClick={() => editPatterns([])}> Clear Patterns </button>
						</div>
					)}
			</ul>
		</div >
	)
}

function EditablePattern({ config, pattern, editPattern }:
	{ config: GameConfig, pattern: Pattern, editPattern: ((pattern: Pattern) => void) }) {
	type UnionKeys<T> = T extends T ? keyof T : never;
	type Fields = UnionKeys<Pattern>;

	const ALL_FIELDS: Fields[] = ["Relation", "Rank", "Suit"];

	const [currentPattern, setCurrentPattern] = useState(pattern);

	function PatternEditor() {
		if ("Relation" in currentPattern) {
			return (<div>
				<PatternRelation config={config} relation={currentPattern.Relation} setRelation={(r) => editPattern!({ Relation: r })} />
			</div>)
		}
		return (<div> TODO </div>)
	}

	return (
		<div className={styles.horizontalList}>
			<select value={Object.keys(currentPattern)[0]} onChange={(e) => {
				const field = e.target.value as Fields;
				if (field == "Relation") {
					setCurrentPattern({ Relation: { Consecutive: "" } });
				}
				if (field == "Rank") {
					setCurrentPattern({ Rank: [] });
				}
				if (field == "Suit") {
					setCurrentPattern({ Suit: [] });
				}
			}}>
				{ALL_FIELDS.map(
					(f) => <option value={f}> {f} </option>
				)}
			</select>
			<PatternEditor />
		</div>
	)

}

function PatternRelation({ config, relation, setRelation = null }:
	{ config: GameConfig, relation: Relation, setRelation: ((relation: Relation) => void) | null }) {

	if ("Consecutive" in relation) {
		return (
			<div className={styles.horizontalList}>
				<div> Consecutive </div>
				{setRelation &&
					// TODO: Terrible hack because the order field can't be nullable so the parent just sets it as an empty string
					<select value={relation.Consecutive.length ? relation.Consecutive : undefined} onChange={(e) => setRelation({ Consecutive: e.target.value })}>
						<option value={undefined}> </option>
						{Object.keys(config.orders).map((k) => <option value={k}> {k} </option>)}
					</select>
				}
			</div>
		)
	}
}
