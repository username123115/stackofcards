import styles from './editor.module.css'
import type { GameConfig } from '@bindings/GameConfig'



import OrderList from './config/orders'
import AllowedRanksList from './config/ranks'
import AllowedSuitsList from './config/suits'
import PatternList from './config/patterns'
import VariableList from './config/variableMappings'
import ZoneList from './config/zones'
import PlayerList from './config/players'

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



export default ConfigDisplay
