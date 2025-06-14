
import type { GameConfig } from '@bindings/GameConfig'

//import type { PatternPiece } from "@bindings/PatternPiece";
import type { Relation } from "@bindings/Relation";
import type { Pattern } from "@bindings/Pattern";

export default function PatternList({ config }: { config: GameConfig }) {
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
