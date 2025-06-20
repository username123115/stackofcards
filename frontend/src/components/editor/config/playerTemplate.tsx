import type { GameConfig } from '@bindings/GameConfig'

import { renameProperty, NameFieldComponent } from './utility'

import styles from './config.module.css'

export default function PlayerTemplateList({ config, handleEditTemplate = null }:
	{ config: GameConfig, handleEditTemplate: ((template: GameConfig['player_zones']) => void) | null }) {

	function RenameVar(newName: string, oldName: string) {
		if (handleEditTemplate) {
			const result = renameProperty(config.player_zones, newName, oldName);
			if (result) {
				handleEditTemplate(result);
			}
		}
	}
	function AddNewVar() {
		if (handleEditTemplate) {
			let untitledVars = 0;
			while (config.player_zones[`new_var_${untitledVars}`]) {
				untitledVars += 1;
			}
			const newVarName = `new_var_${untitledVars}`;

			const updated = {
				...config.player_zones,
				[newVarName]: "",
			}
			handleEditTemplate(updated);
		}
	}

	const template = Object.entries(config.player_zones).map(
		([varName, classRef]) => {
			return (
				<li key={varName}>
					<div className={styles.horizontalList}>
						<NameFieldComponent name={varName} editName={handleEditTemplate ? (newName) => { RenameVar(newName, varName) } : null} />
						<div className={styles.rounded}>
							{
								handleEditTemplate ?
									<div>
										<select value={classRef} onChange={(e) => {
											if (e.target.value && e.target.value !== "") {
												handleEditTemplate({ ...config.player_zones, [varName]: e.target.value })
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
				{handleEditTemplate && <button className={styles.menuButton} onClick={AddNewVar}> Add Variable </button>}
			</ul>
		</div>)

}


