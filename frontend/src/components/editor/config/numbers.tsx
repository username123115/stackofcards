import styles from './config.module.css';

import { NameFieldComponent } from './utility';

export default function NumberList({ numbers, handleEditNumbers = null }:
	{ numbers: string[], handleEditNumbers: ((numbers: string[]) => void) | null }) {
	function EditName(newName: string, oldName: string) {
		if (handleEditNumbers) {
			const updated = numbers.filter((n) => n !== oldName)
			updated.push(newName);
			handleEditNumbers(updated);
		}
	}
	function AddName() {
		let untitledN = 0;
		if (handleEditNumbers) {
			while (numbers.includes(`new_var_${untitledN}`)) {
				untitledN += 1;
			}
			const newNumberName = `new_var_${untitledN}`;
			const copy = [...numbers];
			copy.push(newNumberName);
			handleEditNumbers(copy);
		}
	}

	const nlist = numbers.map(
		(n) => {
			return (
				<li key={n}>
					<div className={styles.horizontalList} >
						{handleEditNumbers && <button className={styles.invisibleButton} onClick={() => handleEditNumbers(numbers.filter((numberName) => numberName !== n))}> X </button>}
						<NameFieldComponent name={n} editName={handleEditNumbers ? (newName) => { EditName(newName, n) } : null} />
					</div>
				</li>
			)
		}
	)
	return (
		<div>
			<ul className={styles.elementListing}>
				{nlist}
				{handleEditNumbers && <button className={styles.menuButton} onClick={() => AddName()}> Add Number </button>}
			</ul>
		</div>
	)

}
