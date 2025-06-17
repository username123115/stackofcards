import { createFileRoute } from '@tanstack/react-router'
import BlocklyComponent from '@Blockly/index';
import { Block, Value, Shadow, Field } from '@Blockly/index';


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
				initialXml={`
<xml xmlns="http://www.w3.org/1999/xhtml">
<block type="controls_ifelse" x="0" y="0"></block>
</xml>
      `}>
				<Block type="controls_ifelse" />
				<Block type="logic_compare" />
				<Block type="logic_operation" />
				<Block type="logic_operation" />
				<Block type="logic_boolean" />
				<Block type="logic_null" disabled="true" />
				<Block type="logic_ternary" />
			</BlocklyComponent>
		</div>
	)
}
