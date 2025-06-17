import { createFileRoute } from '@tanstack/react-router'
import BlocklyComponent from '@Blockly/index';
import { Block, Value, Shadow, Field, Category } from '@Blockly/index';


export const Route = createFileRoute('/blockly')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div>Hello "/blockly"!
			<BlocklyComponent
				readOnly={false}
				trashcan={true}
				move={{
					scrollbars: true,
					drag: true,
					wheel: true,
				}}
			>
				<Block type="controls_ifelse" />
				<Block type="logic_compare" />
				<Block type="logic_operation" />
				<Block type="logic_operation" />
				<Block type="logic_boolean" />
				<Block type="logic_ternary" />

				<Block type="math_number" />
			</BlocklyComponent>
		</div >
	)
}
