import { useState } from 'react';
import styles from './config.module.css'
import type { ReactNode } from 'react';
import type { GameConfig } from '@client/types/engine/config'

export function renameProperty(container: { [key in string]?: any }, newName: string, oldName: string) {
	if (newName.trim() === '' || newName === oldName) {
		return null;
	}

	if (container.hasOwnProperty(newName)) {
		return null;
	}

	const newContainer: { [key in string]?: any } = {};
	Object.entries(container).forEach(([key, val]) => {
		if (key === oldName) {
			newContainer[newName] = val;
		} else {
			newContainer[key] = val;
		}
	});
	return newContainer;
}

export function NameFieldComponent({ name, editName = null }:
	{ name: string, editName: ((newName: string) => void) | null }) {
	const [currentName, setCurrentName] = useState(name);
	if (!editName) {
		return (<div> {name} </div>)
	} else {
		return (<div> <input type="text" value={currentName}
			onChange={(e) => setCurrentName(e.target.value)}
			onBlur={() => {
				if (currentName !== name) {
					editName(currentName);
					setCurrentName(name);
				}
			}}
			onKeyDown={(e) => {
				if (e.key === 'Enter') {
					e.currentTarget.blur();
				}
			}
			}
		/> </div>)
	}
}

export function NumField({ num, setNum = null }: { num: number, setNum: ((num: number) => void) | null }) {
	const [cnum, scnum] = useState(String(num));
	if (!setNum) {
		return (<div> {cnum} </div>)
	} else {
		return (<div>
			<input className={styles.smallInput} type="text" value={cnum} onChange={(e) => {
				scnum(e.target.value);
			}} onBlur={() => {
				const pending = Number(cnum);
				if (Number.isInteger(pending)) {
					setNum(Number(cnum))
				} else {
					setNum(0)
				}
			}}
				onKeyDown={(e) => { e.key === 'Enter' ? e.currentTarget.blur() : null }}
			/>
		</div>
		)
	}

}
export type ConfigMapping<T> = { [key in string]: T }
export interface ModifiableConfigProps<T> {
	config: GameConfig,
	configItem: T,
	setConfigItem: ((ci: T) => void) | null,
};
export type ModifiableConfigComponent<T> = ((props: ModifiableConfigProps<T>) => React.ReactElement);

export function RenameableComponentItemList<T>({ Component, config, contents, defaultItem, updateContents = null, prefix = "new_" }
	: { Component: ModifiableConfigComponent<T>, config: GameConfig, contents: ConfigMapping<T>, defaultItem: (() => T), updateContents: ((contents: ConfigMapping<T>) => void) | null, prefix: string }) {
	function RenameItem(newName: string, oldName: string) {
		if (updateContents) {
			const result = renameProperty(contents, newName, oldName);
			if (result) {
				updateContents(result);
			}
		}
	}

	function CreateItem() {
		if (updateContents) {
			let untitledCount = 0;
			let name = `${prefix}_${untitledCount}`
			while (contents[name]) {
				untitledCount += 1;
				name = `${prefix}_${untitledCount}`
			}
			let newItem = defaultItem();
			updateContents({ ...contents, [name]: newItem });
		}
	}

	const itemMap = Object.entries(contents).map(
		([itemName, item]) => {
			return (
				<li key={itemName}>
					<div>
						<NameFieldComponent name={itemName} editName={updateContents ? (newName) => RenameItem(newName, itemName) : null} />
					</div>
					<div>
						<Component config={config} configItem={item} setConfigItem={updateContents ? (n) => updateContents({ ...contents, [itemName]: n }) : null} />
					</div>
				</li>
			)
		}
	)

	return (
		<div>
			<ul className={styles.elementListing}>
				{itemMap}
				{updateContents && <button className={styles.menuButton} onClick={CreateItem}> Add </button>}
			</ul>
		</div>
	)
}
