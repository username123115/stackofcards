import { useState } from 'react'

import styles from './editor.module.css'
import type { GameConfig } from '@bindings/GameConfig'

import OrderList from './config/orders'
import AllowedRanksList from './config/ranks'
import AllowedSuitsList from './config/suits'
import PatternList from './config/patterns'
import VariableList from './config/variableMappings'
import ZoneList from './config/zones'
import PlayerList from './config/players'

function ConfigDisplay({ config, saveEdits = null }:
	{ config: GameConfig, saveEdits: ((config: GameConfig) => void) | null }) {

	const [currentConfig, setCurrentConfig] = useState<GameConfig>(config);
	// console.log(currentConfig);

	return (
		<>
			<div className={styles.config}>
				<div>
					<h1> Allowed Ranks </h1>
					<AllowedRanksList ranks={currentConfig.allowed_ranks} />
				</div>
				<div>
					<h1> Allowed Suits </h1>
					<AllowedSuitsList suits={currentConfig.allowed_suits} />
				</div>
				<div>
					<h1> Orders </h1>
					<OrderList config={currentConfig} />
				</div>
				<div>
					<h1> Patterns </h1>
					<PatternList config={currentConfig} />
				</div>
				<div>
					<h1> Zones </h1>
					<ZoneList config={currentConfig}
						handleEditZones={saveEdits ? (z) => {
							setCurrentConfig({
								...currentConfig,
								zone_classes: z,
							});
						} : null}
					/>
				</div>
				<div>
					<h1> Players </h1>
					<PlayerList config={currentConfig} />
				</div>
				<div>
					<h1> Variable Mappings </h1>
					<VariableList mappings={currentConfig.initial_zones} />
				</div>

				<div>
					<div> Initial phase: {currentConfig.initial_phase} </div>
				</div>
			</div>
		</>
	)
}



export default ConfigDisplay
