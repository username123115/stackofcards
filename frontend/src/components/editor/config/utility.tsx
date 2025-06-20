import { useState } from 'react';
import styles from './config.module.css'

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
	const [cnum, scnum] = useState(num);
	if (!setNum) {
		return (<div> {String(num)} </div>)
	} else {
		return (<div>
			<input className={styles.smallInput} type="text" value={cnum} onChange={(e) => {
				scnum(Number(e.target.value));
			}} onBlur={() => setNum(cnum)}
				onKeyDown={(e) => { e.key === 'Enter' ? e.currentTarget.blur() : null }}
			/>
		</div>
		)
	}

}
