import type { GameConfig } from '@client/types/engine/config'

import { ConfigItemList, } from './utility'
import type { ModifiableConfigProps, ConfigMapping } from './utility'

import styles from './config.module.css'

export default function VariableMappingList({ config, variableMapping, handleEditMapping = null }:
	{ config: GameConfig, variableMapping: { [key in string]: string | undefined }, handleEditMapping: ((contents: ConfigMapping<string>) => void) | null }) {


	function TypeNameComponent(props: ModifiableConfigProps<string>) {
		return (
			<div className={styles.rounded}>
				{
					props.setConfigItem ?
						<div>
							<select value={props.configItem} onChange={(e) => {
								if (e.target.value && e.target.value !== "") {
									props.setConfigItem!(e.target.value)
								}
							}}>
								<option value=""> </option>
								{
									Object.keys(config.zone_classes).map(
										(z) => <option value={z}> {z} </option>
									)
								}
							</select>
						</div>
						:
						<div>
							{props.configItem}
						</div>
				}
			</div>
		)
	}


	return <ConfigItemList
		Component={TypeNameComponent}
		config={config}
		contents={variableMapping}
		defaultItem={() => ""}
		updateContents={handleEditMapping}
		prefix="new_var"
		displayInline={true}
	/>

}


