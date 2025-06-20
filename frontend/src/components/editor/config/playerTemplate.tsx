import type { GameConfig } from '@bindings/GameConfig'

import { renameProperty, NameFieldComponent } from './utility'

import styles from './config.module.css'

export default function VariableMappingList({ config, variableMapping, handleEditMapping = null }:
	{ config: GameConfig, variableMapping: GameConfig['player_zones'], handleEditMapping: ((template: GameConfig['player_zones']) => void) | null }) {

	function RenameVar(newName: string, oldName: string) {
		if (handleEditMapping) {
			const result = renameProperty(variableMapping, newName, oldName);
			if (result) {
				handleEditMapping(result);
			}
		}
	}
	function AddNewVar() {
		if (handleEditMapping) {
			let untitledVars = 0;
			while (variableMapping[`new_var_${untitledVars}`]) {
				untitledVars += 1;
			}
			const newVarName = `new_var_${untitledVars}`;

			const updated = {
				...variableMapping,
				[newVarName]: "",
			}
			handleEditMapping(updated);
		}
	}

	const template = Object.entries(variableMapping).map(
		([varName, classRef]) => {
			return (
				<li key={varName}>
					<div className={styles.horizontalList}>
						<NameFieldComponent name={varName} editName={handleEditMapping ? (newName) => { RenameVar(newName, varName) } : null} />
						<div className={styles.rounded}>
							{
								handleEditMapping ?
									<div>
										<select value={classRef} onChange={(e) => {
											if (e.target.value && e.target.value !== "") {
												handleEditMapping({ ...variableMapping, [varName]: e.target.value })
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
									<div> {classRef} </div>
							}
						</div>
					</div>
				</li >
			)
		}
	)

	return (
		<div>
			<ul className={styles.elementListing}>
				{template}
				{handleEditMapping && <button className={styles.menuButton} onClick={AddNewVar}> Add Variable </button>}
			</ul>
		</div>)

}


