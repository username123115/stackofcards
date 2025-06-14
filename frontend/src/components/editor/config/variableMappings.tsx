export default function VariableList({ mappings }: { mappings: { [key in string]?: string } }) {
	const mapList = Object.entries(mappings).map(
		([name, zoneClass]) => {
			return (
				<li key={name}>
					<VariableDisplay name={name} zoneClass={zoneClass!} />
				</li>
			)
		}
	)
	return (<div> <ul> {mapList} </ul> </div>)

}

function VariableDisplay({ name, zoneClass }: { name: string, zoneClass: string }) {
	return (
		<div>
			<div> {name} </div>
			<div> {zoneClass} </div>
		</div>
	)
}
