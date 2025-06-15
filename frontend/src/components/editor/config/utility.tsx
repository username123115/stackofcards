import { useState } from 'react';

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
