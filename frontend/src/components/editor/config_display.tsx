import { useState } from 'react'

import styles from './editor.module.css'
import cStyles from './config/config.module.css'

import type { GameConfig } from '@bindings/GameConfig'

import OrderList from './config/orders'
import AllowedRanksList from './config/ranks'
import AllowedSuitsList from './config/suits'
import PatternList from './config/patterns'
import ZoneList from './config/zones'
import PlayerList from './config/players'
import NumberList from './config/numbers'

import VariableMappingList from './config/playerTemplate'

function ConfigDisplay({ config, saveEdits = null }:
	{ config: GameConfig, saveEdits: ((config: GameConfig) => void) | null }) {

	const [currentConfig, setCurrentConfig] = useState<GameConfig>(config);

	if (saveEdits && (currentConfig != config)) {
		saveEdits(currentConfig);
	}

	function PhaseComponent() {
		return (
			<div className={cStyles.elementListing}>
				<div className={cStyles.rounded}>
					{saveEdits ?
						<select value={currentConfig.initial_phase} onChange={(e) => setCurrentConfig({ ...currentConfig, initial_phase: e.target.value })}>
							{
								Object.keys(config.phases).map(
									(pname) => <option value={pname}> {pname} </option>
								)
							}
						</select>
						: <div> currentConfig.initial_phase </div>}
				</div>
			</div>
		)
	}

	return (
		<>
			<div className={styles.config}>
				<div>
					<h1> Allowed Ranks </h1>
					<AllowedRanksList ranks={currentConfig.allowed_ranks}
						handleEditRanks={saveEdits ? (r) => { setCurrentConfig({ ...currentConfig, allowed_ranks: r }); } : null}
					/>
				</div>
				<div>
					<h1> Allowed Suits </h1>
					<AllowedSuitsList suits={currentConfig.allowed_suits}
						handleEditSuits={saveEdits ? (s) => { setCurrentConfig({ ...currentConfig, allowed_suits: s }); } : null}
					/>
				</div>
				<div>
					<h1> Orders </h1>
					<OrderList config={currentConfig} handleEditOrders={saveEdits ? (o) => { setCurrentConfig({ ...currentConfig, orders: o }) } : null} />
				</div>
				<div>
					<h1> Patterns </h1>
					<PatternList config={currentConfig} handleEditPatterns={saveEdits ? (p) => { setCurrentConfig({ ...currentConfig, patterns: p }) } : null} />
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
					<h1> Player Template </h1>
					<VariableMappingList config={config} variableMapping={config.player_zones} handleEditMapping={saveEdits ? (t) => { setCurrentConfig({ ...currentConfig, player_zones: t }) } : null} />
				</div>
				<div>
					<h1> Players </h1>
					<PlayerList config={currentConfig} handleEditPlayers={saveEdits ? (p) => { setCurrentConfig({ ...currentConfig, player_classes: p }) } : null} />
				</div>
				<div>
					<h1> Initial Zones </h1>
					<VariableMappingList config={config} variableMapping={config.initial_zones} handleEditMapping={saveEdits ? (t) => { setCurrentConfig({ ...currentConfig, initial_zones: t }) } : null} />
				</div>

				<div>
					<h1> Numbers </h1>
					<NumberList numbers={config.numbers} handleEditNumbers={saveEdits ? (n) => { setCurrentConfig({ ...config, numbers: n }) } : null} />
				</div>


				<div>
					<h1> Initial phase </h1>
					<PhaseComponent />
				</div>
			</div>
		</>
	)
}



export default ConfigDisplay
