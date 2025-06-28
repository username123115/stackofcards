import styles from './config.module.css'
export default function AssignmentList({ assignments }: { assignments: Array<string> }) {
	const assignmentRules = assignments.map(
		(className) => {
			return <li key={className}>
				<div className={styles.rounded}>
					{className}
				</div>
			</li>
		}
	)

	return <div>
		<div className={styles.elementListing} >
			<ul className={styles.horizontalList}>
				{assignmentRules}
			</ul>
		</div>
	</div>
}
