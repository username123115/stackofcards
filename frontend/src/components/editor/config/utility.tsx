import { useState } from 'react';
import styles from './config.module.css'
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
export type ConfigMapping<T> = { [key in string]: T | undefined }

export interface ModifiableConfigProps<T> {
	config: GameConfig,
	configItem: T,
	setConfigItem: ((ci: T) => void) | null,
};
export type ModifiableConfigComponent<T> = ((props: ModifiableConfigProps<T>) => React.ReactElement);

export interface ConfigItemListProps<T> {
	Component: ModifiableConfigComponent<T>,
	config: GameConfig,
	contents: ConfigMapping<T>,
	defaultItem: (() => T),
	updateContents: ((contents: ConfigMapping<T>) => void) | null,
	prefix: string,
	displayInline?: boolean
}

export function ConfigItemList<T>(props: ConfigItemListProps<T>) {
	const { Component, config, contents, defaultItem, updateContents, prefix, displayInline, } = props;
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
			const displayComponent = <Component config={config} configItem={item!} setConfigItem={updateContents ? (n) => updateContents({ ...contents, [itemName]: n }) : null} />
			const nameComponent = <NameFieldComponent name={itemName} editName={updateContents ? (newName) => RenameItem(newName, itemName) : null} />
			return (
				<li key={itemName} >
					<div className={displayInline ? styles.horizontalList : undefined}>
						{nameComponent}
						{displayComponent}
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
