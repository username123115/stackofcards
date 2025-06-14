import type { GameConfig } from '@bindings/GameConfig'
import ConfigDisplay from '@components/editor/config_display'

function Editor({ config }: { config: GameConfig }) {
	return (
		<>
			<div>
				<ConfigDisplay config={config} />
			</div>
		</>
	)
}

export default Editor
