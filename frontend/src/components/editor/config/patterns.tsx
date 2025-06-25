import type { GameConfig } from '@bindings/GameConfig'
import type { Rank, Suit, PatternPiece, Relation, Pattern } from '@client/types/engine/core';

import { renameProperty, NameFieldComponent, NumField } from './utility'

import { useState, } from "react"

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
				{handleEditPatterns && <button className={styles.menuButton} onClick={() => AddNewPattern()}> Add pattern </button>}
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
								<button className={styles.invisibleButton} onClick={() => editPatterns(patterns.filter((_value, ind) => (ind != index)))}> X </button>
								<button className={styles.invisibleButton} onClick={() => {
									if (index === 0) return;
									const copy = [...patterns];
									[copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
									editPatterns(copy);
								}}> &lt; </button>
								<button className={styles.invisibleButton} onClick={() => {
									if ((index + 1) >= patterns.length) return;
									const copy = [...patterns];
									[copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
									editPatterns(copy);

								}}> &gt; </button>
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
							<button className={styles.menuButton} onClick={() => {
								const copy = [...patterns];
								copy.push({ Suit: [] });
								editPatterns(copy);
							}
							}> Add Pattern Part
							</button>
							<button className={styles.menuButton} onClick={() => editPatterns([])}> Clear Patterns </button>
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
		if ("Suit" in currentPattern) {
			const options: Array<Suit | null> = [null, ...config.allowed_suits]
			return (<div>
				<PatternPieces<Suit | null> pieces={currentPattern.Suit} possibleOptions={options} setPieces={(p) => editPattern!({ Suit: p })} />
			</div>)
		}
		if ("Rank" in currentPattern) {
			const options: Array<Rank | null> = [null, ...config.allowed_ranks]
			return (<div>
				<PatternPieces<Rank | null> pieces={currentPattern.Rank} possibleOptions={options} setPieces={(p) => editPattern!({ Rank: p })} />
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
				<div className={styles.rounded}> {relation.Consecutive} </div>
			</div>
		)
	}
}


function PatternPieces<T>({ pieces, possibleOptions, setPieces = null }:
	{ pieces: PatternPiece<T>[], possibleOptions: T[], setPieces: ((pieces: PatternPiece<T>[]) => void) | null }) {

	const pieceListing = pieces.map(
		(piece, index) => {
			function EditPiece(newPiece: PatternPiece<T>) {
				if (setPieces) {
					setPieces(pieces.map((pce, idx) => (index === idx) ? newPiece : pce));
				}
			}
			function NewMin(m: number) {
				if (m < 0) return;
				if (m > 1000) return; //idk
				const copy = { ...piece, match_min: m };
				if (copy.match_min > copy.match_max) {
					copy.match_max = m;
				}
				EditPiece(copy);
			}
			function NewMax(m: number) {
				if (m < 0) return;
				if (m > 1000) return;
				const copy = { ...piece, match_max: m };
				if (copy.match_min > copy.match_max) {
					copy.match_min = m;
				}
				EditPiece(copy);
			}
			function NewMatcher(t: T) {
				let copy = { ...piece, pattern: t };
				EditPiece(copy);
			}

			const potentialIndex = possibleOptions.indexOf(piece.pattern);
			const IndexOfPattern = (potentialIndex < 0) ? 0 : potentialIndex;

			return (
				<li key={index + JSON.stringify(piece)}>
					<div className={styles.rounded}>
						<div className={styles.horizontalList}>
							<div> <NumField num={piece.match_min} setNum={setPieces ? (n) => NewMin(n) : null} /> </div>
							<div> <NumField num={piece.match_max} setNum={setPieces ? (n) => NewMax(n) : null} /> </div>
							<div>
								{setPieces ?
									<select value={IndexOfPattern} onChange={(e) => NewMatcher(possibleOptions[Number(e.target.value)])} >
										{
											possibleOptions.map(
												(opt, index) => <option value={index}> {opt ? String(opt) : "*"}</option>
											)
										}
									</select>
									:
									<div> {piece.pattern ? String(piece.pattern) : "*"} </div>
								}
							</div>
							{setPieces &&
								<button className={styles.invisibleButton} onClick={() => setPieces(pieces.filter((_value, ind) => (index != ind)))}> X </button>}
						</div>
					</div>
				</li>
			)
		}
	)

	return (
		<div className={styles.horizontalList}>
			{setPieces && <button className={styles.invisibleButton} onClick={() => {
				const copy = [...pieces];
				copy.push({
					match_min: 0,
					match_max: 0,
					pattern: possibleOptions[0],
				});
				setPieces(copy);
			}}> [+Pattern] </button>}
			<ul className={styles.horizontalList}> {pieceListing} </ul>
		</div>)

}

