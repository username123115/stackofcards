import styles from './editor.module.css'
import type { GameConfig } from '@bindings/GameConfig'

import type { Pattern } from "./Pattern";
import type { Phase } from "./Phase";
import type { PlayerClass } from "./PlayerClass";
import type { Rank } from "./Rank";
import type { RankOrder } from "./RankOrder";
import type { Suit } from "./Suit";
import type { ZoneClass } from "./ZoneClass";

function Config({ config }: { config: GameConfig }) {
	return (
		<>
			<div>
				<AllowedRanksList ranks={config.allowed_ranks} />
				<AllowedSuitsList suits={config.allowed_suits} />
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

export default Config
